import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

const AI_GATEWAY_URL = 'https://api.minimax.io/anthropic/v1'
const AI_GATEWAY_KEY = 'sk-cp-NSI_LIXsJ343Q48iiWnhrzshz90kF-GXrnHJelmCYEi5O_JMB6LV6OpaSgFwTZtAT8BxVBXwfZoE6qBtlDsXE5LsVMLEAeb_gdLnz_YlQzDkaDzrwm5pdS0'

export const feed = new Hono<{ Bindings: Env }>()

feed.get('/', async (c) => {
  const deviceId = c.req.query('device_id')
  const limit = parseInt(c.req.query('limit') || '20')
  const useLLM = c.req.query('llm') === 'true'
  
  if (!deviceId) {
    return c.json({ error: 'device_id required' }, 400)
  }
  
  const preferences = await c.env.DB.prepare(`
    SELECT dp.*, a.title, a.content, a.summary, a.source 
    FROM device_preferences dp
    JOIN articles a ON dp.article_id = a.id
    WHERE dp.device_id = ?
    ORDER BY dp.created_at DESC
    LIMIT 50
  `).bind(deviceId).all()
  
  const interests = await c.env.DB.prepare(`
    SELECT topic, weight FROM user_interests 
    WHERE device_id = ? AND weight > 0
  `).bind(deviceId).all()
  
  const sourceScores = await c.env.DB.prepare(`
    SELECT source, score FROM source_scores WHERE device_id = ?
  `).bind(deviceId).all()
  
  const positiveSources = (sourceScores.results as { source: string; score: number }[])
    .filter(s => s.score > 0)
    .map(s => s.source)
  
  const negativeSources = (sourceScores.results as { source: string; score: number }[])
    .filter(s => s.score < 0)
    .map(s => s.source)
  
  let sql = `
    SELECT a.id, a.source, a.title, a.summary, a.content, a.url, a.author, 
           a.published_at, a.image_url, a.category, a.tags, a.day_date,
           dp.comment, dp.sentiment,
           COALESCE(ss.score, 0) as source_score
    FROM articles a
    LEFT JOIN device_preferences dp ON a.id = dp.article_id AND dp.device_id = ?
    LEFT JOIN source_scores ss ON a.source = ss.source AND ss.device_id = ?
    WHERE 1=1
  `
  
  const params: (string | number)[] = [deviceId, deviceId]
  
  if (negativeSources.length > 0) {
    const placeholders = negativeSources.map(() => '?').join(',')
    sql += ` AND a.source NOT IN (${placeholders})`
    params.push(...negativeSources)
  }
  
  sql += ' ORDER BY a.day_date DESC, a.sort_order ASC LIMIT ?'
  params.push(limit * 3)
  
  const result = await c.env.DB.prepare(sql).bind(...params).all()
  let articles = result.results as any[]
  
  articles = articles.slice(0, limit)
  
  return c.json({
    articles,
    stats: {
      preferences: (preferences.results as any[]).length,
      interests: (interests.results as any[]).length
    }
  })
})

async function rerankWithLLM(
  articles: any[],
  userPrefs: any[],
  interests: { topic: string; weight: number }[]
): Promise<any[]> {
  const topPrefs = userPrefs.slice(0, 10)
  
  const context = {
    userComments: topPrefs.map(p => ({
      articleTitle: p.title,
      sentiment: p.sentiment,
      comment: p.comment
    })),
    topics: interests.slice(0, 20).map(i => ({ topic: i.topic, weight: i.weight }))
  }
  
  const articleList = articles.slice(0, 30).map((a, i) => ({
    index: i,
    title: a.title,
    summary: a.summary,
    source: a.source
  }))
  
  const prompt = `You are a personalized news curator. Rank these articles based on what this user would find interesting.

User context:
- Their past feedback: ${JSON.stringify(context.userComments)}
- Topics they like: ${JSON.stringify(context.topics)}

Articles to rank:
${JSON.stringify(articleList, null, 2)}

Output a JSON array of article indices in the order they should appear (most interesting first).
Only output valid JSON array like [0, 5, 2, 1, ...], no explanation.`

  try {
    const response = await fetch(AI_GATEWAY_URL + '/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_GATEWAY_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      return articles
    }
    
    const data = await response.json() as { content: Array<{ type: string; text?: string }> }
    const text = data.content?.find(c => c.type === 'text')?.text || '[]'
    
    const indices = JSON.parse(text.replace(/[^[\d,]/g, (m) => m))
    
    if (!Array.isArray(indices)) {
      return articles
    }
    
    const ranked: any[] = []
    const used = new Set<number>()
    
    for (const idx of indices) {
      if (idx >= 0 && idx < articles.length && !used.has(idx)) {
        ranked.push(articles[idx])
        used.add(idx)
      }
    }
    
    for (let i = 0; i < articles.length; i++) {
      if (!used.has(i)) {
        ranked.push(articles[i])
      }
    }
    
    return ranked
  } catch (err) {
    console.error('LLM rerank failed:', err)
    return articles
  }
}

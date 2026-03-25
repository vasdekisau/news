import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

const AI_GATEWAY_URL = 'https://api.minimax.io/anthropic/v1'
const AI_GATEWAY_KEY = 'sk-cp-NSI_LIXsJ343Q48iiWnhrzshz90kF-GXrnHJelmCYEi5O_JMB6LV6OpaSgFwTZtAT8BxVBXwfZoE6qBtlDsXE5LsVMLEAeb_gdLnz_YlQzDkaDzrwm5pdS0'

export const preferences = new Hono<{ Bindings: Env }>()

preferences.get('/:deviceId', async (c) => {
  const deviceId = c.req.param('deviceId')
  
  const result = await c.env.DB.prepare(`
    SELECT dp.*, a.title, a.url, a.source 
    FROM device_preferences dp
    JOIN articles a ON dp.article_id = a.id
    WHERE dp.device_id = ?
    ORDER BY dp.created_at DESC
    LIMIT 100
  `).bind(deviceId).all()
  
  return c.json({ preferences: result.results })
})

preferences.post('/', async (c) => {
  const body = await c.req.json()
  const { device_id, article_id, comment, sentiment } = body
  
  if (!device_id || !article_id || !comment) {
    return c.json({ error: 'Missing required fields: device_id, article_id, comment' }, 400)
  }
  
  const article = await c.env.DB.prepare(
    'SELECT * FROM articles WHERE id = ?'
  ).bind(article_id).first() as { source: string; title: string; content: string } | undefined
  
  if (!article) {
    return c.json({ error: 'Article not found' }, 404)
  }
  
  await c.env.DB.prepare(`
    INSERT INTO device_preferences (device_id, article_id, comment, sentiment, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(device_id, article_id) DO UPDATE SET comment = ?, sentiment = ?, created_at = ?
  `).bind(device_id, article_id, comment, sentiment || 'neutral', Date.now(), comment, sentiment || 'neutral', Date.now()).run()
  
  const scoreDelta = sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0
  if (scoreDelta !== 0) {
    await c.env.DB.prepare(`
      INSERT INTO source_scores (device_id, source, score, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(device_id, source) DO UPDATE SET score = score + ?, updated_at = ?
    `).bind(device_id, article.source, scoreDelta, Date.now(), scoreDelta, Date.now()).run()
  }
  
  const topics = await extractTopics(comment, article.title + ' ' + (article.content || '').substring(0, 1000))
  for (const topic of topics) {
    const weight = sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0
    if (weight !== 0) {
      await c.env.DB.prepare(`
        INSERT INTO user_interests (device_id, topic, weight, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(device_id, topic) DO UPDATE SET weight = weight + ?, updated_at = ?
      `).bind(device_id, topic, weight, Date.now(), weight, Date.now()).run()
    }
  }
  
  return c.json({ success: true, topics })
})

preferences.delete('/:deviceId/:articleId', async (c) => {
  const { deviceId, articleId } = c.req.param()
  
  await c.env.DB.prepare(`
    DELETE FROM device_preferences WHERE device_id = ? AND article_id = ?
  `).bind(deviceId, articleId).run()
  
  return c.json({ success: true })
})

async function extractTopics(comment: string, articleContext: string): Promise<string[]> {
  const prompt = `Analyze this user feedback about articles they read. Extract 3-5 specific topics, themes, or keywords that represent what the user likes or dislikes.

User's comment: "${comment}"

Article context: "${articleContext.substring(0, 500)}"

Output a JSON array of topics as strings. Example output: ["technology", "AI", "startups", "politics"]
Only output valid JSON, no markdown, no explanation.`

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
      return []
    }
    
    const data = await response.json() as { content: Array<{ type: string; text?: string }> }
    const text = data.content?.find(c => c.type === 'text')?.text || '[]'
    
    const topics = JSON.parse(text.replace(/[^[]*\[[^\]]*\]/, (m) => m))
    return Array.isArray(topics) ? topics.filter((t: unknown) => typeof t === 'string').slice(0, 5) : []
  } catch (err) {
    console.error('Topic extraction failed:', err)
    return []
  }
}

import { Hono } from 'hono'

type Env = {
  DB: D1Database
  MYBROWSER: any
}

const AI_GATEWAY_URL = 'https://api.minimax.io/anthropic/v1'
const AI_GATEWAY_KEY = 'sk-cp-NSI_LIXsJ343Q48iiWnhrzshz90kF-GXrnHJelmCYEi5O_JMB6LV6OpaSgFwTZtAT8BxVBXwfZoE6qBtlDsXE5LsVMLEAeb_gdLnz_YlQzDkaDzrwm5pdS0'

export const scraper = new Hono<{ Bindings: Env }>()

scraper.get('/debug-hn', async (c) => {
  const response = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=5', {
    headers: { 'User-Agent': 'News-Vasdekis/1.0' }
  })
  const data = await response.json() as any
  const debug = data.hits.map((h: any) => ({
    title: h.title,
    titleType: typeof h.title,
    url: h.url,
    author: h.author
  }))
  return c.json({ count: data.hits.length, debug })
})

async function fetchRss(url: string): Promise<any[]> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'News-Vasdekis/1.0 (RSS Aggregator)',
      'Accept': 'application/rss+xml, application/xml, text/xml',
    }
  })
  
  if (!res.ok) {
    console.error(`Failed to fetch RSS: ${url}`, res.status)
    return []
  }
  
  const text = await res.text()
  
  const items: any[] = []
  const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/gi)
  
  for (const match of itemMatches) {
    const itemXml = match[1]
    
    const getTag = (tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
      const result = itemXml.match(regex)
      if (!result) return ''
      let content = result[1]
      const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
      if (cdataMatch) {
        content = cdataMatch[1]
      }
      return content.replace(/<[^>]+>/g, '').trim()
    }
    
    items.push({
      title: getTag('title'),
      link: getTag('link'),
      description: getTag('description'),
      content: getTag('content:encoded') || getTag('content'),
      pubDate: getTag('pubDate'),
      author: getTag('author') || getTag('dc:creator'),
    })
  }
  
  return items
}

async function fetchWithPlaywright(url: string, browser: any): Promise<{ content: string; image: string }> {
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 })
    
    const result = await page.evaluate(() => {
      const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''
      
      const article = document.querySelector('article')
      const main = document.querySelector('main')
      const contentDiv = document.querySelector('[class*="content"], [class*="article"], [id*="content"], [id*="article"]')
      
      const contentArea = article || main || contentDiv
      
      let content = ''
      if (contentArea) {
        const clone = contentArea.cloneNode(true) as Element
        clone.querySelectorAll('script, style, nav, header, footer, [class*="related"], [class*="sidebar"], [class*="ad"], [class*="share"], [class*="social"]').forEach(el => el.remove())
        content = clone.innerText || ''
      }
      
      return { content: content.trim(), image }
    })
    
    await page.close()
    return result
  } catch (err) {
    console.error(`Playwright failed for ${url}:`, err)
    return { content: '', image: '' }
  }
}

async function fetchArticleContent(url: string, browser?: any): Promise<{ content: string; image: string }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal as any
    })
    clearTimeout(timeout)
    
    if (!res.ok) {
      return { content: '', image: '' }
    }
    
    const html = await res.text()
    
    let image = ''
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    if (ogImage) {
      image = ogImage[1]
    }
    
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    
    let content = ''
    const contentArea = articleMatch?.[1] || mainMatch?.[1]
    
    if (contentArea) {
      content = contentArea
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    if (content.length < 500 && browser) {
      console.log(`Low content (${content.length} chars), trying Playwright for: ${url}`)
      return fetchWithPlaywright(url, browser)
    }
    
    return { content, image }
  } catch (err) {
    console.error(`Failed to fetch article: ${url}`, err)
    return { content: '', image: '' }
  }
}

async function cleanContentWithAI(content: string): Promise<string> {
  if (content.length < 500) {
    return content
  }
  
  const prompt = `Clean up this article text by:
1. Removing boilerplate text (navigation, ads, share buttons, footers, related articles)
2. Fixing broken formatting or garbled text
3. Normalizing whitespace
4. Removing duplicate text if any

Output ONLY the cleaned article text, nothing else.

Article:
${content.substring(0, 80000)}`

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
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      return content
    }
    
    const data = await response.json() as { content: Array<{ type: string; text?: string }> }
    const cleaned = data.content?.find(c => c.type === 'text')?.text || content
    
    return cleaned.substring(0, 100000)
  } catch (err) {
    console.error('AI content cleaning failed:', err)
    return content
  }
}

function generateSummary(content: string): string {
  const decoded = content
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
  const stripped = decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const sentences = stripped.split(/[.!?]+/).filter(s => s.trim().length > 20)
  return sentences.slice(0, 3).join('. ').trim().substring(0, 300)
}

function titleFromUrl(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/\/$/, '')
    const segments = path.split('/').filter(Boolean)
    const last = segments[segments.length - 1] || ''
    const name = u.hostname.replace(/^www\./, '')
    if (!last) return `${name} article`
    const title = last.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    return title.length > 10 ? title : `${name} article`
  } catch {
    return 'Untitled'
  }
}

scraper.post('/fetch', async (c) => {
  const body = await c.req.json()
  const { source_id, url, source_name } = body
  const browser = c.env.MYBROWSER
  
  if (!url) {
    return c.json({ error: 'URL required' }, 400)
  }
  
  console.log(`Fetching RSS: ${url}`)
  
  const items = await fetchRss(url)
  
  if (items.length === 0) {
    return c.json({ message: 'No items found', fetched: 0 })
  }
  
  let inserted = 0
  
  for (const item of items) {
    if (!item.link) continue
    
    const existing = await c.env.DB.prepare(
      'SELECT id FROM articles WHERE url = ?'
    ).bind(item.link).first()
    
    if (existing) continue
    
    const { content, image } = await fetchArticleContent(item.link, browser)
    
    const cleanedContent = await cleanContentWithAI(content || item.content || item.description || '')
    const summary = generateSummary(cleanedContent)
    
    const id = crypto.randomUUID()
    const publishedAt = item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
    
    await c.env.DB.prepare(`
      INSERT INTO articles (id, source, url, title, content, summary, author, image_url, published_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      source_name || 'unknown',
      item.link,
      item.title?.trim() || titleFromUrl(item.link),
      cleanedContent,
      summary,
      item.author || '',
      image || '',
      Math.floor(publishedAt / 1000),
      Math.floor(Date.now() / 1000)
    ).run()
    
    inserted++
  }
  
  if (source_id) {
    await c.env.DB.prepare(
      'UPDATE content_sources SET last_fetched_at = ? WHERE id = ?'
    ).bind(Math.floor(Date.now() / 1000), source_id).run()
  }
  
  return c.json({ message: `Fetched ${items.length} items, inserted ${inserted}` })
})

scraper.post('/fetch-all', async (c) => {
  const browser = c.env.MYBROWSER
  const sources = await c.env.DB.prepare(
    'SELECT * FROM content_sources WHERE enabled = 1'
  ).all()
  
  const results = []
  
  for (const source of (sources.results as any[])) {
    const items = await fetchRss(source.url)
    
    let inserted = 0
    
    for (const item of items) {
      if (!item.link) continue
      
      const existing = await c.env.DB.prepare(
        'SELECT id FROM articles WHERE url = ?'
      ).bind(item.link).first()
      
      if (existing) continue
      
      const { content, image } = await fetchArticleContent(item.link)
      
      const cleanedContent = await cleanContentWithAI(content || item.content || item.description || '')
      const summary = generateSummary(cleanedContent)
      
      const id = crypto.randomUUID()
      const publishedAt = item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
      
      await c.env.DB.prepare(`
        INSERT INTO articles (id, source, url, title, content, summary, author, image_url, published_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        source.name,
        item.link,
        item.title?.trim() || titleFromUrl(item.link),
        cleanedContent,
        summary,
        item.author || '',
        image || '',
        Math.floor(publishedAt / 1000),
        Math.floor(Date.now() / 1000)
      ).run()
      
      inserted++
    }
    
    await c.env.DB.prepare(
      'UPDATE content_sources SET last_fetched_at = ? WHERE id = ?'
    ).bind(Math.floor(Date.now() / 1000), source.id).run()
    
    results.push({ source: source.name, items: items.length, inserted })
  }
  
  return c.json({ results })
})

scraper.post('/fetch-hackernews', async (c) => {
  const browser = c.env.MYBROWSER
  
  // Use HN's native API - returns stories in standard frontpage order
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
    headers: {
      'User-Agent': 'News-Vasdekis/1.0'
    }
  })
  
  if (!response.ok) {
    return c.json({ error: 'Failed to fetch Hacker News' }, 500)
  }
  
  const storyIds: number[] = await response.json()
  const topIds = storyIds.slice(0, 30) // Get top 30
  
  // Fetch story details in parallel (HN API allows batch)
  const storyResponses = await Promise.all(
    topIds.map(id => 
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        headers: { 'User-Agent': 'News-Vasdekis/1.0' }
      }).then(res => res.json())
    )
  )
  
  let inserted = 0
  
  for (const story of storyResponses) {
    if (!story || !story.url) continue
    
    const existing = await c.env.DB.prepare(
      'SELECT id FROM articles WHERE url = ?'
    ).bind(story.url).first()
    
    if (existing) continue
    
    const { content, image } = await fetchArticleContent(story.url, browser)
    
    const cleanedContent = await cleanContentWithAI(content || story.title)
    const summary = generateSummary(cleanedContent)
    
    const id = crypto.randomUUID()
    const publishedAt = story.time ? story.time * 1000 : Date.now()
    
    await c.env.DB.prepare(`
      INSERT INTO articles (id, source, url, title, content, summary, author, image_url, published_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      'Hacker News',
      story.url,
      story.title?.trim() || titleFromUrl(story.url),
      cleanedContent,
      summary,
      story.by || '',
      image || '',
      Math.floor(publishedAt / 1000),
      Math.floor(Date.now() / 1000)
    ).run()
    
    inserted++
  }
  
  return c.json({ message: `Fetched ${topIds.length} stories, inserted ${inserted}` })
})

scraper.post('/reprocess/:id', async (c) => {
  const id = c.req.param('id')
  const browser = c.env.MYBROWSER
  
  const article = await c.env.DB.prepare(
    'SELECT url FROM articles WHERE id = ?'
  ).bind(id).first() as { url: string } | undefined
  
  if (!article) {
    return c.json({ error: 'Article not found' }, 404)
  }
  
  const { content, image } = await fetchArticleContent(article.url, browser)
  const cleanedContent = await cleanContentWithAI(content)
  const summary = generateSummary(cleanedContent)
  
  await c.env.DB.prepare(`
    UPDATE articles SET content = ?, summary = ?, image_url = COALESCE(NULLIF(?, ''), image_url) WHERE id = ?
  `).bind(cleanedContent, summary, image, id).run()
  
  return c.json({ success: true, contentLength: cleanedContent.length })
})

scraper.post('/fetch-everything', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const day = body.day || null
  const results = await doScrape(c.env.DB, c.env.KV, null, day)
  return c.json(results)
})

export async function doScrape(db: D1Database, kv: KVNamespace | null, browser: any, targetDay?: string | null) {
  const results: any = { sources: [], hackernews: null, errors: [], ranking: null, targetDay }
  const newArticleIds: string[] = []
  
  try {
    const sourcesData = await db.prepare(
      'SELECT * FROM content_sources WHERE enabled = 1'
    ).all()
    
    for (const source of (sourcesData.results as any[])) {
      const items = await fetchRss(source.url)
      let inserted = 0
      
      for (const item of items) {
        if (!item.link) continue
        
        const existing = await db.prepare(
          'SELECT id FROM articles WHERE url = ?'
        ).bind(item.link).first()
        
        if (existing) continue
        
        const rawContent = item.content || item.description || ''
        const decoded = rawContent
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
          .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
        const summary = decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300)
        
        const id = crypto.randomUUID()
        const publishedAt = item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
        const dayDate = targetDay || new Date(publishedAt).toISOString().split('T')[0]
        
        await db.prepare(`
          INSERT INTO articles (id, source, url, title, content, summary, author, image_url, published_at, created_at, day_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          source.name,
          item.link,
          item.title?.trim() || titleFromUrl(item.link),
          rawContent,
          summary,
          item.author || '',
          '',
          Math.floor(publishedAt / 1000),
          Math.floor(Date.now() / 1000),
          dayDate
        ).run()
        
        newArticleIds.push(id)
        inserted++
      }
      
      await db.prepare(
        'UPDATE content_sources SET last_fetched_at = ? WHERE id = ?'
      ).bind(Math.floor(Date.now() / 1000), source.id).run()
      
      results.sources.push({ source: source.name, items: items.length, inserted })
    }
  } catch (err: any) {
    results.errors.push({ step: 'rss', error: err.message })
  }
  
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      headers: { 'User-Agent': 'News-Vasdekis/1.0' }
    })
    
    if (response.ok) {
      const storyIds: number[] = await response.json()
      const topIds = storyIds.slice(0, 30)
      
      const storyResponses = await Promise.all(
        topIds.map(id => 
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            headers: { 'User-Agent': 'News-Vasdekis/1.0' }
          }).then(res => res.json())
        )
      )
      
      let inserted = 0
      
      for (const story of storyResponses) {
        if (!story || !story.url) continue
        
        const title = story.title ? String(story.title).trim() : titleFromUrl(story.url)
        
        const existing = await db.prepare(
          'SELECT id FROM articles WHERE url = ?'
        ).bind(story.url).first()
        
        if (existing) continue
        
        const id = crypto.randomUUID()
        const publishedAt = story.time ? story.time * 1000 : Date.now()
        const dayDate = targetDay || new Date(publishedAt).toISOString().split('T')[0]
        
        await db.prepare(`
          INSERT INTO articles (id, source, url, title, content, summary, author, image_url, published_at, created_at, day_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          'Hacker News',
          story.url,
          title,
          '',
          title,
          story.by || '',
          '',
          Math.floor(publishedAt / 1000),
          Math.floor(Date.now() / 1000),
          dayDate
        ).run()
        
        newArticleIds.push(id)
        inserted++
      }
      
      results.hackernews = { fetched: topIds.length, inserted }
    }
  } catch (err: any) {
    results.errors.push({ step: 'hackernews', error: err.message })
  }
  
  try {
    const ranked = await rankArticlesByDay(db, newArticleIds)
    results.ranking = ranked
  } catch (err: any) {
    results.errors.push({ step: 'ranking', error: err.message })
  }
  
  fetch('https://nosnch.in/1bfce7fd7b', { method: 'POST' }).catch(() => {})
  
  return results
}

async function rankArticlesByDay(db: D1Database, newArticleIds: string[]) {
  if (newArticleIds.length === 0) {
    return { days: 0, articlesRanked: 0 }
  }
  
  const byDay: Record<string, any[]> = {}
  const BATCH_SIZE = 100
  
  for (let i = 0; i < newArticleIds.length; i += BATCH_SIZE) {
    const batch = newArticleIds.slice(i, i + BATCH_SIZE)
    const placeholders = batch.map(() => '?').join(',')
    const articles = await db.prepare(`
      SELECT id, title, summary, source, day_date, published_at
      FROM articles
      WHERE id IN (${placeholders})
    `).bind(...batch).all()
    
    for (const article of (articles.results as any[])) {
      const day = article.day_date
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(article)
    }
  }
  
  let totalRanked = 0
  
  for (const [day, dayArticles] of Object.entries(byDay)) {
    if (dayArticles.length < 2) {
      for (let i = 0; i < dayArticles.length; i++) {
        await db.prepare('UPDATE articles SET sort_order = ? WHERE id = ?').bind(i, dayArticles[i].id).run()
      }
      continue
    }
    
    const articleList = dayArticles.map((a, i) => ({
      index: i,
      title: a.title,
      summary: (a.summary || '').substring(0, 200),
      source: a.source
    }))
    
    const prompt = `You are a news curator. Rank these articles by how interesting/important they are for a reader, most interesting first.

Articles from ${day}:
${JSON.stringify(articleList, null, 2)}

Output a JSON array of article indices in the order they should appear (most interesting first).
Only output valid JSON array like [0, 5, 2, 1, ...], no explanation.`
    
    try {
      const resp = await fetch(AI_GATEWAY_URL + '/messages', {
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
      
      if (resp.ok) {
        const data = await resp.json() as { content: Array<{ type: string; text?: string }> }
        const text = data.content?.find(c => c.type === 'text')?.text || '[]'
        const indices = JSON.parse(text.replace(/[^[\d,]/g, (m) => m)) as number[]
        
        for (let rank = 0; rank < indices.length; rank++) {
          const article = dayArticles[indices[rank]]
          if (article) {
            await db.prepare('UPDATE articles SET sort_order = ? WHERE id = ?').bind(rank, article.id).run()
            totalRanked++
          }
        }
      }
    } catch (err) {
      console.error('LLM ranking failed for day', day, err)
    }
  }
  
  return { days: Object.keys(byDay).length, articlesRanked: totalRanked }
}

export default scraper

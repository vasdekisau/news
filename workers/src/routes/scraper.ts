import { Hono } from 'hono'

type Env = {
  DB: D1Database
  MYBROWSER: any
}

export const scraper = new Hono<{ Bindings: Env }>()

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
  
  // Simple XML parsing
  const items: any[] = []
  const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/gi)
  
  for (const match of itemMatches) {
    const itemXml = match[1]
    
    const getTag = (tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
      const result = itemXml.match(regex)
      return result ? result[1].replace(/<[^>]+>/g, '').trim() : ''
    }
    
    const getAttr = (tag: string, attr: string): string => {
      const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i')
      const result = itemXml.match(regex)
      return result ? result[1] : ''
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

async function fetchWithPlaywright(url: string, browser: any): Promise<{ content: string; summary: string; image: string }> {
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
    
    const result = await page.evaluate(() => {
      const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''
      
      const article = document.querySelector('article')
      const main = document.querySelector('main')
      const contentDiv = document.querySelector('[class*="content"], [class*="article"], [id*="content"], [id*="article"]')
      
      const contentArea = article || main || contentDiv
      let content = ''
      
      if (contentArea) {
        content = contentArea.innerText || ''
      }
      
      if (content.length > 5000) {
        content = content.substring(0, 5000) + '...'
      }
      
      const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 20)
      const summary = sentences.slice(0, 3).join('. ').trim()
      
      return { content, summary, image }
    })
    
    await page.close()
    return result
  } catch (err) {
    console.error(`Playwright failed for ${url}:`, err)
    return { content: '', summary: '', image: '' }
  }
}

async function fetchArticleContent(url: string, browser?: any): Promise<{ content: string; summary: string; image: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    })
    
    if (!res.ok) {
      return { content: '', summary: '', image: '' }
    }
    
    const html = await res.text()
    
    let content = ''
    let image = ''
    
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    if (ogImage) {
      image = ogImage[1]
    }
    
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    const bodyMatch = html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
    
    const contentArea = articleMatch || mainMatch || bodyMatch
    
    if (contentArea) {
      content = contentArea[1]
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (content.length > 5000) {
        content = content.substring(0, 5000) + '...'
      }
    }
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
    const summary = sentences.slice(0, 3).join('. ').trim()
    
    if (!content && browser) {
      console.log(`Simple fetch empty, trying Playwright for: ${url}`)
      return fetchWithPlaywright(url, browser)
    }
    
    return { content, summary, image }
  } catch (err) {
    console.error(`Failed to fetch article: ${url}`, err)
    return { content: '', summary: '', image: '' }
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
    
    // Check if article already exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM articles WHERE url = ?'
    ).bind(item.link).first()
    
    if (existing) continue
    
    // Fetch full content (with Playwright fallback)
    const { content, summary, image } = await fetchArticleContent(item.link, browser)
    
    const id = crypto.randomUUID()
    const publishedAt = item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
    
    await c.env.DB.prepare(`
      INSERT INTO articles (id, source, url, title, content, summary, author, image_url, published_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      source_name || 'unknown',
      item.link,
      item.title || 'Untitled',
      content || item.content || item.description || '',
      summary || item.description?.substring(0, 200) || '',
      item.author || '',
      image || '',
      Math.floor(publishedAt / 1000),
      Math.floor(Date.now() / 1000)
    ).run()
    
    inserted++
  }
  
  // Update last fetched time
  if (source_id) {
    await c.env.DB.prepare(
      'UPDATE content_sources SET last_fetched_at = ? WHERE id = ?'
    ).bind(Math.floor(Date.now() / 1000), source_id).run()
  }
  
  return c.json({ message: `Fetched ${items.length} items, inserted ${inserted}` })
})

// Trigger fetch for all enabled sources
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
      
      const { content, summary, image } = await fetchArticleContent(item.link)
      
      const id = crypto.randomUUID()
      const publishedAt = item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
      
      await c.env.DB.prepare(`
        INSERT INTO articles (id, source, url, title, content, summary, author, image_url, published_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        source.name,
        item.link,
        item.title || 'Untitled',
        content || item.content || item.description || '',
        summary || item.description?.substring(0, 200) || '',
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

export default scraper

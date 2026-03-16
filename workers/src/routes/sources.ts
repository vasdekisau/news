import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

export const sources = new Hono<{ Bindings: Env }>()

sources.get('/', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT * FROM content_sources 
    ORDER BY name
  `).all()
  
  return c.json({ sources: result.results })
})

sources.post('/', async (c) => {
  const body = await c.req.json()
  const { name, type, url, fetch_interval_minutes } = body
  
  if (!name || !type || !url) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  const id = crypto.randomUUID()
  
  await c.env.DB.prepare(`
    INSERT INTO content_sources (id, name, type, url, fetch_interval_minutes, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, name, type, url, fetch_interval_minutes || 60, Date.now()).run()
  
  return c.json({ success: true, id })
})

sources.delete('/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM content_sources WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

sources.post('/:id/fetch', async (c) => {
  const id = c.req.param('id')
  
  const source = await c.env.DB.prepare('SELECT * FROM content_sources WHERE id = ?').bind(id).first()
  if (!source) {
    return c.json({ error: 'Source not found' }, 404)
  }
  
  await c.env.DB.prepare(`
    INSERT INTO jobs (type, payload, status, created_at)
    VALUES (?, ?, ?, ?)
  `).bind('fetch_source', JSON.stringify({ source_id: id, url: source.url, type: source.type }), 'pending', Date.now()).run()
  
  return c.json({ success: true, message: 'Fetch job queued' })
})

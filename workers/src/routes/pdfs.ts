import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

export const pdfs = new Hono<{ Bindings: Env }>()

pdfs.get('/', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT * FROM pdfs ORDER BY added_at DESC LIMIT 50
  `).all()
  
  return c.json({ pdfs: result.results })
})

pdfs.get('/:id', async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare('SELECT * FROM pdfs WHERE id = ?').bind(id).first()
  
  if (!result) {
    return c.json({ error: 'PDF not found' }, 404)
  }
  
  return c.json({ pdf: result })
})

pdfs.post('/', async (c) => {
  const body = await c.req.json()
  const { drive_file_id, filename, url, content, summary } = body
  
  if (!filename) {
    return c.json({ error: 'Missing filename' }, 400)
  }
  
  const id = crypto.randomUUID()
  
  await c.env.DB.prepare(`
    INSERT INTO pdfs (id, drive_file_id, filename, url, content, summary, added_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, drive_file_id || null, filename, url || null, content || null, summary || null, Date.now()).run()
  
  return c.json({ success: true, id })
})

import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

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
  const { device_id, article_id, preference } = body
  
  if (!device_id || !article_id || preference === undefined) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  await c.env.DB.prepare(`
    INSERT INTO device_preferences (device_id, article_id, preference, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(device_id, article_id) DO UPDATE SET preference = ?, created_at = ?
  `).bind(device_id, article_id, preference, Date.now(), preference, Date.now()).run()
  
  return c.json({ success: true })
})

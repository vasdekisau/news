import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

export const feed = new Hono<{ Bindings: Env }>()

feed.get('/', async (c) => {
  const deviceId = c.req.query('device_id')
  const limit = c.req.query('limit') || '20'
  
  if (!deviceId) {
    return c.json({ error: 'device_id required' }, 400)
  }
  
  const likedArticles = await c.env.DB.prepare(`
    SELECT article_id FROM device_preferences 
    WHERE device_id = ? AND preference = 1
  `).bind(deviceId).all()
  
  const dislikedArticles = await c.env.DB.prepare(`
    SELECT article_id FROM device_preferences 
    WHERE device_id = ? AND preference = -1
  `).bind(deviceId).all()
  
  const likedIds = (likedArticles.results as { article_id: string }[]).map(r => r.article_id)
  const dislikedIds = (dislikedArticles.results as { article_id: string }[]).map(r => r.article_id)
  
  let sql = `
    SELECT a.*, dp.preference as user_preference
    FROM articles a
    LEFT JOIN device_preferences dp ON a.id = dp.article_id AND dp.device_id = ?
  `
  
  const params: (string | number)[] = [deviceId]
  
  if (dislikedIds.length > 0) {
    const placeholders = dislikedIds.map(() => '?').join(',')
    sql += ` WHERE a.id NOT IN (${placeholders})`
    params.push(...dislikedIds)
  }
  
  sql += ' ORDER BY '
  
  if (likedIds.length > 0) {
    sql += `CASE WHEN a.id IN (${likedIds.map(() => '?').join(',')}) THEN 0 ELSE 1 END, `
  }
  
  sql += ' a.published_at DESC LIMIT ?'
  params.push(...(likedIds.length > 0 ? likedIds : []), parseInt(limit))
  
  const result = await c.env.DB.prepare(sql).bind(...params).all()
  
  return c.json({
    articles: result.results,
    stats: {
      liked: likedIds.length,
      disliked: dislikedIds.length
    }
  })
})

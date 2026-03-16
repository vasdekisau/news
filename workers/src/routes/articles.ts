import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

export const articles = new Hono<{ Bindings: Env }>()

articles.get('/', async (c) => {
  const limit = c.req.query('limit') || '20'
  const offset = c.req.query('offset') || '0'
  const source = c.req.query('source')
  const category = c.req.query('category')
  
  let sql = 'SELECT * FROM articles'
  const params: string[] = []
  const conditions: string[] = []
  
  if (source) {
    conditions.push('source = ?')
    params.push(source)
  }
  if (category) {
    conditions.push('category = ?')
    params.push(category)
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }
  
  sql += ' ORDER BY published_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  const result = await c.env.DB.prepare(sql).bind(...params).all()
  
  return c.json({
    articles: result.results,
    limit: parseInt(limit),
    offset: parseInt(offset)
  })
})

articles.get('/:id', async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare('SELECT * FROM articles WHERE id = ?').bind(id).first()
  
  if (!result) {
    return c.json({ error: 'Article not found' }, 404)
  }
  
  return c.json({ article: result })
})

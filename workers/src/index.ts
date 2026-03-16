import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { articles } from './routes/articles'
import { preferences } from './routes/preferences'
import { sources } from './routes/sources'
import { pdfs } from './routes/pdfs'
import { feed } from './routes/feed'
import { scraper } from './routes/scraper'

type Env = {
  DB: D1Database
  KV: KVNamespace
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())
app.use('*', logger())

app.get('/', (c) => c.json({ 
  name: 'News Vasdekis API', 
  version: '1.0.0',
  endpoints: ['/api/articles', '/api/feed', '/api/preferences', '/api/sources', '/api/pdfs']
}))

app.route('/api/articles', articles)
app.route('/api/preferences', preferences)
app.route('/api/sources', sources)
app.route('/api/pdfs', pdfs)
app.route('/api/feed', feed)
app.route('/api/scraper', scraper)

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => c.json({ error: err.message }, 500))

export default app

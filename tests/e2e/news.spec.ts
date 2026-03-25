import { test, expect } from '@playwright/test'

const PASSWORD = '14'

test.describe('News Vasdekis', () => {
  test('password gate works', async ({ page }) => {
    await page.goto('/')
    
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible()
    
    await passwordInput.fill(PASSWORD)
    await page.keyboard.press('Enter')
    
    await page.waitForSelector('text=News Vasdekis', { timeout: 5000 })
  })

  test('feed shows articles after login', async ({ page }) => {
    await page.goto('/')
    
    await page.locator('input[type="password"]').fill(PASSWORD)
    await page.keyboard.press('Enter')
    
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible({ timeout: 10000 })
    
    const articleCards = page.locator('article, [class*="card"], [class*="article"]')
    const hasArticles = await articleCards.count() > 0 || await page.locator('h1, h2, h3').count() > 0
    
    expect(hasArticles).toBeTruthy()
  })

  test('API returns articles', async ({ request }) => {
    const res = await request.get('https://api.vasdekis.com.au/api/articles?limit=5')
    expect(res.ok()).toBeTruthy()
    
    const data = await res.json()
    expect(Array.isArray(data.articles)).toBeTruthy()
    expect(data.articles.length).toBeGreaterThan(0)
    
    const article = data.articles[0]
    expect(article).toHaveProperty('title')
    expect(article).toHaveProperty('url')
    expect(article).toHaveProperty('source')
  })

  test('fetch-everything endpoint works', async ({ request }) => {
    const res = await request.post('https://api.vasdekis.com.au/api/scraper/fetch-everything', {
      timeout: 60000
    })
    expect(res.ok()).toBeTruthy()
    
    const data = await res.json()
    expect(data).toHaveProperty('sources')
    expect(Array.isArray(data.sources)).toBeTruthy()
  })

  test('sources endpoint returns configured sources', async ({ request }) => {
    const res = await request.get('https://api.vasdekis.com.au/api/sources')
    expect(res.ok()).toBeTruthy()
    
    const data = await res.json()
    expect(Array.isArray(data.sources)).toBeTruthy()
    expect(data.sources.length).toBeGreaterThan(0)
    
    const sourceNames = data.sources.map((s: any) => s.name)
    expect(sourceNames).toContain('BBC World')
    expect(sourceNames).toContain('Hacker News')
  })

  test('articles have real titles, not Untitled', async ({ request }) => {
    // Trigger a fresh fetch to get new articles
    await request.post('https://api.vasdekis.com.au/api/scraper/fetch-everything', {
      timeout: 120000
    })
    
    // Check the feed
    const feedRes = await request.get('https://api.vasdekis.com.au/api/feed?device_id=test-titles&limit=20')
    expect(feedRes.ok()).toBeTruthy()
    
    const data = await feedRes.json()
    expect(Array.isArray(data.articles)).toBeTruthy()
    expect(data.articles.length).toBeGreaterThan(0)
    
    // Count how many have "Untitled" as title
    const untitledCount = data.articles.filter((a: any) => 
      !a.title || a.title === 'Untitled'
    ).length
    
    // Most articles should have real titles (allow a small margin for truly unparseable content)
    expect(untitledCount).toBeLessThan(data.articles.length * 0.5)
    
    // Every article that has a URL should have a non-empty title
    for (const article of data.articles) {
      if (article.url) {
        expect(article.title, `Article URL: ${article.url}`).toBeTruthy()
        expect(article.title !== 'Untitled', `Article URL: ${article.url}`).toBeTruthy()
      }
    }
  })

  test('article summaries do not contain HTML entities', async ({ request }) => {
    await request.post('https://api.vasdekis.com.au/api/scraper/fetch-everything', {
      timeout: 120000
    })
    
    const feedRes = await request.get('https://api.vasdekis.com.au/api/feed?device_id=test-html-entities&limit=20')
    expect(feedRes.ok()).toBeTruthy()
    
    const data = await feedRes.json()
    const htmlEntityPattern = /&lt;|&gt;|&amp;|&#/
    
    for (const article of data.articles) {
      if (article.summary) {
        expect(article.summary, `Article: ${article.title || article.url}`).not.toMatch(htmlEntityPattern)
      }
      if (article.title) {
        expect(article.title, `Article: ${article.url}`).not.toMatch(htmlEntityPattern)
      }
    }
  })
})

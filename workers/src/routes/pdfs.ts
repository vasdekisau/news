import { Hono } from 'hono'

type Env = {
  DB: D1Database
  PDFS: R2Bucket
}

const AI_GATEWAY_URL = 'https://api.minimax.io/anthropic/v1'
const AI_GATEWAY_KEY = 'sk-cp-NSI_LIXsJ343Q48iiWnhrzshz90kF-GXrnHJelmCYEi5O_JMB6LV6OpaSgFwTZtAT8BxVBXwfZoE6qBtlDsXE5LsVMLEAeb_gdLnz_YlQzDkaDzrwm5pdS0'

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
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }
  
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return c.json({ error: 'File must be a PDF' }, 400)
  }
  
  const id = crypto.randomUUID()
  const filename = file.name
  
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)
  
  const r2Key = `temp/${id}.pdf`
  await c.env.PDFS.put(r2Key, buffer, {
    httpMetadata: { contentType: 'application/pdf' }
  })
  
  let text = ''
  let imageKeys: string[] = []
  
  try {
    const extractResult = await extractPdfContent(buffer, id, c.env.PDFS)
    text = extractResult.text
    imageKeys = extractResult.imageKeys
  } catch (err) {
    console.error('PDF extraction failed:', err)
  }
  
  await c.env.PDFS.delete(r2Key)
  
  const summary = text.substring(0, 200)
  
  await c.env.DB.prepare(`
    INSERT INTO pdfs (id, filename, content, summary, images, added_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, filename, text, summary, JSON.stringify(imageKeys), Date.now()).run()
  
  let contentFixed = ''
  
  if (text.length > 100) {
    try {
      contentFixed = await processWithAI(text)
      
      await c.env.DB.prepare(`
        UPDATE pdfs SET content_fixed = ? WHERE id = ?
      `).bind(contentFixed, id).run()
    } catch (err) {
      console.error('AI processing failed:', err)
    }
  }
  
  return c.json({ 
    success: true, 
    id, 
    textLength: text.length, 
    imageCount: imageKeys.length,
    processed: contentFixed.length > 0
  })
})

pdfs.delete('/:id', async (c) => {
  const id = c.req.param('id')
  
  const pdf = await c.env.DB.prepare('SELECT images FROM pdfs WHERE id = ?').bind(id).first() as { images: string } | undefined
  if (pdf?.images) {
    const imageKeys = JSON.parse(pdf.images) as string[]
    for (const key of imageKeys) {
      await c.env.PDFS.delete(key)
    }
  }
  
  await c.env.DB.prepare('DELETE FROM pdfs WHERE id = ?').bind(id).run()
  
  return c.json({ success: true })
})

pdfs.post('/:id/reprocess', async (c) => {
  const id = c.req.param('id')
  
  const pdf = await c.env.DB.prepare('SELECT content FROM pdfs WHERE id = ?').bind(id).first() as { content: string } | undefined
  if (!pdf) {
    return c.json({ error: 'PDF not found' }, 404)
  }
  
  if (!pdf.content || pdf.content.length < 100) {
    return c.json({ error: 'No content to process' }, 400)
  }
  
  try {
    const contentFixed = await processWithAI(pdf.content)
    
    await c.env.DB.prepare(`
      UPDATE pdfs SET content_fixed = ? WHERE id = ?
    `).bind(contentFixed, id).run()
    
    return c.json({ success: true, contentFixedLength: contentFixed.length })
  } catch (err) {
    console.error('AI processing failed:', err)
    return c.json({ error: 'AI processing failed' }, 500)
  }
})

pdfs.get('/images/:key(*)', async (c) => {
  const key = c.req.param('key')
  
  const object = await c.env.PDFS.get(key)
  
  if (!object) {
    return c.json({ error: 'Image not found' }, 404)
  }
  
  const data = await object.arrayBuffer()
  
  return new Response(data, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/png',
      'Cache-Control': 'public, max-age=31536000'
    }
  })
})

async function extractPdfContent(pdfData: Uint8Array, pdfId: string, pdfsBucket: R2Bucket): Promise<{ text: string; imageKeys: string[] }> {
  const { getDocument } = await import('pdfjs-dist')
  
  const doc = await getDocument({ data: pdfData }).promise
  let fullText = ''
  const imageKeys: string[] = []
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    
    for (const item of content.items) {
      if ('str' in item) {
        fullText += item.str + '\n'
      }
    }
    
    const operators = await page.getOperatorList()
    for (let j = 0; j < operators.fnArray.length; j++) {
      if (operators.fnArray[j] === 85) {
        const img = operators.argsArray[j][0]
        if (img && img.data) {
          const imageData = new Uint8Array(img.data)
          const imageKey = `images/${pdfId}/page-${i}-${j}.png`
          await pdfsBucket.put(imageKey, imageData, {
            httpMetadata: { contentType: 'image/png' }
          })
          imageKeys.push(imageKey)
        }
      }
    }
  }
  
  return { text: fullText.trim(), imageKeys }
}

async function processWithAI(text: string): Promise<string> {
  const prompt = `You are processing a PDF document that was converted to text. The text may have broken formatting, missing paragraphs, or garbled content from the OCR/conversion process.

Your task is to reconstruct the document into a clean, well-formatted article. If the source material is not clear enough to reconstruct meaningfully, provide a clear summary of what you can understand.

Output ONLY the reconstructed article text - no commentary, no explanations, no "here's the reconstructed content" - just the text itself.

Original text:
${text.substring(0, 50000)}`

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
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json() as { content: Array<{ type: string; text?: string }> }
  
  const textContent = data.content?.find(c => c.type === 'text')?.text || ''
  
  return textContent
}

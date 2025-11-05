import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function prerender() {
  const { render } = await import('../dist/server/entry-server.js')
  
  // Read the client-built index.html
  const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8')
  
  // Routes to prerender
  const routes = [
    '/',
    '/builder',
    '/my_resumes',
    '/ats_checker', 
    '/feedback'
  ]

  for (const route of routes) {
    console.log(`Prerendering ${route}...`)
    
    try {
      const { html } = render(route)
      
      // Replace the placeholder content with SSR content
      const htmlWithSSR = template.replace(`<!--ssr-outlet-->`, html)
      
      // Create directory if it doesn't exist
      const routePath = route === '/' ? '/index' : route
      const dirPath = path.resolve(__dirname, `../dist${routePath}`)
      
      if (route !== '/') {
        fs.mkdirSync(dirPath, { recursive: true })
        fs.writeFileSync(path.resolve(dirPath, 'index.html'), htmlWithSSR)
      } else {
        fs.writeFileSync(path.resolve(__dirname, '../dist/index.html'), htmlWithSSR)
      }
      
      console.log(`✓ Generated ${route}`)
    } catch (error) {
      console.error(`✗ Failed to prerender ${route}:`, error)
    }
  }
}

prerender().catch(console.error)
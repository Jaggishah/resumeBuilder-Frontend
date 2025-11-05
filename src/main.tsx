import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!

// Check if the page was server-side rendered
const isSSR = rootElement.hasChildNodes()

if (isSSR) {
  // Hydrate for SSR
  hydrateRoot(
    rootElement,
    <StrictMode>
      <App />
    </StrictMode>
  )
} else {
  // Regular client-side rendering
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

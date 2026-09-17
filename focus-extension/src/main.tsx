import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './popup/App'
import './popup/styles.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Focus extension root element not found.')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

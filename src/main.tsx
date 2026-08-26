import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted fonts (no render-blocking third-party request at runtime)
import '@fontsource-variable/sora'
import '@fontsource-variable/inter'
import '@fontsource-variable/noto-sans-sinhala'
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

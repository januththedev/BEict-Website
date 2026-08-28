import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted fonts (no render-blocking third-party request at runtime)
import '@fontsource-variable/sora'
import '@fontsource-variable/inter'
import '@fontsource-variable/noto-sans-sinhala'

import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

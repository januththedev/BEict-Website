import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { cmsLocalApi } from './scripts/cms-local-api.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cmsLocalApi()],
})

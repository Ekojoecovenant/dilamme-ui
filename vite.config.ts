import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'ekojoe.name.ng',
      'scheduler.ekojoe.name.ng'
    ],
    host: true,
  }
})

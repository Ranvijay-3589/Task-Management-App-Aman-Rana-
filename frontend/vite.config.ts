import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/aman/',
  build: {
    outDir: '../static',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/aman/api': {
        target: 'http://127.0.0.1:5006',
        rewrite: (path) => path.replace(/^\/aman/, ''),
      },
    },
  },
})

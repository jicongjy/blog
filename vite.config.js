import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 프로젝트 사이트: https://jicongjy.github.io/blog/
export default defineConfig({
  base: '/blog/',
  plugins: [react()],
})

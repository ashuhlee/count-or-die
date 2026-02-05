import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: './',
  root: path.resolve(__dirname, 'src/renderer'),
  // publicDir: path.resolve(__dirname, 'src/renderer/assets'),
  build: {
    outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/renderer/index.html')
    },
    assetsDir: 'assets'
  }
})
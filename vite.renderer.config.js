import { defineConfig } from 'vite';
import path from 'path';
import pkg from './package.json';

export default defineConfig({
  base: './',
  root: path.resolve(__dirname, 'src/renderer'),
  resolve : {
    alias: {
	  '@assets': path.resolve(__dirname, 'src/renderer/assets')
	}
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  build: {
    outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/renderer/index.html')
    },
    assetsDir: 'assets'
  }
})
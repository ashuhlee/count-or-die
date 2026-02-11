import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
		  'electron',
		  'electron-store',
		  'electron-squirrel-startup',
		  'bufferutil',
		  'utf-8-validate',
		  'simple-discord-rpc'
	  ]
    }
  }
})
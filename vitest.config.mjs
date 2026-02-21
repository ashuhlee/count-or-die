
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		include: [
			'tests/**/*.test.js',
			'src/**/*.test.js'
    	],
		exclude: [
		  'node_modules/**',
		  'out/**',
		  '.vite/**'
		],
		setupFiles: ['vitest-localstorage-mock'],
    	mockReset: false,
		// clearMocks: true,
		restoreMocks: true,
	},
	resolve: {
		alias: {
			'@assets': path.resolve(__dirname, 'src/renderer/assets'),
		}
	}
})

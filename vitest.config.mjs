
import { defineConfig } from 'vitest/config';

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
		restoreMocks: true
	}
})

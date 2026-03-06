import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		include: [
			'tests/**/*.test.ts',
			'src/**/*.test.ts'
		],
		exclude: [
			'node_modules/**',
			'out/**', '.vite/**'
		],
		setupFiles: ['vitest-localstorage-mock'],
		mockReset: false,
		restoreMocks: true,
	},
	resolve: {
		alias: {
			'@assets': path.resolve(__dirname, 'src/renderer/assets'),
		},
	},
});

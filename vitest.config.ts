import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		setupFiles: ['./tests/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/**/*.ts'],
			exclude: [
				'node_modules/',
				'dist/',
				'examples/',
				'tests/',
				'**/*.config.*',
				'**/*.d.ts',
				'src/index.ts',
				'src/types.ts',
				'src/bin/**',
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
	},
	resolve: {
		alias: {
			'~': resolve(__dirname, 'src'),
		},
	},
})

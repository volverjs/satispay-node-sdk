import { defineConfig } from 'vite'
import { resolve } from 'path'
import { builtinModules } from 'module'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [
		dts({
			include: ['src/**/*'],
			outDir: 'dist',
			copyDtsFiles: true,
		}),
	],
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				'bin/satispay-keygen': resolve(__dirname, 'src/bin/satispay-keygen.ts'),
			},
			formats: ['es'],
		},
		outDir: 'dist',
		sourcemap: true,
		rollupOptions: {
			external: [
				...builtinModules,
				...builtinModules.map((m) => `node:${m}`),
			],
			output: {
				preserveModules: true,
				preserveModulesRoot: 'src',
				entryFileNames: '[name].js',
			},
		},
		target: 'node18',
		minify: false,
	},
	resolve: {
		alias: {
			'~': resolve(__dirname, 'src'),
		},
	},
})

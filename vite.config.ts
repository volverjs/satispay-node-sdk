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
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'index',
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

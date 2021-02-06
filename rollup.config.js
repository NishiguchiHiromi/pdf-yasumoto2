import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import preprocess from 'svelte-preprocess';
import postcss from 'rollup-plugin-postcss';
import inject from '@rollup/plugin-inject'
// import webWorkerLoader from 'rollup-plugin-web-worker-loader';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	// input: [
	// 	'src/main.js',
	// 	'src/worker.js',
	// ],
	// output: [
	// 	{
	// 		sourcemap: true,
	// 		format: "es",
	// 		name: 'app',
	// 		// file: 'public/build/bundle.js',
	// 		dir: "public/build",
	// 	},
	// 	{
	// 		sourcemap: true,
	// 		format: "es",
	// 		name: 'worker',
	// 		// file: 'public/build/worker.js',
	// 		dir: "public/build",
	// 	}
	// ],
	plugins: [
		// inject({
		// 	include: 'src/worker.js',
		// 	window: 'global/window'
		// }),
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			},
			preprocess: preprocess()
		}),
		// webWorkerLoader({
		// 	// pattern: new RegExp('src/worker.js'),
		// }),
		// {
		// 	name: 'copy-worker',
		// 	generateBundle() {
		// 		fs.copyFileSync(
		// 			path.resolve('./src/worker.js'),
		// 			path.resolve('./public/build/worker.js')
		// 		);
		// 	}
		// },
		// we'll extract any component CSS out into
		// a separate file - better for performance
		// css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		postcss({
			extract: true,
			minimize: true,
			use: [
				['sass', {
					includePaths: [
						'./theme',
						'./node_modules'
					]
				}]
			]
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

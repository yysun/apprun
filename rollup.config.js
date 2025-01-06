/**
 * Rollup Configuration
 * 
 * This configuration builds AppRun's ESM bundles with the following features:
 * - Minification (controlled by MINIFY env var, defaults to true)
 * - Sourcemaps (enabled by default)
 * - Property mangling for properties starting with '__'
 * 
 * Usage:
 * - Default build (minified): rollup -c
 * - Unminified build: MINIFY=false rollup -c
 */

const terser = require('@rollup/plugin-terser');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

// Control minification via environment variable
const minify = process.env.MINIFY !== 'false';

const plugins = minify ? [
  resolve(),
  commonjs(),
  terser({
    module: true,
    sourceMap: true, // Enable sourcemap support in terser
    mangle: {
      properties: {
        regex: /^__/,
      },
    },
  })
] : [
  resolve(),
  commonjs()
];

module.exports = [{
  input: 'esm/apprun.js',
  output: {
    file: 'dist/apprun.esm.js',
    format: 'esm',
    sourcemap: true
  },
  plugins,
}, {
  input: 'esm/apprun-html.js',
  output: {
    file: 'dist/apprun-html.esm.js',
    format: 'esm',
    sourcemap: true
    },
  plugins
  }, {
    input: 'esm/apprun-play-html.js',
    output: {
      file: 'dist/apprun-play-html.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins
}]

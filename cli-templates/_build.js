#!/usr/bin/env node
const builder = require('esbuild');
const server = require('apprun-dev-server');

const build = (watch = false) => builder.build({
  entryPoints: ['src/main.tsx'],
  outfile: 'dist/main.js',
  bundle: true,
  minify: true,
  sourcemap: true,
  watch
});

const start = () => {
  server.start({
    host: 'localhost',
    port: process.env.PORT || 8080,
    watch: 'src'
  });
}

if (!process.argv[2]) {
  build();
} else {
  build(true);
  start();
}
#!/usr/bin/env node
const builder = require('esbuild');
const path = require('path');
const server = require('apprun-dev-server');

const app = {
  build: () => builder.build({
    entryPoints: ['src/main.tsx'],
    outfile: 'dist/main.js',
    bundle: true,
    minify: true,
    sourcemap: true
  }),

  start: () => {
    server.start({
      host: 'localhost',
      port: process.env.PORT || 8080,
      watch: 'src'
    });

    server.watcher.on('change', (changePath) => {
      const ext = path.extname(changePath).toLocaleLowerCase();
      /\.(t|j)sx?/.test(ext) && app.build();
    });
  }
};

app.build();
process.argv[2] === 'start' && app.start();
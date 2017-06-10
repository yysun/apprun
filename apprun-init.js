#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const package_json = path.resolve('./package.json');
const tsconfig_json = path.resolve('./tsconfig.json');
const webpack_config_js = path.resolve('./webpack.config.js');
const git_ignore_file = path.resolve('./.gitignore');
const index_html = path.resolve('./index.html');
const main_tsx = path.resolve('./main.tsx');
const execSync = require('child_process').execSync;

// webpack 2.x
const webpack_config = `const path = require('path');
module.exports = {
  entry: {
    'app': './main.tsx',
  },
  output: {
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  devServer: {
  }
}`;

const tsconfig = `{
  "compilerOptions": {
    "target": "es5",
    "jsx": "react",
    "reactNamespace": "app",
    "lib": ["dom", "es2015.promise", "es5"]
  }
}`

const git_ignore = 
`.DS_Store
node_modules
*.log
`;

const index = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>apprun</title>
</head>
<body>
  <div id="my-app"></div>
  <script src="app.js"></script>
</body>
</html>`;

const main = `import app from './node_modules/apprun/index';
const model = 'Hello world';
const view = (state) => <h1>{state}</h1>;
const update = {
}
const element = document.getElementById('my-app');
app.start(element, model, view, update);
`;

if (!fs.existsSync(package_json)) {
  console.log('Initializing package.json');
  execSync('npm init -y');
}

console.log('Installing packages. This might take a couple minutes.');
execSync('npm install webpack webpack-dev-server ts-loader typescript --save-dev');
execSync('npm install apprun --save');

if (!fs.existsSync(tsconfig_json)) {
  console.log('Creating tsconfig.json ...');
  fs.writeFileSync(
    tsconfig_json,
    tsconfig
  );
}

RegExp.prototype.toJSON = RegExp.prototype.toString;
if (!fs.existsSync(webpack_config_js)) {
  console.log('Creating webpack.config.js ...');
  fs.writeFileSync(
    webpack_config_js,
    webpack_config
  );
}

if (!fs.existsSync(index_html)) {
  console.log('Creating index.html ...');
  fs.writeFileSync(
    index_html,
    index
  );
}

if (!fs.existsSync(main_tsx)) {
  console.log('Creating main.ts ...');
  fs.writeFileSync(
    main_tsx,
    main
  );
}

if (!fs.existsSync(git_ignore_file)) {
  console.log('Creating .gitignore ...');
  fs.writeFileSync(
    git_ignore_file,
    git_ignore
  );
}

console.log('Adding npm scripts');
const package_info = require(package_json);
if (!package_info.scripts || ! package_info.scripts['start']) {
  package_info["scripts"]["start"] = 'webpack-dev-server';
}
if (!package_info.scripts || ! package_info.scripts['build']) {
  package_info["scripts"]["build"] = 'webpack -p';
}
fs.writeFileSync(
  package_json,
  JSON.stringify(package_info, null, 2)
);

console.log('Initializing git');
execSync('git init');
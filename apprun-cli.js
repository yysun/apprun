#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const package_json = path.resolve('./package.json');
const tsconfig_json = path.resolve('./tsconfig.json');
const webpack_config_js = path.resolve('./webpack.config.js');
const git_ignore_file = path.resolve('./.gitignore');
const eslint_file = path.resolve('./.eslintrc.js');
const index_html = path.resolve('./index.html');
const main_tsx = path.resolve('./src/main.tsx');
const spa_index = path.resolve('./index.html');
const spa_main_tsx = path.resolve('./src/main.tsx');
const spa_layout_tsx = path.resolve('./src/Layout.tsx');
const readme_md = path.resolve('./README.md');
const execSync = require('child_process').execSync;
const program = require('commander');

const dir_src = './src';
const dir_tests = './tests';
const dir_stories = './stories'

let show_start = false;
let show_test = false;
let es5 = false;
let no_webpack = false;

function read(name) {
  return fs.readFileSync(path.resolve(__dirname + '/cli-templates', name), 'utf8');
}

function write(file_name, text, title = ' * Creating', overwrite = false) {
  const file = path.resolve(file_name);
  if (!fs.existsSync(file) || overwrite) {
    process.stdout.write(`${title}: ${file} ... `);
    fs.writeFileSync(
      file,
      text
    );
    process.stdout.write('Done\n');
  } else {
    process.stdout.write(` *  No change made. File exists: ${file}\n`);
  }
}

function init() {
  RegExp.prototype.toJSON = RegExp.prototype.toString;

  if (!fs.existsSync(package_json)) {
    console.log(' * Initializing package.json');
    execSync('npm init -y');
  }

  if (!fs.existsSync(dir_src)) fs.mkdirSync(dir_src);

  console.log(' * Installing packages. This might take a few minutes.');
  if (!no_webpack) {
    execSync('npm install webpack webpack-cli webpack-dev-server ts-loader source-map-loader --save-dev');
  }
  if (!es5) execSync('npm install apprun typescript --save-dev');
  else execSync('npm install apprun@es5 typescript --save-dev');

  es5 ?
    write(tsconfig_json, read('tsconfig.es5.json'), ' * Configuring typescript - es5', true) :
    write(tsconfig_json, read('tsconfig.es6.json'), ' * Configuring typescript - es2015', true);

  write(webpack_config_js, read('webpack.config.js'))
  write(index_html, read('index.html'));
  write(main_tsx, read('main.ts_'));
  write(readme_md, read('readme.md'));

  console.log(' * Adding npm scripts');
  const package_info = require(package_json);
  if (!package_info.scripts) package_info["scripts"] = {}
  if (!package_info.scripts['start']) {
    package_info["scripts"]["start"] = 'webpack serve --mode development';
  }
  if (!package_info.scripts['build']) {
    package_info["scripts"]["build"] = 'webpack --mode production';
  }
  if (!package_info.scripts['tsc:watch']) {
    package_info['scripts']['tsc:watch'] = 'tsc -w';
  }
  save_package_json(package_info);
  git_init();
  // jest_init();
  show_start = true;
}

function save_package_json(package_info) {
  fs.writeFileSync(
    package_json,
    JSON.stringify(package_info, null, 2)
  );
}

function git_init() {
  if (!fs.existsSync('.git')) {
    console.log(' * Initializing git');
    execSync('git init');
  } else {
    console.log(' * Skip git init. .git exsits');
  }
  write(git_ignore_file, read('_gitignore'));
}

function component(name) {
  if (!fs.existsSync(dir_src)) fs.mkdirSync(dir_src);
  const fn = path.resolve(dir_src + '/' + name + '.tsx');
  const component_template = read('component.ts_');
  write(fn, component_template.replace(/\#name/g, name),
    `Creating component ${name}`);
  show_start = true;
}

function jest_init() {
  console.log(' * Installing jest');
  execSync('npm i @types/jest jest ts-jest --save-dev');
  const jest_config = {
    "preset": "ts-jest",
  }

  const package_info = require(package_json) || {};
  package_info["jest"] = jest_config

  package_info["scripts"]["test"] = 'jest --watch';
  save_package_json(package_info);
  show_test = true;
}

function lint_init() {
  console.log(' * Installing ESLint');
  execSync('npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin');

  const package_info = require(package_json) || {};
  package_info["scripts"]["lint"] = 'eslint src';
  package_info["scripts"]["lint:fix"] = 'eslint src --fix';
  save_package_json(package_info);

  write(eslint_file, read('_eslintrc.js'));
}

function component_spec(name) {
  if (!fs.existsSync(dir_tests)) fs.mkdirSync(dir_tests);
  const fn = path.resolve(dir_tests + '/' + name + '.spec.ts');
  const test_template = read('spec.ts_');
  write(fn, test_template.replace(/\#name/g, name),
    `Creating component spec ${name}`);
  show_test = true;
}

function component_story(name) {
  if (!fs.existsSync(dir_stories)) fs.mkdirSync(dir_stories);
  const fn = path.resolve(dir_stories + '/' + name + '.stories.js');
  const story_template = read('stories.js_');
  write(fn, story_template.replace(/\#name/g, name),
    `Creating component stories ${name}`);
}

function spa() {
  write(spa_index, read('spa_index.html'), 'Creating', true);
  write(spa_main_tsx, read('spa_main.ts_'), 'Creating', true);
  write(spa_layout_tsx, read('Layout.ts_'), 'Creating', true);
  component('Home');
  component('About');
  component('Contact');
  show_start = true;
}

program
  .name('apprun')
  .version('2.27')
  .option('-i, --init', 'Initialize AppRun Project')
  .option('-c, --component <file>', 'Generate AppRun component')
  .option('-g, --git', 'Initialize git repository')
  .option('-j, --jest', 'Install jest')
  .option('-l, --lint', 'Install ESLint')
  .option('-t, --test <file>', 'Generate component spec')
  .option('-o, --story <file>', 'Generate component stories')
  .option('-s, --spa', 'Generate SPA app')
  .option('-5, --es5', 'Use apprun@es5')
  .option('-0, --no_webpack', 'Don\'t install webpack')
  .parse(process.argv);

program._name = 'apprun';

if (!program.init && !program.component && !program.git && !program.jest &&
  !program.test && !program.spa && !program.lint && !program.story) {
  program.outputHelp();
  process.exit()
}

if (program.es5) es5 = true;
if (program.no_webpack) no_webpack = true;
if (program.init) init();
if (program.component) component(program.component);
if (program.git) git_init();
if (program.jest) jest_init();
if (program.lint) lint_init();
if (program.test) component_spec(program.test);
if (program.story) component_story(program.story);
if (program.spa) spa();

console.log('\r');
if (show_start) console.log('All done. You can run `npm start` and then navigate to http://localhost:8080 in a browser.');
//if (show_test) console.log('All done. You can run `npm test`.');
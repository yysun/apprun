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
const spa_index = path.resolve('./index.html');
const spa_main_tsx = path.resolve('./main.tsx');
const readme_md = path.resolve('./README.md');
const execSync = require('child_process').execSync;
const program = require('commander');

function read(name) {
  return fs.readFileSync(path.resolve(__dirname + '/cli-templates', name), 'utf8');
}

function write(file_name, text, title = 'Creating', overwrite = false) {
  const file = path.resolve(file_name);
  if (!fs.existsSync(file) || overwrite) {
    process.stdout.write(`${title}: ${file} ... `);
    fs.writeFileSync(
      file,
      text
    );
    process.stdout.write('Done\n');
  } else {
    process.stdout.write(`No change made. File exists: ${file}\n`);
  }
}

function init() {
  RegExp.prototype.toJSON = RegExp.prototype.toString;

  if (!fs.existsSync(package_json)) {
    console.log('Initializing package.json');
    execSync('npm init -y');
  }

  console.log('Installing packages. This might take a couple minutes.');
  execSync('npm install webpack webpack-dev-server ts-loader typescript --save-dev');
  execSync('npm install apprun --save');

  write(tsconfig_json, read('tsconfig.json'));
  write(webpack_config_js, read('webpack.config.js'))
  write(index_html, read('index.html'));
  write(main_tsx, read('main.ts_'));
  write(readme_md, read('readme.md'));

  console.log('Adding npm scripts');
  const package_info = require(package_json);
  if (!package_info.scripts) package_info["scripts"] = {}
  if (!package_info.scripts['start']) {
    package_info["scripts"]["start"] = 'webpack-dev-server';
  }
  if (!package_info.scripts['build']) {
    package_info["scripts"]["build"] = 'webpack -p';
  }
  fs.writeFileSync(
    package_json,
    JSON.stringify(package_info, null, 2)
  );
}

function git_init() {
  console.log('Initializing git');
  execSync('git init');
  write(git_ignore_file, read('.gitignore'));
}

function component(name) {
  const fn = path.resolve(name + '.tsx');
  const component_template = read('component.ts_');
  write(name + '.tsx', component_template.replace(/\#name/g, name),
    `Creating component ${name}`)
}

function karma_init() {
  console.log('Installing karma');
  execSync('npm i @types/jasmine jasmine-core karma karma-chrome-launcher karma-jasmine karma-webpack --save-dev');
  write('karma.conf.js', read('karma.conf.js'));
}

function karma_test(name) {
  const fn = path.resolve(name + '.spec.ts');
  const test_template = read('test.ts_');
  write(fn, test_template.replace(/\#name/g, name),
    `Creating component spec ${name}`)
}

function spa() {
  write(spa_index, read('spa_index.html'), 'Creating', true);
  write(spa_main_tsx, read('spa_main.ts_'), 'Creating', true);
  component('Home');
  component('About');
  component('Contact');
}

program
  .version('1.8.0')
  .option('-i, --init', 'Initialize AppRun Project')
  .option('-c, --component <file>', 'Generate AppRun component')
  .option('-g, --git', 'Initialize git repository')
  .option('-k, --karma', 'Install karma')
  .option('-t, --test <file>', 'Generate component spec')
  .option('-s, --spa', 'Generate SPA app')
  .parse(process.argv);

program._name = 'apprun';

if (!program.init && !program.component && !program.git &&
  !program.karma && !program.test && !program.spa) {
  program.outputHelp();
}

if (program.init) init();
if (program.component) component(program.component);
if (program.git) git_init();
if (program.karma) karma_init();
if (program.test) karma_test(program.test);
if (program.spa) spa();

console.log('\nAll done. Please run `npm start` and then navigate to http://localhost:8080 in a browser.');
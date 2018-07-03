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

let show_start = false;
let show_test = false;

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
  execSync('npm install webpack webpack-cli webpack-dev-server ts-loader typescript source-map-loader --save-dev');
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
    package_info["scripts"]["start"] = 'webpack-dev-server --mode development';
  }
  if (!package_info.scripts['build']) {
    package_info["scripts"]["build"] = 'webpack -p --mode production';
  }
  fs.writeFileSync(
    package_json,
    JSON.stringify(package_info, null, 2)
  );
  git_init();
  jest_init();
  show_start = true;
}

function git_init() {
  if (!fs.existsSync('.git')) {
    console.log('Initializing git');
    execSync('git init');
  } else {
    console.log('Skip git init. .git exsits');
  }
  write(git_ignore_file, read('_gitignore'));
}

function component(name) {
  const fn = path.resolve(name + '.tsx');
  const component_template = read('component.ts_');
  write(name + '.tsx', component_template.replace(/\#name/g, name),
    `Creating component ${name}`);
  show_start = true;
}

function karma_init() {
  console.log('Installing karma');
  execSync('npm i @types/jasmine jasmine-core karma karma-chrome-launcher karma-jasmine karma-webpack --save-dev');
  write('karma.conf.js', read('karma.conf.js'));
  show_test = true;
}

function jest_init() {
  console.log('Installing jest');
  execSync('npm i @types/jest jest ts-jest --save-dev');

  const jest_config = {
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"],
    "globals": {
      "ts-jest": {
        "enableTsDiagnostics": true
      }
    }
  }
  delete require.cache[require.resolve(package_json)];
  const package_info = require(package_json) || {};
  package_info["jest"] = jest_config

  package_info["scripts"]["test"] = 'jest --watch';
  fs.writeFileSync(
    package_json,
    JSON.stringify(package_info, null, 2)
  );

  show_test = true;
}

function component_spec(name) {
  const fn = path.resolve(name + '.spec.ts');
  const test_template = read('spec.ts_');
  write(fn, test_template.replace(/\#name/g, name),
    `Creating component spec ${name}`);
  show_test = true;
}

function spa() {
  write(spa_index, read('spa_index.html'), 'Creating', true);
  write(spa_main_tsx, read('spa_main.ts_'), 'Creating', true);
  component('Home');
  component('About');
  component('Contact');
  show_start = true;
}

program
  .name('apprun')
  .version('1.12.6')
  .option('-i, --init', 'Initialize AppRun Project')
  .option('-c, --component <file>', 'Generate AppRun component')
  .option('-g, --git', 'Initialize git repository')
  .option('-j, --jest', 'Install jest')
  .option('-k, --karma', 'Install karma')
  .option('-t, --test <file>', 'Generate component spec')
  .option('-s, --spa', 'Generate SPA app')
  .parse(process.argv);

program._name = 'apprun';

if (!program.init && !program.component && !program.git && !program.jest &&
  !program.karma && !program.test && !program.spa) {
  program.outputHelp();
  process.exit()
}

if (program.init) init();
if (program.component) component(program.component);
if (program.git) git_init();
if (program.jest) jest_init();
if (program.karma) karma_init();
if (program.test) component_spec(program.test);
if (program.spa) spa();

console.log('\r');
if (show_start) console.log('All done. You can run `npm start` and then navigate to http://localhost:8080 in a browser.');
//if (show_test) console.log('All done. You can run `npm test`.');
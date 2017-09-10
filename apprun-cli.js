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
const readme_md = path.resolve('./README.md');
const execSync = require('child_process').execSync;
const program = require('commander');

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
    "lib": ["dom", "es2015", "es5"],
    "experimentalDecorators": true
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

const main = `import app from 'apprun';
const model = 'Hello world - AppRun';
const view = (state) => <h1>{state}</h1>;
const update = {
}
const element = document.getElementById('my-app');
app.start(element, model, view, update);
`;

const readme = `##

* Use _npm start_ to start the dev server
* Use _npm run build_ to build for production
`;

function write(file_name, text, title = 'Creating') {
  const file = path.resolve(file_name);
  if (!fs.existsSync(file)) {
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

  write(tsconfig_json, tsconfig);
  write(webpack_config_js, webpack_config)
  write(index_html, index);
  write(main_tsx, main);
  write(readme_md, readme);

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
  write(git_ignore_file, git_ignore);
}

const component_template = `import app, {Component} from 'apprun';

export default class #nameComponent extends Component {
  state = '#name';

  view = (state) => {
    return <div>
      <h1>{state}</h1>
    </div>
  }

  update = {
    '##name': state => state,
  }
}


// to use this component in main.tsx
// import #name from './#name';
// const element = document.getElementById('my-app');
// new #name().start(element);
`;

function component(name) {
  const fn = path.resolve(name + '.tsx');
  write(name + '.tsx', component_template.replace(/\#name/g, name),
    `Creating component ${name}`)
}


const karma_config = `var webpackConfig = require('./webpack.config');
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ["jasmine"],
    files: [
      { pattern: "tests/*.spec.*" }
    ],
    exclude: [
    ],
    preprocessors: {
      'tests/*.spec.*': ['webpack'],
    },
    webpack: webpackConfig,
    reporters: ["progress"],
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    }
  })
}`

function karma_init() {
  console.log('Installing karma');
  execSync('npm i @types/jasmine jasmine-core karma karma-chrome-launcher karma-jasmine karma-webpack --save-dev');
  write('karma.conf.js', karma_config);
}

const test_template = `import app from 'apprun'
import #name from './#name';

describe('component', () => {
  it('should update state', (done) => {
    app.run('route', '##name');
    setTimeout(() => {
      expect(#name.state).toBe('#name');
      done();
    })
  })
})
`
function karma_test(name) {
  const fn = path.resolve(name + '.spec.ts');
  write(fn, test_template.replace(/\#name/g, name),
    `Creating component spec ${name}`)
}

program
  .version('1.7.0')
  .option('-i, --init', 'Initialize AppRun Project')
  .option('-c, --component <file>', 'Generate AppRun component')
  .option('-g, --git', 'Initialize git repository')
  .option('-k, --karma', 'Install karma') 
  .option('-t, --test <file>', 'Generate component spec')  
 .parse(process.argv);

program._name = 'apprun';

if (!program.init && !program.component && !program.git &&
    !program.karma && !program.test) {
  program.outputHelp();
}

if (program.init) init();
if (program.component) component(program.component);
if (program.git) git_init();
if (program.karma) karma_init();
if (program.test) karma_test(program.test);
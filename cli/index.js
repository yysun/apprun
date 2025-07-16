#!/usr/bin/env node

const { program } = require('commander');
const { existsSync, writeFileSync, mkdirSync, copyFileSync } = require('fs');
const { resolve, dirname } = require('path');
const { red, green, yellow } = require('./colors');
const execSync = require('child_process').execSync;

const component_template = `import {app, Component} from 'apprun';

export default class #nameComponent extends Component {
  state = '#name';

  view = (state) => <>
      <h1>{state}</h1>
  </>;

  // update = {
  //   '/#name': state => state,
  // }
}
`;

const test_template = `import app from 'apprun';
import #name from './#fn';

describe('component', () => {
  it('should render state upon route event', () => {
    const element = document.createElement('div');
    const component = new #name().start(element);
    expect(element.textContent).toBe('#name');
  })
})
`;

program
  .version('3.36.0')
  .description('AppRun CLI')
  .option('-i, --init', 'Initialize AppRun Project')
  .option('-c, --component <name>', 'Create a component')
  .option('-t, --test <name>', 'Create a component spec')
  .option('-p, --pages [directory]', 'Create example pages')

program.parse(process.argv);

const options = program.opts();
if (options.init) {
  execSync('npm create apprun-app@latest', { stdio: 'inherit' });
}


function createTestFile(fn, name) {
  const component_name = name || fn.split('/').pop();
  const component_file = fn.split('/').pop();
  const test = test_template
    .replace(/#name/g, component_name)
    .replace(/#fn/g, component_file);
  writeFile(fn + '.spec.tsx', test);
}

function createComponent(fn, name) {
  if (!name) name = fn.split('/').pop();
  const component = component_template.replace(/#name/g, name);
  writeFile(fn + '.tsx', component);
}

const cwd = process.cwd();
const writeFile = (fn, text) => {
  fn = resolve(cwd, fn);
  const dir = dirname(fn);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(yellow(`✔ ${dir}`));

  }
  if (existsSync(fn)) {
    console.log(red(`✘ ${fn} exists`));
    return;
  }
  writeFileSync(fn, text, 'utf8');
  console.log(green(`✔ ${fn}`));
}

options.component && createComponent(options.component);
options.test && createTestFile(options.test);

if (options.pages) {
  let pages = typeof options.pages === 'string' ? options.pages : 'pages';
  pages = resolve(cwd, pages);
  createComponent(`${pages}/Home/index`, 'Home');
  createTestFile(`${pages}/Home/index`, 'Home');
  createComponent(`${pages}/About/index`, 'About');
  createTestFile(`${pages}/About/index`, 'About');
  createComponent(`${pages}/Contact/index`, 'Contact');
  createTestFile(`${pages}/Contact/index`, 'Contact');
}
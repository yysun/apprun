/**
 * Regression coverage for the public pretty-link examples.
 *
 * This file verifies that runnable examples using ordinary path anchors opt in
 * before rendering, while the hash-routing example keeps the default mode.
 */

import examples from '../demo/components/play-examples';

const readFileSync = require('fs').readFileSync;
const path = require('path');
const ts = require('typescript');

const readRepoFile = (file: string): string =>
  readFileSync(path.join(__dirname, '..', file), 'utf8');

const expectOptInBefore = (source: string, startup: string): void => {
  const startupIndex = source.indexOf(startup);
  const optInIndex = source.lastIndexOf('app.use_prettyLink();', startupIndex);

  expect(startupIndex).toBeGreaterThan(-1);
  expect(optInIndex).toBeGreaterThan(-1);
  expect(optInIndex).toBeLessThan(startupIndex);
};

const exampleCode = (name: string): string => {
  const example = examples.find(item => item.name === name);
  if (!example) throw new Error(`Missing Play example: ${name}`);
  return example.code;
};

describe('Pretty-link examples', () => {
  it('compiles every Play catalog example in synchronous script mode', () => {
    const failures = examples.flatMap(example => {
      const result = ts.transpileModule(example.code, {
        compilerOptions: {
          jsx: 'react',
          jsxFactory: 'app.h',
          jsxFragmentFactory: 'app.Fragment',
          target: 'es2020',
          module: 'none'
        },
        reportDiagnostics: true
      });
      const errors = (result.diagnostics || [])
        .filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)
        .map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));

      return errors.map(error => `${example.name}: ${error}`);
    });

    expect(failures).toEqual([]);
  });

  it('opts the Play path-anchor example in before rendering and mounting', () => {
    const code = exampleCode('Routing (mount options)');
    const optIn = code.indexOf('app.use_prettyLink();');

    expect(optIn).toBeGreaterThan(-1);
    expect(optIn).toBeLessThan(code.indexOf('app.render('));
    expect(optIn).toBeLessThan(code.indexOf('app.addComponents('));
  });

  it('keeps the Play hash-anchor example in default hash mode', () => {
    const code = exampleCode('Routing (component event)');

    expect(code).toContain('href="#home"');
    expect(code).not.toContain('app.use_prettyLink');
  });

  it('opts the README path-anchor example in before rendering', () => {
    const readme = readRepoFile('README.md');

    expect(readme).toContain('<a href="/home">Home</a>');
    expectOptInBefore(readme, 'app.render(document.body, <App />);');
  });

  it('keeps the What\'s New path-anchor example explicitly opted in', () => {
    const whatsNew = readRepoFile('WHATSNEW.md');

    expect(whatsNew).toContain('<a href="/about">About</a>');
    expectOptInBefore(whatsNew, 'app.render(document.body, <App />);');
  });

  it('opts the CLI starter in before mounting its path-anchor app', () => {
    const cliStarter = readRepoFile('cli/app.js');

    expect(cliStarter).toContain('<a href="/home">Home</a>');
    expectOptInBefore(cliStarter, "app.start('#app', {}, App);");
  });

  it('opts the standalone add-components demo in before mounting', () => {
    const navigation = readRepoFile('demo-html/add-components/components/AppComponent.js');
    const bootstrap = readRepoFile('demo-html/add-components/index.js');

    expect(navigation).toContain('<a href="/about">About</a>');
    expectOptInBefore(bootstrap, 'mainApp.start(document.body);');
    expectOptInBefore(bootstrap, "app.addComponents('#pages', {");
  });

  it.each(['src/apprun-code.tsx', 'src/apprun-play.tsx'])(
    'executes compiled examples synchronously in %s',
    file => {
      const source = readRepoFile(file);

      expect(source).toContain('"module": "none"');
      expect(source).toContain("script.type = 'text/javascript';");
      expect(source).not.toContain("script.type = 'module';");
    }
  );

  it('does not turn deliberate full-page navigation into SPA routing', () => {
    const prompt = readRepoFile('ai/apprun.prompt.md');

    expect(prompt).toContain("window.location.href = '/new-page';");
    expect(prompt).not.toContain('app.use_prettyLink');
  });
});

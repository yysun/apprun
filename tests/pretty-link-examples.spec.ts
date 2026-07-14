/**
 * Routing-intent coverage for runnable AppRun examples.
 *
 * Inventories the Play catalog and owned page/document entry points, keeps
 * routing configuration out of generic examples, and verifies preview startup
 * plus editor input wiring. It also keeps deployed Play assets version-aligned
 * without letting reusable Play bundles override host routing configuration.
 */

import examples from '../demo/components/play-examples';

const { readFileSync, readdirSync } = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const repoFile = (file: string): string =>
  readFileSync(path.join(__dirname, '..', file), 'utf8');

const routingCalls = (source: string): string[] => {
  const calls: string[] = [];
  const startPattern = /app\.use_prettyLink\s*\(/g;
  let match: RegExpExecArray | null;

  while ((match = startPattern.exec(source))) {
    let depth = 1;
    let quote = '';
    let escaped = false;
    let index = startPattern.lastIndex;

    for (; index < source.length && depth > 0; index++) {
      const char = source[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === quote) quote = '';
      } else if (char === '"' || char === "'" || char === '`') {
        quote = char;
      } else if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
      }
    }

    if (depth > 0) continue;
    while (/\s/.test(source[index] || '')) index++;
    if (source[index] === ';') index++;
    calls.push(source.slice(match.index, index).trim());
    startPattern.lastIndex = index;
  }

  return calls;
};

const routingStatements = (source: string): string[] =>
  routingCalls(source).filter(call => call.endsWith(';'));

const firstEffectIndex = (source: string): number => {
  const patterns = [
    /app\.on\(/,
    /app\.start\(/,
    /app\.render\(/,
    /app\.addComponents\(/,
    /app\.webComponent\(/,
    /new\s+[A-Za-z_$][\w$]*\([^)]*\)\.start\(/,
    /document\.(?:body|createElement|querySelector|append)/,
    /window\.(?:setInterval|open|location)/
  ];
  const indexes = patterns
    .map(pattern => source.search(pattern))
    .filter(index => index >= 0);
  return indexes.length ? Math.min(...indexes) : source.length;
};

const expectSingleModeBeforeEffects = (source: string, enabled: boolean): void => {
  const expected = `app.use_prettyLink(${enabled});`;
  expect(routingCalls(source)).toEqual([expected]);
  expect(source.indexOf(expected)).toBeLessThan(firstEffectIndex(source));
};

const extractRunnablePlayBlocks = (source: string): string[] => {
  const blocks: string[] = [];
  const pattern = /```(?:js|html)\n((?:(?!```).)*?)```\n<apprun-code[^>]*>/gs;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) blocks.push(match[1]);
  return blocks;
};

const extractFencedCodeBlocks = (source: string): string[] =>
  Array.from(source.matchAll(/```[^\n]*\n([\s\S]*?)```/g), match => match[1]);

const walk = (root: string): string[] => {
  const absoluteRoot = path.join(__dirname, '..', root);
  return readdirSync(absoluteRoot, { withFileTypes: true }).flatMap(entry => {
    const relative = path.join(root, entry.name);
    return entry.isDirectory() ? walk(relative) : [relative.replace(/\\/g, '/')];
  });
};

const playNames = [
  'Hello World ($bind)',
  'Hello World ($on)',
  'Hello World (debounce)',
  'Clock',
  'Clock (Component Lifecycle)',
  'Stopwatch',
  'Counter (HTML)',
  'Counter (JSX)',
  'Counter ($onclick)',
  'Counter (Web Component)',
  'Async fetch',
  'Custom Directive',
  'Ref - Examples',
  'Child Components',
  'Element in JSX - canvas',
  'Shadow DOM',
  'Decorators',
  'Reactivity - getter',
  'Reactivity - Proxy',
  'Routing (component event)',
  'Routing (mount options)',
  'SVG - animation',
  'SVG - xlink',
  'SVG - $onclick',
  'Content Editable',
  'List attribute',
  'Init State as an Async Function',
  'View Transition Event Level',
  'View Transition Component Level',
  'Async Generator Function'
];

const pagePolicies = [
  { page: 'cli/index.html', config: 'cli/app.js', calls: ['app.use_prettyLink(true);'] },
  { page: 'demo-html/add-components/index.html', config: 'demo-html/add-components/index.js', calls: ['app.use_prettyLink(true);'] },
  { page: 'demo-html/gen.html', config: 'demo-html/gen.html', calls: [] },
  { page: 'demo-html/index.html', config: 'demo-html/index.html', calls: [] },
  { page: 'demo-html/lit.html', config: 'demo-html/lit.html', calls: [] },
  {
    page: 'demo/apprun-play.html',
    config: 'demo/apprun-play.html',
    calls: []
  }
];

describe('Play catalog routing intent', () => {
  it('keeps the complete named catalog under policy', () => {
    expect(examples.map(example => example.name)).toEqual(playNames);
  });

  it.each(playNames)('keeps routing configuration scoped in %s', name => {
    const example = examples.find(item => item.name === name);
    expect(example).toBeDefined();
    if (name === 'Routing (component event)') {
      expectSingleModeBeforeEffects(example!.code, false);
    } else if (name === 'Routing (mount options)') {
      expectSingleModeBeforeEffects(example!.code, true);
      expect('prettyLinks' in example! && example!.prettyLinks).toBe(true);
    } else {
      expect(routingCalls(example!.code)).toEqual([]);
    }
  });
});

describe('Page-level example routing intent', () => {
  it('discovers every owned runnable HTML page in the policy table', () => {
    const discovered = [...walk('cli'), ...walk('demo'), ...walk('demo-html')]
      .filter(file => file.endsWith('.html'))
      .filter(file => /<script[^>]+(?:apprun|app\.js)/i.test(repoFile(file)))
      .filter(file => !file.startsWith('demo/mode/'))
      .sort();

    expect(discovered).toEqual(pagePolicies.map(policy => policy.page).sort());
  });

  it.each(pagePolicies)('$page declares its mode through $config', ({ config, calls }) => {
    expect(routingCalls(repoFile(config))).toEqual(calls);
  });

  it('keeps the shared hash component gallery on the framework default', () => {
    const source = repoFile('demo/main.ts');
    expect(routingCalls(source)).toEqual([]);
    expect(source).toContain("import home from './components/home'");
  });
});

describe('Runnable documentation routing intent', () => {
  it.each([
    { file: 'README.md', modes: [null, null, null, null, true, null, null] },
    { file: 'WHATSNEW.md', modes: [true, null, null] }
  ])('$file limits routing calls to routing blocks', ({ file, modes }) => {
    const runnable = extractRunnablePlayBlocks(repoFile(file));
    expect(runnable).toHaveLength(modes.length);
    runnable.forEach((block, index) => {
      const enabled = modes[index];
      if (enabled === null) expect(routingCalls(block)).toEqual([]);
      else expectSingleModeBeforeEffects(block, enabled);
    });
  });

  it('documents explicit modes in migration and SPA guidance', () => {
    const migrationCode = extractFencedCodeBlocks(repoFile('MIGRATION.md')).join('\n');
    const spaCode = extractFencedCodeBlocks(repoFile('ai/building-apprun-spa.md')).join('\n');
    const routingCode = extractFencedCodeBlocks(
      repoFile('skills/apprun/references/routing-navigation.md')
    ).join('\n');

    expect(routingCalls(migrationCode)).toEqual([
      'app.use_prettyLink(false);'
    ]);
    expectSingleModeBeforeEffects(spaCode, true);
    expectSingleModeBeforeEffects(routingCode, true);
  });

  it('documents the complete public use_prettyLink startup contract', () => {
    const readme = repoFile('README.md');
    expect(readme).toContain('Making no call or calling `app.use_prettyLink(false)` keeps that mode');
    expect(readme).toContain('Call `app.use_prettyLink()` or `app.use_prettyLink(true)`');
    expect(readme).toContain('The last call before `DOMContentLoaded` wins');
    expect(readme).toContain('later calls do not rewire listeners');

    const migration = repoFile('MIGRATION.md');
    expect(migration).toContain('No call or `app.use_prettyLink(false)`');
    expect(migration).toContain('`app.use_prettyLink()` or `app.use_prettyLink(true)`');
    expect(migration).toContain('Calls after that event do not remove or replace installed listeners');

    const routingReference = repoFile('skills/apprun/references/routing-navigation.md');
    expect(routingReference).toContain('Select the mode once in the application startup entry point before `DOMContentLoaded`');
    expect(routingReference).toContain('hash handlers no longer switch the browser-routing mode');

    expect(readme).not.toContain('pretty-link `/path` navigation by default');
  });

  it('keeps public source usage examples explicit', () => {
    expect(routingStatements(repoFile('src/apprun.ts'))).toEqual(['app.use_prettyLink(true);']);
    expect(routingStatements(repoFile('src/router.ts'))).toEqual([
      'app.use_prettyLink(false);',
      'app.use_prettyLink(true);'
    ]);
  });
});

describe('Play startup timing', () => {
  it.each(['src/apprun-code.tsx', 'src/apprun-play.tsx'])(
    'inherits default-off routing in synchronous compiled previews in %s',
    file => {
      const source = repoFile(file);
      expect(source).toContain('https://cdn.jsdelivr.net/npm/typescript@5.8.3/lib/typescript.js');
      expect(source).not.toContain('typescript@latest');
      expect(source).toContain('"module": "none"');
      expect(source).toContain('"experimentalDecorators": true');
      expect(source).toContain("script.type = 'text/javascript';");
      expect(source).not.toContain('"module": "esnext"');
      expect(source).not.toContain("script.type = 'module';");
      expect(routingCalls(source)).toEqual([]);
    }
  );

  it('detects every public routing-mode invocation form', () => {
    expect(routingCalls(`
      app.use_prettyLink();
      app.use_prettyLink(true);
      app.use_prettyLink(mode);
      app.use_prettyLink(getMode());
      app.use_prettyLink(
        getMode(fallback())
      );
      app.use_prettyLink(false)
    `)).toEqual([
      'app.use_prettyLink();',
      'app.use_prettyLink(true);',
      'app.use_prettyLink(mode);',
      'app.use_prettyLink(getMode());',
      'app.use_prettyLink(\n        getMode(fallback())\n      );',
      'app.use_prettyLink(false)'
    ]);
  });

  it('keeps new-tab previews aligned with the catalog routing mode', () => {
    const source = repoFile('demo/components/play.tsx');
    expect(source).toContain('prettyLinks = false');
    expect(source).toContain("prettyLinks ? '<script>app.use_prettyLink(true);</script>' : ''");
    expect(source).not.toContain('app.use_prettyLink(false)');
  });

  it('hides only the source textarea and leaves CodeMirror input editable', () => {
    const styles = repoFile('demo/styles.css');
    expect(styles).toContain('.playground > textarea {');
    expect(styles).not.toContain('.playground textarea {');
  });

  it('loads the AppRun runtime beside the apprun-play bundle', () => {
    const source = repoFile('src/apprun-play.tsx');
    expect(source).toContain("'apprun-html.js'");
    expect(source).toContain('document.currentScript');
    expect(source).toContain('document.scripts');
    expect(source).not.toContain('https://unpkg.com/apprun');
  });

  it('publishes the Play component and matching AppRun runtime to Pages', () => {
    const sync = repoFile('scripts/sync-pages-assets.js');
    expect(sync).toContain("'apprun-html.js'");
    expect(sync).toContain("'apprun-play.js'");
    expect(sync).toContain("'apprun-play.js.map'");
    expect(repoFile('demo/apprun-play.html')).not.toContain('https://unpkg.com/apprun');
  });

  it('keeps every generated documentation host on the default-off mode', () => {
    const hosts = walk('docs')
      .filter(file => file.endsWith('.html'))
      .filter(file => /<script src="[^"]*assets\/apprun-play\.js"><\/script>/.test(repoFile(file)));

    expect(hosts.length).toBeGreaterThan(0);
    hosts.forEach(file => {
      expect(repoFile(file)).not.toMatch(
        /<script src="[^"]*assets\/apprun-play\.js"><\/script>\s*<script>app\.use_prettyLink\(false\);<\/script>/
      );
    });
  });

  it('keeps tracked Play publish bundles on the 6.0 runtime contract', () => {
    expect(repoFile('demo/app.js')).toContain('use_prettyLink');
    expect(repoFile('demo/app.js')).toContain(
      'typescript@5.8.3/lib/typescript.js'
    );
    expect(repoFile('docs/assets/apprun-html.js')).toContain('use_prettyLink');

    const playBundle = repoFile('docs/assets/apprun-play.js');
    expect(playBundle).toContain('use_prettyLink');
    expect(playBundle).toContain('typescript@5.8.3/lib/typescript.js');
    expect(playBundle).not.toContain('https://unpkg.com/apprun');
  });

  it('preserves an explicit host pretty-link selection when Play loads', () => {
    const dom = new JSDOM(
      '<!doctype html><body><a id="guide" href="/guide">Guide</a></body>',
      { url: 'https://example.test/docs/', runScripts: 'dangerously' }
    );

    dom.window.eval(repoFile('docs/assets/apprun-html.js'));
    (dom.window as any).app.use_prettyLink(true);
    dom.window.eval(repoFile('docs/assets/apprun-play.js'));
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    const link = dom.window.document.getElementById('guide');
    const click = new dom.window.MouseEvent('click', {
      button: 0,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect(dom.window.location.pathname).toBe('/guide');
    dom.window.close();
  });

  it('keeps native navigation on an unconfigured Play host', () => {
    const dom = new JSDOM(
      '<!doctype html><body><a id="guide" href="/guide">Guide</a></body>',
      { url: 'https://example.test/docs/', runScripts: 'dangerously' }
    );

    dom.window.eval(repoFile('docs/assets/apprun-play.js'));
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    const link = dom.window.document.getElementById('guide');
    const click = new dom.window.MouseEvent('click', {
      button: 0,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(false);
    expect(dom.window.location.pathname).toBe('/docs/');
    dom.window.close();
  });
});

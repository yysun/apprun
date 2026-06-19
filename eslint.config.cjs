/**
 * ESLint baseline for source, tests, and build scripts.
 *
 * Phase 3 replaces the dead TSLint config with a small flat-config baseline
 * that can run on the current repository without treating generated output as
 * source truth.
 */

const tseslint = require('typescript-eslint');

const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  window: 'readonly',
  global: 'readonly',
  self: 'readonly',
  HTMLElement: 'readonly',
  ShadowRoot: 'readonly',
  MutationObserver: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly'
};

const testGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  jest: 'readonly',
  jasmine: 'readonly'
};

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'esm/**',
      'docs/**',
      'demo/**',
      'demo-html/**',
      'demo-node/**',
      'test-cli/**',
      '*.map'
    ]
  },
  {
    files: ['*.config.js', '*.config.cjs', 'jest.setup.js', 'cli/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...browserGlobals,
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly'
      }
    },
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-implicit-globals': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}', '*.ts', '*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...browserGlobals,
        ...testGlobals,
        process: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-implicit-globals': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  }
];

module.exports = {
  entry: {
    'apprun': './index.ts',
    'app': './demo/main.ts',
    'jsx/app': './demo/jsx/main.tsx',
    'hyperscript/app': './demo/hyperscript/main.ts',
    'html-multiple-counters/app':'./demo/html-multiple-counters/main.ts'
  },
  output: {
    path: './demo',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  }
}
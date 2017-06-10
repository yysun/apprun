const path = require('path');

module.exports = {
  entry: {
    'dist/apprun': './index.ts',
    'dist/apprun-zero':  './index-zero.ts',
    'dist/apprun-jsx':  './index-jsx.ts',
    'dist/apprun-html': './index-html.ts',

    'demo/apprun': './index.ts',
    'demo/app': './demo/main.ts',
    'demo/jsx/app': './demo/jsx/main.tsx',
    'demo/hyperscript/app': './demo/hyperscript/main.ts',
    'demo/hyperHTML/app': './demo/hyperHTML/main.ts',
    'demo/html-multiple-counters/app': './demo/html-multiple-counters/main.ts'
  },
  output: {
    // path: path.join(__dirname, 'dist'),
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
    contentBase: path.join(__dirname, 'demo'),
    port: 8080
  }
}
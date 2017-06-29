const path = require('path');

module.exports = {
  entry: {
    'dist/apprun': './index.ts',
    'demo/apprun': './index.ts',
    'demo/app': './demo/main.ts',
    'demo/jsx/app': './demo/jsx/main.tsx',
    'demo/hyperscript/app': './demo/hyperscript/main.ts',
    'demo/hyperHTML/app': './demo/hyperHTML/main.ts',
    'demo/html-multiple-counters/app': './demo/html-multiple-counters/main.ts'
  },
  output: {
    filename: '[name].js',
    library: 'apprun',
    libraryTarget: 'umd'
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
}
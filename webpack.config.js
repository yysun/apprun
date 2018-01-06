const path = require('path');

module.exports = {
  entry: {
    'dist/apprun': './src/apprun.ts',
    'dist/apprun-html': './src/apprun-html.ts',
    'demo/app': './demo/main.ts',
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
  },
  devtool: 'source-map'
}
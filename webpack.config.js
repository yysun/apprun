const path = require('path');

module.exports = {
  entry: {
    'dist/apprun': './src/apprun.ts',
    'dist/apprun-html': './src/apprun-html.ts',
    'dist/apprun-dev-tools': './src/apprun-dev-tools.tsx',
    'dist/apprun-dev-tools-tests': './src/apprun-dev-tools-tests.tsx',
    'demo/app': './demo/main.ts'
  },
  output: {
    filename: '[name].js',
    library: 'apprun',
    libraryTarget: 'umd',
    path: path.resolve(__dirname),
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  devServer: {
    open: true
  },
  devtool: 'source-map'
}
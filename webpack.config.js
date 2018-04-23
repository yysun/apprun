const path = require('path');

module.exports = {
  entry: {
    'dist/apprun': './src/apprun.ts',
    'dist/apprun-html': './src/apprun-html.ts',
    'demo/app': './demo/main.ts',
    'demo-html/app': './demo-html/main.tsx'
  },
  output: {
    filename: '[name].js',
    library: 'apprun',
    libraryTarget: 'umd',
    path: path.resolve(__dirname)
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
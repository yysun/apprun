const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    'dist/apprun': './src/apprun.ts',
    'dist/apprun-play': './src/apprun-play.tsx',
    'dist/apprun-html': './src/apprun-html.ts',
    './jsx-runtime': './src/vdom.ts',
    'dist/apprun-dev-tools': './src/apprun-dev-tools.tsx',
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
    open: true,
    static: path.join(__dirname),
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      // This tells Lit to run in production mode
      'globalThis.DEV_MODE': JSON.stringify(false)
    })
  ]
}

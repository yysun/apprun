const path = require('path');
module.exports = {
  entry: {
    'dist/app': './src/main.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname)
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.js$/, use: ["source-map-loader"], enforce: "pre" }
    ]
  },
  devServer: {
    open: true
  },
  devtool: 'source-map'
}
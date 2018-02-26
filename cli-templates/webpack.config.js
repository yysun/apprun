const path = require('path');
module.exports = {
  entry: {
    'app': './main.tsx',
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
      { test: /.tsx?$/, loader: 'ts-loader' }
    ]
  },
  devServer: {
    open: true
  },
  devtool: 'source-map'
}
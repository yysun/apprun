module.exports = {
  entry: {
    'apprun': './index.ts',
    'apprun-zero':  './index-zero.ts',
    'apprun-jsx':  './index-jsx.ts',
    'apprun-html': './index.ts',
  },
  output: {
    path: 'dist',
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
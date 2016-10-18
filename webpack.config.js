module.exports = {
  entry: {
    'apprun': './index.ts',
    'apprun-jsx':  './apprun-jsx/index.ts',
    'apprun-zero': './apprun-zero/index.ts',
  },
  output: {
    path: 'dist',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  }
}
module.exports = {

  entry: {
    app: "./tests/app.spec.ts",
    component: "./tests/component.spec.ts"
  },
  output: {
    filename: "./tests/[name].spec.js"
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
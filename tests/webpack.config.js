module.exports = {

  entry: {
    app: "./tests/app.spec.ts",
    component: "./tests/component.spec.ts",
    vdom_jsx: "./tests/vdom_jsx.spec.tsx",
    vdom_html: "./tests/vdom_html.spec.ts"
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
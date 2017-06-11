# TypeScript and webpack

AppRun exposes a global object named app that is accessible by JavaScript and TypScript directly. AppRun can also be compiled/bundled with your code too. So use it in one of three ways:

* Included apprun.js in a script tag and use app from JavaScript
* Included apprun.js in a script tag and use app from TypeScript (by referencing to apprun.d.ts)
* Compile/bundle using webpack and ts-load using ES2015 import


AppRun includes a cli to initialize a TypeScript and webpack configured project.

```
npm install apprun
apprun
```
Note: on Mac, you might need to run local npm command like:

```
$(npm bin)/apprun
```

It installs apprun, webpack, webpack-dev-server and typescript and generates files: tsconfig.json, webpack.config.js, index.html and main.tsx.


tsconfig.json
```
  "compilerOptions": {
    "target": "es5",
    "jsx": "react",
    "reactNamespace": "app",
    "lib": ["dom", "es2015.promise", "es5"]
  }
}
```

webpack.config.js
```
const path = require('path');
module.exports = {
  entry: {
    'app': './main.tsx',
  },
  output: {
    filename: '[name].js'
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
  }
}
```

index.html
```
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>apprun</title>
</head>
<body>
  <div id="my-app"></div>
  <script src="app.js"></script>
</body>
</html>
```

main.tsx
```
import app from './node_modules/apprun/index';
const model = 'Hello world - AppRun';
const view = (state) => <h1>{state}</h1>;
const update = {
}
const element = document.getElementById('my-app');
app.start(element, model, view, update);
```

After the command finishes execution, you can run
```
npm start
```
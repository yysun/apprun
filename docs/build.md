# Build

AppRun exposes a global object named app that is accessible by JavaScript and TypScript directly. AppRun can also be compiled/bundled with your code too. So use it in one of three ways:

* Included apprun.js in a script tag and use app from JavaScript
* Included apprun.js in a script tag and use app from TypeScript (by referencing to apprun.d.ts)
* Compile/bundle using webpack and ts-load using ES2015 import


AppRun includes a cli to initialize a TypeScript and webpack configured project.

```
npm install apprun
apprun-init
npm start
```

It generates files: package.json, tsconfig.json, webpack.config.js, index.html and main.tsx.

Note: on Mac, you might need to run local npm command like:

```
$(npm bin)/apprun-init
```


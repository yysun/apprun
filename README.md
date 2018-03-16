# AppRun [![Build Status](https://travis-ci.org/yysun/apprun.svg?branch=master)](https://travis-ci.org/yysun/apprun) [![npm](https://img.shields.io/npm/v/apprun.svg)](https://www.npmjs.org/package/apprun)

![logo](logo.png)

AppRun is a 3K library for building applications using the [elm architecture](https://guide.elm-lang.org/architecture), events, and components.

What makes AppRun different from Elm, or other Elm inspired frameworks and libraries is that AppRun uses the [Event Pub-Sub](https://yysun.github.io/apprun/docs/#/?id=event-pubsubs) and [Components](https://yysun.github.io/apprun/docs/#/?id=component) that each component has its own elm architecture.


Applications built with AppRun have less line of code, smaller js file, and better performance. See a comparison from [A Real-World Comparison of Front-End Frameworks with Benchmarks](https://medium.freecodecamp.org/a-real-world-comparison-of-front-end-frameworks-with-benchmarks-e1cb62fd526c).


AppRun has good performance. You can see the [performance results](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html) compared to other frameworks and libraries in the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) project,.
## Quick Start

To give it a try, include AppRun in your html.
```html
<script src="https://unpkg.com/apprun@latest/dist/apprun-html.js"></script>
```

No other ceremony, you can start developing your app right away.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Counter</title>
</head>
<body>
  <script src="https://unpkg.com/apprun@latest/dist/apprun-html.js"></script>
  <div id="my-app"></div>
  <script>
    const state = 0;
    const view = state => {
      return `<div>
        <h1>${state}</h1>
        <button onclick='app.run("-1")'>-1</button>
        <button onclick='app.run("+1")'>+1</button>
      </div>`;
    };
    const update = {
      '+1': state => state + 1,
      '-1': state => state - 1
    };
    app.start('my-app', state, view, update);
  </script>
</body>
</html>
```

The example code above is a counter application that has implemented the elm architecture.

Try it online: [AppRun - Counter](https://jsfiddle.net/ap1kgyeb/4).


## Architecture Concept

There are three separated parts in the elm architecture.

* Model — the data model of your application state
* Update — a set of functions to update the state
* View — a function to display the state as HTML

AppRun applications have the event cycle like below to drive the architecture:

```
Web events => AppRun Events => Update => State => View => HTML
```

Using events makes it very easy to handle user interaction, routing and even server-side events. Events also make your code modules decoupled and easy to test.

In addition, AppRun allows you to build applications using [Component](https://yysun.github.io/apprun/docs/#/?id=component). Each component has an elm architecture. It is very suitable for Single Page Applications (SPA).

## Examples

* [RealWorld Example App](https://github.com/gothinkster/apprun-realworld-example-app) - a blogging platform adheres to the [RealWorld specification](https://github.com/gothinkster/realworld) (1100 lines).
* [Hacker News Reader](https://github.com/yysun/apprun-hn) - PWA hacker news reader (230 lines)
* [AppRun Demo App](https://yysun.github.com/apprun) - a SPA that has 8 components, including a [Todo component](https://github.com/yysun/apprun/tree/master/demo/components/todo.tsx) (90 lines)

* [AppRun Server-Side Rendering](https://github.com/yysun/apprun-ssr)
* [AppRun Multilingual Example](https://github.com/yysun/apprun-multilingual)
* [AppRun Firebase Authentication](https://github.com/yysun/apprun-firebase-authentication)
* [AppRun Dynamic Module Import](https://github.com/yysun/apprun-dynamic-components)
* [AppRun Hot Module Reload with Webpack](https://github.com/yysun/apprun-hot-module-reload)
* [Use Apprun with Parcel](https://github.com/yysun/apprun-parcel-bundler)


## Install

If you are interested in moving forward, you can install the AppRun CLI and initialize a TypeScript and webpack configured project:
```sh
npm install apprun -g
apprun --init --spa
npm start
```

## Explore More

To explore more about AppRun, read the following.

* [Architecture](https://yysun.github.io/apprun/docs/#/?id=architecture)
* [Event Pub and Sub](https://yysun.github.io/apprun/docs/#/?id=event-pubsubs)
* [State Management](https://yysun.github.io/apprun/docs/#/?id=state-management)
* [Virtual DOM](https://yysun.github.io/apprun/docs/#/?id=virtual-dom)
* [Component](https://yysun.github.io/apprun/docs/#/?id=component)
* [Routing](https://yysun.github.io/apprun/docs/#/?id=routing)
* [CLI](https://yysun.github.io/apprun/docs/#/?id=cli)

## Video Tutorials

* [Building Applications with AppRun, Part 1 - Getting Started](https://www.youtube.com/watch?v=RuRmXEN2-xI)
* [Building Applications with AppRun, Part 2 - Components](https://www.youtube.com/watch?v=qkP6HvZmhtY)

## Articles

* [Building Applications with AppRun](https://medium.com/@yiyisun/building-applications-with-apprun-d103cd461bae)
* [Deep Dive into AppRun State](https://medium.com/@yiyisun/deep-dive-into-apprun-state-3d6fb58b1521)
* [Deep Dive into AppRun Events](https://medium.com/@yiyisun/deep-dive-into-apprun-events-1650dc7811ea)

## Contribute

You can launch the webpack dev-server and the demo app from the _demo_ folder with the following npm commands:
```sh
npm install
npm start
```

You can run the unit tests from the _tests_ folder.
```sh
npm test
```
Unit tests can serve as functional specifications.

Finally, to build optimized js files to the dist folder, just run:
```sh
npm run build
```

Have fun and send pull requests.

## License

MIT

Copyright (c) 2015-2018 Yiyi Sun

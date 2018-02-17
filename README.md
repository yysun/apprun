# AppRun [![Build Status](https://travis-ci.org/yysun/apprun.svg?branch=master)](https://travis-ci.org/yysun/apprun)

![logo](logo.png)

AppRun is a 3K library for building applications using the [elm architecture](https://guide.elm-lang.org/architecture) and event publication and subscription.

## Quick Start

To give it a try, include AppRun in your html.
```
<script src="https://unpkg.com/apprun@latest/dist/apprun-html.js"></script>
```

No other ceremony, you can start writing your model, view and update code right away.

```
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

AppRun is different to Elm, or other Elm inspired frameworks and libraries that AppRun uses the [Event Pub and Sub](https://yysun.github.io/apprun/docs/#/?id=event-pubsubs) to connect user interactions, web events and server-side events to the architecture.

AppRun also support [Component](https://yysun.github.io/apprun/docs/#/?id=component). Each component has a elm architecture. Complex applications can be built using components.

e.g.

* [RealWorld Example App](https://github.com/gothinkster/apprun-realworld-example-app) - a blogging platform adheres to the [RealWorld specification](https://github.com/gothinkster/realworld) (1100 lines).
* [Hacker News](https://github.com/yysun/apprun-hn) - PWA hacker news reader (230 lines)
* [AppRun Demo App](https://github.com/yysun/demo) - a SPA that has 8 components, including a [Todo component](https://github.com/yysun/apprun/tree/master/demo/components/todo.tsx) (90 lines)

Applications built with AppRun have less line of code, smaller js file, and better performance. See a comparison from [A Real-World Comparison of Front-End Frameworks with Benchmarks](https://medium.freecodecamp.org/a-real-world-comparison-of-front-end-frameworks-with-benchmarks-e1cb62fd526c).

AppRun has also joined the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) project. You can see its [performance results](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html) compared to other frameworks and libraries.

## Install

If you are interested in moving forward, you can install the AppRun CLI and initialize a TypeScript and webpack configured project:
```
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

## More Examples and Boilerplates

* [AppRun Server=Side Rendering](https://github.com/yysun/apprun-ssr)
* [AppRun Multilingual Example](https://github.com/yysun/apprun-multilingual)
* [AppRun Firebase Authentication](https://github.com/yysun/apprun-firebase-authentication)
* [AppRun Dynamic Module Import](https://github.com/yysun/apprun-dynamic-components)
* [AppRun Hot Module Reload with Webpack](https://github.com/yysun/apprun-hot-module-reload)
* [Use Apprun with Parcel](https://github.com/yysun/apprun-parcel-bundler)

## Contribute

You can launch the webpack dev-server and the demo app from the _demo_ folder with the following npm commands:
```
npm install
npm start
```

You can run the unit tests from the _tests_ folder.
```
npm test
```
Unit tests can serve as functional specifications.

Finally, to build optimized js files to the dist folder, just run:
```
npm run build
```

Have fun and send pull requests.

## License

MIT

Copyright (c) 2015-2018 Yiyi Sun

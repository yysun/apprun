# AppRun [![Build][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url] [![License][license-image]][license-url] [![twitter][twitter-badge]][twitter]


AppRun is a 3K library for building applications using the [Elm architecture](https://guide.elm-lang.org/architecture), [event pub-sub](https://yysun.github.io/apprun/docs/#/?id=event-pubsubs) and [components](https://yysun.github.io/apprun/docs/#/?id=component).

AppRun has a tiny API which has just three functions and one component class. It acts like glue to link and drives your application logic. It adds no overhead or ceremony.

Applications built with AppRun have less line of code, smaller js file, and better performance. See a comparison from [A Real-World Comparison of Front-End Frameworks with Benchmarks (2018 update)](https://medium.freecodecamp.org/a-real-world-comparison-of-front-end-frameworks-with-benchmarks-2018-update-e5760fb4a962).


AppRun has good performance. You can see the [performance results](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html) compared to other frameworks and libraries in the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) project.

AppRun is flexible and practical. It gives options. You can choose:

* Whether just include it in a script tag or use it with a build process.
* Which language to use, JavaScript or TypeScript;
* Apply the Elm architecture globally or use components;
* View output format to be HTML or Virtual DOM/JSX;
* Whether to using static types;
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

The example code above is a counter application that has implemented the Elm architecture.

Try it online: [AppRun - Counter](https://jsfiddle.net/ap1kgyeb/4).


## Architecture Concept

There are three separated parts in the Elm architecture.

* Model — the data model of your application state
* View — a function to display the state as HTML
* Update — a set of event handlers to update the state

AppRun applications have the event cycle like below to drive the architecture:

```
Web events => AppRun Events => Update => State => View => HTML
```

Using events makes it very easy to handle user interaction, routing and even server-side events. Events make modules decoupled and easy to test. Using the event pub-sub also solved the component relationship and communication problem that concerns Elm community.

Each AppRun [Component](https://yysun.github.io/apprun/docs/#/?id=component) has an Elm architecture like a mini-application. It is very suitable for building Single Page Applications (SPA).

## Examples

* [RealWorld Example App](https://github.com/gothinkster/apprun-realworld-example-app) - a SPA blogging platform adheres to the [RealWorld specification](https://github.com/gothinkster/realworld) (1100 lines).
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
npx apprun --init --spa
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


[travis-image]: https://travis-ci.org/yysun/apprun.svg?branch=master
[travis-url]: https://travis-ci.org/yysun/apprun
[npm-image]: https://img.shields.io/npm/v/apprun.svg
[npm-url]: https://npmjs.org/package/apprun
[license-image]: https://img.shields.io/:license-mit-blue.svg
[license-url]: LICENSE.md
[downloads-image]: http://img.shields.io/npm/dm/apprun.svg
[downloads-url]: https://npmjs.org/package/apprun

[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20AppRun%20by%20%40yysun%20https%3A%2F%2Fgithub.com%2Fyysun%2Fapprun%20%F0%9F%91%8D%20%40apprunjs
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/yysun/apprun.svg?style=social

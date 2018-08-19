# AppRun [![Build][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url] [![License][license-image]][license-url] [![twitter][twitter-badge]][twitter]


AppRun is a 3K library for building high-performance and reliable web applications using the [Elm inspired Architecture](https://yysun.github.io/apprun/docs/#/?id=architecture), [event pub-sub](https://yysun.github.io/apprun/docs/#/?id=event-pubsubs) and [components](https://yysun.github.io/apprun/docs/#/?id=component).

> AppRun is a MIT-licensed open source project. Please consider [supporting the project on Patreon](https://www.patreon.com/apprun). 👍❤️🙏


## Architecture Concept

Application logic is broken down into three separated parts in the AppRun architecture.

* State (a.k.a. Model) — the state of your application
* View — a function to display the state
* Update — a collection of event handlers to update the state

AppRun ties the three parts together and drives the applications using [event pub-sub](https://yysun.github.io/apprun/docs/#/?id=event-pubsubs).

Applications built with AppRun have less lines of code, smaller js files, and better performance. See a comparison from [A Real-World Comparison of Front-End Frameworks with Benchmarks (2018 update)](https://medium.freecodecamp.org/a-real-world-comparison-of-front-end-frameworks-with-benchmarks-2018-update-e5760fb4a962). You can also see the [performance results](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html) compared to other frameworks and libraries in the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) project.


## Quick Start

Below is a counter application using AppRun.
```html
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

## Web Components

Using apprun@es6, you can convert AppRun components into [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). AppRun components become the custom elements that also can handle AppRun events.

```html
<html>
<head>
  <meta charset="utf-8">
  <title>Counter as web component</title>
</head>
<body>
  <my-app id='counter'></my-app>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/custom-elements/1.1.2/custom-elements.min.js"></script>
  <script src="https://unpkg.com/apprun@es6/dist/apprun-html.js"></script>
  <script>
    class Counter extends Component {
      constructor() {
        super();
        this.state = 0;
        this.view = state => `<div>
          <h1>${state}</h1>
          <button onclick='counter.run("-1")'>-1</button>
          <button onclick='counter.run("+1")'>+1</button>
          </div>`;
        this.update = {
          '+1': state => state + 1,
          '-1': state => state - 1
        };
      }
    }
    app.webComponent('my-app', Counter);
  </script>
</body>
</html>
```

## Install

You can include AppRun in your html directly and use it with JavaScript.
```javascript
<script src="https://unpkg.com/apprun@latest/dist/apprun-html.js"></script>
```

## CLI
Or you can use AppRun with TypeScript and Webpack. Use the AppRun CLI to initialize a TypeScript and webpack configured project:
```sh
npx apprun --init --spa
npm start
```

## Online Demos
See Examples Online @[glitch.com](https://glitch.com/@yysun) and @[stackblitz.com](https://stackblitz.com/@yysun)

## Dev-Tools

To use the AppRun dev-tools, include the the dev-tools script.
```JavaScript
<script src="https://unpkg.com/apprun@latest/dist/apprun-dev-tools.js"></script>
```
Then install the [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension). You can monitor the events and states in the devtools.

![app-dev-tools](docs/apprun-dev-tools.gif)

## Documentation

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
* [Redux vs. The React Context API vs. AppRun](https://medium.com/@yiyisun/redux-vs-the-react-context-api-vs-apprun-f324bee8cbbf)
* [I Also Created the Exact Same App Using AppRun](https://medium.com/@yiyisun/i-also-created-the-exact-same-app-using-apprun-dd1860cb8112)

## Examples

* [RealWorld Example App](https://github.com/gothinkster/apprun-realworld-example-app) - a SPA blogging platform adheres to the [RealWorld specification](https://github.com/gothinkster/realworld) (1100 lines).
* [Hacker News Reader](https://github.com/yysun/apprun-hn) - PWA hacker news reader (230 lines)
* [AppRun Demo App](https://yysun.github.com/apprun) - a SPA that has 8 components, including a [Todo component](https://github.com/yysun/apprun/tree/master/demo/components/todo.tsx) (90 lines)
* [AppRun Admin Dashboard](https://yysun.github.com/apprun-bootstrap)
* [AppRun Server-Side Rendering](https://github.com/yysun/apprun-ssr)
* [AppRun Server-Side Rendering for ASP.NET MVC](https://github.com/yysun/apprun-ssr-aspnet)
* [AppRun Multilingual Example](https://github.com/yysun/apprun-multilingual)
* [AppRun Firebase Authentication](https://github.com/yysun/apprun-firebase-authentication)
* [AppRun Dynamic Module Import](https://github.com/yysun/apprun-dynamic-components)
* [AppRun Hot Module Reload with Webpack](https://github.com/yysun/apprun-hot-module-reload)
* [Use Apprun with Parcel](https://github.com/yysun/apprun-parcel-bundler)
* [AppRun Desktop Application with Electron](https://github.com/yysun/apprun-electron)
* [AppRun Mobile Application with Framework7](https://github.com/yysun/f7)


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

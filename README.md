# AppRun [![Build][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url] [![License][license-image]][license-url] [![twitter][twitter-badge]][twitter] [![Discord Chat][discord-image]][discord-invite]


## Introduction

AppRun is a lightweight alternative to other frameworks and libraries. It has a [unique architecture](https://apprun.js.org/docs/architecture/) inspired by the Elm architecture that can help you manage states, routing, and other essential aspects of your web application.

Use a _Counter_ as an example.

```js
// define the initial state
const state = 0;

// view is a function to display the state (JSX)
const view = state => <div>
  <h1>{state}</h1>
  <button onclick="app.run('-1')">-1</button>
  <button onclick="app.run('+1')">+1</button>
</div>;

// update is a collection of event handlers
const update = {
  '+1': state => state + 1,
  '-1': state => state - 1
};

// start the app
app.start(document.body, state, view, update);
```
<apprun-code></apprun-code>

* AppRun is lightweight, only 6KB gzipped, but includes state management, rendering, event handling, and routing.

* With only three functions: `app.start`, `app.run`, and `app.on` in its API makes it easy to learn and use. And no worries about the incompatibility of version upgrades.

* One more thing, you can [use AppRun with React](https://apprun.js.org/docs/react) to simplify state management and routing of your React applications.

At its core, AppRun harnesses the power of the [event PubsSub]([Publish-Subscribe](https://apprun.js.org/docs/event-pubsub/)) pattern to streamline your application’s state handling and routing. The result? Cleaner, more maintainable code and a smoother development experience.

## AppRun Benefits

* Clean architecture that needs less code
* State management and routing included
* No proprietary syntax to learn (no hooks, no reducers, no signals)
* Use directly in the browser or with a compiler/bundler
* Advanced features: JSX, Web Components, Dev Tools, SSR, etc.


## Getting Started

AppRun is distributed on npm. To get it, run:

```sh
npm install apprun
```
You can also load AppRun directly from the unpkg.com CDN:

```js
<html>
<body>
<script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
<script>
  const view = state => `<div>${state}</div>`;
  app.start(document.body, 'hello AppRun', view);
</script>
</body>
</html>
```
<apprun-code style="height:200px"></apprun-code>

Or, use the ESM version:
```js
<html>
<body>
<script type="module">
  import { app, html } from 'https://unpkg.com/apprun/dist/apprun-html.esm.js';
  const view = state => html`<div>${state}</div>`;
  app.start(document.body, 'hello ESM', view);
</script>
</body>
</html>
```
<apprun-code style="height:200px"></apprun-code>

In addition to run directly in the browser,  or with a compiler/bundler like Webpack or Vite.

You can run the `npm create apprun-app` command to create an AppRun project.

```sh
npm create apprun-app [my-app]
```

### Learn More

You can get started with [AppRun Docs](https://apprun.js.org/docs) and [the AppRun Playground](https://apprun.js.org/#play).

### AppRun Book from Apress

[![Order from Amazon](https://images-na.ssl-images-amazon.com/images/I/51cr-t1pdSL._SX348_BO1,204,203,200_.jpg)](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)

* [Order from Amazon](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)


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

## Contributors
[![](https://contributors-img.firebaseapp.com/image?repo=yysun/apprun)](https://github.com/yysun/apprun/graphs/contributors)

## Support

AppRun is an MIT-licensed open-source project. Please consider [supporting the project on Patreon](https://www.patreon.com/apprun). 👍❤️🙏

### Thank you for your support

* Athkahden Asura
* Alfred Nerstu
* Gyuri Lajos
* Lorenz Glißmann
* Kevin Shi
* Chancy Kennedy

## License

MIT

Copyright (c) 2015-2025 Yiyi Sun


[travis-image]: https://travis-ci.org/yysun/apprun.svg?branch=master
[travis-url]: https://travis-ci.org/yysun/apprun
[npm-image]: https://img.shields.io/npm/v/apprun.svg
[npm-url]: https://npmjs.org/package/apprun
[license-image]: https://img.shields.io/:license-mit-blue.svg
[license-url]: LICENSE.md
[downloads-image]: https://img.shields.io/npm/dm/apprun.svg
[downloads-url]: https://npmjs.org/package/apprun

[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20AppRun%20by%20%40yysun%20https%3A%2F%2Fgithub.com%2Fyysun%2Fapprun%20%F0%9F%91%8D%20%40apprunjs
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/yysun/apprun.svg?style=social

[discord-image]: https://img.shields.io/discord/476903999023480842.svg
[discord-invite]: https://discord.gg/CETyUdx
# AppRun [![Build][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url] [![License][license-image]][license-url] [![twitter][twitter-badge]][twitter] [![Discord Chat][discord-image]][discord-invite]


## Introduction

AppRun is a sleek and efficient JavaScript library designed to revolutionize statement management in web development. At its core, AppRun harnesses the power of the event PubsSub (Publish-Subscribe) pattern to streamline your application’s state handling.


## Why the Event Pubsub Pattern?

The event PubSub pattern isn't new; it's a well-established design pattern used widely in software development to handle communication between components or services in a decoupled manner. Web developers are likely already familiar with the PubSub pattern through their use of DOM event handling.

AppRun takes the familiar PubSub concept and extends it into your application's logic, providing a more structured and powerful approach to state management. The result? Cleaner, more maintainable code and a smoother development experience.

Here is an example of a simple counter application built with AppRun:


```js
// define the initial state
const state = 0;

// view is a pure function to display the state
const view = state => `<div>
  <h1>${state}</h1>
  <button onclick="app.run('-1')">-1</button>
  <button onclick="app.run('+1')">+1</button>
</div>`;

// update is a collection of event handlers
const update = {
  '+1': state => state + 1,
  '-1': state => state - 1
};

// start the app
app.start(document.body, state, view, update);
```
<apprun-code style="height:360px; font-size: smaller;"></apprun-code>

## AppRun Benefits

* Clean architecture that needs less code
* State management and routing included
* No proprietary syntax to learn (no hooks)
* Use directly in the browser or with a compiler/bundler
* Advanced features: JSX, Web Components, Dev Tools, SSR, etc.


## Getting Started

AppRun is distributed on npm. To get it, run:

```sh
npm install apprun
```

You can also load AppRun directly from the unpkg.com CDN:

```js
<script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
<script>
  const view = state => `<div>${state}</div>`;
  app.start(document.body, 'hello AppRun', view);
</script>
```

Or, use the ESM version:
```js
<script type="module">
  import { app } from 'https://unpkg.com/apprun/dist/apprun-html.esm.js';
  const view = state => `<div>${state}</div>`;
  app.start(document.body, 'hello ESM', view);
</script>
```

Or, you can create an AppRun app by using the `npm create apprun-app` command.

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

AppRun is an MIT-licensed open source project. Please consider [supporting the project on Patreon](https://www.patreon.com/apprun). 👍❤️🙏

### Thank you for your support

* Athkahden Asura
* Alfred Nerstu
* Gyuri Lajos
* Lorenz Glißmann
* Kevin Shi
* Chancy Kennedy

## License

MIT

Copyright (c) 2015-2024 Yiyi Sun


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
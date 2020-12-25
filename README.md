# AppRun [![Build][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url] [![License][license-image]][license-url] [![twitter][twitter-badge]][twitter] [![Discord Chat][discord-image]][discord-invite]

AppRun is a JavaScript library for building reliable, high-performance web applications using the Elm inspired architecture, events, and components.

> AppRun is an MIT-licensed open source project. Please consider [supporting the project on Patreon](https://www.patreon.com/apprun). 👍❤️🙏

## AppRun Benefits

* Write less code
* No proprietary syntax to learn
* Compiler/transpiler is optional
* State management and routing included
* Run side-by-side with jQuery, chartjs, D3, lit-html ...

AppRun is distributed on npm.
```sh
npm install apprun
```

You can also load AppRun directly from the unpkg.com CDN:

```javascript
<script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
```
Or use it as ES module from unpkg.com:
```javascript
<script type="module">
  import { app, Component } from 'https://unpkg.com/apprun@next/esm/apprun-html?module';
</script>
```
## Architecture Concept

![apprun-demo](docs/imgs/apprun-demo.gif)

[Try it in AppRun Playground](https://apprun.js.org/#play/6).

You can build applications using [Component](docs/#/05-component) that also have _state_, _view_, and _update_.

## AppRun Book from Apress

[![Order from Amazon](https://camo.githubusercontent.com/99fad1f024c274a3d752a1583cf125037583811c/68747470733a2f2f696d616765732e737072696e6765722e636f6d2f7367772f626f6f6b732f6d656469756d2f393738313438343234303638372e6a7067)](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)

* [Order from Amazon](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)

## Create AppRun Apps

We recommend using TypeScript and JSX. TypeScript provides [strong typing](https://medium.com/@yiyisun/strong-typing-in-apprun-78520be329c1). JSX provides more [advanced features](https://dev.to/yysun/advanced-view-features-in-apprun-17g5).

We recommend using webpack for building production code. However, you can also have fast and productive [development experiences with esm-server](https://dev.to/yysun/a-dev-server-supports-esm-3cea).

Use the AppRun CLI to initialize a TypeScript and webpack configured project:
```sh
npx apprun --init
npm start
```

You can also initialize a SPA project.

```sh
npx apprun --init --spa
```

To initialize a project that targets ES5, use the AppRun CLI with the --es5 flag:

```sh
npx apprun --init --spa --es5
```

## Starter Templates

Optionally, you can directly scaffold AppRun projects from the AppRun starter templates.

```sh
npx degit apprunjs/apprun-rollup my-app
npx degit apprunjs/apprun-rollup-lit-html my-app
npx degit apprunjs/apprun-webpack my-app
npx degit apprunjs/apprun-parcel my-app
npx degit apprunjs/apprun-web-components my-app
npx degit apprunjs/apprun-bootstrap my-app
npx degit apprunjs/apprun-coreui my-app
npx degit apprunjs/apprun-pwa my-app
npx degit apprunjs/apprun-pwa-workbox my-app
npx degit yysun/apprun-d3 my-app
npx degit yysun/apprun-electron my-app
npx degit yysun/apprun-electron-forge my-app
npx degit yysun/apprun-websockets my-app
npx degit yysun/apprun-websockets-sqlite my-app
```
## AppRun Developer Tools

To use the AppRun dev-tools, include the dev-tools script.

```JavaScript
<script src="https://unpkg.com/apprun/dist/apprun-dev-tools.js"></script>
```

See [AppRun CLI Run in the Console](https://dev.to/yysun/make-cli-run-in-the-console-42ho)

AppRun Dev Tools connects to the Redux DevTools Extension. To use the dev-tools, install the [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension). You can monitor the events and states.

![app-dev-tools](docs/imgs/apprun-dev-tools.gif)

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

## License

MIT

Copyright (c) 2015-2020 Yiyi Sun


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

[discord-image]: https://img.shields.io/discord/476903999023480842.svg
[discord-invite]: https://discord.gg/M5EDsj
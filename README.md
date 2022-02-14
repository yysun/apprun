# AppRun [![Build][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url] [![License][license-image]][license-url] [![twitter][twitter-badge]][twitter] [![Discord Chat][discord-image]][discord-invite]

AppRun is a JavaScript library for building reliable, high-performance web applications using the Elm-inspired architecture, events, and components.

> [All the Ways to Make a Web Component - May 2021 Update](https://webcomponents.dev/blog/all-the-ways-to-make-a-web-component/) compares the coding style, bundle size, and performance of 55 different ways to make a Web Component. It put AppRun on the top 1/3 of the list of bundle size and performance.

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

Or, you can create an AppRun app by using the `npm init apprun-app` command.

```sh
npm init apprun-app [my-app]
```

## Architecture Concept

* AppRun [architecure](docs/architecture) has _state_, _view_, and _update_.
* AppRun is [event-driven](docs/event-pubsub).
* AppRun apps can be global or [Component](docs/component) based.


You can get started with [AppRun Docs](https://apprun.js.org/docs) and [the AppRun Playground](https://apprun.js.org/#play).

## AppRun Book from Apress

[![Order from Amazon](https://camo.githubusercontent.com/99fad1f024c274a3d752a1583cf125037583811c/68747470733a2f2f696d616765732e737072696e6765722e636f6d2f7367772f626f6f6b732f6d656469756d2f393738313438343234303638372e6a7067)](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)

* [Order from Amazon](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)


## AppRun Dev Tools
To use the AppRun dev-tools, include the dev-tools script.

```JavaScript
<script src="https://unpkg.com/apprun/dist/apprun-dev-tools.js"></script>
```

See the annoucement: [AppRun Dev Tools](https://dev.to/yysun/make-cli-run-in-the-console-42ho)

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

Copyright (c) 2015-2022 Yiyi Sun


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
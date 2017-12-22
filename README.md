# AppRun [![Build Status](https://travis-ci.org/yysun/apprun.svg?branch=master)](https://travis-ci.org/yysun/apprun)

![logo](logo.png)

AppRun is a 3K library for developing applications using the [elm](http://elm-lang.org/) style
[model-view-update architecture](https://guide.elm-lang.org/architecture/)
and the [event publication and subscription](docs/event-pubsub.md).

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
    const model = 0;

    const view = (model) => {
      return `<div>
        <h1>${model}</h1>
        <button onclick='app.run("-1")'>-1</button>
        <button onclick='app.run("+1")'>+1</button>
      </div>`;
    };

    const update = {
      '+1': (model) => model + 1,
      '-1': (model) => model - 1
    };

    app.start('my-app', model, view, update);
  </script>
</body>
</html>
```

The example code above is a counter application that has implemented the model-view-update architecture. 

Try it online: [AppRun - Counter](https://jsfiddle.net/ap1kgyeb/4).

Larger applications can be built using components where each component has a model-view-update architecture. 

Run and checkout the source code of following examples for more details.

* [RealWorld Example App](https://github.com/yysun/realworld-starter-kit) - a blogging platform adheres to the [RealWorld specification](https://github.com/gothinkster/realworld)
* [Hacker News](https://yysun.github.io/apprun-hn) - hacker news reader in 230 lines
* [AppRun Demo App](https://yysun.github.io/apprun-examples/) - a SPA that has 8 components
* [Todo w/ undo and redo ](https://yysun.github.io/apprun-examples/#todo) - in 90 lines


## Video Tutorials

* [Building Applications with AppRun, Part 1 - Getting Started](https://www.youtube.com/watch?v=RuRmXEN2-xI)
* [Building Applications with AppRun, Part 2 - Components](https://www.youtube.com/watch?v=qkP6HvZmhtY)

## Articles

* [Building Applications with AppRun](https://medium.com/@yiyisun/building-applications-with-apprun-d103cd461bae)
* [Deep Dive into AppRun State](https://medium.com/@yiyisun/deep-dive-into-apprun-state-3d6fb58b1521)
* [Deep Dive into AppRun Events]()
* [Dynamic Components Using TypeScript 2.4](https://medium.com/@yiyisun/dynamic-components-using-typescript-2-4-de109be6d135)
* [A Real-World Comparison of Front-End Frameworks with Benchmarks](https://medium.freecodecamp.org/a-real-world-comparison-of-front-end-frameworks-with-benchmarks-e1cb62fd526c)

## Install

If you are interested in moving forward, you can install the AppRun CLI and initialize a TypeScript and webpack configured project:
```
npm install apprun -g
apprun --init
npm start

```

## Explore More

AppRun provides everything you need to build a modern application frontend. To explore more about AppRun, read the following docs.

* [Introduction](docs/README.md)
* [Event Pub and Sub](docs/event-pubsub.md)
* [Model-view-update Architecture](docs/concept.md)
* [Component](docs/component.md)
* [JSX vs HTML](docs/jsx-html.md)
* [TypeScript and webpack](docs/build.md)



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

Copyright (c) 2015-2017 Yiyi Sun

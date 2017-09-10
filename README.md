# AppRun

![logo](logo.png)

AppRun is a 3K library for developing applications using the [elm](http://elm-lang.org/) style
[model-view-update architecture](https://guide.elm-lang.org/architecture/)
and the [event publication and subscription](docs/event-pubsub.md).
.
## Quick Start

To give it a try, include AppRun in your html.
```
<script src="https://unpkg.com/apprun@latest/dist/apprun-html.js"</script>
```

No other ceremony, you can start write code of model, view and update right away.

```
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Counter</title>
</head>
<body>
<script src="https://unpkg.com/apprun@latest/dist/apprun-html.js"</script>
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

    const element = document.getElementById();
    app.start(element, model, view, update);
  </script>
</body>
</html>
```

Or try it online: [AppRun - Counter](https://jsfiddle.net/ap1kgyeb/4).

The counter example above implements the model-view-update architecture at application level. AppRun applications can also be built using components. Each component has a model-view-update architecture that manages component state. Components communicate each other through events. Run the following examples and checkout their source code for more details.

* [AppRun Demo App](https://yysun.github.io/apprun-examples/) - a SPA that has 8 components
* [Todo](https://yysun.github.io/apprun-examples/#todo) component in 90 lines
* [Hacker News](https://yysun.github.io/apprun-hn) - hacker news reader in 230 line
* [RealWorld Example App](https://github.com/yysun/realworld-starter-kit) - a blogging platform adheres to the [RealWorld specification](https://github.com/gothinkster/realworld) 

## Video Tutorials

* [Building Applications with AppRun, Part 1 - Getting Started](https://www.youtube.com/watch?v=RuRmXEN2-xI)
* [Building Applications with AppRun, Part 2 - Components](https://www.youtube.com/watch?v=qkP6HvZmhtY)

## Articles

* [Building Applications with AppRun](https://medium.com/@yiyisun/building-applications-with-apprun-d103cd461bae)
* [Dynamic Components Using TypeScript 2.4](https://medium.com/@yiyisun/dynamic-components-using-typescript-2-4-de109be6d135)
* [Deep Dive into AppRun State](https://medium.com/@yiyisun/deep-dive-into-apprun-state-3d6fb58b1521)
* [Deep Dive into AppRun Events]()

## Install

If you are interested moving forward, you can install AppRun CLI and initialize a TypeScript and webpack configured project:
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

You can launch the webpack dev-server and the demo app from the _demo_ folder by npm commands:
```
npm install
npm start
```

You can run the unit tests from the _tests_ folder.
```
npm test
```
Unit tests can serve as the functional specifications.

Finally, to build optimized js files to dist folder by run:
```
npm run build
```

Have fun and send pull requests.

## License

MIT

Copyright (c) 2015-2017 Yiyi Sun
# Introduction

## What is AppRun

AppRun is a JavaScript library for building applications using the [elm](https://guide.elm-lang.org/architecture) inspired architecture, events, and components.
> AppRun is an MIT-licensed open source project. Please consider [supporting the project on Patreon](https://www.patreon.com/apprun). 👍❤️🙏

## Why AppRun

### Best Developer Experiences

* Write less code
* No proprietary syntax to learn
* Rich developer tools

### Flexible and Practical

* State management and routing included
* Web Components Support
* Works well with other libraries, such as jQuery, chart.js, D3, lit-html ...

### Best Application Quality

Applications built with AppRun have **fewer lines of code**, **smaller js files**, and **better performance**. See a comparison from [A Real-World Comparison of Front-End Frameworks with Benchmarks (2019 update)](https://medium.freecodecamp.org/a-realworld-comparison-of-front-end-frameworks-with-benchmarks-2019-update-4be0d3c78075).

You can also see the [performance results](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html) compared to other frameworks and libraries in the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) project.


## AppRun API

You can build applications using the global _state_, _view_ function, and _update_ object.

```javascript
const state = any;
const view = state => <div>{state}</div>;
const update = {};
app.start(document.body, state, view, update);
```

You can also build applications using [components](05-component).

```javascript
import { app, Component } from 'apprun';

class MyApp extends Component {
  state = {};
  view = state => <div></div>;
  update = {};
}

app.render(document.body, <MyApp />);
```

Ready to try it yourself?

Head over to [Getting Started](01-start).
# AppRun

AppRun is a library to help implementing the
[elm](http://elm-lang.org/)/[Redux](http://redux.js.org/) model-view-update architecture in plain JavaScript
or TypeScript code.

## An Example

The 15 lines of code below is a simple counter. Two functions from AppRun
(app.run and app.start) are used to make it elm architecture.
```
/// <reference path="apprun.d.ts" />
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

const element = document.getElementById('my-app');
app.start(element, model, view, update);
```

## Basic Concepts

The [elm architecture](https://guide.elm-lang.org/architecture/) has three parts.

* Model — the state of your application
* Update — a way to update your state
* View — a way to view your state as HTML

app.start ties the three parts together to an element on page. That's the architecture.

## The Model

Model can be any data structure, a number, an array, or an object that reflects
the state of the application.
```
const model = 0;
```

## Define Update

Update re-creates the model. Update is defined as JavaScript object declaratively.
```
const update = {
  '+1': (model) => model + 1,
  '-1': (model) => model - 1
}
```
There are a couple of more creative ways to define the update object.

```
const update = {};
update['+1'] = (model) => model + 1;
update['-1'] = (model) => model - 1;
```
```
const update = {
  INCREASE: (model) => model + 1,
  DECREASE: (model) => model - 1
}
```
## Run Update

app.run is the function to run the update.
```
app.run('INCREASE');
```
It can be used in HTML markup directly:
```
<button id="inc" onclick="app.run('INCREASE')">+1</button>
```
Or in JavaScript:
```
document.getElementById('inc').addEventListener('click',
  () => app.run('INCREASE'));
```
Or with jQuery:
```
$('#inc').on('click', () => app.run('INCREASE'));
```

## HTML View

Once the update re-creates model, AppRun passes the new model into the view function.
The view function generates HTML using the model. AppRun parses the HTML string into
virtual dom. It then calculates the differences against the web page element and r
enders the changes.

```
const view = (model) => `<div>${model}</div>`;
```
ES2015 string interpolation made it very easy to construct HTML string. Even
creating a list is straight forward.
```
const view = (numbers) => {
  return numbers.reduce(prev, curr) {
    prev + `<li>${curr}</li>`;
  }, '');
}
```

# HyperScript and JSX View

AppRun supports [HyperScript](https://github.com/dominictarr/hyperscript).
It converts HyperScript to [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/blob/master/virtual-hyperscript/README.md)
internally to work with [virtual DOM](https://github.com/Matt-Esch/virtual-dom).

```
const h = app.h;
const view = (val) => {
  return h('div', {},
    h('div', {}, val),
    h('input', {
      value: val,
      oninput: function() { app.run('render', this.value)}
    }, null)
  );
};
```
The internal conversion from HyperScript to virtual-hyperscript make AppRun
compatible with Babel and TypeScript (TSX).
```
/* @jsx h */
const h = app.h;
const view = (val) => {
  return <div>
    <div>{val}</div>
    <input value={val}
      oninput={function() { app.run('render', this.value)}}/>
  </div>
};
```

There are three editions for different view strategy.

* apprun-zero.js: 1K, use your own preferred DOM virtualization technology, such as React
* apprun-jsx.js: 4K, support virtual-hyperScript, jsx/tsx
* apprun.js: 64K, support virtual-hyperScript, jsx/tsx and HTML template string

*Note*: The JSX view is the reommanded way, due to the reasons described by Facebook React team:
[Why not template literals](http://facebook.github.io/jsx/#why-not-template-literals)

## TypeScript

AppRun exposes a global object named app that is accessible by JavaScript and TypScript directly
as weel as being compiled/bundled with your code using webpack.

## Examples

You run some examples in the demo folder by run
```
npm run build:demo
live-server demo
```
or try it online:

* [Single counter](https://jsfiddle.net/ap1kgyeb/)
* [Multiple counters](https://jsfiddle.net/ap1kgyeb/1/)

or check out another example project, [apprun-examples](https://github.com/yysun/apprun-examples).


Have fun and send pull requests.

## License

MIT

Copyright (c) 2015-2016 Yiyi Sun
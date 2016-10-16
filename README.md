# AppRun

AppRun is a library to help implementing the [elm](http://elm-lang.org/)/
[Redux](http://redux.js.org/) model-view-update architecture in plain JavaScript
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
const update = {
  INCREASE: (model) => model + 1,
  DECREASE: (model) => model - 1
}
```
```
const update = {};
update['+1'] = (model) => model + 1;
update['-1'] = (model) => model - 1;
```
```
app.on('+1', (model) => model + 1);
app.on('-1', (model) => model - 1);
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
The view function generates HTML using the model. AppRun calculates the differences
against the web page element and renders the changes.

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

## Conclusion

The steps to make an application are

* Create a model that can be a number, an array or an object
* Create a update object that has functions to re-create the model
* Create a view that generates HTML string based on the model
* Start the app in an element - app.start
* Trigger the update - app.run

That's all. You can find examples that are made this way in
[this project](https://github.com/yysun/apprun-examples), or try it online:

* [Single counter](https://jsfiddle.net/ap1kgyeb/)
* [Multiple counters](https://jsfiddle.net/ap1kgyeb/1/)

## Three Editions

AppRun converts HTML generated from the view function to [virtual DOM](https://github.com/Matt-Esch/virtual-dom) by default.
In case you want to use other technology, e.g. React, hyperScript and JSX, there two smaller size editions of js files.

* apprun-zero.js: 1K, write view function with your preferred DOM virtualization technology, such as React
* apprun-jsx.js: 4K, write view function using [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/blob/master/virtual-hyperscript/README.md) or jsx/tsx
* apprun.js: 64K, full edition, write view function in hyperScript, jsx and plain HTML


## TypeScript

Once AppRun exposes a global object app that is accessible by JavaScript and TypScript directly.
It can also be compiled/bundled with your TypeScript file using webpack.

Have fun and send pull requests.

## License

MIT

Copyright (c) 2015-2016 Yiyi Sun
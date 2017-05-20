# AppRun

AppRun is a lightweight library for implementing the [elm](http://elm-lang.org/)/[Redux](http://redux.js.org/)
model-view-update architecture using JavaScript or TypeScript.
It supports writing views in JSX / TSX or HTML string. The views
are rendered through [virtual DOM](https://github.com/Matt-Esch/virtual-dom).
At core, it is based on the event pubsub pattern, where _app.run_ publishes events and _app.on_ subscribes to the events.
Finally, _app.start_ bootstraps the application.

## An Example

The 15 lines of code below is a simple counter. Two functions from AppRun
(_app.run_ and _app.start_) are used to make it model-view-update architecture.
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

The model-view-update architecture has three parts.

* Model — the state of your application
* Update — a function to update your state
* View — a function to display your state as HTML

_app.start_ ties the three parts together to an element on page. That's the architecture. More details below.

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
```
const update = (id) => ({
  [`INCREASE_${id}`]: (model) => model + 1,
  [`DECREASE_${id}`]: (model) => model - 1
})
```
## Run Update

_app.run_ is the function to run the update.
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
Or with JSX:
```
<button onclick={()=>app.run("INCREASE")}>+1</button>
```
Or even with jQuery:
```
$('#inc').on('click', ()=>app.run('INCREASE'));
```

## HTML View

Once the update re-creates model, AppRun passes the new model into the view function.
The view function generates HTML using the model. AppRun parses the HTML string into
virtual dom. It then calculates the differences against the web page element and renders the changes.

```
const view = (model) => `<div>${model}</div>`;
```
ES2015 string interpolation can made it easy to construct HTML string to form a list.
```
const view = (numbers) => {
  return numbers.reduce(prev, curr) {
    prev + `<li>${curr}</li>`;
  }, '');
}
```

# JSX / TSX View

Although HTML View is easy to understand and useful for trying out ideas, the JSX / TSX view is
recommended. The reasons are the same as described by Facebook React team:
[Why not template literals](http://facebook.github.io/jsx/#why-not-template-literals)

AppRun supports JSX / TSX views.

```
const Todo = ({todo, idx}) => <li>
  {todo.value}
</li>

const view = (model) => <div>
  <h1>Todo</h1>
  <ul> {
    model.todos.map((todo, idx) => <Todo todo={todo} idx={idx} />)
  }
  </ul>
</div>

```

AppRun also supports [HyperScript](https://github.com/dominictarr/hyperscript).
It converts HyperScript to [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/blob/master/virtual-hyperscript/README.md)
internally to work with [virtual DOM](https://github.com/Matt-Esch/virtual-dom).
If you are a hyperscript fan, you will like this option.

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

## JavaScript and TypeScript

AppRun exposes a global object named _app_ that is accessible by JavaScript and TypScript directly.
AppRun can also be compiled/bundled with your code too. So use it in one of three ways:

* Included apprun.js in a script tag and use _app_ from JavaScript
* Included apprun.js in a script tag and use _app_ from TypeScript (by referencing to apprun.d.ts)
* Compile/bundle using webpack

Also depends on your view strategy, there are also four editions to use:

* apprun-zero.js: 5.2K, use your own preferred DOM virtualization technology, such as React
* apprun-jsx.js: 11.1K, support virtual-hyperScript, jsx/tsx
* apprun-html.js: 7.1K, support virtual-hyperScript, jsx/tsx and HTML template string
* apprun.js: 12.7K, support virtual-hyperScript, jsx/tsx and HTML template string

## Examples

You can run the demo app in the _demo_ folder by:
```
npm start
```
or try it online:

* [Single counter](https://jsfiddle.net/ap1kgyeb/)
* [Multiple counters](https://jsfiddle.net/ap1kgyeb/1/)

The unit tests in the _tests_ folder can be served as the functional specifications.

Have fun and send pull requests.

## License

MIT

Copyright (c) 2015-2016 Yiyi Sun
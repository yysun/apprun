# Basic Concepts

In the [model-view-update architecture](https://guide.elm-lang.org/architecture/), there are three separated parts in an application.

* Model — the state of your application
* Update — a function to update your state
* View — a function to display your state as HTML

The 15 lines of code below is a simple counter in model-view-update architecture.

```
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

## The Model

The model can be any data structure, a number, an array, or an object that reflects the state of the application.
```
const model = 0;
```

## The Update

The update updates the state.
```
const update = {
  '+1': (model) => model + 1,
  '-1': (model) => model - 1
}
```

## The View

The view generates HTML based on the state. AppRun parses the HTML string into virtual dom. It then calculates the differences against the web page element and renders the changes.

```
const view = (model) => {
  return `<div>
    <h1>${model}</h1>
    <button onclick='app.run("-1")'>-1</button>
    <button onclick='app.run("+1")'>+1</button>
  </div>`;
};
```

## Run the Application

_app.start_ function from AppRun framework ties Model, Update and View together to an element and starts the application.
```
const element = document.getElementById('my-app');
app.start(element, model, view, update);
```

Two functions from AppRun (_app.run_ and _app.start_) are used to make it model-view-update architecture.


## Trigger the Update and View

_app.run_ is the function to run the update.
```
app.run('+1');
```
It can be used in HTML markup directly:
```
<button id="inc" onclick="app.run('+1')">+1</button>
```
Or in JavaScript:
```
document.getElementById('inc').addEventListener('click',
  () => app.run('+1'));
```
Or with JSX:
```
<button onclick={()=>app.run("+1")}>+1</button>
```
Or even with jQuery:
```
$('#inc').on('click', ()=>app.run('+1'));
```

Once the update has updated the state, AppRun passes the new state into the view function to update the web page.

That's all. _app.start_ function and _app.run_ function are all you need.

Try it online: [Counter](https://jsfiddle.net/ap1kgyeb/2).

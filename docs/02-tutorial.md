# Tutorial

## Create Your First App

The easiest way is to include AppRun in the HTML file. Let's use the counter app below as an example.

```html
<html>
<head>
  <meta charset="utf-8">
  <title>Counter</title>
</head>
<body>
  <script src="https://unpkg.com/apprun@latest/dist/apprun-html.js"></script>
  <div id="my-app"></div>
  <script>
    const state = 0;
    const view = state => {
      return `<div>
        <h1>${state}</h1>
        <button onclick='app.run("-1")'>-1</button>
        <button onclick='app.run("+1")'>+1</button>
      </div>`;
    };
    const update = {
      '+1': state => state + 1,
      '-1': state => state - 1
    };
    app.start('my-app', state, view, update);
  </script>
</body>
</html>
```


## Architecture Overview

Application logic is broken down into three separated parts in the AppRun architecture.

* State (a.k.a. Model) — the state of your application
* View — a function to display the state
* Update — a collection of event handlers to update the state


### State

The _state_ can be any data structure, a number, an array, or an object that reflects the state of the application. In the _Counter_ example, it is a number.
```javascript
const state = 0;
```

### View

The _view_ generates HTML based on the state. AppRun parses the HTML string into a virtual dom. It then calculates the differences against the web page element and renders the changes.

```javascript
const view = state => `<div>
    <h1>${state}</h1>
    <button onclick='app.run("-1")'>-1</button>
    <button onclick='app.run("+1")'>+1</button>
  </div>`;
};
```

### Update

The _update_ is a collection of named event handlers, or a dictionary of event handlers. Each event handler creates a new state from the current state.
```javascript
const update = {
  '+1': state => state + 1,
  '-1': state => state - 1
}
```

When the three parts, the _state_, _view_, and _update_ are provided to AppRun to start an application, AppRun registers the event handlers defined in the _update_ and waits for AppRun events.

You can save and run the _Counter_ example above locally or use the following online editors.

* [AppRun Playground](https://apprun.js.org/#play)
* [glitch](https://glitch.com/~apprun-counter).
* [repl.it](https://repl.it/@yysun/apprun-counter)
* [jsfiddle](https://jsfiddle.net/ap1kgyeb/4)

## Dev Environment

For real-world application development, you can use the AppRun CLI to create a TypeScript and webpack configured project. You will get a productive development environment in Visual Studio Code.

```sh
npx apprun --init
```

![debug](imgs/debug.png)


Next, you will see with a set of [Dev Tools](03-dev-tools) that can help you develop.
Many development tools can help you developing AppRun applications with productivity and quality.
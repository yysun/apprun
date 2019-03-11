# Building Applications with AppRun

AppRun is a 3K library for building applications using the [elm architecture](https://guide.elm-lang.org/architecture) and the [event pubsub pattern](##event-pubsub) and [components](##component).

## AppRun Architecture

Like the elm architecture, there are three parts in the AppRun application architecture.

* Model — the data model of your application state
* View — a function to display the state as HTML
* Update — a set of functions to update the state

The 15 lines of code below is a simple counter application demonstrates the architecture using AppRun.

```javascript
const state = 0;

const view = state => `<div>
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
```

You can try the counter example online: [Simple Counter](https://jsfiddle.net/ap1kgyeb/4).

### The Model

The model can be any data structure, a number, an array, or an object that reflects the state of the application. In the counter example, it is a number.
```javascript
const state = 0;
```

### The View

The view generates HTML based on the state. AppRun parses the HTML string into virtual dom. It then calculates the differences against the web page element and renders the changes.

```javascript
const view = state => `<div>
    <h1>${state}</h1>
    <button onclick='app.run("-1")'>-1</button>
    <button onclick='app.run("+1")'>+1</button>
  </div>`;
};
```

### The Update

Update is a collection of named event handlers, or a dictionary of event handlers. Each
event handler creates a new state from the current state.
```javascript
const update = {
  '+1': state => state + 1,
  '-1': state => state - 1
}
```

AppRun registers the event handlers defined in the Update to the [event pubsub system](#event-pubsub). We can trigger these event handlers using the event name. Once we trigger the events, AppRun manages a event cycle that calls the event handlers, then calls the view function, and finally renders the web page:

```
AppRun Events => (current state) => Update => (new state) => View => (HTML/Virtual DOM) => Web Page
```

At the core, AppRun has an [event pubsub system](#event-pubsub), a [state manage system](#state-management), and a [virtual DOM rendering system](#virtual-dom).

## Event PubSub

At the core, AppRun is an event publication and subscription system, which is also known as event emitter. It is a commonly used pattern in JavaScript programming.

* Publishing an event means to raise an event for some other code to handle. Publishing an event is also referred to as firing an event or
triggering an event.
* Subscribing an event means to register an event handler function to the event. The event handler function executes when the correspondent event.

AppRun has two functions to facilitate the event pubsub pattern.

* app.on for registering event handlers (event subscription)
* app.run for firing events (event publication)

E.g., Module A subscribes to an event _print_:
```javascript
import app from 'apprun';
export () => app.on('print', e => console.log(e));
```
Module B publishes the event _print_:
```javascript
import app from 'apprun';
export () => app.run('print', {});
```
Main Module:
```javascript
import a from './A';
import b from './B';
a();
b();
```
Module A and Module B only have to know the event system, not each other, so they are only dependent on the event system. Therefore modules are decoupled. Therefore it is easier to modify, extend and swap modules.

In AppRun applications, there is no dependencies between the View and event handlers. It makes the AppRun applications easier to develop, test and maintain.


The web page programming is event-driven. Connecting web events to AppRun events, you can trigger event handlers from user input, click, navigation, etc.

E.g. call _app.run_ in HTML markup directly:
```javascript
<button id="inc" onclick="app.run('+1')">+1</button>
```
Or in JavaScript:
```javascript
document.getElementById('inc').addEventListener('click',
  () => app.run('+1'));
```
Or with JSX:
```javascript
<button onclick={()=>app.run("+1")}>+1</button>
```
Or even with jQuery:
```javascript
$('#inc').on('click', ()=>app.run('+1'));
```

While developing AppRun applications, we convert DOM events such as timer,
user input, and button click events using the web event handlers for AppRun events.
Therefore, the following steps take place:
1. AppRun dispatches the events to the event handlers in the update
along with the current application state.
2. The event handlers create a new state based on the current state.
3. AppRun passes the new state to the view function.
4. The view function creates HTML or a virtual DOM.
5. AppRun renders the HTML to the screen and calls the optional
rendered function to complete the AppRun event life cycle.

![AppRun event life cycle](https://github.com/yysun/apprun/raw/master/docs/Figure_1-1.png)

The AppRun architecture supports asynchronous operations in the AppRun event
handlers. We only need to add the async keyword in front of the event handler and call
the functions to return a Promise object with the await keyword.

```javascript
import app from 'apprun';
const get = async (url) => { };
const state = {};
const view = (state) => <div>{state}</div>;
const update = {
  '#': async (state) => {
    try {
      const data = await get('https://...');
      return { ...state, data }
    } catch (err) {
    return { ...state, err }
    }
   }
};
app.start('my-app', state, view, update);
```

## State Management

During the event cycle, AppRun manages application states. It passes current state into the event handlers. It takes the new state from the event handlers and passes into the view function. Therefore it can maintain the history of all states, which enables the time travel / undo-redo feature.

In leverage the time travel / undo-redo feature, the event handlers must make sure current state immutable and always create a new state.

See the multiple counter example that has undo-redo online: [Multiple counters](https://jsfiddle.net/ap1kgyeb/6)


## Virtual DOM

AppRun uses virtual DOM technology. The virtual DOM (VDOM) is the data
representing a DOM structure. AppRun compares the VDOM with the real DOM and updates only the changed elements and element properties.

In the simple counter example above, the View creates HTML string out of the state. AppRun parses the HTML string into VDOM. Although HTML string is easy to understand and useful for trying out ideas, it takes time to parse it into virtual dom at run time, which may cause performance issue.
It also has some problems that have been documented by the Facebook React team:
[Why not template literals](http://facebook.github.io/jsx/#why-not-template-literals).

We recommend to use JSX. The JSX compiler compiles the JSX into functions at compile time. The View function creates virtual dom in runtime directly without parsing HTML, which gives
better performance. To compile the JSX, we also recommend using TypeScript and webpack. See CLI section below.


## Component

A component is a technique to decompose the large system into smaller, manageable,
and reusable pieces. Usually, a component is an autonomous and reusable module
that encapsulates a set of data and functions. A component is the basic building block
in other popular frameworks and libraries such as Angular, React, and Vue. Elm does
not have components. Elm has the concern that the relationship and communication
between components might prevent or cause difficulties to ensure that everything is done in
the functional programming style.

AppRun solves the component relationship and communication problem by
using event pubsub. AppRun components are decoupled and isolated modules. Elm’s
concern is not an issue in AppRun. In AppRun applications, the component is a mini-application
and has a component-scoped AppRun architecture, which includes the
three architecture parts discussed previously: state, view, and update. Components
communicate with each other through the events.

### Create and Mount Components
A component in AppRun is a mini elm architecture, which means inside a component, there are model, view, and update. Because components are classes, it is straightforward to use them in code. We first create an object of the component.

```javascript
import app, {Component} from 'apprun';

export default class extends Component {
  state = '';
  view = state => <div/>;
  update = {};
}
```

Then we mount the component instance to an element.

```javascript
import Counter from './Counter';
const element = document.getElementById('my-app');
new Counter().mount(element);
```

The component is mounted to the web page element or element ID. When the
component is mounted to an element ID, it retrieves the element by using the document.
getElementID function at the time it needs to render the element. It will not render the
element if it cannot find it. The lazy components are useful for single-page applications
(SPAs), where we can mount multiple components to a single element. The components
are hidden until the events that wake them up and display them.

### Components in JSX

A useful convention in JSX is that when the JSX tag name is capitalized, it creates components. We can use the capitalized JSX tag to create AppRun Components in JSX.

```javascript
class Child extends Component {
  state = {}
  view = state => <div></div>
  update = {}
}

class Parent extends Component {
  state = {}
  view = state => <div>
    <Child />
  </div>
  update = {}
}

```

### Pure Function Component

We can also use the capitalized JSX tag to call JavaScript functions with capitalized the function names. The functions are also known as the Pure Function Component.

```javascript
const Counter = ({num, idx}) => (
  <div>
    <h1>{num}</h1>
    <button onclick={() => app.run("-1", idx)}>-1</button>
    <button onclick={() => app.run("+1", idx)}>+1</button>
    <button onclick={() => app.run("remove-counter", idx)}>x</button>
  </div>
);

const CounterList = ({counters}) => counters.map((num, idx) =>
  <Counter num={num} idx={idx} />
);

const view = state => {
  return (
  <div>
    <div>
      <button onclick={() => app.run("add-counter")}>add counter</button>
      <button onclick={() => app.run("remove-counter", state.length-1)} disabled={state.length <= 0}>remove counter</button>
    </div>
    <br/>
    <CounterList counters={state} />
  </div>);
};
```


### Event Handler Decorator

AppRun has included two decorators to create the event handlers in the component. _@event_ and _@on_. _@event_ is for class functions. _@on_ is for class properties.

```javascript
    class TestComponent extends Component {
      view = state => state

      // function decorator
      @event('hi, #hi')
      f2(state, val) {
        return val;
      }

      // property decorator
      @on('hi2, #hi2')
      f2 = (state, val) => val
    }
```

## Routing

Because we can connect the DOM events to AppRun Event, handling routing becomes much easier. AppRun detects the hash changes in URL (by listening to the window's onpopstate event) and triggers the AppRun events with matching the hash. E.g., when URL in the browser address bar becomes http://..../#Counter, it triggers the #Counter event.

Using the events, each component defines its route events. It can avoid much code for registering and matching routes like in the other frameworks and libraries.

### Unhandled Routes

When the router triggers an AppRun event with no listener for the route, the router will automatically generate a ROUTER_404_EVENT AppRun event giving the application a chance to degrade gracefully by, perhaps, displaying a 404 page. To bind to this event here are a few examples of things you can do:

```
import app, { Component, ROUTER_404_EVENT } from 'apprun';

// Generate an error message when there's no handler for a URL.
app.on(ROUTER_404_EVENT, (url, ..._rest) => console.error('No event handler for', url));

// Alternatively create a component that will display a message.
class NoRouteComponent extends Component {
  state = {};

  view = (state) => {
    return <><h1>PAGE NOT FOUND! WE SUCK!</h1></>
  }

  // Handle the "no route found" events with this component
  update = {
    [ROUTER_404_EVENT]: state => state
  }
}

new NoRouteComponent().mount( on some element );
```

### Pretty Links

If you would prefer to use pretty links (i.e. non hash links) and have HTML5 browser history, then you can implement a new router yourself or use the pretty router from the [apprun-router](https://github.com/phBalance/apprun-router) package. This router also handles unknown routes via the ROUTER_404_EVENT and has a few other goodies to make life easier.

### Replacing AppRun's default router

Replacing AppRun's default router couldn't be easier. Just overwrite app.route and you're off to the races. You'll also want to bind to the popstate events and trigger the first URL event (via the DOMContentLoaded event handler in the code example below):

```
// A simplistic but not great router.
function newRouter(url: string) {
  app.run(url);
  app.run(ROUTER_EVENT, url);
}

// Kick off the first URL event when the DOM is loaded.
document.addEventListener("DOMContentLoaded", () => {
  window.onpopstate = app["route"](location.pathname, true);
  newRouter(location.pathname);
});

app["route"] = newRouter;

```

## CLI

AppRun includes a cli. To install AppRun CLI:

```
npm install apprun -g
```

AppRun CLI can:

* Initialize a TypeScript and webpack configured project
* Initialize git repository
* Add Jest unit test
* Generate component
* Generate SPA application

Let's initialize a SPA project.

```
apprun -i --spa
```

The apprun -i command installs apprun, webpack, webpack-dev-server and typescript. It also generates files: tsconfig.json, webpack.config.js, index.html and main.tsx.

The apprun --spa command generates files: index.html, main.tsx and three components: Home, About and Contact.

After the command finishes execution, you can start the application and then navigate to https://localhost:8080 in a browser.

```
npm start
```

## Performance

AppRun itself is lightweight. It is about 3K gzipped. More important is that applications built with AppRun have less line of code, smaller js file, and better performance.
See a comparison from [A Real-World Comparison of Front-End Frameworks with Benchmarks](https://medium.freecodecamp.org/a-real-world-comparison-of-front-end-frameworks-with-benchmarks-e1cb62fd526c).

AppRun has also joined the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) project. You can see its [performance results](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html) compared to other frameworks and libraries.

## Book About AppRun

For more details, please refer to the AppRun book published by Apress.

[![Order from Amazon](https://camo.githubusercontent.com/99fad1f024c274a3d752a1583cf125037583811c/68747470733a2f2f696d616765732e737072696e6765722e636f6d2f7367772f626f6f6b732f6d656469756d2f393738313438343234303638372e6a7067)](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)

[Order from Amazon](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)


AppRun makes your applications clean, precious, declarative and has no ceremony.
Please give it a try and send pull requests.

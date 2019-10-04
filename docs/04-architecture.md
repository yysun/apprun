# Architecture


Application logic is broken down into three separated parts in the AppRun architecture.

* State (a.k.a. Model) — the state of your application
* View — a function to display the state
* Update — a collection of event handlers to update the state

```javascript
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
```
## Overview

### State

The _state_ can be any data structure, a number, an array, or an object that reflects the state of the application. In the counter example, it is a number.
```javascript
const state = 0;
```

### View

The _view_ generates HTML based on the state. AppRun parses the HTML string into virtual dom. It then calculates the differences against the web page element and renders the changes.

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

## AppRun Event Life Cycle

When an AppRun event is published, the following steps take place:

1. AppRun dispatches the events to the event handlers defined in the _update_
along with the _current state_.
2. The event handlers create _a new state_ based on the _current state_.
3. AppRun passes the _new state_ to the _view_ function.
4. The _view_ function creates HTML or a Virtual DOM.
5. AppRun renders the HTML/Virtual DOM to the screen
6. AppRun calls the optional _rendered_ function to complete the AppRun event life cycle.

![AppRun event life cycle](imgs/Figure_1-1.png)

Web programming is event-driven. All we have to do is to convert DOM events to AppRun events to trigger the AppRun event life cycle.

```
DOM events => AppRun Events => (current state) => Update => (new state) => View => (HTML/Virtual DOM) => Web Page
```


## Event Pub-Sub

Event publication and subscription, also known as event emitter, is a commonly used pattern in JavaScript programming.

* Publishing an event means to raise an event for some other code to handle. Publishing an event is also referred to as firing an event or
triggering an event.
* Subscribing an event means to register an event handler function to the event. The event handler function executes when the correspondent event.

AppRun has two functions to facilitate event publication and subscription.

* app.on for registering event handlers (event subscription)
* app.run for firing events (event publication)


In AppRun applications, there are no dependencies between the View and event handlers. It makes the AppRun applications easier to develop, test and maintain.


## Asynchronous Event

AppRun also supports asynchronous operations in the AppRun event
handlers. We only need to add the _async_ keyword in front of the event handler and call the functions that return a _Promise_ object with the _await_ keyword.

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

Events are not only used for handling user interactions. They are used for everything in AppRun.

* [Routing](07-routing) is through event.
* [Directive](08-directive) is through event.

Events can be strongly typed. If you are interested, please read this post: [Strong Typing in AppRun](https://medium.com/@yiyisun/strong-typing-in-apprun-78520be329c1).

![typed events](https://cdn-images-1.medium.com/max/1600/1*Z1y_-n7_Y1bzDUJuw0ORVw.png)

We have covered the two core AppRun concepts our of three, Elm inspired architecture and events.

Next, you will see the 3rd AppRun concept: [component](04-component).
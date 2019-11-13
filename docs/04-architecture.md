# Architecture

## Event Pub-Sub

Event publication and subscription, also known as event emitter, is a commonly used pattern in JavaScript programming.

* Publishing an event means to raise an event for some other code to handle. Publishing an event is also referred to as firing an event or
triggering an event.
* Subscribing an event means to register an event handler function to the event. The event handler function executes when the correspondent event.

At the core, AppRun is an event pub-sub system.

## Event Life Cycle

When an AppRun event is published, the following steps take place:

1. AppRun dispatches the events to the event handlers defined in the _update_ along with the _current state_.
2. The event handlers create _a new state_ based on the _current state_.
3. AppRun passes the _new state_ to the _view_ function.
4. The _view_ function creates HTML or a Virtual DOM.
5. AppRun renders the HTML/Virtual DOM to the screen
6. AppRun calls the optional _rendered_ function to complete the AppRun event life cycle.

![AppRun event life cycle](imgs/Figure_1-1.png)


AppRun Event Life Cycle connects the _state_, _view_, and _update (event handlers)_ together. Take a look at the _Counter_ example again.

```javascript
import app from 'apprun';
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

When one of the buttons is clicked, it publishes AppRun event +1 or -1. The event handlers increase or decreases the state and return a new state. The view function creates the virtual DOM using the new state. Finally, AppRun renders the virtual DOM.

## State Management

The State is the application state at any given time of your applications. The State is the data flow between Update and View. It acts as the data transfer object (DTO) in traditional multilayered application architecture, where the DTO is an object that carries data between logical and physical layers.

The benefits using events and DTO like the state is that there are no dependencies between the _view_ and _update (event handlers)_. It makes the AppRun applications easier to develop, test, and maintain. You can get more information about [unit testing](11-unit-testing) later.


## State History

The state can be stored in state history by AppRun. Once the state history is enabled, we can travel through the history back and forth to get the previous and next state. See the [Counter example](https://apprun.js.org/#counters) and [Todo - undo-redo example](https://apprun.js.org/#todo).


## Asynchronous Events

In the service/API oriented applications, the state is created by changed by the asynchronous operations. e.g., getting remote data from the server.

It is easy to handle asynchronous operations in the AppRun event handlers. We only need to add the _async_ keyword in front of the event handler and call the functions that return a _Promise_ object with the _await_ keyword.

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

## Use Events for Everything

Web programming is event-driven. All we have to do is to convert DOM events to AppRun events to trigger the AppRun event life cycle.

```
DOM events => AppRun Events => (current state) => Update => (new state) => View => (HTML/Virtual DOM) => Render Web Page
```

Events are not only used for handling user interactions. They are used for everything in AppRun.

* [Routing](07-routing) is through event.
* [Directive](07a-directive) is through event.

## Event Types

Events can be strongly typed using TypeScript Discriminated Unions. If you are interested, please read this post: [Strong Typing in AppRun](https://medium.com/@yiyisun/strong-typing-in-apprun-78520be329c1).

![typed events](https://cdn-images-1.medium.com/max/1600/1*Z1y_-n7_Y1bzDUJuw0ORVw.png)

## Event Scope

So far, the AppRun events we see are global events, which means that the events are published and handled globally by all modules. Sometime, you may want to limit the events to a certain scope. You then can use [components](04-component).
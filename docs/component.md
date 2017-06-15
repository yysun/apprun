# Component

AppRun event system can tie pieces from model-view-update architecture together.
Given  _model_, _view_ and _update_. AppRun converts each item in the _update_ object to something like:

```
 // initial state
current_state = model;

// create event handler
app.on('#test', (...args) => {

  // creates new state
  const new_state = update['#test](current_state, ...args);

  // creates virtual dom
  const virtual_dom = view(new_state);

  // update element with virtual dom
  render(element, virtual_dom);

  // save new state into history stack
  save_state(new_state);
  current_state = new_state;
}
```

## State Management

A state manage function was added as the last two steps in the above process. It manages
a state history in stack. Application can retrieve any saved state and render it to
the page, if the application creates immutable state each time it updates.

Try it online: [Multiple counters](https://jsfiddle.net/ap1kgyeb/3/)


## Component

Component is a localized event system and state management system.
```
import { Component } from 'apprun';

export class MyComponent extends Component {

  save(state) {
  }

  update = {
    '#my': state => state,
    'save': state => this.save(state);
  }
}
```

The local events are limited within components. When applications have many components,
or have many instances of one component class, their events will not conflict.

Component can publish and subscribe to global events using an convention that
is to name the event like #event or /event. The event #my in the example above is a global event.

Next, you will see how AppRun updates web page element using [virtual dom](jsx-html.md).
# Component

The default AppRun instance app is a global event system. _app.run_ and _app.on_ publish and
subscribe events globally. _app.start_ creates model-view-update application globally.

## Component Event

Component on the other hand is a localized event system and model-view-update structure.
The events in components are limited within components. When applications have many components,
or have many instances of one component class, their events will not conflict.

```
import app, { Component } from 'apprun';

const Hello = ({ name }) => <div>Hello: {name}</div>;

export class HelloComponent extends Component {
  state = 'world';

  view = (val) => {
    return <div>
      <Hello name={val} />
      <input value={val} oninput={ (e)=> this.run('render', e.target.value)} />
      <input value={val} oninput={ (e)=> app.run('render', e.target.value)} />
    </div>
  };

  update = {
    '#hello': (val) => val,
    'render': (_, val) => val;
  }
}
```

In the example above, _this.run_ fires a local event. _app.run_ fires a global event.

## Routing Event

AppRun router translates location hash changes to routing events. Routing events are globally.
In order to be able to subscribe such global events, the convention is to treat events start 
with # or / as public events.

The event #hello in the example above is a global routing event. 
When web browser URL is set to http://..../#hello, the above component will be activated.

There is no other mechanism needed to handle routing. Components in an application will react 
to the routing event defined by it self. 

Next, you will see how AppRun updates web page element using [virtual dom](jsx-html.md).

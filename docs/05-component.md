# Component

An AppRun component is a mini-application that has the elm architecture, which means inside a component, there are _state_, _view_, and _update_. Components provide a local scope.

The component is a technique to decompose the large system into smaller, manageable, and reusable pieces. The component is the basic building block. Usually, a component is an autonomous and reusable module that encapsulates a set of data and functions.

## Create Your First Component

It is straightforward to create a component. You create a component class around the _state_, _view_, and _update_.

### Component Class

The component class is a subclass of AppRun Component class.

```javascript
import {app, Component} from 'apprun';
class Counter extends Component {
  state = '';
  view = state => <div/>;
  update = {};
}
```

The counter component uses the _class fields_ to define the _state_, _view_, and _update_. Thanks to the TypeScript, _class fields_ are compiled into the code that browsers can run. Also, TypeScript compiles the JSX in the _view_ function.

### Render the Component

To use the components, you can render it to an element.

```javascript
const element = document.getElementById('my-app');
app.render(element, <Counter />);
```
When rendering the component, AppRun creates a component instance and render it to the element.

### Mount and Start

Or you can create the component using the constructor and mount the component instance to an element or to an _element ID_. When the component is mounted to an _element ID_, It will render the element only when it exists.


```javascript
const element = document.getElementById('my-app');
new Counter().mount(element);
```

You can also pass the initial state in to the component's constructor directly:

```javascript
new Counter(100).mount(element);
```


When the component is mounted, by default it won't display until the events come. It is useful in the single page application (SPA) scenario where you can mount all components at once. Each component is activated by the routing events.

If you need the component to display the initial state, you can use the _start_ function.

```javascript
new Counter().start(document.body); // mount and display
```

You can render, mount, or start the component to _document.body_.

```javascript
//
app.render(document.body, <Counter />);
//
new Counter().mount(document.body);
//
new Counter().start(document.body);
```

## Child Component

Components can have child components.

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

But, you are not forced into the nested component structure. Sometimes, mounting components are more flexible. Please read this post, [Redux vs. The React Context API vs. AppRun](https://medium.com/@yiyisun/redux-vs-the-react-context-api-vs-apprun-f324bee8cbbf).


## Component Events

Component provides a local scope for events. The _update_ registers the local events in the component. The _this.run_ function fires local events that can only be picked up inside the component.

> You can prefix the event name with #, / or @ to make it global.

```javascript
class Counter extends Component {
   update = {
      '+1': state=>state+1, // local event
      '#+1': state=>state+1, // global event
   }
}
```

The _app.run_ fires the global events that can be picked up by all components.

In addition to use the _update_ for defining event handlers, you can also use the @on decoratot or the $on directive.

### Event Handler Decorator

In the component class we can use the TypeScript to compile the @on decorators to create the event handlers without using the _update_ object.

```javascript
import app, { Component, on } from 'apprun';
class Counter extends Component {
  state = 0;
  view = state => <>
    <h1>{state}</h1>
    <button onclick={()=>this.run('-1')}>-1</button>
    <button onclick={()=>this.run('+1')}>+1</button>
  </>;

  @on('-1')
  decrease = state => state - 1;

  @on('+1')
  increase = state => state + 1;
}
```

### Event Directive

We can also use the [directive](07a-directive) to simplify the event handling.

```javascript
import {app, Component} from 'apprun';
class Counter extends Component {
  state = 0;
  view = state => <div>
    <h1>{state}</h1>
    <button $onclick={state=>state-1}>-1</button>
    <button $onclick={state=>state+1}>+1</button>
  </div>;
}
```


## Life Cycle Functions

Life Cycle Functions are call back functions that AppRun calls during the component life cycle. They are _mounted_, _rendered_, and _unload_.

```javascript
import { app, Component } from 'apprun';

class MyApp extends Component {
  state = {};
  view = state => <div></div>;
  update = {};

  //life cycle functions
  mounted = (props, children, state) => state;
  rendered = state => {};
  unload = state => {};
}

app.render(document.body, <MyApp />);
```

### mounted

The _mounted_ function is called after the component instance is mounted to a DOM element. The _mounted_ function can be used to set the initialize the state.
```javascript
mounted: (props: any, children: any[], state: T) => T | void;

```
> Note: the _mounted_ function is only called in the child component.

```javascript
class Child extends Component {
  state = {} // you can define the initial state
  view = state => <div></div>
  update = {}
  mounted = (props, children) => { ...state, ...props } // this will be called, you can merge props into the state
}

class Parent extends Component {
  state = {} // you can define the initial state
  view = state => <div>
    <Child />
  </div>
  update = {}
  mounted = () => { } // this will NOT be called when component is created using the constructor
}
new Parent().start(document.body);
```

### rendered

The _rendered_ function is called after AppRun renders the result of the _view_ function. The _rendered_ function can be used to modify the DOM element using 3rd party libraries.
```javascript
rendered: (state: T, props?: any[]) => void;
```

### unload

The _unload function is called when the DOM element that component is mounted to is removed or reused by other components. The _unload function can be used to clean by the resources created by the 3rd party libraries.

```javascript
unload: (state: T) => void;
```

You can see, the component life cycle functions are useful for integrating [3rd party libraries](08-3rd-party-libs).

## Web Components

Using **apprun@es6**, you can convert AppRun components into [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). AppRun components become the custom elements that also can handle AppRun events ([Online Demo](https://apprun.js.org/#play/7)).

```html
<html>
<head>
  <meta charset="utf-8">
  <title>Counter as web component</title>
</head>
<body>
  <my-app id='counter'></my-app>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/custom-elements/1.1.2/custom-elements.min.js"></script>
  <script src="https://unpkg.com/apprun@es6/dist/apprun-html.js"></script>
  <script>
    class Counter extends Component {
      constructor() {
        super();
        this.state = 0;
        this.view = state => `<div>
          <h1>${state}</h1>
          <button onclick='counter.run("-1")'>-1</button>
          <button onclick='counter.run("+1")'>+1</button>
          </div>`;
        this.update = {
          '+1': state => state + 1,
          '-1': state => state - 1
        };
      }
    }
    app.webComponent('my-app', Counter);
  </script>
</body>
</html>
```

We have started to mention JSX. Next, you will learn about the [view patterns](06-view-patterns) of using JSX to create a rich user interface.



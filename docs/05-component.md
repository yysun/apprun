# Component

In addition to building applications using the global _state_, _view_ function, and _update_ object, AppRun lets you build applications using components.

The component is a technique to decompose the large system into smaller, manageable, and reusable pieces. The component is the basic building block. Usually, a component is an autonomous and reusable module that encapsulates a set of data and functions.

An AppRun component is a mini-application that has the elm architecture, which means inside a component, there are _state_, _view_, and _update_. Basically, components provide a local scope.

## Create Your First Component

It is straightforward to create a component. You create a component class around the _state_, _view_, and _update_.

```javascript
import {app, Component} from 'apprun';

class Counter extends Component {
  state = '';
  view = state => <div/>;
  update = {};
}
```

## Mount Component to Element

Then you mount the component instance to an element.

```javascript
const element = document.getElementById('my-app');
new Counter().mount(element);
```

The component can be mounted to the web page element or element ID. When the component is mounted to an _element ID_, It will not render the element if it cannot find it.

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

## Child Component

Components can have child components. A useful convention in JSX is that when the JSX tag name is capitalized, it creates components. We can use the capitalized JSX tag to create AppRun Components in JSX.


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

We have started to mention JSX. Next, you will learn about the [view patterns](06-view-patterns) of using JSX to create the rich user interface.

BTW, if you want to know more about the differences between AppRun and React/Redux and React Context API, please read this post, [Redux vs. The React Context API vs. AppRun](https://medium.com/@yiyisun/redux-vs-the-react-context-api-vs-apprun-f324bee8cbbf).


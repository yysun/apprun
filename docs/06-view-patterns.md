# View Patterns

AppRun uses virtual DOM technology (VDOM). The VDOM is the data representing a DOM structure. AppRun compares the VDOM with the real DOM and updates only the changed elements and element properties. It provides high performance.

AppRun allows you to choose your favorite technology to create user interfaces.

* HTML string
* JSX
* Other technology, e.g., [lit-html](https://github.com/Polymer/lit-html)

## HTML String

In the simple counter app example above, the _view_ function creates HTML string.

```javascript
const view = state => `<div>
  <h1>${state}</h1>
  <button onclick="app.run('-1')">-1</button>
  <button onclick="app.run('+1')">+1</button>
</div>`;
```

Although HTML string is easy to understand and useful for trying out ideas, it takes time to parse it into VDOM at run time, which may cause performance issue.
It also has some problems that have been documented by the Facebook React team:
[Why not template literals](http://facebook.github.io/jsx/#why-not-template-literals).

We recommend using JSX. The JSX compiler compiles the JSX into VDOM functions at compile time, which has better performance.

```javascript
const view = state => <div>
  <h1>{state}</h1>
  <button $onclick='-1'>-1</button>
  <button $onclick='+1'>+1</button>
</div>;
```

## JSX

JSX is a syntax sugar of function calls. You can compose the functions and apply dynamic and conditional rendering without no run-time cost of parsing the HTML string. Below is a list of view patterns of JSX

### JSX fragments

JSX Fragments let you group a list of children without adding extra root node. E.g., you can use <></> for declaring fragments. E.g.,

```javascript
const view = <>
  <h1>title 1</h1>
  <h2>title 2</h2>
</>
```

### Function Calls

We can also use the capitalized JSX tag to call JavaScript functions with capitalized the function names. The functions are also known as the Pure Function Component.

E.g., To render the to-do item list, You can call the Todo function in an array.map function.

```javaScript
const Todo = ({ todo, idx }) => <li>{todo.title}</li>;
const view = state => <ul className="todo-list"> {
  state.list.map((todo, idx) => <Todo todo={todo} idx={idx} />)
}</ul>
```

### De-structuring Properties
The call to the Todo function passes two properties todo and idx. In the Todo function, you can retrieve the two properties by de-structuring the parameters.

```javascript
const Todo = ({ todo, idx }) => <li>{todo.title}</li>;
```

### Set Class

Each to-do item should have class “view” represents that active or complete for complete status of the to-do item. You can user the ternary operator to toggle between two classes.

```javascript
const Todo = ({ todo, idx }) => <li class={todo.done ? "completed" : "view"}>
```

Please note that AppRun supports using the keyword _**class**_ in JSX.

### Toggle Class

Sometimes, you need to toggle classes based on the state. You can also use the ternary operator to toggle the class. E.g., toggle the _selected_ class to an menu item.

```javascript
<li><a className={state.filter === 'All' ? 'selected' : ''} >All</a></li>
```

### Show and Hide Element

To show or hide an element dynamically, you can also use the ternary operator

```javascript
const countComplete = state.list.filter(todo => todo.done).length || 0;
{ countComplete > 0 ? <button>Clear completed</button> : ''}
```

The view patterns above are the commonly used in AppRun applications. You can use as a reference for developing your own applications.

## Event Handler Decorator

AppRun has included two decorators to create the event handlers in the component without using the _update_ object. _@event_ and _@on_. _@event_ is for class functions. _@on_ is for class properties.

```javascript
import app, { Component, on, event } from 'apprun';
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

## Directives

AppRun directives are syntax sugars that help simplify the code. They are custom attributes in JSX that have names starting with $. AppRun two out of the box directives: $on and $bind.

### $on

The $on directive simplifies the code to convert the DOM events to AppRun events.
You can see the $on example from the [AppRun playground](https://apprun.js.org/#play/1).

### $bind

The $bind directive synchronize the HTML input value to the _state_.
You can see the $bind example from the [AppRun playground](https://apprun.js.org/#play/0).

### Custom directive

When AppRun is processing the JSX code, it publishes the $ event when it finds the custom attributes named like $X. You can simply subscribe to the $ event to provide your own directives. E.g., if you create the $animation directive to attach the animation classes from the animation library, [animation.css](https://daneden.github.io/animate.css).

```javascript
app.on('$', ({key, props}) => {
  if (key === '$animation') {
    const value = props[key];
    if (typeof value === 'string') {
      props.class = \`animated \${value}\`;
    }
  }
});
```
You can see the $animation example from the [AppRun playground](https://apprun.js.org/#play/9).


## lit-html

[lit-html](https://github.com/Polymer/lit-html) lets you write HTML templates in JavaScript with template literals.

lit-html templates are plain JavaScript. lit-html takes care of rendering templates to DOM, including efficiently updating the DOM with new values.

Below is the complete code of using lit-html in browser.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Hello!</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
  <script type="module">
    import { html, render } from 'https://unpkg.com/lit-html?module';
    import { app } from 'https://unpkg.com/apprun@es6?module';
    app.render = (element, html) => render(html, element);
    const state = 0;
    const view = state => html`<div>
      <h1>${state}</h1>
      <button @click=${()=>app.run("-1")}>-1</button>
      <button @click=${()=>app.run("+1")}>+1</button>
    </div>`;
    const update = {
      '+1': state => state + 1,
      '-1': state => state - 1
    };
    app.start(document.body, state, view, update);
  </script>
  </body>
</html>
```

You can see how easy it is to use other VDOM implementation you like in AppRun. You only need to overwrite the _app.render_ function with other libraries.

Once you have developed components, next you will need to learn how to handle users' navigation and activate the components, which in formal term is [routing](07-routing).


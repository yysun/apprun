# View Patterns

AppRun allows you to choose your favorite technology to create user interfaces in the _view_ function.

* JSX
* [lit-html](https://github.com/Polymer/lit-html)
* HTML string

We recommend using JSX. Some advanced features apply to JSX only.

## JSX

JSX is a syntax sugar of function calls. You can compose the functions and apply dynamic and conditional rendering without the run-time cost of parsing the HTML string.

>AppRun uses virtual DOM technology (VDOM). The VDOM is the data representing a DOM structure. AppRun compares the VDOM with the real DOM and updates only the changed elements and element properties. It provides high performance.

You can use the JSX view patterns, and features describe below.

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

E.g., To render the todo item list, You can call the Todo function in an array.map function.

```javaScript
const Todo = ({ todo, idx }) => <li>{todo.title}</li>;
const view = state => <ul class="todo-list"> {
  state.list.map((todo, idx) => <Todo todo={todo} idx={idx} />)
}</ul>
```

### De-structuring Properties
The call to the Todo function passes two properties todo and idx. In the Todo function, you can retrieve the two properties by de-structuring the parameters.

```javascript
const Todo = ({ todo, idx }) => <li>{todo.title}</li>;
```

### Set Class

Each todo item should have class “view” represents that active or complete for a complete status of the todo item. You can use the ternary operator to toggle between two classes.

```javascript
const Todo = ({ todo, idx }) => <li class={todo.done ? "completed" : "view"}>
```

Please note that AppRun supports using the keyword _**class**_ in JSX.

### Toggle Class

Sometimes, you need to toggle classes based on the state. You can also use the ternary operator to toggle the class. E.g., toggle the _selected_ class to a menu item.

```javascript
<li><a class={state.filter === 'All' ? 'selected' : ''} >All</a></li>
```

### Show and Hide Element

To show or hide an element dynamically, you can use the _&&_ operator.

```javascript
const countComplete = state.list.filter(todo => todo.done).length || 0;
{ countComplete && <button>Clear completed</button>}
```

### _ref_

[_ref_](https://apprun.js.org/#play/12) is a special JSX property, which is a callback function that is called after the _view_ function is executed.

```javascript
const view = <div ref={el=>{...}}></div>
```

We can use _ref_ function to update the HTML element, e.g., [set focus to an input box](https://apprun.js.org/#play/12).

_ref_ is a better method to update the element than using the _rendered_ lifecycle function.

>Please think of using _ref_ function, before you use the _rendered_ function.


### Element embedding

Furthermore, AppRun allows [embedding elements directly into JSX](https://apprun.js.org/#play/14).

```javascript
view = state => {
  const canvas = document.createElement('canvas');
  return <div>{canvas}</div>
};
```

A few use cases of the _Element embedding_ are:

* Create special element, e.g. [element has shadow root](https://apprun.js.org/#play/16)
* Create elements using 3rd libraries.
* Create and cache the element to avoid recreation in every event lifecycle

Just create the HTML element and add it to the AppRun _view_.

>Please think of embedding the element before you use the _ref_ function.

### Directive

The directive is the special property that looks like $xxx. When AppRun is processing the JSX code and finds the properties of $xxx, it publishes the $ event. The event parameters contain the directive key, properties, and tag Name of the HTML element, and component instance.

```javascript
const view = <div $myDirective></div>;
app.on('$', ({key, props, tag, component}) => {
  if (key === '$myDirective') {
  }
}
```

We can subscribe to the $ event and create _custom directives_ to modify the properties of the HTML element, e.g., [adding or removing classes](https://apprun.js.org/#play/11).


## lit-html

[lit-html](https://github.com/Polymer/lit-html) lets you write HTML templates in JavaScript with template literals.

lit-HTML templates are plain JavaScript. lit-html takes care of rendering templates to DOM, including efficiently updating the DOM with new values.

Below is the Counter code of [using lit-html in the browser](https://apprun-lit-html.glitch.me).

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
    import { app, Component, html } from 'https://unpkg.com/apprun@next/esm/apprun-html?module';
      class Counter extends Component {
        state = 0;
        view = (state) => html`<div>
        <h1>${state}</h1>
          <button @click=${()=>this.run("add", -1)}>-1</button>
          <button @click=${()=>this.run("add", +1)}>+1</button>
        </div>`;
        update =[
          ['add', (state, n) => state + n]
        ]
      }
      new Counter().start(document.body);
  </script>
  </body>
</html>
```


## HTML String


Although HTML string is easy to understand and useful for trying out ideas, it takes time to parse it into VDOM at run time, which may cause performance issues.
It also has some problems that have been documented by the Facebook React team: [Why not template literals](http://facebook.github.io/jsx/#why-not-template-literals).

AppRun supports creating the HTML string from the _view_ function. Sometimes it may be easy for quick prototyping.

```javascript
const view = state => `<div>
  <h1>${state}</h1>
  <button onclick="app.run('-1')">-1</button>
  <button onclick="app.run('+1')">+1</button>
</div>`;
```



Next, you will need to learn how to handle users' navigation and activate the components, which is also known as [routing](07-routing).


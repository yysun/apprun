# HTML vs JSX

## HTML View

You can write the view function to generate HTML string. AppRun parses the HTML string into virtual dom. It then calculates the differences against the web page elements and renders the changes.

```
const view = (model) => `<div>${model}</div>`;
```
ES2015 string interpolation made it easy to construct HTML string to form a list.
```
const view = (numbers) => {
  return numbers.reduce(prev, curr) {
    prev + `<li>${curr}</li>`;
  }, '');
}
```

HTML View is easy to understand and useful for trying out ideas. 
But it has some problems that have been documented by the Facebook React team:
[Why not template literals](http://facebook.github.io/jsx/#why-not-template-literals)

Using JSX in production is recommended. 

## JSX View

AppRun supports JSX / TSX (for TypeScript).

```
const Todo = ({todo, idx}) => <li>
  {todo.value}
</li>

const view = (model) => <div>
  <h1>Todo</h1>
  <ul> {
    model.todos.map((todo, idx) => <Todo todo={todo} idx={idx} />)
  }
  </ul>
</div>

```

AppRun also supports [HyperScript](https://github.com/dominictarr/hyperscript).
If you are a hyperscript fan, you will like this option.

```
const h = app.h;
const view = (val) => {
  return h('div', {},
    h('div', {}, val),
    h('input', {
      value: val,
      oninput: function() { app.run('render', this.value)}
    }, null)
  );
};
```

Using JSX requires a [build tool](build.md). AppRun includes a cli to initialize a TypeScript and webpack configured project.

```
npm install apprun
apprun-init
npm start
```

It generates files: package.json, tsconfig.json, webpack.config.js, index.html and main.tsx.

Note: on Mac, you might need to run local npm command like:

```
$(npm bin)/apprun-init
```
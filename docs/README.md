# Building Applications with AppRun

AppRun is a lightweight library for developing applications using the [elm](http://elm-lang.org/) style
[model-view-update](https://guide.elm-lang.org/architecture/) architecture.

## Architecture

According to the model-view-update  architecture, there are three separated parts in an application.

* Model — the data model of your application state
* Update — a set of functions to update the state
* View — a function to display the state as HTML

The 15 lines of code below is a simple counter application demonstrates the architecture using AppRun.

```
const model = 0;

const view = (model) => {
  return `<div>
    <h1>${model}</h1>
    <button onclick='app.run("-1")'>-1</button>
    <button onclick='app.run("+1")'>+1</button>
  </div>`;
};

const update = {
  '+1': (model) => model + 1,
  '-1': (model) => model - 1
};

const element = document.getElementById('my-app');
app.start(element, model, view, update);
```

### The Model

The model can be any data structure, a number, an array, or an object that reflects the state of the application. In the counter example, it is a number.
```
const model = 0;
```

### The Update

The update contains functions that take existing state and create new state.
```
const update = {
  '+1': (model) => model + 1,
  '-1': (model) => model - 1
}
```

### The View

The view generates HTML based on the state. AppRun parses the HTML string into virtual dom. It then calculates the differences against the web page element and renders the changes.

```
const view = (model) => {
  return `<div>
    <h1>${model}</h1>
    <button onclick='app.run("-1")'>-1</button>
    <button onclick='app.run("+1")'>+1</button>
  </div>`;
};
```

### Trigger the Update

AppRun exposes a global object named _app_ that is accessible globally to trigger the Update by calling _app.run_ function.
```
app.run('+1');
```
The web page programming is event driven. Connecting web events to AppRun events, you can trigger update functions from user input, click, navigation and etc.

E.g. call _app.run_ in HTML markup directly:
```
<button id="inc" onclick="app.run('+1')">+1</button>
```
Or in JavaScript:
```
document.getElementById('inc').addEventListener('click',
  () => app.run('+1'));
```
Or with JSX:
```
<button onclick={()=>app.run("+1")}>+1</button>
```
Or even with jQuery:
```
$('#inc').on('click', ()=>app.run('+1'));
```

Finally, _app.start_ function from AppRun ties Model, View and Update together to an element and starts the application.
```
const element = document.getElementById('my-app');
app.start(element, model, view, update);
```

To summarize above, the two functions from AppRun (_app.run_ and _app.start_) are all you need to make an application of model-view-update architecture.

Try the counter example online: [Simple Counter](https://jsfiddle.net/ap1kgyeb/4).

## Event PubSubs

At core, AppRun is an event publication and subscription system, which is also known as event emitter. It is a commonly used pattern in JavaScript programming.

AppRun has two important functions: _app.run_ and _app.on_. _app.run_ fires events.
_app.on_ handles events. E.g. :

Module A subscribes to an event _print_:
```
import app from 'apprun';
export () => app.on('print', e => console.log(e));
```
Module B publishes the event _print_:
```
import app from 'apprun';
export () => app.run('print', {});
```
Main Module:
```
import a from './A';
import b from './B';
a();
b();
```
Module A and Module B only have to know the event system, not other modules, so they are only dependent on the event system, not other modules. Therefore modules are decoupled. Thus makes it easier to modify, extend and swap modules.

The biggest benefit of such event system is decoupling. In traditional MVC architecture, the model, view and controller are coupled, which makes it difficult to test and maintain. In result, there are many architecture patterns have been developed in order to solve the coupling problem, such as Model-View-Presenter, Presentation Model and Model-View-ViewModel. AppRun solved the coupling problem by using event publication and subscription. Model, View and Controller/Update don't know each.

AppRun applications have an event cycle like below:

```
Web events => AppRun Events => Update => (new state) => View => (HTML)
```

Behind scene AppRun events trigger update functions; the update functions create new states; AppRun then let view function turn the new state into HTML or virtual DOM. Finally AppRun renders the HTML or virtual DOM to web page element.

## State Management

During the event cycle, AppRun manages application states. It passes current state into the update functions. It takes the new state from the update functions and passes into the view function. Therefore it can maintains the history of all states, which enables the time travel / undo-redo feature.

In order to leverage the time travel / undo-redo feature, the update functions must make sure current state immutable and always create new state.

See the multiple counter example that has undo-redo online: [Multiple counters](https://jsfiddle.net/ap1kgyeb/6)


## Virtual DOM

When applications get complex, we start to think performance and build system.

In the simple counter example above, the View creates HTML string out of the state.
Although HTML string is easy to understand and useful for trying out ideas, it takes
time to parse it into virtual dom at run time, which may cause performance issue.
It also has some problems that have been documented by the Facebook React team:
[Why not template literals](http://facebook.github.io/jsx/#why-not-template-literals).

Using JSX, the JSX compiler compiles the JSX into functions at compile time. The functions creates virtual dom in run time directly without parsing HTML, which gives
better performance. Therefore, we recommend using JSX in production.

To compile and build production code, we recommend using TypeScript and webpack. See CLI section below.


## Component

Another thing to consider when applications get complex is to divide and organize code into components.

A component in AppRun is a mini model-view-update architecture, which means inside a component, there are model, view and update. Let's use _AppRun CLI_ to generate a component.

```
apprun -c Counter
```

It generates a Counter component:
```
import app, {Component} from 'apprun';

export default class CounterComponent extends Component {
  state = 'Counter';
  view = (state) => {
    return <div>
      <h1>{state}</h1>
    </div>
  }
  update = {
    '#Counter': state => state,
  }
}
```

To use the Counter component, create an instance of it and then mount the instance to an element.

```
import Counter from './Counter';
const element = document.getElementById('my-app');
new Counter().mount(element);
```

Notice the update has a '#Counter' function. It is a route. See Routing section below.
### Update function Decorator

Using the on decorator, the update functions look better. There are two decorators. _@update_ and _@on_. _@update_ is for class functions. _@on_ is for class properties.

```
    class TestComponent extends Component {
      view = state => state

      // function decorator
      @update('hi, #hi')
      f2(state, val) {
        return val;
      }

      // property decorator
      @on('hi2, #hi2')
      f2 = (state, val) => val
    }
```

### Pure Function Component

Pure Function Component is fully supported. Make sure the function name is capitalized.

```
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

const view = (state) => {
  console.log(state);
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

### Child Stateful Component

(Working in progress)

```
    class TestComponent extends Component {
      state = '';
      view = (state) => <div>{state}</div>
      update = { }
      constructor({ id }) {
        super();
      }
    }

    class MainComponent extends Component {
      view = (state) => {
        return <div>
          <TestComponent id = 'c1' />
          <TestComponent id = 'c2' />
          <TestComponent id = 'c3'/>
        </div>
      }
    }

    new MainComponent().start('my-app');
```

## Routing

Because AppRun can connect web page events to AppRun Event. Handling routing becomes much easier. AppRun detects the hash changes in URL and calls functions in update by matching the hash. E.g. when URL in the browser address bar becomes http://..../#Counter, The #Couter update function of the components will be executed.

Each component defines its route in an update function. Once the URL is changed to the route the component defined, the update function is triggered and executed. It can avoid a lot of code for registering and matching routes like in the other frameworks and libraries.

The AppRun [demo application](https://yysun.github.io/apprun-examples/) was built to have 8 components that are routed into one element, which makes it a single page application (SPA).

## CLI

AppRun includes a cli. To install AppRun CLI:

```
npm install apprun -g
```

AppRun CLI can:

* Initialize a TypeScript and webpack configured project
* Initialize git repository
* Add Karam unit test
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

AppRun itself is lightweight. It is about 3K gzipped. More important is that applications built with AppRun have less line of code, smaller js file and better performance.
See a comparision from [A Real-World Comparison of Front-End Frameworks with Benchmarks](https://medium.freecodecamp.org/a-real-world-comparison-of-front-end-frameworks-with-benchmarks-e1cb62fd526c).

AppRun has also joined the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) project. You can see its [performance results](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html) compared to other frameworks and libraries.


AppRun makes your applications clean, precious, declarative and has no ceremony.
Please give it a try and send pull request.

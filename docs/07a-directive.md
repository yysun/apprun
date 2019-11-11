# Directives

AppRun directives are syntax sugars that help simplify the code. They are custom attributes in JSX that have names starting with $. AppRun two out of the box directives: $on and $bind.

## $on...

The $on directive simplifies the code to convert the DOM events to AppRun events.

### Convert Events

```javascript
class Counter extends Component {
  state = 0;
  view = state => <>
    <h1>{state}</h1>
    <button $onclick='-1'>-1</button>
    <button $onclick='+1'>+1</button>
  </>;
  update = {
    '+1': state => state + 1,
    '-1': state => state - 1
  };
}
```

### Invoke Functions

The $on directive can also invoke functions.

```javascript
class Counter extends Component {
  state = 0;
  view = state => <div>
    <h1>{state}</h1>
    <button $onclick={state=>state-1}>-1</button>
    <button $onclick={state=>state+1}>+1</button>
  </div>;
}
```

You can see more $on example from the [AppRun playground](https://apprun.js.org/#play).

## $bind

The $bind directive synchronizes the HTML input value to the _state_.
You can see the $bind example from the [AppRun playground](https://apprun.js.org/#play/0).

## Custom directive

When AppRun is processing the JSX code, it publishes the $ event when it finds the custom attributes named like $X. You can subscribe to the $ event to provide your directives. E.g., if you create the $animation directive to attach the animation classes from the animation library, [animation.css](https://daneden.github.io/animate.css).

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
export default [
  {
    name: 'Hello World ($bind)',
    code: `// Hello World ($bind)
const state = '';
const view = state => <div>
  <h1>Hello {state}</h1>
  <input autofocus $bind />
</div>;
app.start(document.body, state, view);
`
  },

  {
    name: 'Hello World ($on)',
    code: `// Hello World ($on)
const state = { who: 'World' };
const view = ({who}) => <div>
  <h1>Hello {who}</h1>
  <p><input $oninput value={who} /> $oninput</p>
  <p><input $oninput="hello" value={who}/> $oninput="event"</p>
  <p><input $oninput={["hello"]} value={who}/> $oninput=Tuple ["event", ...p]</p>
  <p><input $oninput={hello} value={who}/> $oninput=Function Name</p>
  <p><input $oninput={(_, e)=>({who:e.target.value})} value={who}/> $oninput=Function</p>
</div>;

const update = [
  ['oninput, hello', (_, e) => ({who:e.target.value})]
];
const hello = (_, e) => ({who:e.target.value});
app.start(document.body, state, view, update);
`
  },

  {
    name: 'Hello World (debounce)',
    code: `// Hello World (debounce)
const state = '';
const view = state => <div>
  <h1>Hello {state}</h1>
  <input autofocus $oninput />
</div>;
const update = {
  'oninput': [(_, e) => e.target.value, { delay: 300 }]
}
app.start(document.body, state, view, update);
`
  },

  {
    name: 'Clock',
    code: `// Clock
const state = new Date();
const view = state => <h1>{state.toLocaleTimeString()}</h1>;
const update = {
  'timer': state => new Date()
}
window.setInterval(() => { app.run('timer') }, 1000);
app.start(document.body, state, view, update);
`
  },

  {
    name: 'Clock (Component)',
    code: `// Clock (Component)
class Clock extends Component {
  id;
  state = new Date();
  view = state => <>
    <h1>{state.toLocaleTimeString()}</h1>
    <button onclick={()=>document.body.innerHTML="Clock deleted"}>delete</button>
  </>;
  update = {
    'timer': state => new Date()
  }
  mounted = () => {
    this.id = window.setInterval(() => { this.run('timer') }, 1000);
    console.log('timer started');
  }
  unload = () => {
    window.clearInterval(this.id);
    console.log('timer cleared');
  }
}
app.render(document.body, <Clock />);
`
  },

  {
    name: 'Stopwatch',
    code: `// Stopwatch
let id;
const state = {
  start: new Date(),
  elapsed: '0'
}
const view = state => {
  return <div>
    <h1>{state.elapsed}</h1>
    <button $onclick="start">Start</button>
    <button $onclick="stop">Stop</button>
  </div>;
};
const update = {
  'start':state => {
    state.start = new Date();
    id = id || window.setInterval(() => { app.run('timer') }, 100);
  },
  'stop': state => {
    id = id && window.clearInterval(id) && false;
  },
  'timer': state => {
    state.elapsed = ((new Date() - state.start) / 1000).toFixed(3) + ' seconds';
    return state
  }
};
app.start(document.body, state, view, update);
`
  },
  {
    name: 'Counter (HTML)',
    code: `// Counter (HTML)
const state = 0;
const view = state => \`<div>
  <h1>\${state}</h1>
  <button onclick="app.run('-1')">-1</button>
  <button onclick="app.run('+1')">+1</button>
</div>\`;
const update = {
  '+1': state => state + 1,
  '-1': state => state - 1
};
app.start(document.body, state, view, update);
`
  },
  {
    name: 'Counter (JSX)',
    code: `// Counter (JSX)
const state = 0;
const view = state => <div>
  <h1>{state}</h1>
  <button onclick={()=>app.run('-1')}>-1</button>
  <button onclick={()=>app.run('+1')}>+1</button>
</div>;
const update = {
  '+1': state => state + 1,
  '-1': state => state - 1
};
app.start(document.body, state, view, update);
`
  },
  {
    name: 'Counter (JSX Directive)',
    code:`// Counter (JSX Directive)
const state = 0;
const view = state => <div>
  <h1>{state}</h1>
  <button $onclick={()=>add(state, -1)}>-1</button>
  <button $onclick={()=>add(state, +1)}>+1</button>
  <button $onclick={state=>state-1}>-1</button>
  <button $onclick={state=>state+1}>+1</button>
</div>;
app.start(document.body, state, view);
  `
  },
  {
    name: 'Counter (Web Component)',
    code: `// Counter (Web Component)
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
app.webComponent('my-app', Counter);
app.render(document.body, <my-app />);
`
  },
  {
    name: 'Async fetch',
    code: `// Async fetch
const state = {};
view = state => <>
  <div><button $onclick="fetchComic">fetch ...</button></div>
  {state.loading && <div>loading ... </div>}
  {state.comic && <img src={state.comic.url}/>}
</>;
const update = {
  'loading': (state, loading) => ({...state, loading }),
  'fetchComic': async _ => {
    app.run('loading', true);
    const response = await fetch('https://xkcd-imgs.herokuapp.com/');
    const comic = await response.json();
    return {comic};
  }
};
app.start(document.body, state, view, update);
`
  },
  {
    name: 'Animation Directive',
    code: `// Animation Directive
app.on('$', ({key, props}) => {
  if (key === '$animation') {
    const value = props[key];
    if (typeof value === 'string') {
      props.class = \`animated \${value}\`;
    }
  }
});

const state = {
  animation: true
}

const start_animation = state => ({ animation: true })
const stop_animation = state => ({ animation: false })

const view = state => <>
  <img $animation={state.animation && 'bounce infinite'} src='logo.png' />
  <div $animation='bounceInRight'>
    <button disabled={state.animation} $onclick={start_animation}>start</button>
    <button disabled={!state.animation} $onclick={stop_animation}>stop</button>
  </div>
</>

app.start(document.body, state, view);
`
  },
  {
    name: 'Ref - focus',
    code: `// Ref - focus
const ref = e => e.focus()
const View = () => <input ref={ref}/>

app.render(document.body, <View />);
`
  },
  {
    name: 'Child Component',
    code: `// Child Component

class Counter extends Component {
  state = 0;
  view = state => (
    <div>
      <h1>{state}</h1>
      <button $onclick='-1'>-1</button>
      <button $onclick='+1'>+1</button>
    </div>
  );
  update = {
    '+1': state => state + 1,
    '-1': state => state - 1
  };
}

class App extends Component {
  state = 0;
  view = state => (
    <div>
      <button $onclick='+1'>{state}</button>
      <hr/>
      <Counter />
      <Counter />
      <Counter />
    </div>
  );
  update = {
    '+1': state => state + 1,
  };
}

new App().start(document.body);
`
  },

  {
    name: 'Element in JSX - canvas',
    code: `// Element in JSX - canvas
const View = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(95, 50, 40, 0, 2 * Math.PI);
  ctx.stroke();
  return <div>
    {canvas}
  </div>
}
app.render(document.body, <View/>);
`
  },
  {
    name: 'Calculator',
    code: `// Calculator
const state = {
  value: 0,
  input: '',
  done: true
};

const oninput = ({value, input, done}, e) => {
  const c = e.target.textContent;
  switch (c) {
    case 'C':
      return { value: '0', input: '', done: true }
    case '=':
      input = input || 0;
      value = eval(input).toString();
      return { value, input: \`\${input} = \${value}\`, done: true }
    default:
      const isNumber = /\\d|\\./.test(c);
      if (input.indexOf('=') > 0) {
        isNumber && (input = value = '');
        !isNumber && (input = value || '');
      } else if (done) {
        isNumber && (value = '');
        !isNumber && (input = input || value)
      }
      return {
        value: isNumber ? (value || '') + c : value,
        input: input + c, done: !isNumber
      }
  }
}

const view = ({input, value}) => <>
  <style>
{\`
.calculator { width: 200px; }
.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 2px;
}
button { padding: 10px; width:100%; }
button:nth-of-type(1) {
  grid-column: span 3;
}
button:nth-of-type(15) {
  grid-column: span 2;
}
\`}
  </style>
  <div class="calculator">
    <h1>{value}</h1>
    <div class="buttons" $onclick={oninput}>
      <button>C</button>
      <button>/</button>
      <button>7</button>
      <button>8</button>
      <button>9</button>
      <button>*</button>
      <button>4</button>
      <button>5</button>
      <button>6</button>
      <button>-</button>
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>+</button>
      <button>0</button>
      <button>.</button>
      <button>=</button>
    </div>
    <small>{input}</small>
  </div>
</>;

app.start(document.body, state, view);
`
  },
  {
    name: 'Shadow DOM',
    code: `// Shadow DOM
const Shadow = (_, children) => {
  const el = document.createElement('section');
  el.attachShadow({ mode: 'open' });
  app.render(el.shadowRoot, children);
  return <>{el}</>;
};

const View = () => <>
  <div>black</div>
  <Shadow>
    <style>{'div {color: red}'}</style>
    <div>red</div>
    <div>red</div>
  </Shadow>
  <div>black</div>
</>
app.render(document.body, <View />);
`
  }
];

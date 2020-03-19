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
const state = '';
const view = state => <>
  <h1>Hello {state}</h1>
  <input $oninput={oninput}/>
</>;
const oninput = (_, e) => e.target.value;
app.start(document.body, state, view);
`
  },

  {
    name: 'Hello World (debounce)',
    code: `// Hello World (debounce)
const state = '';
const view = state => <>
  <h1>Hello {state}</h1>
  <input autofocus $oninput />
</>;
const oninput = [(_, e) => e.target.value, { delay: 300 }];
app.start(document.body, state, view, {oninput});
`
  },

  {
    name: 'Clock',
    code: `// Clock
const state = new Date();
const view = state => <h1>{state.toLocaleTimeString()}</h1>;
const timer = state => new Date();
window.setInterval(() => { app.run('timer') }, 1000);
app.start(document.body, state, view, {timer});
`
  },

  {
    name: 'Clock (Component Lifecycle)',
    code: `// Clock (Component Lifecycle)
class Clock extends Component {
  id;
  state = new Date();
  view = state => <>
    <h1>{state.toLocaleTimeString()}</h1>
    <button onclick={()=>document.body.innerHTML="Clock deleted"}>delete</button>
  </>;
  update = {
    timer: state => new Date()
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
const state = {
  id: null,
  start: new Date(),
  elapsed: '0'
}
const view = state => <div>
  <h1>{state.elapsed}</h1>
  <button $onclick="start">Start</button>
  <button $onclick="stop">Stop</button>
</div>;

const update = {
  start:state => {
    state.start = new Date();
    state.id = state.id || window.setInterval(() => { app.run('timer') }, 100);
  },
  stop: state => {
    state.id = state.id && window.clearInterval(state.id) && false;
  },
  timer: state => {
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
    name: 'Counter ($onclick)',
    code:`// Counter ($onclick)
const state = 0;
const view = state => <div>
  <h1>{state}</h1>
  <button $onclick={state => state - 1}>+1</button>
  <button $onclick={state => state + 1}>+1</button>
</div>;
app.start(document.body, state, view);
  `
  },
  {
    name: 'Counter (Web Component)',
    code: `// Counter (Web Component)
class Counter extends Component {
  state = 0;
  view = state => {
    const add = (state, num) => state + num;
    return <>
      <h1>{state}</h1>
      <button $onclick={[add, -1]}>-1</button>
      <button $onclick={[add, +1]}>+1</button>
      </>;
  }
}
app.webComponent('my-app', Counter);
app.render(document.body, <my-app />);
`
  },
  {
    name: 'Async fetch',
    code: `// Async fetch
const state = {};
const view = state => <>
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
    name: 'Custom Directive',
    code: `// Animation Directive Using animate.css
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
    name: 'Ref - Set Focus',
    code: `// Ref - Set Focus
const ref = e => e.focus()
const View = () => <input ref={ref}/>

app.render(document.body, <View />);
`
  },
  {
    name: 'Child Components',
    code: `// Child Components

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
//   {
//     name: 'State Machine',
//     code: `// State Machine
// const state_machine = {
//   red: ['green1', 10000],
//   green1: ['yellow1', 3000],
//   yellow1: ['green', 10000],
//   green: ['yellow2', 5000],
//   yellow2: ['red', 15000],
// }

// const timer = async (state) => {
//   let {sm_state, start, delta } = state;
//   if ((new Date().getTime() - start) < delta) return state;
//   const transition = state_machine[sm_state];
//   if (transition) {
//     sm_state = transition[0];
//     start = new Date().getTime();
//     delta = transition[1];
//     return {sm_state, start, delta}
//   }
// }

// const state = {
//   sm_state: 'red',
//   start: new Date().getTime(),
//   delta: 10000
// }

// const view = ({sm_state, start, delta }) => <>
//   <svg height="60" width="160">
//     <rect width="100%" height="100%" rx="10" ry="10" fill="lightgrey" />
//     <circle cx="30" cy="30" r="20" fill='lime' fill-opacity={sm_state.startsWith('green')?'1':'0.1'}>
//     {sm_state==='green1' && <animate
//           attributeType="XML"
//           attributeName="fill"
//           values="lime;lightgrey;lime;lightgrey"
//           dur="0.5s"
//           repeatCount="indefinite"/>}
//     </circle>
//     <circle cx="80" cy="30" r="20" fill='yellow' fill-opacity={sm_state.startsWith('yellow')?'1':'0.1'}/>
//     <circle cx="130" cy="30" r="20" fill='orangered' fill-opacity={sm_state==='red'?'1':'0.1'} />
//   </svg>
//   <h1>{((delta - new Date() + start) / 1000).toFixed(0)}</h1>
// </>;

// app.start(document.body, state, view, { timer });
// window.setInterval(() => { app.run('timer') }, 1000);
// `
//   },
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
  },

  {
    name: 'Decorators',
    code: `// Decorators
//@customElement decorator creates a web component
@customElement('my-counter')
class Counter extends Component {
  state = 0;

  //@on decorator creates an event handler
  @on('+') add = (state, delta) => state + delta;

  view = state => <>
    <h1>{state}</h1>
    <button $onclick={['+', -1]}>-1</button>
    <button $onclick={['+', +1]}>+1</button>
  </>;
}

//now, create three web components
document.body.append(document.createElement('my-counter'));
document.body.append(document.createElement('my-counter'));
document.body.append(document.createElement('my-counter'));
`
  },

  {
    name: 'Reactive - $bind',
    code: `// Reactive - $bind
const state = {
  a: 1,
  b: 2,
};
const view = ({a, b}) => <>
  <input type="number" $bind="a" />
  <input type="number" $bind="b" />
  <p>{a} + {b} = { a + b }</p>
</>;
app.start(document.body, state, view);
`
  },

  {
    name: 'Reactive - Proxy',
    code: `// Reactive - Proxy
const handler = {
  get: (target, name) => {
    const text = target.text || '';
    switch (name) {
      case 'text': return target.text;
      case 'characters': return text.replace(/\s/g, '').length;
      case 'words': return !text ? 0 :target.text?.split(' ').length;
      default: return null
    }
  }
};
const state = new Proxy(
  { text: "let's count" },
  handler
);
const view = state => <div>
  <textarea rows="10" cols="50" $bind="text"></textarea>
  <div>{state.characters} {state.words}</div>
  {state.text}
</div>;
app.start(document.body, state, view);
`
  },

  {
    name: 'Routing (component event)',
    code: `// Routing (component event)
class Home extends Component {
  view = () => <div>Home</div>;
  update = {'#, #home': state => state };
}

class Contact extends Component {
  view = () => <div>Contact</div>;
  update = {'#contact': state => state };
}

class About extends Component {
  view = () => <div>About</div>;
  update = {'#about': state => state };
}

const App = () => <>
  <div id="menus">
    <a href="#home">Home</a>{' | '}
    <a href="#contact">Contact</a>{' | '}
    <a href="#about">About</a></div>
  <div id="pages"></div>
</>

app.render(document.body, <App />);
[About, Contact, Home].map(C => new C().start('pages'));
`
  },

  {
    name: 'Routing (mount options)',
    code: `// Routing (mount options)
class Home extends Component {
  view = () => <div>Home</div>;
}

class Contact extends Component {
  view = () => <div>Contact</div>;
}

class About extends Component {
  view = () => <div>About</div>;
}

const App = () => <>
  <div id="menus">
    <a href="#home">Home</a>{' | '}
    <a href="#contact">Contact</a>{' | '}
    <a href="#about">About</a></div>
  <div id="pages"></div>
</>

app.render(document.body, <App />);
[
  [About, '#about'],
  [Contact, '#contact'],
  [Home, '#, #home'],
].map(([C, route]) => new C().start('pages', {route}));
`
  },

];

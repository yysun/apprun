export default [
  {
    name: 'Hello World ($bind)',
    code: `// Hello World ($bind)
const state = '';
const view = state => <div>
  <h1>Hello {state}</h1>
  <input $bind />
</div>;
app.start(document.body, state, view, {});
`
  },

  {
    name: 'Hello World ($on)',
    code: `// Hello World ($on)
const state = { who: 'Would' };
const view = ({who}) => <div>
  <h1>Hello {who}</h1>
  <input $oninput="hello" value={who}/>
  <h1>Hello {who}</h1>
  <input $oninput={[hello]} value={who}/>
</div>;
const update = {
  'hello': (_, e) => ({who:e.target.value})
}
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
  <input $oninput />
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
    name: 'Stopwatch',
    code: `// Stopwatch
const state = {
  start: new Date(),
  active: false,
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
  'start':state =>({
    start: new Date(),
    active: true}),
  'stop': state => ({ ...state, active: false }),
  'timer': state => {
    if(state.active){
      state.elapsed = ((new Date() - state.start) / 1000).toFixed(3) + ' seconds';
      return state
    }
  }
};
window.setInterval(() => { app.run('timer') }, 100);
app.start(document.body, state, view, update);
`
  },

  {
    name: 'Counter (JSX)',
    code: `// Counter (JSX)
const state = 0;
const view = state => <div>
  <h1>{state}</h1>
  <button $onclick='-1'>-1</button>
  <button $onclick='+1'>+1</button>
</div>;
const update = {
  '+1': state => state + 1,
  '-1': state => state - 1
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
const wc = document.createElement('my-app');
document.body.appendChild(wc);
app.webComponent('my-app', Counter);
`
  },

  {
    name: 'Async fetch',
    code: `// Async fetch
const state = {};
const view = (state) => <>
  <div><button $onclick='fetchComic'>XKCD</button></div>
  {state.comic && <>
    <h3>{state.comic.title}</h3>
    <img src={state.comic.url} />
  </>}
</>;
const update = {
  'fetchComic': async _ => {
    const response = await fetch('https://xkcd-imgs.herokuapp.com/');
    const comic = await response.json();
    return {comic};
  }
};
app.start(document.body, state, view, update);
`
  },

//   {
//     name: '$bind Directives',
//     code: `// $bind Directives
// const state = {
//   a:'a',
//   b:'b',
//   c:5,
//   d:true,
//   e:'A',
//   f:5,
//   h:1,
//   o1: false,
//   o2: true,
//   o3: false
// };
// const view = state => <>
//   state: {state}<hr/>
//   a: <input $bind name='a' /><br/>
//   b: <input $bind='b' /><br/>
//   c: <input type='number' name='c' $bind /><br/>
//   d: <input type='checkbox' name='d' $bind /><br/>
//   e: <input type='radio' name='e' value='A' $bind /> A
//      <input type='radio' name='e' value='B' $bind /> B <br/>
//   f: <input type='range' min='0' max='5' name='f' $bind /><br/>

//   h: <select $bind name='h'>
//     <option>0</option>
//     <option>1</option>
//     <option>2</option>
//     <option>3</option>
//   </select><br/>

//   i: <select multiple name='i'>
//     <option $bind='o1'>1</option>
//     <option $bind='o2'>2</option>
//     <option $bind='o3'>3</option>
//   </select>
// </>
// app.start(document.body, state, view, {});
// `
//   },

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

const view = state => <>
  <img $animation={state.animation && 'bounce infinite'} src='logo.png' />
  <div $animation='bounceInRight'>
    <button disabled={state.animation} $onclick='start-animation'>start</button>
    <button disabled={!state.animation} $onclick='stop-animation'>stop</button>
  </div>
</>

const update = {
  '#animation': state => state,
  'start-animation': state => ({ ...state, animation: true }),
  'stop-animation': state => ({...state, animation: false})
}
app.start(document.body, state, view, update);
`
  }

];

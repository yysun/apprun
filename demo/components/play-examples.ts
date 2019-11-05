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
const state = { who: 'World' };
const view = ({who}) => <div>
  <h1>Hello {who}</h1>
  <p><input $oninput value={who}/> $oninput</p>
  <p><input $oninput="hello" value={who}/> $oninput="event"</p>
  <p><input $oninput={hello} value={who}/> $oninput=Function</p>
  <p><input $oninput={[hello]} value={who}/> $oninput=Tuple [Function, ...p] </p>
</div>;
// update tuple, new in 1.19.2
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
  'start-animation': state => ({ ...state, animation: true }),
  'stop-animation': state => ({...state, animation: false})
}
app.start(document.body, state, view, update);
`
  },

  {
    name: 'Pikaday',
    code: `// Pikaday

const state = { day: '8/19/2016' }

const view = state => <>
  <h1>{state}</h1>
  <input autocomplete="off" id="datepicker" placeholder="Click to pick a date"/>
</>
const update = {
  'set-date': (state, e) => ({ ...state, day: e })
}

app.start(document.body, state, view, update, {
  rendered: () => {
    const input = document.getElementById('datepicker')
    let pik = new Pikaday({
      field: input,
      onSelect: d => {
        pik.destroy();
        app.run('set-date', d.toLocaleDateString());
      }
    })
  }
});
`},

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
    name: 'Element in JSX',
    code: `// Element in JSX

class Test extends Component {
  state = 'world';
  view = state => {
    const element = document.createElement('div');
    element.innerHTML = 'hello ' + state;
    return <div>
      {element}
    </div>
  }
}
new Test().start(document.body);
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
    const view = ({input, value}) => <>
      <style>{\`
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
    \`}</style>
      <div class="calculator">
        <h1>{value}</h1>
        <div class="buttons" $onclick='oninput'>
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

    const update = {
      'oninput': ({value, input, done}, e) => {
        const c = e.target.textContent;
        switch (c) {
          case 'C':
            return { value: '0', input: '', done: true }
          case '=':
            input = input || 0;
            value = eval(input).toString();
            return { value, input: \`\${input} = \${value}\`, done: true }
          default:
            const isNumber = /\d|\./.test(c);
            done && isNumber && (value = 0);
            done && !isNumber && (input = !input ? value : input.substring(0, input.length - 1))
            input.indexOf('=') > 0 && (input = value || '');
            return {
              value: isNumber ? (value || '') + c : value,
              input: input + c, done: !isNumber
        }
      }
    }
    }
    app.start(document.body, state, view, update);
`
  }
];

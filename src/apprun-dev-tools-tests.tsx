declare var app;
let win;

function openWin(name) {
  win = window.open('', name);
  win.document.write(`<html>
  <title>AppRun Analyzer | ${document.location.href}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI" }
  </style>
  <body><pre>`);
}

function write(text) {
  win.document.write(text + '\n');
}

function closeWin() {
  win.document.write(`</pre>
  </body>
  </html>`);
  win.document.close();
}

const _createEventTests = () => {
  const o = { components: {} };
  app.run('get-components', o);
  const { components } = o;
  openWin('');
  Object.keys(components).forEach(el => {
    components[el].forEach(component => {
      write(`const component = ${component.constructor.name};`);
      write(`describe('${component.constructor.name}', ()=>{`);
      component._actions.forEach(action => {
        write(`  it ('should handle event: ${action.name}', ()=>{`);
        write(`    component.run('${action.name}');`);
        write(`    expect(component.state).toBeTruthy();`);
        write(`  })`);
      });
      write(`});`);
    });
  });
  closeWin();
}

let recording = false;
let events = [];

app.on('debug', p => {
  if (recording && p.vdom) {
    events.push(p);
    console.log(`* ${events.length} state(s) recorded.`);
  }
});

const _createStateTests = (s) => {

  const printTests = () => {
    if (events.length === 0) {
      console.log('* No state recorded.');
      return;
    }
    openWin('');
    events.forEach((event, idx) => {
      write(`  it ('view snapshot: #${idx+1}', ()=>{`);
      write(`    const component = ${event.component.constructor.name};`);
      write(`    const state = ${JSON.stringify(event.state, undefined, 2)};`);
      write(`    const vdom = component['view'](state);`);
      write(`    expect(JSON.stringify(vdom)).toMatchSnapshot();`);
      write(`  })`);
    });
    closeWin();
  }

  if (s === 'start') {
    events = [];
    recording = true;
    console.log('* State logging started.');
  } else if (s === 'stop') {
    printTests();
    recording = false;
    events = [];
    console.log('* State logging stopped.');
  } else {
    console.log('create-state-tests <start|stop>');
  }
}

window['_apprun-create-event-tests'] = ['create-event-tests',
  () => _createEventTests()
]

window['_apprun-create-state-tests'] = ['create-state-tests <start|stop>',
  (p?) => _createStateTests(p)
]
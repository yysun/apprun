import app from './app';
import toHTML from './vdom-to-html';

const commands = {};

commands['help'] = ['', () => {
  Object.keys(commands).forEach(cmd => cmd === 'help' ?
    console.log('AppRun Commands:'):
    console.log(`* ${cmd}: ${commands[cmd][0]}`));
}];

function newWin(html) {
  const win = window.open('', '_apprun_debug', 'toolbar=0');
  win.document.write(`<html>
  <title>AppRun Analyzer | ${document.location.href}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI" }
    li { margin-left: 30px; }
  </style>
  <body>
  <div id="main">${html}</div>
  </script>
  </body>
  </html>`);
  win.document.close();
}

const Events = ({ events }) => <ul>
  {events && events
    .sort(((a, b) => a.name > b.name ? 1 : -1))
    .map(event => <li>
    {event.name}
  </li>)}
</ul>;

const Components = ({ components }) => <ul>
  {components.map(component => <li>
    <div>{component.constructor.name}</div>
    <Events events={component['_actions']} />
  </li>)}
</ul>;

const view = state => <ul>
  {Object.keys(state).map(name =><li>
    <div>#{name}</div>
    <Components components={state[name]} />
  </li>)}
</ul>

const _components = (print?) => {
  const o = { components: {} };
  app.run('get-components', o);
  const { components } = o;
  if (print) {
    const vdom = view(components);
    newWin(toHTML(vdom));
  } else {
    Object.keys(components).forEach(el => {
      const element = typeof el === 'string' ? document.getElementById(el) : el;
      const comps = components[el].map(component => ({
        component,
        events: component['_actions'].sort(((a, b) => a.name > b.name ? 1 : -1)).map(e => e.name),
      }));
      console.log(element, comps);
    });
  }
}

let debugging = 0;
app.on('debug', p => {
  if (debugging & 1 && p.event) console.log(p);
  if (debugging & 2 && p.vdom) console.log(p);
});

commands['log'] = ['log [event|view] on|off', (a1?, a2?) => {
  if (a1 === 'on') {
    debugging = 3;
  } else if (a1 === 'off') {
    debugging = 0;
  } else if (a1 === 'event') {
    if (a2 === 'on') {
      debugging |= 1;
    } else if (a2 === 'off') {
      debugging &= ~1;
    }
  } else if (a1 === 'view') {
    if (a2 === 'on') {
      debugging |= 2;
    } else if (a2 === 'off') {
      debugging &= ~2;
    }
  }
  console.log(`log ${a1} ${a2||''}`)
}];

commands['components'] = ['components log|print', (p) => {
  _components(p === 'print');
}]

window['_apprun'] = (strings) => {
  const [cmd, ...p] = strings[0].split(' ').filter(c => !!c);
  if (commands[cmd]) commands[cmd][1](...p);
  // else console.log('Unknown command: ' + cmd);
  else commands['help'][1]();
}

console.info('AppRun Commands 0.1: type "_apprun `help`" to list all available commands.');
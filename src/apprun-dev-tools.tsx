import app from './app';
import toHTML from './vdom-to-html';

const log = p => console.log(p);
let debug = false;

window['_debug'] = (on) => {
  on ? !debug && app.on('debug', log) : debug && app.off('debug', log);
  debug = on;
}

function newWin(html) {
  const newWin = window.open('', '_apprun_debug', 'toolbar=0');
  newWin.document.write(`<html>
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
  newWin.document.close();
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

window['_components'] = (print) => {
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
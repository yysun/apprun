import app from './app';
import toHTML from './vdom-to-html';
import { _createEventTests, _createStateTests } from './apprun-dev-tools-tests';
app['debug'] = true;
window['_apprun-help'] = ['', () => {
        Object.keys(window).forEach(cmd => {
            if (cmd.startsWith('_apprun-')) {
                cmd === '_apprun-help' ?
                    console.log('AppRun Commands:') :
                    console.log(`* ${cmd.substring(8)}: ${window[cmd][0]}`);
            }
        });
    }];
function newWin(html) {
    const win = window.open('', '_apprun_debug', 'toolbar=0');
    win.document.write(`<html>
  <title>AppRun Analyzer | ${document.location.href}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI" }
    li { margin-left: 80px; }
  </style>
  <body>
  <div id="main">${html}</div>
  </script>
  </body>
  </html>`);
    win.document.close();
}
const get_components = () => {
    const o = { components: {} };
    app.run('get-components', o);
    const { components } = o;
    return components;
};
const viewComponents = state => {
    const Events = ({ events }) => app.createElement("ul", null, events && events.map(event => app.createElement("li", null, event.name)));
    const Components = ({ components }) => app.createElement("ul", null, components.map(component => app.createElement("li", null,
        app.createElement("div", null, component.constructor.name),
        app.createElement(Events, { events: component['_actions'] }))));
    return app.createElement("ul", null, Object.keys(state).map(name => app.createElement("li", null,
        app.createElement("div", null,
            "#",
            name),
        app.createElement(Components, { components: state[name] }))));
};
const viewEvents = state => {
    const Components = ({ components }) => app.createElement("ul", null, components.map(component => app.createElement("li", null,
        app.createElement("div", null, component.constructor.name))));
    const Events = ({ events, global }) => app.createElement("ul", null, events && events
        .filter(event => event.global === global)
        .map(({ event, components }) => app.createElement("li", null,
        app.createElement("div", null, event),
        app.createElement(Components, { components: components }))));
    return app.createElement("div", null,
        app.createElement("div", null, "GLOBAL EVENTS"),
        app.createElement(Events, { events: state, global: true }),
        app.createElement("div", null, "LOCAL EVENTS"),
        app.createElement(Events, { events: state, global: false }));
};
const _events = (print) => {
    const global_events = app['_events'];
    const events = {};
    const cache = get_components();
    Object.keys(cache).forEach(el => {
        cache[el].forEach(component => {
            component['_actions'].forEach(event => {
                events[event.name] = events[event.name] || [];
                events[event.name].push(component);
            });
        });
    });
    const data = [];
    Object.keys(events).forEach(event => {
        data.push({ event, components: events[event], global: global_events[event] ? true : false });
    });
    data.sort(((a, b) => a.event > b.event ? 1 : -1)).map(e => e.event);
    if (print) {
        const vdom = viewEvents(data);
        newWin(toHTML(vdom));
    }
    else {
        console.log('=== GLOBAL EVENTS ===');
        data.filter(event => event.global)
            .forEach(({ event, components }) => console.log({ event }, components));
        console.log('=== LOCAL EVENTS ===');
        data.filter(event => !event.global)
            .forEach(({ event, components }) => console.log({ event }, components));
    }
};
const _components = (print) => {
    const components = get_components();
    const data = [];
    Object.keys(components).forEach(el => {
        const element = typeof el === 'string' ? document.getElementById(el) : el;
        const comps = components[el].map(component => ({
            component,
            events: component['_actions']
        }));
        data.push({ element, comps });
    });
    if (print) {
        const vdom = viewComponents(components);
        newWin(toHTML(vdom));
    }
    else {
        data.forEach(({ element, comps }) => console.log(element, comps));
    }
};
let debugging = 0;
app.on('debug', p => {
    if (debugging & 1 && p.event)
        console.log(p);
    if (debugging & 2 && p.vdom)
        console.log(p);
});
window['_apprun-components'] = ['components [print]', (p) => {
        _components(p === 'print');
    }];
window['_apprun-events'] = ['events [print]', (p) => {
        _events(p === 'print');
    }];
window['_apprun-log'] = ['log [event|view] on|off', (a1, a2) => {
        if (a1 === 'on') {
            debugging = 3;
        }
        else if (a1 === 'off') {
            debugging = 0;
        }
        else if (a1 === 'event') {
            if (a2 === 'on') {
                debugging |= 1;
            }
            else if (a2 === 'off') {
                debugging &= ~1;
            }
        }
        else if (a1 === 'view') {
            if (a2 === 'on') {
                debugging |= 2;
            }
            else if (a2 === 'off') {
                debugging &= ~2;
            }
        }
        console.log(`* log ${a1} ${a2 || ''}`);
    }];
window['_apprun-create-event-tests'] = ['create-event-tests',
    () => _createEventTests()
];
window['_apprun-create-state-tests'] = ['create-state-tests <start|stop>',
    (p) => _createStateTests(p)
];
window['_apprun'] = (strings) => {
    const [cmd, ...p] = strings[0].split(' ').filter(c => !!c);
    const command = window[`_apprun-${cmd}`];
    if (command)
        command[1](...p);
    else
        window['_apprun-help'][1]();
};
console.info('AppRun DevTools 0.4: type "_apprun `help`" to list all available commands.');
const reduxExt = window['__REDUX_DEVTOOLS_EXTENSION__'];
if (reduxExt) {
    let devTools_running = false;
    const devTools = window['__REDUX_DEVTOOLS_EXTENSION__'].connect();
    if (devTools) {
        console.info('Connected to the Redux DevTools');
        devTools.subscribe((message) => {
            if (message.type === 'START')
                devTools_running = true;
            else if (message.type === 'STOP')
                devTools_running = false;
            else if (message.type === 'DISPATCH') {
                //console.log('DevTools: ', message);
            }
        });
        app.on('debug', p => {
            if (devTools_running && p.event) {
                const state = p.newState;
                const type = p.event;
                const payload = p.e;
                const action = { type, payload };
                if (state instanceof Promise) {
                    state.then(s => devTools.send(action, s));
                }
                else {
                    devTools.send(action, state);
                }
            }
        });
    }
}
//# sourceMappingURL=apprun-dev-tools.js.map
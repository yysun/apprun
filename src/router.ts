import app from './app';

const ROUTER_EVENT = '//';

app.on('//', _ => { });
app.on('#', _ => { });

export default class Router {

  route(url: string) {
    if (!url) url = '#';
    if (url.startsWith('#')) {
      const [name, ...rest] = url.split('/');
      app.run(name, ...rest);
      app.run(ROUTER_EVENT, name, ...rest);
    } else if (url.startsWith('/')) {
      const [_, name, ...rest] = url.split('/');
      app.run('/' + name, ...rest);
      app.run(ROUTER_EVENT, '/' + name, ...rest);
    } else {
      app.run(url);
      app.run(ROUTER_EVENT, url);
    }
  }

  constructor() {
    app.on('route', url => this.route(url));
    window.onpopstate = e => this.route(location.hash || location.pathname);
    this.route(location.hash);
  }
}
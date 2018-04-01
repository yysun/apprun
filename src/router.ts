import app from './app';

const ROUTER_EVENT = '//';

app.on('//', _ => { });
app.on('#', _ => { });

export default class Router {

  route(url: string) {
    if (!url) url = '#';
    if (url.indexOf('/') > 0) {
      const [name, ...rest] = url.split('/');
      app.run(name, ...rest);
      app.run(ROUTER_EVENT, name, ...rest);
    } else {
      app.run(url);
      app.run(ROUTER_EVENT, url);
    }
  }

  constructor() {
    app.on('route', hash => this.route(hash));
    window.onpopstate = e => this.route(location.hash);
    this.route(location.hash);
  }
}
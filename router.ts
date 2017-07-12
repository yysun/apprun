import app from './app';

const ROUTER_EVENT = '//';

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
    window.onpopstate = e => this.route(location.hash);
    this.route(location.hash);
  }
}
import app from './app';

const ROUTER_INIT_EVENT = 'init-router';

export default class Router {

  route(url: string) {
    if (!url) url = '/';
    if (url.indexOf('/') > 0) {
      const [name, ...rest] = url.split('/');
      app.run(name, ...rest);
    } else {
      app.run(url);
    }
  }

  constructor() {
    window.onpopstate = e => this.route(location.hash);
    this.route(location.hash);
  }
}
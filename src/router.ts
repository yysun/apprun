import app from './app';

export const ROUTER_EVENT: string = '//';
export const ROUTER_404_EVENT: string = '///';

export default function route(url: string) {
  if (!url) url = '#';
  if (url.startsWith('#')) {
    const [name, ...rest] = url.split('/');
    app.run(name, ...rest) || app.run(ROUTER_404_EVENT, name, ...rest);
    app.run(ROUTER_EVENT, name, ...rest);
  } else if (url.startsWith('/')) {
    const [_, name, ...rest] = url.split('/');
    app.run('/' + name, ...rest) || app.run(ROUTER_404_EVENT, '/' + name, ...rest);
    app.run(ROUTER_EVENT, '/' + name, ...rest);
  } else {
    app.run(url) || app.run(ROUTER_404_EVENT, url);
    app.run(ROUTER_EVENT, url);
  }
}

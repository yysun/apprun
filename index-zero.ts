import app from './app';
import Component from './component';

export default app;
export { Component };

export type Model = any;
export type View = (model: Model) => string;
export type Action = (model: Model, ...p) => Model;
export type Update = { [name: string]: Action };

app.start = (element: HTMLElement, model: Model, view: View, update: Update, options?) =>
  new Component(element, model, view, update, options);

const route = (url) => {
  if (url && url.indexOf('/') > 0) {
    const ss = url.split('/');
    app.run(ss[0], ss[1]);
  } else {
    app.run(url);
  }
}

if (typeof window === 'object') {
  window['app'] = app;
  window.onpopstate = e => {
    route(location.hash || '/');
  }
}

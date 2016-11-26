import app from './app';
import router from './router';
import Component from './component';
export default app;

export type Model = any;
export type View = (model: Model) => string;
export type Action = (model: Model, ...p) => Model;
export type Update = { [name: string]: Action };

app.start = (element: HTMLElement, model: Model, view: View, update: Update, options?) =>
  new Component(element, model, view, update, options);

app.router = (element: HTMLElement, components: Array<Component>, home: string = '/') =>
  router(element, components, home);

if (typeof window === 'object') {
  window['app'] = app;
}
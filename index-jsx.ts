import app from './app';
import router from './router';
import { updateElement, updateElementVtree } from './vdom-jsx';
import ComponentBase from './component_base';

export class Component extends ComponentBase {

  protected set_state(state) {
    this.state = state;
    if (state && state.view && typeof state.view === 'function') {
      state.view(this.state);
      state.view = undefined;
      if (this.element.firstChild) updateElementVtree(this.element);
    } else if (this.view) {
      const html = this.view(this.state);
      if (html) updateElement(this.element, html);
    }
  }
}

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
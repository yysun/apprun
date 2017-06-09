import app, { Model, View, Update } from './index-zero';
import Router from './router';
import { updateElement } from './vdom-html';
import ComponentBase from './component';

export { Router };

export class Component extends ComponentBase {
  protected initVdom() {
    this.updateElement =  updateElement.bind(this);
  }
}

app.start = (element: HTMLElement, model: Model, view: View, update: Update, options:any={}) => {
  if (typeof options.global_event === 'undefined') options.global_event = true;
  const component = new Component(element, model, view, update, options);
  component.start();
  return component;
}

export default app;
import app, { Model, View, Update } from './index-zero';
import { h, render } from './vdom';
import ComponentBase from './component';

export class Component extends ComponentBase {
  protected initVdom() {
    this.updateElement =  render.bind(this);
    this.app.createElement = h;
  }
}

app.start = (element: HTMLElement, model: Model, view: View, update: Update, options:any={}) => {
  if (typeof options.global_event === 'undefined') options.global_event = true;
  const component = new Component(element, model, view, update, options);
  component.start();
  return component;
}

app.createElement = app.h = h;
export default app;
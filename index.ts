import app, { Model, View, Update } from './index-zero';
import Router from './router';
import { updateElement } from './vdom';
import ComponentBase from './component';

export { Router };
export class Component extends ComponentBase {
  protected initVdom() {
    this.updateElement =  updateElement.bind(this);
  }
}

app.start = (element: HTMLElement, model: Model, view: View, update: Update, options?) =>
  new Component(element, model, view, update, options);

export default app;
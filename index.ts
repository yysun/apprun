import app from './index-zero';
import { updateElement, updateElementVtree } from './vdom';
import ComponentBase from './component';

export class Component extends ComponentBase {
  protected initVdom() {
    this.updateElement =  updateElement.bind(this);
    this.updateElementVtree = updateElementVtree(this);
  }
}

app.start = (element, model, view, update, options) =>
  new Component(element, model, view, update, options);

export default app;
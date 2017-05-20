import app from './index-zero';
import { updateElement } from './vdom-html';
import ComponentBase from './component';

export class Component extends ComponentBase {
  protected initVdom() {
    this.updateElement =  updateElement.bind(this);
  }
}

app.start = (element: HTMLElement, model: Model, view: View, update: Update, options?) =>
  new Component(element, model, view, update, options);
  
export default app;
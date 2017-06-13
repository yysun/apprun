import app, { Component } from './index-zero';
import { h, render } from './vdom';

class _Component extends Component {
  render = render;
  mount(element, options?) {
    this.app.createElement = this.app.h = h
    return super.mount(element, options)
  }
}

app.createElement = app.h = h;
app.start = (element: HTMLElement, model: Model, view: View, update: Update, options:any={}) => {
  if (typeof options.global_event === 'undefined') options.global_event = true;
  const component = new _Component(model, view, update);
  component.mount(element, options);
  return component;
}

export default app;
export { _Component as Component };
import app from '../app';
import updateElement from './vdom';
import ComponentBase from '../component_base';

export default class Component extends ComponentBase {

  protected set_state(state) {
    this.state = state;
    if (state && state.view && typeof state.view === 'function') {
      state.view(this.state);
      state.view = undefined;
    } else if (this.view) {
      const html = this.view(this.state);
      if (html) updateElement(this.element, html);
    }
  }
};

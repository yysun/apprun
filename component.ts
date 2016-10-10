import app from './app';
import updateElement from './vdom'

type Model = any;
type View = (model: Model) => string;
type Action = (model: Model, ...p) => Model;
type Update = { [name: string]: Action };

export default class Component {

  private _history = [];
  private _history_idx = -1;
  private enable_history;

  get State() {
    return this.state;
  }

  private set_state(state) {
    this.state = state;
    if (this.view) {
      const html = this.view(this.state);
      if (html) updateElement(this.element, html);
    }
  }

  private push_state(state) {
    this.set_state(state);
    if (this.enable_history) {
      this._history = [...this._history, state];
      this._history_idx = this._history.length - 1;
    }
  }

  constructor(private element: HTMLElement,
    private state: any,
    private view: (any) => string,
    update: Update = {},
    options?) {

    console.assert(!!element);
    options = options || {};
    this.enable_history = !!options.history;
    if (this.enable_history) {
      app.on(options.history.prev || 'history-prev', () => {
        this._history_idx --;
        if (this._history_idx >=0) {
          this.set_state(this._history[this._history_idx]);
        }
        else {
          this._history_idx = 0;
        }
      });
      app.on(options.history.next || 'history-next', () => {
        this._history_idx ++;
        if (this._history_idx < this._history.length) {
          this.set_state(this._history[this._history_idx]);
        }
        else {
          this._history_idx = this._history.length - 1;
        }
      });
    }

    this.view = view;
    this.add_actions(update);
    this.push_state(state);
  }

  add_actions(actions) {
    Object.keys(actions).forEach(action => {
      app.on(action, (...p) => {
        this.push_state(actions[action](this.State, ...p));
      });
    });
  }
};

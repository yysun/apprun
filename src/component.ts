/**
 * AppRun Component System Implementation
 *
 * This file provides the Component class which is the foundation for:
 * 1. State Management
 *    - Maintains component state with history support
 *    - Handles state updates with async/iterator support
 *    - Supports state history navigation (prev/next)
 *    - Promise and async iterator state handling
 *
 * 2. View Rendering
 *    - Renders virtual DOM to real DOM with directives
 *    - Handles component lifecycle (mounted, rendered, unload)
 *    - Supports shadow DOM and web components
 *    - DOM removal tracking with a shared MutationObserver registry
 *    - View transition API support
 *
 * 3. Event Handling
 *    - Local and global event subscription management
 *    - Event handler registration via decorators
 *    - Action to state updates with error handling
 *    - Support for event options (delay, once, global)
 *
 * Features:
 * - Component caching for debugging
 * - Element tracking for cleanup
 * - History navigation support
 * - Global vs local event routing
 * - Async state handling with latest-pending-promise protection
 * - Memory leak prevention with shared unload tracking
 * - Component unmounting with cleanup
 * - Phase 3 concrete component field and history option typing
 *
 * Type Safety Improvements (v3.35.1):
 * - Enhanced element access with null checks and warnings
 * - Improved action validation and error handling
 * - Better error reporting in component actions
 * - Safer DOM element queries with fallback warnings
 *
 * Usage:
 * ```ts
 * class MyComponent extends Component {
 *   state = // Initial state
 *   view = state => // Return virtual DOM
 *   update = {
 *     'event': (state, ...args) => // Return new state
 *   }
 * }
 *
 * // Mount component
 * new MyComponent().mount('element-id');
 * ```
 */

import _app, { App } from './app';


import { Reflect } from './decorator'
import { State, View, Update, Action, ActionDef, ActionOptions, MountOptions, EventOptions, IApp, Element as AppRunElement, HistoryOptions } from './types';
import directive from './directive';
import { safeQuerySelector, safeGetElementById } from './type-utils';

// const componentCache = new Map();
// if (!app.find('get-components')) app.on('get-components', o => o.components = componentCache);

export const REFRESH = state => state;

const app = _app as unknown as IApp;
let tracking_id_counter = 0;
const tracking_attr = '_c';
type TrackedElement = globalThis.Element & {
  _component?: Component<any, any>;
  getAttribute?: (name: string) => string | null;
  setAttribute?: (name: string, value: string) => void;
  removeAttribute?: (name: string) => void;
};
type MountedElement = AppRunElement | null | undefined;

const tracked_elements = new Map<TrackedElement, { component: Component<any, any>, tracking_id: string }>();
let shared_observer: MutationObserver | null = null;

function getHistoryOptions(history: HistoryOptions): { prev?: string; next?: string } {
  return typeof history === 'object' && history !== null ? history : {};
}

function disconnectSharedObserverIfIdle() {
  if (tracked_elements.size === 0 && shared_observer) {
    shared_observer.disconnect();
    shared_observer = null;
  }
}

function unloadTrackedElement(el: TrackedElement) {
  const tracked = tracked_elements.get(el);
  if (!tracked) return;
  tracked_elements.delete(el);
  tracked.component.unload?.(tracked.component.state);
  disconnectSharedObserverIfIdle();
}

function ensureSharedObserver() {
  if (shared_observer || typeof MutationObserver === 'undefined' || typeof document !== 'object' || !document.body) return;
  shared_observer = new MutationObserver(changes => {
    changes.forEach(change => {
      if (change.type === 'attributes') {
        const el = change.target as TrackedElement;
        const tracked = tracked_elements.get(el);
        if (tracked && change.oldValue === tracked.tracking_id) unloadTrackedElement(el);
      } else if (change.type === 'childList') {
        Array.from(tracked_elements.keys()).forEach(el => {
          if (!document.body.contains(el)) unloadTrackedElement(el);
        });
      }
    });
  });
  shared_observer.observe(document.body, {
    childList: true, subtree: true,
    attributes: true, attributeOldValue: true, attributeFilter: [tracking_attr]
  });
}

function registerTrackedElement(component: Component<any, any>, el: TrackedElement, tracking_id: string) {
  const existing = tracked_elements.get(el);
  if (existing && existing.component !== component) unloadTrackedElement(el);
  tracked_elements.set(el, { component, tracking_id });
  ensureSharedObserver();
}

function unregisterTrackedElement(el?: TrackedElement | null) {
  if (!el) return;
  tracked_elements.delete(el);
  disconnectSharedObserverIfIdle();
}

export class Component<T = any, E = any> {
  static __isAppRunComponent = true;
  private _app = new App();
  private _actions: Array<{ name: string, fn: (...args: any[]) => void }> = [];
  private _global_events: string[] = [];
  private _state?: State<T>;
  private _history: T[] = [];
  private _history_idx = -1;
  private enable_history = false;
  private global_event = false;
  public element: MountedElement;
  public rendered?: (state: T) => void;
  public mounted?: (props: any, children: any[], state: T) => T | Promise<T> | void;
  public unload?: (state: T) => void;
  private tracking_id?: string;
  private tracking_element: TrackedElement | null = null;
  private _pending_state?: Promise<T> | null;


  private renderState(state: T, vdom = null) {
    if (!this.view) return;
    let html = vdom || this.view(state);
    app['debug'] && app.run('debug', {
      component: this,
      _: html ? '.' : '-',
      state,
      vdom: html,
      el: this.element
    });

    if (typeof document !== 'object') return;

    const el = ((typeof this.element === 'string' && this.element) ?
      safeGetElementById(this.element) || safeQuerySelector(this.element) : this.element) as TrackedElement | null;

    if (!el) {
      console.warn(`Component element not found: ${this.element}`);
      return;
    }
    if (!this.unload) {
      unregisterTrackedElement(this.tracking_element);
      this.tracking_element = null;
      el.removeAttribute && el.removeAttribute(tracking_attr);
    } else if (el['_component'] !== this || el.getAttribute(tracking_attr) !== this.tracking_id) {
      if (this.tracking_element && this.tracking_element !== el) unregisterTrackedElement(this.tracking_element);
      this.tracking_id = (++tracking_id_counter).toString(36);
      el.setAttribute(tracking_attr, this.tracking_id);
      this.tracking_element = el;
      registerTrackedElement(this, el, this.tracking_id);
    }
    el['_component'] = this;

    if (!vdom && html) {
      html = directive(html, this);
      if (this.options.transition && document && document['startViewTransition']) {
        document['startViewTransition'](() => app.render(el as HTMLElement, html, this));
      } else {
        app.render(el as HTMLElement, html, this);
      }
    }
    this.rendered && this.rendered(this.state as T);
  }

  public setState(state: T, options: ActionOptions & EventOptions
    = { render: true, history: false }) {

    const handleAsyncIterator = async (iterator: AsyncIterator<T>) => {
      try {
        while (true) {
          const { value, done } = await iterator.next();
          if (done) break;
          this.setState(value, options);
        }
      } catch (e) {
        console.error('Error in async iterator:', e);
      }
    };

    const result = state as any;
    if (result?.[Symbol.asyncIterator]) {
      // handleAsyncIterator(result[Symbol.asyncIterator]());
      this.setState(handleAsyncIterator(result[Symbol.asyncIterator]()) as any, options);
      return;
    } else if (result?.[Symbol.iterator] && typeof result.next === "function") {
      for (const value of result) {
        this.setState(value, options);
      }
      return;
    } else if (state && state instanceof Promise) {
      // Promise will not be saved or rendered
      // state will be saved and rendered when promise is resolved
      const pending_state = state;
      this._pending_state = pending_state;
      Promise.resolve(pending_state).then(v => {
        if (this._pending_state === pending_state) {
          this._pending_state = null;
          this.setState(v as T, options);
        }
      });
    } else {
      this._state = state;
      if (state == null) return;
      this._pending_state = null;
      this.state = state;
      if (options.render !== false) {
        // before render state
        if (options.transition && document && document['startViewTransition']) {
          document['startViewTransition'](() => this.renderState(state));
        } else {
          this.renderState(state);
        }
      }
      if (options.history !== false && this.enable_history) {
        this._history = [...this._history, state];
        this._history_idx = this._history.length - 1;
      }
      if (typeof options.callback === 'function') options.callback(this.state);
    }
  }

  private _history_prev = () => {
    this._history_idx--;
    if (this._history_idx >= 0) {
      this.setState(this._history[this._history_idx], { render: true, history: false });
    }
    else {
      this._history_idx = 0;
    }
  };

  private _history_next = () => {
    this._history_idx++;
    if (this._history_idx < this._history.length) {
      this.setState(this._history[this._history_idx], { render: true, history: false });
    }
    else {
      this._history_idx = this._history.length - 1;
    }
  };

  constructor(
    public state?: State<T>,
    public view?: View<T>,
    public update?: Update<T, E>,
    protected options: MountOptions = {}) {
  }

  start = (element: MountedElement = null, options?: MountOptions): Component<T, E> => {
    this.mount(element, { render: true, ...options });
    if (this.mounted && typeof this.mounted === 'function') {
      const new_state = this.mounted({}, [], this.state as T);
      (typeof new_state !== 'undefined') && this.setState(new_state as T);
    }
    return this;
  }

  public mount(element: MountedElement = null, options?: MountOptions): Component<T, E> {
    console.assert(!this.element, 'Component already mounted.')
    this.options = options = { ...this.options, ...options };
    this.element = element;
    this.global_event = options.global_event;
    this.enable_history = !!options.history;

    if (this.enable_history) {
      const history = getHistoryOptions(options.history);
      this.on((history.prev || 'history-prev') as E, this._history_prev);
      this.on((history.next || 'history-next') as E, this._history_next);
    }

    if (options.route) {
      this.update = this.update || {};
      if (!this.update[options.route]) this.update[options.route] = REFRESH;
    }

    this.add_actions();
    this.state = this.state ?? this['model'] ?? {};
    if (typeof this.state === 'function') this.state = (this.state as Function)();
    this.setState(this.state as T, { render: !!options.render, history: true });
    if (app['debug'] && app.find('debug-create-component')?.length) {
      app.run('debug-create-component', this);
    }
    return this;
  }

  is_global_event(name: string): boolean {
    return name && (
      this.global_event ||
      this._global_events.indexOf(name) >= 0 ||
      name.startsWith('#') || name.startsWith('/') || name.startsWith('@'));
  }

  add_action(name: string, action: Action<T>, options: ActionOptions = {}) {
    if (!action || typeof action !== 'function') {
      console.warn(`Component action for '${name}' is not a valid function:`, action);
      return;
    }
    if (options.global) this._global_events.push(name);
    this.on(name as any, (...p) => {

      app['debug'] && app.run('debug', {
        component: this,
        _: '>',
        event: name, p,
        current_state: this.state,
        options
      });

      try {
        const newState = action(this.state as T, ...p);

        app['debug'] && app.run('debug', {
          component: this,
          _: '<',
          event: name, p,
          newState,
          state: this.state,
          options
        });

        this.setState(newState as T, options);
      } catch (error) {
        const payload = { event: name, error, component: this, state: this.state, args: p, phase: 'component' };
        app.find('error')?.length ? app.run('error', payload) : console.error(`Error in component action '${name}':`, error);
        app['debug'] && app.run('debug', {
          component: this,
          _: '!',
          event: name, p,
          error,
          state: this.state,
          options
        });
      }
    }, options);
  }

  add_actions() {
    const actions = this.update || {};
    Reflect.getMetadataKeys(this).forEach(key => {
      if (key.startsWith('apprun-update:')) {
        const meta = Reflect.getMetadata(key, this)
        actions[meta.name] = [this[meta.key].bind(this), meta.options];
      }
    })

    const all = {};
    if (Array.isArray(actions)) {
      actions.forEach(act => {
        const [name, action, opts] = act as ActionDef<T, E>;
        const names = name.toString();
        names.split(',').forEach(n => all[n.trim()] = [action, opts])
      })
    } else {
      Object.keys(actions).forEach(name => {
        const action = actions[name];
        if (typeof action === 'function' || Array.isArray(action)) {
          name.split(',').forEach(n => all[n.trim()] = action)
        }
      })
    }

    if (!all['.']) all['.'] = REFRESH;
    Object.keys(all).forEach(name => {
      const action = all[name];
      if (typeof action === 'function') {
        this.add_action(name, action);
      } else if (Array.isArray(action)) {
        this.add_action(name, action[0], action[1]);
      }
    });
  }

  public run(event: E, ...args: any[]) {
    if (this.state instanceof Promise) {
      return Promise.resolve(this.state).then(state => {
        this.state = state;
        this.run(event, ...args)
      });
    } else {
      const name = event.toString();
      return this.is_global_event(name) ?
        app.run(name, ...args) :
        this._app.run(name, ...args);
    }
  }

  public on(event: E, fn: (...args: any[]) => void, options?: EventOptions) {
    const name = event.toString();
    this._actions.push({ name, fn });
    return this.is_global_event(name) ?
      app.on(name, fn, options) :
      this._app.on(name, fn, options);
  }

  public runAsync(event: E, ...args: any[]) {
    const name = event.toString();
    return this.is_global_event(name) ?
      app.runAsync(name, ...args) :
      this._app.runAsync(name, ...args);
  }

  public unmount() {
    unregisterTrackedElement(this.tracking_element);
    this.tracking_element = null;
    this._actions.forEach(action => {
      const { name, fn } = action;
      this.is_global_event(name) ?
        app.off(name, fn) :
        this._app.off(name, fn);
    });
  }
}

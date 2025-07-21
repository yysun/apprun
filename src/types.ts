/**
 * Core TypeScript Type Definitions
 * 
 * This file defines the fundamental types used across AppRun:
 * 1. Component Types
 *    - View: Function that renders state to VDOM
 *    - Action: Function that updates state (sync/async)
 *    - Update: Collection of actions (array or object format)
 *    - ActionDef: Tuple definition for action arrays
 * 
 * 2. Virtual DOM Types
 *    - VNode: Virtual DOM node structure with tag/props/children
 *    - VDOM: Union of possible VDOM types (false, string, VNode, array)
 *    - Element: DOM element references (HTMLElement or string selector)
 *    - TemplateResult: Lit-html template support
 * 
 * 3. Configuration Types
 *    - EventOptions: Event handler options (once, delay, transition)
 *    - ActionOptions: Action behavior options (render, history, global, callback)
 *    - MountOptions: Component mounting options (global events, routing, transitions)
 *    - AppStartOptions: Application startup configuration with lifecycle hooks
 * 
 * Features:
 * - Strong typing for component lifecycle
 * - Flexible action definition formats
 * - Comprehensive event options
 * - Integration with external libraries (lit-html)
 * - Type-safe component mounting
 * - Lifecycle hook typing
 *
 * Type Safety Improvements (v3.35.1):
 * - Enhanced generic constraints for better type inference
 * - Improved union types for VDOM flexibility
 * - Better callback typing in options
 * - Stricter typing for lifecycle methods
 *
 * Usage:
 * ```ts
 * class MyComponent extends Component<State, Events> {
 *   view: View<State>;
 *   update: Update<State, Events>;
 * }
 * 
 * // Type-safe action definitions
 * const update: Update<State> = {
 *   'event': (state: State, ...args) => newState
 * };
 * ```
 */

import { TemplateResult } from 'lit-html';
export type Element = HTMLElement | string;
export type VNode = {
  tag: string | Function,
  props: {},
  children: Array<VNode | string>
}
export type VDOM = false | string | VNode | Array<VNode | string> | TemplateResult;
export type View<T> = (state: T) => VDOM | void;
export type Action<T> = (state: T, ...p: any[]) => T | Promise<T> | void;
export type ActionDef<T, E> = (readonly [E, Action<T>, {}?]);
export type Update<T, E = any> = ActionDef<T, E>[] | { [name: string]: Action<T> | {}[] } | (E | Action<T> | {})[];
export type ActionOptions = {
  render?: boolean, history?, global?: boolean;
  callback?: (state: any) => void;
};
export type EventOptions = {
  once?: boolean;
  transition?: boolean;
  delay?: number;
} | any;
export type MountOptions = {
  render?: boolean, history?, global_event?: boolean, route?: string;
  transition?: boolean;
};

export type AppStartOptions<T> = {
  render?: boolean;
  history?;
  transition?: boolean;
  route?: string;
  rendered?: (state: T) => void
  mounted?: (props: any, children: any, state: T) => T
};
export type Router = (url: string, ...args: any[]) => any;

export interface IApp {
  // Event system methods
  on(name: string, fn: (...args: any[]) => any, options?: EventOptions): void;
  off(name: string, fn: (...args: any[]) => any): void;
  run(name: string, ...args: any[]): number;
  runAsync(name: string, ...args: any[]): Promise<any[]>;
  once(name: string, fn: (...args: any[]) => any, options?: EventOptions): void;
  find(name: string): any;

  /** @deprecated Use runAsync() instead */
  query(name: string, ...args: any[]): Promise<any[]>;
}

export interface IComponent<T = any, E = any> {
  // Core properties
  readonly element: Element;
  readonly state: T;
  view?: View<T>;
  update?: Update<T, E>;

  // Lifecycle hooks
  mounted?: (props: any, children: any[], state: T) => T | void;
  rendered?: (state: T) => void;
  unload?: (state: T) => void;

  // Component lifecycle methods
  mount(element?: Element, options?: MountOptions): IComponent<T, E>;
  start(element?: Element, options?: MountOptions): IComponent<T, E>;
  unmount(): void;

  // State management
  setState(state: T, options?: ActionOptions & EventOptions): void;

  // Event system
  on(event: E, fn: (...args: any[]) => void, options?: EventOptions): void;
  run(event: E, ...args: any[]): any;
  runAsync(event: E, ...args: any[]): Promise<any[]>;

  /** @deprecated Use runAsync() instead */
  query(event: E, ...args: any[]): Promise<any[]>;

  // Action management
  add_action(name: string, action: Action<T>, options?: ActionOptions): void;
  is_global_event(name: string): boolean;
}

export type CustomElementOptions = {
  render?: boolean;
  shadow?: boolean;
  history?: boolean;
  global_event?: boolean;
  observedAttributes?: string[];
};

export interface IAppRun extends IApp {
  start<T, E = any>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T, E>,
    options?: AppStartOptions<T>): IComponent<T, E>;

  h(tag: string | Function, props?: any, ...children: any[]): VNode | VNode[];
  createElement(tag: string | Function, props?: any, ...children: any[]): VNode | VNode[];
  render(element: Element | ShadowRoot, node: VNode, component?: {}): void;
  Fragment(props: any, ...children: any[]): any[];
  route: Router;
  webComponent(name: string, componentClass: any, options?: CustomElementOptions): void;
  safeHTML(html: string): any[];
  use_render(render: any, mode?: 0 | 1): void;
  use_react(React: any, ReactDOM: any): void;
  version: string;
  basePath?: string;
  addComponents: (element: Element | string, components: ComponentRoute) => void;
}

export type ComponentRoute = {
  [route: string]: any;
};

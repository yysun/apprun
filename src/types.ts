/**
 * Core TypeScript Type Definitions
 * 
 * This file defines the fundamental types used across AppRun:
 * 1. Component Types
 *    - View: Function that renders state to VDOM
 *    - Action: Function that updates state (sync/async/generator)
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
 * - Added support for async generator and generator functions in Action types
 *
 * Usage:
 * ```ts
 * class MyComponent extends Component<State, Events> {
 *   view: View<State>;
 *   update: Update<State, Events>;
 * }
 * 
 * // Type-safe action definitions with async generators
 * const update: Update<State> = {
 *   'event': (state: State, ...args) => newState,
 *   'stream-event': async function* (state: State, ...args) {
 *     yield { ...state, loading: true };
 *     const data = await fetchData();
 *     yield { ...state, data, loading: false };
 *   }
 * };
 * ```
 */

import { TemplateResult } from 'lit-html';
export type Element = HTMLElement | string;
export type State<T> = T | Promise<T> | (() => T) | (() => Promise<T>);
export type VNode = {
  tag: string | Function,
  props: {},
  children: Array<VNode | string>
}
export type VDOM = false | string | VNode | Array<VNode | string> | TemplateResult;
export type View<T> = (state: T) => VDOM | void;
export type Action<T> = (state: T, ...p: any[]) => T | Promise<T> | void | AsyncGenerator<T> | Generator<T>;
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

export type CustomElementOptions = {
  render?: boolean;
  shadow?: boolean;
  history?: boolean;
  global_event?: boolean;
  observedAttributes?: string[];
};

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

  start<T, E = any>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T, E>,
    options?: AppStartOptions<T>): any;

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

// Define what constitutes a mountable component
interface ComponentLike {
  mount(element?: Element | string, options?: any): any;
}

// Define component constructor type
type ComponentConstructor<T = any> = new (
  state?: T,
  view?: any,
  update?: any,
  options?: any
) => ComponentLike;

// Enhanced ComponentRoute type with clear distinctions
export type ComponentRoute = {
  [route: string]:
  | ComponentLike                                    // Component instance
  | ComponentConstructor                             // Component class constructor
  | (() => ComponentLike | ComponentConstructor | Promise<ComponentLike | ComponentConstructor>) // Factory function
  | ((...args: any[]) => any)                       // Event handler function
};

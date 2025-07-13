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
export type Update<T, E = string> = ActionDef<T, E>[] | { [name: string]: Action<T> | {}[] } | (E | Action<T> | {})[];
export type ActionOptions = {
  render?: boolean, history?, global?: boolean;
  callback?: (state) => void;
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

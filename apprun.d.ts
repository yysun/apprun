/**
 * AppRun TypeScript Declaration File
 * 
 * This file provides TypeScript declarations for the AppRun framework:
 * 1. Core Framework Types
 *    - Component lifecycle (View, Action, Update)
 *    - Virtual DOM (VNode, VDOM)
 *    - Event system with comprehensive options
 * 
 * 2. Application Interfaces
 *    - IApp: Main framework interface
 * 
 * 3. Configuration Options
 *    - EventOptions: Event handling configuration
 *    - ActionOptions: Action behavior settings
 *    - MountOptions: Component mounting configuration
 *    - CustomElementOptions: Web component settings
 * 
 * 4. Integration Support
 *    - React integration types
 *    - Lit-html TemplateResult support
 *    - JSX namespace declarations
 *    - State management with createState
 * 
 * Updated in v3.35.1:
 * - Consolidated types from types.ts implementation
 * - Enhanced type safety with better generic constraints
 * - Improved lifecycle hook typing with proper signatures
 * - Added routing system types with ComponentRoute
 * - Better integration with external libraries
 * - Comprehensive options typing matching implementation
 * - Added proper deprecation warnings
 * - Enhanced error handling and validation
 * - Added support for async generator and generator functions in Action types
 */

import { TemplateResult } from 'lit-html';

declare module 'apprun' {

  export type Element = HTMLElement | string;

  export type VNode = {
    tag: string | Function,
    props: {},
    children: Array<VNode | string>
  };

  export type VDOM = false | string | VNode | Array<VNode | string> | TemplateResult;
  export type View<T> = (state: T) => VDOM | void;
  export type Action<T> = (state: T, ...p: any[]) => T | Promise<T> | void | AsyncGenerator<T> | Generator<T>;
  export type ActionDef<T, E> = (readonly [E, Action<T>, {}?]);
  export type Update<T, E = any> = ActionDef<T, E>[] | { [name: string]: Action<T> | {}[] } | (E | Action<T> | {})[];
  export type Router = (url: string, ...args: any[]) => any;

  export type EventOptions = {
    once?: boolean;
    transition?: boolean;
    delay?: number;
  } | any;

  export type ActionOptions = {
    render?: boolean;
    history?;
    global?: boolean;
    callback?: (state: any) => void;
  };

  export type MountOptions = {
    render?: boolean;
    history?;
    global_event?: boolean;
    route?: string;
    transition?: boolean;
  };

  export type AppStartOptions<T> = {
    render?: boolean;
    history?;
    transition?: boolean;
    route?: string;
    rendered?: (state: T) => void;
    mounted?: (props: any, children: any, state: T) => T;
  };

  export type CustomElementOptions = {
    render?: boolean;
    shadow?: boolean;
    history?: boolean;
    global_event?: boolean;
    observedAttributes?: string[];
  };

  export type ComponentRoute = {
    [route: string]: any;
  };

  export interface IApp {
    // Event system methods
    on(name: string, fn: (...args: any[]) => any, options?: EventOptions): void;
    once(name: string, fn: (...args: any[]) => any, options?: EventOptions): void;
    off(name: string, fn: (...args: any[]) => any): void;
    find(name: string): any;
    run(name: string, ...args: any[]): number;
    runAsync(name: string, ...args: any[]): Promise<any[]>;

    /** @deprecated Use runAsync() instead. query() will be removed in a future version. */
    query(name: string, ...args: any[]): Promise<any[]>;

    start<T, E = any>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T, E>,
      options?: AppStartOptions<T>): Component<T, E>;

    h(tag: string | Function, props?: any, ...children: any[]): VNode | VNode[];
    createElement(tag: string | Function, props?: any, ...children: any[]): VNode | VNode[];
    render(element: Element | ShadowRoot, node: VNode, component?: {}): void;
    Fragment(props: any, ...children: any[]): any[];

    route: Router;
    basePath?: string;
    addComponents: (element: Element | string, components: ComponentRoute) => void;

    webComponent(name: string, componentClass: any, options?: CustomElementOptions): void;
    safeHTML(html: string): any[];
    use_render(render: any, mode?: 0 | 1): void;
    use_react(React: any, ReactDOM: any): void;
    version: string;
  }

  export class Component<T = any, E = any> {
    constructor(state?: T, view?: View<T>, update?: Update<T, E>, options?: any);
    readonly element: Element;
    readonly state: T;
    view?: View<T>;
    update?: Update<T, E>;

    // Lifecycle hooks
    rendered?: (state: T) => void;
    mounted?: (props: any, children: any[], state: T) => T | void;
    unload?: (state: T) => void;

    // Component lifecycle methods
    mount(element?: Element, options?: MountOptions): Component<T, E>;
    start(element?: Element, options?: MountOptions): Component<T, E>;
    unmount(): void;

    // State management
    setState(state: T, options?: ActionOptions & EventOptions): void;

    // Event system
    on(event: E, fn: (...args: any[]) => void, options?: EventOptions): void;
    run(event: E, ...args: any[]): any;
    runAsync(event: E, ...args: any[]): Promise<any[]>;

    /** @deprecated Use runAsync() instead. query() will be removed in a future version. */
    query(event: E, ...args: any[]): Promise<any[]>;

    // Action management
    add_action(name: string, action: Action<T>, options?: ActionOptions): void;
    is_global_event(name: string): boolean;
  }

  export function on<E>(name?: E, options?: EventOptions): any;
  export function customElement(name: string, options?: CustomElementOptions):
    <T extends { new(...args: any[]): {} }>(constructor: T) => T;

  // Deprecated exports (kept for backward compatibility)
  /** @deprecated Use on() instead */
  export function update<E>(name?: E, options?: EventOptions): any;
  /** @deprecated Use on() instead */
  export function event<E>(name?: E, options?: EventOptions): any;

  export const app: IApp;
  export default app;
  export const App: IApp;

  export const ROUTER_EVENT: string;
  export const ROUTER_404_EVENT: string;
  export const safeHTML: (html: string) => any[];
  export function Fragment(props: any, ...children: any[]): any[];
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'apprun/react' {
  import { Component } from 'apprun';
  export default function toReact<T = any>(componentClass: Component<T>): Function;
}

declare module 'apprun/createState' {
  type Draft<T> = T;
  export default function createState<T = any>(
    state: T,
    updater: (draft: Draft<T>) => void
  ): Promise<T> | T;
}
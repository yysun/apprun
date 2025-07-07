declare module 'apprun' {

  export type Element = HTMLElement | string;

  export type VNode = {
    tag: string,
    props: {},
    children: Array<VNode | string>
  };
  export type VDOM = false | string | VNode | Array<VNode | string>;
  export type View<T> = (state: T) => VDOM | void;
  export type Action<T> = (state: T, ...p: any[]) => T | Promise<T> | void;
  export type ActionDef<T, E> = (readonly [E, Action<T>, {}?]);
  export type Update<T, E = any> = ActionDef<T, E>[] | { [name: string]: Action<T> | {}[] } | (E | Action<T> | {})[];
  export type Route = (url: string, ...args: any[]) => any;
  export type EventOptions<T = any> = {
    once?: boolean;
    transition?: boolean;
    delay?: number;
  } | any;
  export type CustomElementOptions = {
    render?: boolean;
    shadow?: boolean;
    history?: boolean;
    global_event?: boolean;
    observedAttributes?: string[];
  };

  export type MountOptions = {
    render?: boolean, history?, global_event?: boolean,
    transition?: boolean;
    route?: string
  };

  export type AppStartOptions<T> = {
    render?: boolean;
    transition?: boolean;
    history?;
    route?: string;
    rendered?: (state: T) => void
  };

  export interface IApp {
    start<T, E = any>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T, E>,
      options?: AppStartOptions<T>): Component<T, E>;
    on(name: string, fn: (...args: any[]) => void, options?: any): void;
    once(name: string, fn: (...args: any[]) => void, options?: any): void;
    off(name: string, fn: (...args: any[]) => void): void;
    find(name: string): any;
    run(name: string, ...args: any[]): number;
    query(name: string, ...args): Promise<any[]>; // obsolete
    runAsync(name: string, ...args): Promise<any[]>;
    h(tag: string | Function, ...children: any[]): VNode | VNode[];
    createElement(tag: string | Function, ...children: any[]): VNode | VNode[];
    render(element: Element | string, node: VDOM): void;
    Fragment(props: any[], ...children: any[]): any[];
    route?: Route;
    webComponent(name: string, componentClass, options?: CustomElementOptions): void;
    safeHTML(html: string): any[];
    use_render(render, mode?: 0 | 1);
    use_react(React, ReactDOM);
    public use_prettyLink: () => void;
  }

  export class Component<T = any, E = any> {
    constructor(state?: T, view?: View<T>, update?: Update<T, E>);
    readonly state: T;
    setState(state: T, options?: { render?: boolean, history?: boolean }): void;
    mount(element?: Element | string, options?: MountOptions): Component<T, E>;
    start(element?: Element | string, options?: MountOptions): Component<T, E>;
    on(name: E, fn: (...args: any[]) => void, options?: any): void;
    run(name: E, ...args: any[]): number;
    query(name: string, ...args): Promise<any[]>; // obsolete
    runAsync(name: string, ...args): Promise<any[]>;
    rendered: (state: T) => void;
    mounted: (props: any, children: any[], state: T) => T | void;
    unmount: () => void;
    unload: (state: T) => void;
    render(element: HTMLElement, node: any): void;
  }

  export function on<E>(name?: E, options?: EventOptions): any;
  // obsolete
  export function update<E>(name?: E, options?: EventOptions): any;
  export function event<E>(name?: E, options?: EventOptions): any;
  export function customElement(name: string, options?: CustomElementOptions):
    <T extends { new(...args: any[]): {} }>(constructor: T) => T;

  export const app: IApp
  export default app;
  export const App: IApp;

  export const ROUTER_EVENT: string;
  export const ROUTER_404_EVENT: string;
  export const safeHTML;
  export function Fragment (props, ...children): [];
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'apprun/react' {
  import { Component } from 'apprun';
  export default function toReact(componentClass: Component): Function;
}
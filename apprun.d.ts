declare module 'apprun' {

  export type Element = HTMLElement | string;

  export type VNode = {
    tag: string,
    props: {},
    children: Array<VNode | string>
  };
  export type VDOM = false | string | VNode | Array<VNode | string>;
  export type View<T> = (state: T, props?) => VDOM | void;
  export type Action<T> = (state: T, ...p: any[]) => T | Promise<T> | void;
  export type ActionDef<T, E> = (readonly [E, Action<T>, {}?]);
  export type Update<T, E = any> = ActionDef<T, E>[] | { [name: string]: Action<T> | {}[] } | (E | Action<T> | {})[];
  export type Route = (url: string, ...args: any[]) => any;
  export type EventOptions<T = any> = {
    once?: boolean;
    delay?: number;
  };
  export type CustomElementOptions = {
    render?, shadow?, history?, global_event?: boolean;
    observedAttributes?: string[]
  };

  export type MountOptions = {
    render?: boolean, history?, global_event?: boolean;
  };

  export interface IApp {
    start<T, E = any>(element?: Element, model?: T, view?: View<T>, update?: Update<T, E>,
      options?: { history?: any, rendered?: (state: T) => void }): Component<T, E>;
    on(name: string, fn: (...args: any[]) => void, options?: any): void;
    once(name: string, fn: (...args: any[]) => void, options?: any): void;
    off(name: string, fn: (...args: any[]) => void): void;
    find(name: string): any;
    run(name: string, ...args: any[]): number;
    h(tag: string | Function, props?: any[], ...children: any[]): VNode | VNode[];
    createElement(tag: string | Function, props?: any[], ...children: any[]): VNode | VNode[];
    render(element: HTMLElement, node: VNode): void;
    Fragment(props: any[], ...children: any[]): any[];
    route?: Route;
    webComponent(name: string, componentClass, options?: CustomElementOptions): void;
  }

  export class Component<T = any, E = any> {
    constructor(state?: T, view?: View<T>, update?: Update<T, E>);
    readonly state: T;
    setState(state: T, options?: { render?: boolean, history?: boolean }): void;
    mount(element?: Element, options?: MountOptions): Component<T, E>;
    start(element?: Element, options?: MountOptions): Component<T, E>;
    on(name: E, fn: (...args: any[]) => void, options?: any): void;
    run(name: E, ...args: any[]): number;
    rendered: (state: T, props?: any[]) => void;
    mounted: (props: any, children: any[], state: T) => T | void;
    unmount: () => void;
    unload: (state: T) => void;
    render(element: HTMLElement, node: any): void;
  }

  export type StatelessComponent<T = {}> = (args: T) => VNode | void;

  export function on<E>(name?: E, options?: EventOptions): any;
  // obsolete
  export function update<E>(name?: E, options?: EventOptions): any;
  export function event<E>(name?: E, options?: EventOptions): any;
  export function customElement(name: string, options?: CustomElementOptions):
    <T extends { new(...args: any[]): {} }>(constructor: T) => T;

  export const app: IApp
  export default app;

  export const ROUTER_EVENT: string;
  export const ROUTER_404_EVENT: string;

  export function Fragment (props, ...children): [];
}

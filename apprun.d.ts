declare module 'apprun' {

  export type Element = HTMLElement | string;

  export type VNode = {
    tag: string,
    props: {},
    children: Array<VNode|string>
  };

  export type View<T> = (state: T, props?) => string | VNode | VNode[] | void;
  export type Action<T> = (state: T, ...p: any[]) => T | Promise<T> | void;
  export type ActionDef<T, E> = (readonly [E, Action<T>, {}?]);
  export type Update<T, E = any> = ActionDef<T, E>[] | { [name: string]: Action<T> | {}[] } | (E | Action<T> | {})[];
  export type Route = (url: string, ...args: any[]) => any;
  export type EventOption = {
    render?: boolean, history?, global?: boolean;
    callback?: (state) => void
  };

  export interface IApp {
    start<T, E=any>(element?: Element, model?: T, view?: View<T>, update?: Update<T, E>,
      options?: { history?, rendered?: (state: T) => void }): Component<T, E>;
    on(name: string, fn: (...args: any[]) => void, options?: any): void;
    once(name: string, fn: (...args: any[]) => void, options?: any): void;
    off(name: string, fn: (...args: any[]) => void): void;
    run(name: string, ...args: any[]): number;
    createElement(tag: string | Function, props?, ...children): VNode | VNode[];
    render(element: HTMLElement, node: VNode): void;
    Fragment(props, ...children): any[];
    route?: Route;
  }

  export class Component<T=any, E=any> {
    constructor(state?: T, view?: View<T>, update?: Update<T, E>);
    readonly state: T;
    setState(state: T, options?: { render?: boolean, history?: boolean }): void;
    mount(element?: Element, options?: { render?: boolean, history?, global_event?: boolean }): Component<T>;
    start(element?: Element, options?: { render?: boolean, history?, global_event?: boolean }): Component<T>;
    on(name: E, fn: (...args: any[]) => void, options?: any): void;
    run(name: E, ...args: any[]): number;
    rendered: (state: T, props?) => void;
    mounted: (props: any, children?) => void;
    unmount: () => void;
    unload: () => void;
    render(element: HTMLElement, node: any): void;
  }

  export type StatelessComponent<T={}> = (args: T) => VNode | void;

  export function on<E>(name?: E, options?: EventOption);
  // obsolete
  export function update<E>(name?: E, options?: EventOption);
  export function event<E>(name?: E, options?: EventOption);

  export const app: IApp
  export default app;

  export const ROUTER_EVENT: string;
  export const ROUTER_404_EVENT: string;
}

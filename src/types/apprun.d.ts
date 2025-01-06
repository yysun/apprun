declare type VNode = {
  tag: string;
  props?: Record<string, any>;
  children?: Array<VNode | string | number>;
} | string | number;

declare type VDOM = VNode | VNode[];

declare type View<T = any> = (state: T) => VDOM | void;
declare type Action<T = any> = (state: T, ...p: any[]) => T | void | Promise<T>;
declare type ActionDef<T = any> = [Action<T>, object?];
declare type Update<T = any> = { [name: string]: Action<T> | ActionDef<T> | Array<Action<T> | ActionDef<T>> };

declare interface IApp {
  start<T>(element?: Element | string | null, model?: T, view?: View<T>, update?: Update<T>, options?: AppStartOptions): Component<T>;
  on(name: string, fn: (...args: any[]) => void, options?: any): void;
  run(name: string, ...args: any[]): void;
  createElement(tag: string | Function, props?: any, ...children: any[]): VNode;
  render(element: Element, node: VNode): void;
}

declare interface Component<T = any> {
  readonly state: T;
  setState(state: T, options?: any): void;
  mount(element?: Element | string | null, options?: any): Component<T>;
  start(element?: Element | string | null, options?: any): Component<T>;
  run(name: string, ...args: any[]): void;
  rendered?: (state: T) => void;
  view?: View<T>;
  update?: Update<T>;
  element?: Element;
}

declare interface CustomElementOptions {
  render?: boolean;
  shadow?: boolean;
  history?: boolean | { prev: string; next: string };
  global_event?: boolean;
  route?: string;
}

declare interface AppStartOptions extends CustomElementOptions {
  render?: boolean;
  history?: boolean | { prev: string; next: string };
  global_event?: boolean;
  route?: string;
}

declare interface Route {
  (url: string): void;
  push(url: string, notify?: boolean): void;
}

declare const app: IApp;
declare function on<T = any>(name?: string, options?: any): (target: any, key: string) => void;
declare function Component<T = any>(options?: any): (constructor: Function) => void;

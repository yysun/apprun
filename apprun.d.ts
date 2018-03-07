declare module 'apprun' {
  export type IModel = any;
  export type IView = (state: IModel) => string | Function | void;
  export type IAction = (state: IModel, ...p: any[]) => IModel;
  export type IUpdate = { [name: string]: IAction | {}[] | void; };

  export type Element = HTMLElement | string;

  export type VNode = {
    tag: string,
    props: {},
    children: Array<VNode | string>
  }

  export class App {
    start(element: Element, model: IModel, view: IView, update: IUpdate, options?: { history }): void;
    on(name: string, fn: (...args) => void, options?: any): void;
    run(name: string, ...args: any[]): void;
    on(name: string, fn: (...args) => void, options?: any): void;
    run(name: string, ...args: any[]): void;
    createElement(tag: string | Function, props, ...children): any;
    render(element: HTMLElement, node: VNode): void;
  }
  export class Component {
    constructor(state?: IModel, view?: IView, update?: IUpdate);
    state: any;
    setState(state: any, options?: { render?: boolean, history?: boolean }): void;
    mount(element?: Element, options?: { render?: boolean, history?, global_event?: boolean }): Component;
    start(element?: Element, options?: { render?: boolean, history?, global_event?: boolean }): Component;
    on(name: string, fn: (...args) => void, options?: any): void;
    run(name: string, ...args: any[]): void;
  }

  export function on(name?: string, options?: { render?: boolean, history?: boolean });
  export function update(name?: string, options?: { render?: boolean, history?: boolean });
  export const app: App
  export default app;

  export type View<T> = (state: T) => string | Function | void;
  export type Action<T> = (state: T, ...p: any[]) => T | Promise<T>;
  export type Update<T> = { [name: string]: Action<T> | {}[] | void; };

  export interface IComponent<T> {
    readonly state: T;
    view: View<T>;
    update?: Update<T>;
  }
}
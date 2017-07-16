declare module 'apprun' {
  export type Model = any;
  export type View = (state: Model) => string | Function;
  export type Action = (state: Model, ...p: any[]) => Model;
  export type Update = {
    [name: string]: Action;
  };

  export type Element = HTMLElement | string;
  
  export type VNode = {
    tag: string,
    props: {},
    children: Array<VNode | string>
  }

  export class App {
    start(element: HTMLElement, model: Model, view: View, update: Update, options?: any): void;
    on(name: string, fn: (...args) => void, options?: any): void;
    run(name: string, ...args: any[]): void;

    createElement(tag: string | Function, props: {}, ...children): any;
    render(element: HTMLElement, node: VNode): void;
  }
  export class Component extends App {
    constructor(state?: Model, view?: View, update?: Update, options?: {});
    setState(state: any): void;
    mount(element?: Element, options?: {}): Component;
    start(element?: Element, options?: {}): Component;
  }

  export const app: App
  export default app;
}
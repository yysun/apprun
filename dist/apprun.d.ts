declare type Model = any;
declare type View = (model: Model) => string;
declare type Action = (model: Model, ...p: any[]) => Model;
declare type Update = {
    [name: string]: Action;
};
declare class App {
    start: (element: HTMLElement, model: Model, view: View, update: Update, options?) => void;
    on(name: string, fn: (...args) => void, options?: any): void;
    run(name: string, ...args): void;
}
declare let app: App;
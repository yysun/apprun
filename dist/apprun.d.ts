declare type Model = any;
declare type View = (model: Model) => string | Function;
declare type Action = (model: Model, ...p: any[]) => Model;
declare type Update = {
    [name: string]: Action;
};
declare class App {
    start: (element: HTMLElement, model: Model, view: View, update: Update, options?) => void;
    on(name: string, fn?: Function, options?: any): any;
    run(name: string, ...args): any;
}
declare let app: App;
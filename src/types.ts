export type VNode = {
  tag: string | Function,
  props: {},
  children: Array<VNode|string>
}
export type VDOM = string | VNode | Array<VNode | string>;
export type View<T> = (state: T) => VDOM | void;
export type Action<T> = (state: T, ...p: any[]) => T | Promise<T>;
export type Update<T> = { [name: string]: Action<T> | {}[] | void; };
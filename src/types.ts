export type VNode = {
  tag: string | Function,
  props: {},
  children: Array<VNode|string>
}
export type VDOM = string | VNode | Array<VNode | string>;
export type View<T> = (state: T, props?) => VDOM | void;
export type Action<T> = (state: T, ...p: any[]) => T | Promise<T> | void;
export type ActionDef<T, E> = [E, Action<T>, {}?]
export type Update<T, E = any> = ActionDef<T, E>[] | { [name: string]: Action<T> | {}[] };
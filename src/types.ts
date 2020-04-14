export type Element = HTMLElement | string;

export type VNode = {
  tag: string | Function,
  props: {},
  children: Array<VNode|string>
}
export type VDOM = false | string | VNode | Array<VNode | string>;
export type View<T> = (state: T, props?) => VDOM | void;
export type Action<T> = (state: T, ...p: any[]) => T | Promise<T> | void;
export type ActionDef<T, E> = (readonly [E, Action<T>, {}?]);
export type Update<T, E = string> = ActionDef<T, E>[] | { [name: string]: Action<T> | {}[] } | (E | Action<T> | {})[];
export type ActionOptions = {
  render?: boolean, history?, global?: boolean;
  callback?: (state) => void
};
export type EventOptions = {
  once?: boolean;
  delay?: number;
};
export type MountOptions = {
  render?: boolean, history?, global_event?: boolean, route?: string
};

export type AppStartOptions<T> = {
  render?: boolean;
  history?;
  route?: string;
  rendered?: (state: T) => void
};
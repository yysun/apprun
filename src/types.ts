import { TemplateResult } from 'lit-html';
export type Element = HTMLElement | string;
export type VNode = {
  tag: string | Function,
  props: {},
  children: Array<VNode | string>
}
export type VDOM = false | string | VNode | Array<VNode | string> | TemplateResult;
export type View<T> = (state: T) => VDOM | void;
export type Action<T> = (state: T, ...p: any[]) => T | Promise<T> | void;
export type ActionDef<T, E> = (readonly [E, Action<T>, {}?]);
export type Update<T, E = string> = ActionDef<T, E>[] | { [name: string]: Action<T> | {}[] } | (E | Action<T> | {})[];
export type ActionOptions = {
  render?: boolean, history?, global?: boolean;
  callback?: (state) => void;
};
export type EventOptions = {
  once?: boolean;
  transition?: boolean;
  delay?: number;
} | any;
export type MountOptions = {
  render?: boolean, history?, global_event?: boolean, route?: string;
  transition?: boolean;
};

export type AppStartOptions<T> = {
  render?: boolean;
  history?;
  transition?: boolean;
  route?: string;
  rendered?: (state: T) => void
  mounted?: (props:any, children:any, state: T) => T
};
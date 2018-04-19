export type VNode = {
  tag: string,
  props: {},
  children: Array<VNode|string>
}

export type View<T> = (state: T) => string | VNode | Array<VNode|string> | void;
export type Action<T> = (state: T, ...p: any[]) => T | Promise<T>;
export type Update<T> = { [name: string]: Action<T> | {}[] | void; };
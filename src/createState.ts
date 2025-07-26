import { produce, Draft } from 'immer';

export function createState<T = unknown>(
  fn: (draft: Draft<T>, ...args: any[]) => void
): (state: T, ...args: any[]) => T {
  return (state: T, ...args: any[]): T => {
    return produce(state, (draft) => {
      fn(draft, ...args);
    });
  };
}

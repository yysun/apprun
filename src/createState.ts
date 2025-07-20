import type { Draft } from 'immer';

export async function createState<T>(
  state: T,
  updater: (draft: Draft<T>) => void
): Promise<T> {
  let produce: typeof import('immer').produce;
  try {
    // dynamic ESM import
    const mod = await import('immer');
    produce = mod.produce;
  } catch {
    throw new Error(
      "immer is not installed. Please run: npm install immer"
    );
  }

  return produce(state, updater);
}

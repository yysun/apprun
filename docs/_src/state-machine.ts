export type Transition<T = any> = (state?: T) => void;
export type EventStateTransition<E, S> = [E, S, Transition];
export type StateMachine<S extends string, E> = {
  [key in S]: EventStateTransition<E, S>[];
};

export const find_transition = <S extends string, E>(
  state_machine: StateMachine<S, E>,
  state: S,
  event: E
): { next_state?: S, transition?: Transition } => {
  const current_state = state_machine[state];
  if (!current_state) throw new Error(`No state: ${current_state} found in state machine`);
  const event_tuple = current_state.find(s => s[0] === event);
  return event_tuple ? {
    next_state: event_tuple[1],
    transition: event_tuple[2]
  } : {}
};

/**
 * Tests for Generic Type Parameter Defaults
 * 
 * This test validates that changing generic defaults from `any` to `unknown`
 * maintains backward compatibility while improving type safety.
 */

import { Component, app } from '../src/apprun';
import { createState } from '../src/createState';

describe('Generic Type Parameter Defaults', () => {

  it('should work with Component without explicit type parameters', () => {
    // This should work with unknown defaults - component should still function
    class TestComponent extends Component {
      state = { count: 0 };
      view = (state) => `Count: ${state.count}`;
      update = {
        '+1': (state) => ({ ...state, count: state.count + 1 })
      };
    }

    const component = new TestComponent();
    expect(component).toBeInstanceOf(Component);
    expect(component.state).toEqual({ count: 0 });
  });

  it('should work with Component with explicit type parameters', () => {
    // This should continue to work exactly as before
    interface State {
      count: number;
    }
    
    type Events = '+1' | '-1';

    class TypedComponent extends Component<State, Events> {
      state = { count: 0 };
      view = (state: State) => `Count: ${state.count}`;
      update = {
        '+1': (state: State) => ({ ...state, count: state.count + 1 }),
        '-1': (state: State) => ({ ...state, count: state.count - 1 })
      };
    }

    const component = new TypedComponent();
    expect(component).toBeInstanceOf(Component);
    expect(component.state).toEqual({ count: 0 });
  });

  it('should work with Component using explicit any types', () => {
    // Users should still be able to explicitly use any if needed
    class AnyComponent extends Component<any, any> {
      state = { anything: 'goes' };
      view = (state) => `State: ${JSON.stringify(state)}`;
      update = {
        'set': (state, newState) => newState
      };
    }

    const component = new AnyComponent();
    expect(component).toBeInstanceOf(Component);
    expect(component.state).toEqual({ anything: 'goes' });
  });

  it('should work with createState without explicit type parameters', () => {
    // This should work with unknown defaults
    const increment = createState((draft) => {
      draft.count = (draft.count || 0) + 1;
    });

    const initialState = { count: 0 };
    const newState = increment(initialState);
    expect(newState.count).toBe(1);
    expect(initialState.count).toBe(0); // Original should be unchanged (immutable)
  });

  it('should work with createState with explicit type parameters', () => {
    // This should continue to work exactly as before
    interface CounterState {
      count: number;
    }

    const increment = createState<CounterState>((draft) => {
      draft.count += 1;
    });

    const initialState: CounterState = { count: 0 };
    const newState = increment(initialState);
    expect(newState.count).toBe(1);
    expect(initialState.count).toBe(0);
  });

  it('should work with app.start without explicit type parameters', () => {
    // Mock DOM element for testing
    const mockElement = document.createElement('div');
    document.body.appendChild(mockElement);

    try {
      // This should work with unknown defaults
      const component = app.start(mockElement, 
        { message: 'Hello' }, 
        (state) => `Message: ${state.message}`,
        { 
          'update': (state, newMessage) => ({ ...state, message: newMessage })
        }
      );

      expect(component).toBeInstanceOf(Component);
      expect(component.state).toEqual({ message: 'Hello' });
    } finally {
      document.body.removeChild(mockElement);
    }
  });

  it('should work with app.start with explicit type parameters', () => {
    // Mock DOM element for testing
    const mockElement = document.createElement('div');
    document.body.appendChild(mockElement);

    try {
      interface AppState {
        message: string;
      }

      type AppEvents = 'update' | 'reset';

      const component = app.start<AppState, AppEvents>(mockElement,
        { message: 'Hello' },
        (state: AppState) => `Message: ${state.message}`,
        {
          'update': (state: AppState, newMessage: string) => ({ ...state, message: newMessage }),
          'reset': (state: AppState) => ({ ...state, message: '' })
        }
      );

      expect(component).toBeInstanceOf(Component);
      expect(component.state).toEqual({ message: 'Hello' });
    } finally {
      document.body.removeChild(mockElement);
    }
  });

});
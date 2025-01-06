/**
 * Tests for generator function support in AppRun components.
 * Verifies that generator functions can be used as event handlers
 * and properly yield multiple state updates.
 */

import { Component } from '../src/apprun';

describe('Component', () => {

  it('should support generator function as event handler', async () => {

    const spy = jest.fn();

    function* changeState() {
      yield 1;
      yield 2;
      yield 3;
    }

    class Test extends Component {
      state = 0;
      view = spy;
      update = { changeState };
    }
    const component = new Test().start() as any;
    component.run('changeState');
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[0][0]).toBe(0);
    expect(spy.mock.calls[1][0]).toBe(1);
    expect(spy.mock.calls[2][0]).toBe(2);
    expect(spy.mock.calls[3][0]).toBe(3);
    expect(component.state).toEqual(3);
  });


  it('should support async generator function as event handler', async () => {

    const spy = jest.fn();

    async function* changeState() {
      yield 1;
      yield 2;
      yield 3;
    }

    class Test extends Component {
      state = 0;
      view = spy;
      update = { changeState };
    }
    const component = new Test().start() as any;
    component.run('changeState');
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[0][0]).toBe(0);
    expect(spy.mock.calls[1][0]).toBe(1);
    expect(spy.mock.calls[2][0]).toBe(2);
    expect(spy.mock.calls[3][0]).toBe(3);
    expect(component.state).toEqual(3);
  });

})

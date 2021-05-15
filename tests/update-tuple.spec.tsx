import app, { Component, Update } from '../src/apprun';

describe('Component', () => {

  it('should support non-event-typed update tuple', () => {
    class Test extends Component {
      state = 0;

      update = [
        ['+1', state => ++state, { once: true }],
        ['+1a', state => ++state],
      ];
    }

    const t = new Test().start() as any;
    t.run('+1');
    t.run('+1');
    t.run('+1a');
    expect(t.state).toEqual(2); 
  })

  it('should support state-typed update tuple and event alias', () => {
    class Test extends Component {
      state = 0;

      update: Update<number> = [
        ['method1, method2', state => ++state]
      ];
    }

    const t = new Test().start() as any;
    t.run('method1');
    t.run('method2');
    expect(t.state).toEqual(2);
  })

  it('should support event-typed update tuple', () => {

    type Events = '+1-once' | '+1';
    class Test extends Component<number, Events> {
      state = 0;

      update: Update<number, Events> = [
        ['+1-once', state => ++state, { once: true }],
        ['+1', state => ++state],
      ];
    }

    const t = new Test().start() as any;
    t.run('+1-once');
    t.run('+1-once');
    t.run('+1');
    expect(t.state).toEqual(2);
  })
})
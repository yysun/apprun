import app, { Component, on, update, event, customElement } from '../src/apprun';

describe('Update decorator', () => {

  it('should convert class method to action using @update', () => {
    class TestComponent extends Component {
      view = state => state

      @update()
      f1(state, val) {
        return val;
      }

      @event('hi, #hi')
      f2(state, val) {
        return val;
      }
    }

    const test = new TestComponent().mount() as any;
    const spy = spyOn(test, 'view')
    test.run('f1', 'x')
    expect(spy).toHaveBeenCalledWith('x')
    // test.run('f2', 'xx')
    // expect(spy).not.toHaveBeenCalledWith('xx')
    // local alias
    test.run('hi', 'xxx')
    expect(spy).toHaveBeenCalledWith('xxx')
    // global alias
    app.run('#hi', 'xxxx')
    expect(spy).toHaveBeenCalledWith('xxxx')
  })


  it('should convert class property to action using @on', () => {
    class TestComponent extends Component {
      view = state => state

      @on()
      f1 = (state, val) => val

      @on('hi2, #hi2')
      f2 = (state, val) => val
    }

    const test = new TestComponent().mount() as any;
    const spy = spyOn(test, 'view')
    test.run('f1', 'x')
    expect(spy).toHaveBeenCalledWith('x')
    // test.run('f2', 'xx')
    // expect(spy).not.toHaveBeenCalledWith('xx')
    // local alias
    test.run('hi2', 'xxx')
    expect(spy).toHaveBeenCalledWith('xxx')
    // global alias
    app.run('#hi2', 'xxxx')
    expect(spy).toHaveBeenCalledWith('xxxx')

  })

  it('should support this in @on with =>', done => {
    class TestComponent extends Component {
      view = state => state

      @on('test')
      f1 = (state, val) => {
        expect(this).not.toBeUndefined();
        done();
      }
    }
    const test = new TestComponent().mount();
    test.run('test');
  })

  it('should support this in @on with function', done => {
    class TestComponent extends Component {
      view = state => state

      @on('test')
      f1 = function (state, val) {
        expect(this).not.toBeUndefined();
        done();
      }
    }
    const test = new TestComponent().mount();
    test.run('test');
  })

  it('should support this in @update', done => {
    class TestComponent extends Component {
      view = state => state

      @update('test')
      onTest(state, val) {
        expect(this).not.toBeUndefined();
        done();
      }
    }
    const test = new TestComponent().mount();
    test.run('test');
  })

  it('should support this in @customElement', () => {
    @customElement('my-app')
    class TestComponent extends Component {
    }
  });

  it('should support context - @on decorator', done => {
    class TestComponent extends Component {
      state = 1;
      
      @on('test', {n: 100})
      f1 = (state, p, {n}) => {
        expect(state).toBe(1);
        expect(p).toBe(10);
        expect(n).toBe(100);
        done();
      }
    }
    const test = new TestComponent().mount();
    test.run('test', 10);
  })
})
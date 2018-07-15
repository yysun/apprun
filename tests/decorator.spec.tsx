import app, { Component, on, update, event } from '../src/apprun';

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

    const test = new TestComponent().mount();
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

    const test = new TestComponent().mount();
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


})
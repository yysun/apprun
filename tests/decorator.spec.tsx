import app, { Component, on, update } from '../src/apprun';

describe('Update decorator', () => {

  it('should convert class method to action using @update', () => {
    class TestComponent extends Component {
      view = state => state

      @update()
      f1(state, val) {
        return val;
      }

      @update('hi, #hi')
      f2(state, val) {
        return val;
      }
    }

    const test = new TestComponent().mount();
    const spy = spyOn(test, 'view')
    test.run('f1', 'x')
    expect(spy).toHaveBeenCalledWith('x')
    test.run('f2', 'xx')
    expect(spy).toHaveBeenCalledWith('xx')
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
    test.run('f2', 'xx')
    expect(spy).toHaveBeenCalledWith('xx')
    // local alias
    test.run('hi2', 'xxx')
    expect(spy).toHaveBeenCalledWith('xxx')
    // global alias
    app.run('#hi2', 'xxxx')
    expect(spy).toHaveBeenCalledWith('xxxx')

  })

})
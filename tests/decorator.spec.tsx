import app, { Component, on, update } from '../index';

describe('Update decorator', () => {
  
  it('should convert method to action', () => {
    class TestComponent extends Component {
      view = state => state

      @update('hi, #hi')
      f1(state, val) {
        return val;
      }

      @on('hi2, #hi2')
      f2 = (state, val) => val
    }

    const test = new TestComponent().mount();
    const spy = spyOn(test, 'view')
    test.run('hi', 'x')
    expect(spy).toHaveBeenCalledWith('x')
    app.run('#hi','xx')
    expect(spy).toHaveBeenCalledWith('xx')
    test.run('hi2', 'xxx')
    expect(spy).toHaveBeenCalledWith('xxx')
    app.run('#hi2', 'xxxx')
    expect(spy).toHaveBeenCalledWith('xxxx')
    
  })

}) 
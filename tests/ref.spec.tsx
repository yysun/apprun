import app from '../src/apprun';

describe('ref', () => {

  it('should set call ref function', done => {
    const ref = e => {
      expect(e.id).toBe('a');
      done();
    }
    const View = () => <div id="a" ref={ref}></div>
    app.render(document.body, <View />);
  });

})
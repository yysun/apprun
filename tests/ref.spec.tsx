import app from '../src/apprun';

describe('ref', () => {

  it('should set call ref function', () => {
    const ref = jasmine.createSpy();
    const View = () => <div id="a" ref={ref}></div>
    app.render(document.body, <View />);
    expect(ref).toHaveBeenCalled();
  });

})
import app from '../src/apprun';

describe('ref', () => {

  it('should set element to ref.value', () => {
    const ref = {};
    const View = () => <div id="a" ref={ref}></div>
    app.render(document.body, <View />);
    expect(ref['value'].id).toBe("a");
  });

})
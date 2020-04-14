import app from '../src/apprun';

describe('vdom', () => {

  it('should support style as string', () => {
    const el = document.createElement('div');
    const view1 = () => <div style={{ color: 'red' }}></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.style.cssText).toBe('color: red;');
    app.render(el, view2());
    expect(div.style.cssText).toBe('');
  });

  it('should support style as object', () => {
    const el = document.createElement('div');
    const view1 = () => <div style='color: red'></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.style.cssText).toBe('color: red;');
    app.render(el, view2());
    expect(div.style.cssText).toBe('');
  });

});
import app from '../src/apprun';

describe('vdom-my', () => {
  it('should set data attribute', () => {
    const el = document.createElement('div');
    const view = () => <div data-a='a'></div>
    app.render(el, view());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.dataset.a).toBe('a');
  })

  it('should unset data attribute', () => {
    const el = document.createElement('div');
    const view1 = () => <div data-a='b'></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.dataset.a).toBe('b');
    app.render(el, view2());
    expect(div.dataset.a).toBe('');
  })
})
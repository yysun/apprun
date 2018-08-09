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
  it('should support attribute - role', () => {
    const el = document.createElement('div');
    const view1 = () => <div role='r'></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.getAttribute('role')).toBe('r');
    app.render(el, view2());
    expect(div.getAttribute('role')).toBe('');
  })
  it('should support attribute - aria', () => {
    const el = document.createElement('div');
    const view1 = () => <div aria-label='al'></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.getAttribute('aria-label')).toBe('al');
    app.render(el, view2());
    expect(div.getAttribute('aria-label')).toBe('');
  })
  it('should support data-kebab-case', () => {
    const el = document.createElement('div');
    const view1 = () => <div data-kebab-case='123'></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.getAttribute('data-kebab-case')).toBe('123');
    app.render(el, view2());
    expect(div.getAttribute('data-kebab-case')).toBe('');
  })
})
import app from '../src/apprun';

(expect as any).extend({
  toBeNullOrEmptyString(received) {
    if(received === null || received === '') {
      return { 
        message: () => 'expected ${received} not to be null or the empty string', 
        pass: true
      };
    } else {
      return { 
        message: () => 'expected ${received} to be null or the empty string', 
        pass: false
      };
    }
  }
});

describe('vdom-my', () => {
  it('should support data attribute', () => {
    const el = document.createElement('div');
    const view1 = () => <div data-a='b'></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.dataset.a).toBe('b');
    app.render(el, view2());
    expect(div.dataset.a).toBe(undefined);
  });

  it('should support a boolean data attribute', () => {
    const el = document.createElement('div');
    const view1 = () => <div data-a=''></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.dataset.a).toBe('');
    app.render(el, view2());
    expect(div.dataset.a).toBe(undefined);
  });

  it('should support data-kebab-case', () => {
    const el = document.createElement('div');
    const view1 = () => <div data-kebab-case='123'></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.getAttribute('data-kebab-case')).toBe('123');
    app.render(el, view2());
    expect(div.hasAttribute('data-kebab-case')).toBe(false);
  });

  it('should support attribute - role', () => {
    const el = document.createElement('div');
    const view1 = () => <div role='r'></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.getAttribute('role')).toBe('r');
    app.render(el, view2());
    expect(div.hasAttribute('role')).toBe(false);
  });

  it('should support attribute - aria', () => {
    const el = document.createElement('div');
    const view1 = () => <div aria-label='al'></div>
    const view2 = () => <div></div>
    app.render(el, view1());
    const div = el.firstElementChild as HTMLDivElement;
    expect(div.getAttribute('aria-label')).toBe('al');
    app.render(el, view2());
    expect(div.hasAttribute('aria-label')).toBe(false);
  });
})
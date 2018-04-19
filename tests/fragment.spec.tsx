import app from '../src/apprun';

describe('vdom-my', () => {
  it('should convert JSX Fragment to array', () => {
    const view = () => <>
      <li><a></a></li>
      <li><a></a></li>
    </>;
    const vdom = view();
    expect(vdom.length).toBe(2);
  })
  it('should support JSX Fragment keyword to array', () => {
    const view = () => <app.Fragment>
      <li><a></a></li>
      <li><a></a></li>
    </app.Fragment>;
    const vdom = view();
    expect(vdom.length).toBe(2);
  })
  it('should convert merge JSX Fragment to parents', () => {
    const view = () => <ul><>
      <li><a></a></li>
      <li><a></a></li>
    </>
    <li><a></a></li></ul>;
    const vdom = view();
    expect(vdom.tag).toBe('ul');
    expect(vdom.children.length).toBe(3)
  })
  it('should support JSX Fragment at root level with mutiple elements', () => {
    const el = document.createElement('div');
    const view = () => <>
      <li><a></a></li>
      <li><a></a></li>
    </>
    const vdom = view();
    expect(Array.isArray(vdom)).toBeTruthy();
    app.render(el, vdom);
    expect(el.childElementCount).toBe(2);
  })
  it('should support JSX Fragment at root level with signle element', () => {
    const el = document.createElement('div');
    const view = () => <>
      <li><a></a></li>
    </>
    const vdom = view();
    expect(Array.isArray(vdom)).toBeTruthy();
    app.render(el, vdom);
    expect(el.childElementCount).toBe(1);
    expect(el.innerHTML).toBe('<li><a></a></li>');
  })
  it('should remove extra', () => {
    const el = document.createElement('ul');
    el.innerHTML='<li>a</li><li>b</li><li>c</li>'
    const view = () => <><li><a></a></li><li><a></a></li></>
    const vdom = view();
    app.render(el, vdom);
    expect(el.childElementCount).toBe(2);
    expect(el.innerHTML).toBe('<li><a></a></li><li><a></a></li>');
  })
  it('should combine string and tags', () => {
    const el = document.createElement('div');
    el.innerHTML = '<h1><h1>';
    const view = () => <>aaa<div>b</div>{' '}</>
    const vdom = view();
    app.render(el, vdom);
    expect(vdom.length).toBe(3);
    expect(el.innerHTML).toBe('aaa<div>b</div> ');
  })
  it('should combine string and tags', () => {
    const el = document.createElement('div');
    el.innerHTML = '<h1><h1>';
    const view = () => <>{' '} <div>b</div> {' '}</>
    const vdom = view();
    app.render(el, vdom);
    expect(vdom.length).toBe(5);
    expect(el.innerHTML).toBe('  <div>b</div>  ');
  })
})
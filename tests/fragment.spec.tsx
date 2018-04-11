import app from '../src/apprun';

describe('vdom-my', () => {
  it('should convert JSX Fragment to array', () => {
    const view = () => <>
      <li><a href="#profile">Profile</a></li>
      <li><a href="#signout">Sign Out</a></li>
    </>;
    const vdom = view();
    expect(vdom.length).toBe(2);
  })
  it('should support JSX Fragment keyword to array', () => {
    const view = () => <app.Fragment>
      <li><a href="#profile">Profile</a></li>
      <li><a href="#signout">Sign Out</a></li>
    </app.Fragment>;
    const vdom = view();
    expect(vdom.length).toBe(2);
  })
  it('should convert merge JSX Fragment to parents', () => {
    const view = () => <ul><>
      <li><a href="#profile">Profile</a></li>
      <li><a href="#signout">Sign Out</a></li>
    </>
    <li><a href="#signin">Sign In</a></li></ul>;
    const vdom = view();
    expect(vdom.tag).toBe('ul');
    expect(vdom.children.length).toBe(3)
  })
  it('should support JSX Fragment at root level with mutiple elements', () => {
    const el = document.createElement('div');
    const view = () => <>
      <li><a href="#profile">Profile</a></li>
      <li><a href="#signout">Sign Out</a></li>
    </>
    const vdom = view();
    expect(Array.isArray(vdom)).toBeTruthy();
    app.render(el, vdom);
    expect(el.childElementCount).toBe(2);
  })
  it('should support JSX Fragment at root level with signle element', () => {
    const el = document.createElement('div');
    const view = () => <>
      <li><a href="#profile">Profile</a></li>
    </>
    const vdom = view();
    expect(Array.isArray(vdom)).toBeTruthy();
    app.render(el, vdom);
    expect(el.childElementCount).toBe(1);
    expect(el.innerHTML).toBe('<li><a href="#profile">Profile</a></li>');
  })
  it('should work as usual w/o JSX Fragment at root level', () => {
    const el = document.createElement('div');
    const view = () => <li><a href="#profile">Profile</a></li>
    const vdom = view();
    expect(Array.isArray(vdom)).toBeFalsy();
    app.render(el, vdom);
    expect(el.childElementCount).toBe(1);
    expect(el.innerHTML).toBe('<li><a href="#profile">Profile</a></li>');
  })
})
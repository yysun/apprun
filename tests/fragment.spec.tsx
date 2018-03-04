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
})
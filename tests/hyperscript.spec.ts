import app from '../src/apprun';
const h = app.createElement;
import { VNode } from '../src/types';

describe('hyperscript', () => {
  it('should be supported case 1', () => {
    const view = state => h('div', null, '1');
    app.start('my-app', 0, view, {});
  })

  it('should be supported case 2', () => {
    const view = state => h('div', null,
      h('div', null, '2'),
      h('div', null, '3'));
    const vdom = view({}) as VNode;
    expect(vdom.children.length).toBe(2);
    app.start('my-app', 0, view, {});
  })

  it('should be supported case 3', () => {
    const view = state => h('div', null, [
      h('div', null, '2'),
      h('div', null, '3')]
    );
    const vdom = view({}) as VNode;
    expect(vdom.children.length).toBe(2);
    app.start('my-app', 0, view, {});
  })

  it('should be supported case 4', () => {
    const view = state => h('div', null,
      h('div', null,
        h('div', null, '3')
      )
    );
    const vdom = view({}) as VNode;
    expect(vdom.children.length).toBe(1);
    expect((vdom.children[0] as VNode).children.length).toBe(1);
    app.start('my-app', 0, view, {});
  })
  
})


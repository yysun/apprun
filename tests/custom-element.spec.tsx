import app, { Component, webComponent } from '../src/apprun';

describe('component', () => {
  it('should be able to export as custom element', () => {

    class C extends Component {
    }
    const c = webComponent(C);

    // customElements.define('my-app',c);
    // const el= document.createElement('hello-world');
    // document.body.appendChild(el);
    // expect(el.innerHTML).toBe('<div>hello world</div>');

  })

})
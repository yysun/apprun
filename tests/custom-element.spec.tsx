import app, { Component } from '../src/apprun';
import { customElement } from '../src/web-component';

describe('component', () => {
  it('should be able to export as custom element', () => {

    class C extends Component {
    }


    const component = customElement(C);

    // app.webComponent('hello-world', C);

    // const el= document.createElement('hello-world');
    // document.body.appendChild(el);
    // expect(el.innerHTML).toBe('<div>hello world</div>');

  })

})
import app, { Component } from '../src/apprun';
import { customElement } from '../src/web-component';

describe('web-component', () => {
  it('should convert component to custom element', () => {
    class C extends Component {
      state = 50;
    }
    // const component = new (customElement(C)); // need TypeScript 2.9?

    // class CE extends customElement(C) { }
    // const component = new CE();
    // expect(component.state).toBe(5);
  })

  it('should have on and run fuction', () => {

  })
})
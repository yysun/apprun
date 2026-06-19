import app, { Component } from '../src/apprun';
import { customElement } from '../src/web-component';

let elementId = 0;
const nextElementName = () => `x-rpd-${++elementId}`;

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

  it('should replay attributes after deferred mount and unload with state', () => {
    const rafCallbacks = [];
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    window.requestAnimationFrame = ((callback) => {
      rafCallbacks.push(callback);
      return rafCallbacks.length;
    }) as any;
    window.cancelAnimationFrame = jest.fn() as any;

    class C extends Component {
      state = { value: 'initial' };
      update = {
        attributeChanged: (state, name, oldValue, value) => ({ ...state, [name]: value })
      };
      unload = jest.fn();
    }

    const CE = customElement(C, { observedAttributes: ['value'], render: false });
    const name = nextElementName();
    customElements.define(name, CE);
    const element = document.createElement(name) as any;
    document.body.appendChild(element);

    element.attributeChangedCallback('value', 'initial', 'queued');
    expect(element.component).toBeUndefined();

    rafCallbacks.shift()();

    expect(element.component.state.value).toBe('queued');

    const component = element.component;
    document.body.removeChild(element);

    expect(component.unload).toHaveBeenCalledWith({ value: 'queued' });
    expect(element.component).toBeNull();

    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('should cancel deferred mount when disconnected before animation frame', () => {
    const rafCallbacks = [];
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    const cancelAnimationFrame = jest.fn();
    window.requestAnimationFrame = ((callback) => {
      rafCallbacks.push(callback);
      return 1;
    }) as any;
    window.cancelAnimationFrame = cancelAnimationFrame as any;

    class C extends Component {
      state = 1;
    }

    const CE = customElement(C, { render: false });
    const name = nextElementName();
    customElements.define(name, CE);
    const element = document.createElement(name) as any;
    document.body.appendChild(element);

    document.body.removeChild(element);
    rafCallbacks.shift()();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(element.component).toBeNull();

    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });
})

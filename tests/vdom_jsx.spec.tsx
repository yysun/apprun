import { } from 'jasmine';
import app, { Component } from '../index';

const model = 'x';
const view = _ => <div>{_}</div>;
const update = {
  hi: (_, val) => val
}

class TestComponent extends Component {
  state = 'x';
  view = (state) => <div>{state}</div>
  update = {
    '#hi': (state, v) => v
  }
}

describe('vdom-jsx', () => {

  let element;
  beforeEach(()=>{
    element = document.createElement('div');
    app.start(element, model, view, update);
  });

  it('created by app.start should trigger view', () => {
    const model = 'x';
    const view = jasmine.createSpy('view');
    const component = app.start(document.body, model, view, update);
    expect(view).toHaveBeenCalledWith('x');
    app.run('hi', 'xx');
    expect(view).toHaveBeenCalledWith('xx');
  });

  it('should create first child element', () => {
    expect(element.firstChild.nodeName).toEqual('DIV');
    expect(element.firstChild.textContent).toEqual('x');
  });

  it('should re-create child element', () => {
    element.removeChild(element.firstChild);
    app.run('hi', 'xx');
    expect(element.firstChild.nodeName).toEqual('DIV');
    expect(element.firstChild.textContent).toEqual('xx');
  });

  it('should update child element', () => {
    app.run('hi', 'xxx');
    expect(element.firstChild.nodeName).toEqual('DIV');
    expect(element.firstChild.textContent).toEqual('xxx');
  });

  it('should render custom element', () => {
    const CustomElement = ({val}) => <div>{val}</div>;
    const view = _ => <CustomElement val= {_} />;
    const element = document.createElement('div');
    document.body.appendChild(element);
    app.start(element, model, view, update);
    app.run('hi', 'xxxxx');
    expect(element.firstChild.textContent).toEqual('xxxxx');
  });

  it('should render nested element', () => {
    const CustomElement = ({val}) => <li>{val}</li>;
    const view = _ => (
    <ul>
      <CustomElement val= {_+'1'} />
      <CustomElement val= {_+'2'} />
      <CustomElement val= {_+'3'} />
      <CustomElement val= {_+'4'} />
    </ul>);
    const element = document.createElement('div');
    document.body.appendChild(element);
    app.start(element, '', view, update);
    const el = element.firstChild as HTMLElement;

    expect(el.children[0].textContent).toEqual('1');
    expect(el.children[1].textContent).toEqual('2');
    expect(el.children[2].textContent).toEqual('3');
    expect(el.children[3].textContent).toEqual('4');

    app.run('hi', 'x');
    expect(el.children[0].textContent).toEqual('x1');
    expect(el.children[1].textContent).toEqual('x2');
    expect(el.children[2].textContent).toEqual('x3');
    expect(el.children[3].textContent).toEqual('x4');

  });

  it('should render JSON', () => {
    const view = _ => <div>{_}</div>;
    const element = document.createElement('div');
    document.body.appendChild(element);
    app.start(element, { name: 'x' }, view, update);
    expect(element.textContent).toEqual('{"name":"x"}');
  });

  it('should allow element to be string', () => {
    const element = document.createElement('div');
    element.id = 'main';
    document.body.appendChild(element);
    new TestComponent().start('main');
    expect(element.textContent).toEqual('x');
  });

  const test = new TestComponent().start('test');
  const Test = () => test.render();

  class TestComponent2 extends Component {
    state = '';
    view = (state) => {
      return <div id='test'>
        <Test />
      </div>
    }
    update = {
      '#hi2': (state, v) => test.setState(v)
    }
  }

  it('should render component', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    new TestComponent2().start(element);
    app.run('#hi2', 'xxxxx');
    expect(element.textContent).toEqual('xxxxx');
    app.run('#hi', 'xxxx');
    expect(element.textContent).toEqual('xxxx');

  });
  
});

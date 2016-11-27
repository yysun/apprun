import { } from 'jasmine';
import app from '../index-jsx';

const model = 'x';
const view = _ => <div>{_}</div>;
const update = {
  hi: (_, val) => val
}

describe('vdom-jsx', () => {

  let element;
  beforeEach(()=>{
    element = document.createElement('div');
    document.body.appendChild(element);
    app.start(element, model, view, update);
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

});

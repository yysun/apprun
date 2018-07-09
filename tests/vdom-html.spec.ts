import app from '../src/apprun-html';

const model = 'y';
const view = _ => `\n <div>${_}</div>`;
const update = {
  hi: (_, val) => val
}

describe('vdom-html', () => {

  let element;
  beforeEach(()=>{
    element = document.createElement('div');
    app.start(element, model, view, update);
  });

  it('should create first child element', () => {
    expect(element.firstChild.nodeName).toEqual('DIV');
    expect(element.firstChild.textContent).toEqual('y');
  });

  it('should re-create child element', () => {
    element.removeChild(element.firstChild);
    app.run('hi', 'yy');
    expect(element.firstChild.nodeName).toEqual('DIV');
    expect(element.firstChild.textContent).toEqual('yy');
  });

  it('should update child element', () => {
    app.run('hi', 'yyy');
    expect(element.firstChild.nodeName).toEqual('DIV');
    expect(element.firstChild.textContent).toEqual('yyy');
  });

});

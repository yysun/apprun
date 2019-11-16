import app from '../src/apprun-html';

const model = 'y';
const view = _ => {
  switch (_) {
    case 'a':
      return `<div>${_}</div><div>2</div><div>3</div>`
    default:
      return `\n <div>${_}</div>`

  }
}

const update = {
  hi: (_, val) => val
}

describe('vdom-html', () => {

  let element;
  beforeEach(() => {
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
    app.run('hi', 'a');
    expect(element.children.length).toEqual(3);
    app.run('hi', 'b');
    expect(element.children.length).toEqual(1);
  });

});

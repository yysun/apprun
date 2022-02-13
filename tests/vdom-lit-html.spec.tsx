import { html, svg, render } from '../src/vdom-lit-html';

describe('vdom-lit-html', () => {

  it('should create first child element', () => {
    const element = document.createElement('div');
    render(element, '<div>a</div>');
    const div = element.querySelector('div');
    expect(div.innerHTML).toBe('a')
  })

  it('should update child element', () => {
    const element = document.createElement('div');
    render(element, '<div>a</div>');
    render(element, `<div>1</div><div>2</div><div>3</div>`);
    // console.log(element.innerHTML);
    const divs = element.querySelectorAll('div');
    expect(divs.length).toBe(3);
  })

  it('should allow html template', () => {
    const element = document.createElement('div');
    render(element, '<div>a</div>');
    render(element, html`<div>1</div><div>2</div><div>3</div>`);
    // console.log(element.innerHTML);
    const divs = element.querySelectorAll('div');
    expect(divs.length).toBe(3);
  })

  it('should allow svg template', () => {
    const element = document.createElement('svg');
    render(element, svg`<g></g>`);
    // console.log(element);
    expect(element.innerHTML).toBe('<!----><g></g>')
  })

});

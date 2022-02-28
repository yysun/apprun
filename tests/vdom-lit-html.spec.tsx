import { app, html, svg, render } from '../src/apprun-html';

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

  it('should render over JSX - string', () => {
    const element = document.createElement('div');
    app.render(element, <div>a</div>);
    render(element, '<div>b</div>');
    const div = element.querySelector('div');
    expect(div.innerHTML).toBe('b')
  })

  it('should render over JSX - html', () => {
    const element = document.createElement('div');
    app.render(element, <div>a</div>);
    render(element, html`<div>c</div>`);
    const div = element.querySelector('div');
    expect(div.innerHTML).toBe('c')
  })

});

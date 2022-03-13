import { app, html, svg, render, run, Component } from '../src/apprun-html';

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


  it('should apply directive', () => {
    let show = false;
    app.on('addx', d => show = d);
    const element = document.createElement('div');
    render(element, html`<div>
      <button id='btn' @click=${run('addx', -1)} />
    </div>`);
    const btn = element.querySelector('#btn') as HTMLButtonElement;
    btn.click();
    expect(show).toBeTruthy();
  })

  it('should apply directive in component', () => {

    const element = document.createElement('div');
    const add = (state, d) => state + d;
    class Test extends Component {
      state = 0;
      view = () => html`<div>
        <button id='btn2' @click=${run(add, -1)} />
        <button id='btn3' @click=${run('add', -1)} />
      </div>`;
      update = { add }
    }
    const comp = new Test().start(element);
    const btn2 = element.querySelector('#btn2') as HTMLButtonElement;
    const btn3 = element.querySelector('#btn3') as HTMLButtonElement;
    btn2.click();
    btn3.click();
    expect(comp['state']).toBe(-2);
  })

});

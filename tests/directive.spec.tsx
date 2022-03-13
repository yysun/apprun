import app, { Component, on, event } from '../src/apprun';
import directive from '../src/directive';

describe('Directive', () => {
  it('should apply $on', () => {
    let vdom = {
      tag: 'div',
      props: {
        "$onclick": 'a'
      }
    };
    vdom = directive(vdom, {});
    expect(vdom.props['$onclick']).toBeUndefined();
    expect(vdom.props['onclick']).not.toBeUndefined();

    let vdom2 = [{
      tag: 'div',
      props: {
        "$onclick": 'a'
      }
    }];

    vdom = directive(vdom2, {});
    expect(vdom[0].props['$onclick']).toBeUndefined();
    expect(vdom[0].props['onclick']).not.toBeUndefined();

    let vdom3 = [{
      tag: 'div',
      props: null,
      children: [{
        tag: 'div',
        props: {
          "$onclick": 'a'
        }
      }]
    }];

    vdom = directive(vdom3, {});
    expect(vdom[0].children[0].props['$onclick']).toBeUndefined();
    expect(vdom[0].children[0].props['onclick']).not.toBeUndefined();
  });

  it('should trigger event - $on', () => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <>
        <button id='b1' $onclick />
        <button id='b2' $onclick='+2' />
        <button id='b3' $onclick='#2' />
      </>

      @on()
      onclick = state => state + 1;

      @event('+2, #2')
      add2(state) {
        return state + 2;
      }
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b1').click();
    expect(component.state).toBe(1);
    document.getElementById('b2').click();
    expect(component.state).toBe(3);
    document.getElementById('b3').click();
    expect(component.state).toBe(5);
  });

  it('should trigger event - $on to function', () => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <button id='b4' $onclick={this.add2} />

      add2(state) {
        return state + 2;
      }
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b4').click();
    expect(component.state).toBe(2);
  });

  it('should trigger event - $on to function that returns Promise', (done) => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <>
        <button id='b5' $onclick={[this.add, 3]} />
        <button id='b6' $onclick={[this.addPromise, 3]} />
      </>
      addPromise = (state, n) => new Promise((r) => r(state + n));
      add = (state, n) => state + n;
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b5').click();
    document.getElementById('b6').click();
    setTimeout(() => {
      expect(component.state).toBe(6);
      done();
    }, 0)
  });

  it('should trigger event - $on [function ...]', () => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <button id='b7' $onclick={[this.add, 3]} />

      add = (state, num) => state + num;
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b7').click();
    expect(component.state).toBe(3);
  });

  it('should trigger event - $on [event: string ...]', () => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <button id='b8' $onclick={['add', 3]} />

      @on() add = (state, num) => state + num;
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b8').click();
    expect(component.state).toBe(3);
  });

  it('should bind input to state - $bind', () => {
    class Test extends Component {
      state = {
        a: 'a',
        b: 'b',
        c: 5,
        d: true,
        e: 'A',
        f: 5,
        h: 'v2',
        o1: false,
        o2: true,
        o3: false
      };

      // prettier-ignore
      view = state => <>
        <input $bind />
        <input $bind name='a' />
        <input $bind='b' />
        <input type='number' name='c' $bind />
        <input type='checkbox' name='d' $bind />
        <input type='radio' name='e' value='A' $bind />
        <input type='radio' name='e' value='B' $bind />
        <input type='range' min='0' max='5' name='f' $bind />
        <select $bind name='h'>
          <option value='v1'>1</option>
          <option value='v2'>2</option>
          <option value='v3'>3</option>
        </select>
        <select multiple name='i'>
          <option $bind='o1'>1</option>
          <option $bind='o2'>2</option>
          <option $bind='o3'>3</option>
        </select>
      </>
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    const inputs = document.querySelectorAll('input');

    expect(inputs[1].value).toBe('a');
    inputs[1].value = '1';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.a).toBe('1');

    expect(inputs[2].value).toBe('b');
    inputs[2].value = '2';
    inputs[2].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.b).toBe('2');

    expect(inputs[3].value).toBe('5');
    inputs[3].value = '3';
    inputs[3].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.c).toBe(3);

    expect(inputs[4].checked).toBeTruthy();
    inputs[4].click();
    expect(component.state.d).toBeFalsy();
    inputs[4].click();
    expect(component.state.d).toBeTruthy();

    expect(inputs[5].checked).toBeTruthy();
    inputs[5].click();
    expect(component.state.e).toBe('A');
    expect(inputs[6].checked).toBeFalsy();
    inputs[6].click();
    expect(component.state.e).toBe('B');

    expect(inputs[7].value).toBe('5');
    inputs[7].value = '4';
    inputs[7].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.f).toBe(4);

    const select = document.querySelector('select');
    expect(select.selectedIndex).toBe(1);
    select.value = 'v3';
    select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    expect(component.state.h).toBe('v3');

    const options = document.querySelectorAll('option');
    // expect(options[1].selected).toBeTruthy();
    expect(options[4].selected).toBeTruthy();

    options[4].selected = true;
    options[4].dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    expect(component.state.o2).toBeTruthy();

    inputs[0].value = '0';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state).toBe('0');
  });

  it('should use directive in app.render', () => {
    let show = false;
    app.on('$', ({ key, props }) => {
      if (key === '$show') {
        show = true;
      }
    });
    const View = () => <>
      <button id='bx' $show />
    </>
    app.render(document.body, View());
    expect(show).toBeTruthy();
  });

  it('should trigger $on in app.render to app.run', () => {
    let show = false;
    app.on('11', () => {
        show = true;
    });

    const View = () => <>
      <button id='bx' $onclick='11' />
    </>
    app.render(document.body, View());
    document.getElementById('bx').click();
    expect(show).toBeTruthy();
  });
});

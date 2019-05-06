import app, { Component, on , event} from '../src/apprun';

describe('Directive', () => {

  it('should trigger driective event - $on', () => {
    class Test extends Component {
      state = 0;
      view = () => <>
        <button id='b1' $onclick />
        <button id='b2' $onclick='+2' />
        <button id='b3' $onclick='#2' />
      </>

      @on()
      onclick = state => state + 1;

      @event('+2, #2')
      add2 (state) {
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

  it('should bind input to state - $bind', () => {
    class Test extends Component {
      state = 0;
      view = () => <>
        <input $bind value='0'/>
        <input $bind value='1' name='a' />
        <input $bind='b' value='2'/>
        <input type='number' value='3' name='c' $bind />
        <input type='checkbox' name='d' $bind />
        <input type='radio' name='e' value='A' $bind />
        <input type='radio' name='e' value='B' $bind />
        <input type='range' value='4' min='0' max='5' name='f' $bind />
        <input type='date' value='2020-01-01' name='g' $bind />
        <select $bind name='h'>
          <option>1</option>
          <option selected>2</option>
          <option>3</option>
        </select>
        <select multiple $bind name='i'>
          <option selected>1</option>
          <option selected>2</option>
          <option selected>3</option>
        </select>
      </>
    }

    // var event = document.createEvent('Event');
    // event.initEvent('input', true, true);

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    const inputs = document.querySelectorAll('input');

    inputs[0].dispatchEvent(new Event('input', {'bubbles': true,'cancelable': true}));
    expect(component.state).toBe('0');

    inputs[1].dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }));
    expect(component.state.a).toBe('1');

    inputs[2].dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }));
    expect(component.state.b).toBe('2');

    inputs[3].dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }));
    expect(component.state.c).toBe(3);

    inputs[4].click();
    expect(component.state.d).toBeTruthy();
    inputs[4].click();
    expect(component.state.d).toBeFalsy();

    inputs[5].click();
    expect(component.state.e).toBe('A')
    inputs[6].click();
    expect(component.state.e).toBe('B');

    inputs[7].dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }));
    expect(component.state.f).toBe(4);
    inputs[8].dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true }));
    expect(component.state.g).toBe(Date.parse('2020-01-01'));

  });
});
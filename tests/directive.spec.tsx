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

});
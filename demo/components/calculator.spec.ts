import { button_click, State } from './calculator';

const state: State = {
  _state: 'START',
  display: '0',
  arg1: 0,
  arg2: 0,
  op: ''
};

const click = (input: string) => {
  const keys = [...input];
  let s = state;
  keys.forEach(key => {
    const new_state = button_click(s, key);
    s = new_state
  })
  return s;
}

describe('calculator', () => {

  it('case 1', () => {
    const { _state, display } = click('1');
    expect(display).toBe('1');
    expect(_state).toBe('FIRST_ARG');
  })

  it('case 2', () => {
    const { _state, display } = click('12');
    expect(display).toBe('12');
    expect(_state).toBe('FIRST_ARG');
  })

  it('case 3', () => {
    const { _state, display, arg1, arg2 } = click('1+2=');
    expect(display).toBe('3');
    expect(arg1).toBe(1);
    expect(arg2).toBe(2);
    expect(_state).toBe('EQ');
  })

  it('case 4', () => {
    const { _state, display } = click('1/');
    expect(display).toBe('1');
    expect(_state).toBe('OP');
  })

  it('case 5', () => {
    const { _state, display } = click('1/2');
    expect(display).toBe('2');
    expect(_state).toBe('SECOND_ARG');
  })

  it('case 6', () => {
    const { _state, display, op } = click('1//');
    expect(display).toBe('1');
    expect(op).toBe('/');
    expect(_state).toBe('OP');
  })

  it('case 7', () => {
    const { _state, display, op } = click('1/=');
    expect(display).toBe('1');
    expect(op).toBe('/');
    expect(_state).toBe('OP');
  })

  it('case 8', () => {
    const { _state, display, op } = click('1/+');
    expect(display).toBe('1');
    expect(op).toBe('+');
    expect(_state).toBe('OP');
  })

  it('case 9', () => {
    const { _state, display } = click('1/10');
    expect(display).toBe('10');
    expect(_state).toBe('SECOND_ARG');
  })

  it('case 10', () => {
    const { _state, display } = click('1+1.');
    expect(display).toBe('1.');
    expect(_state).toBe('SECOND_ARG_FLOAT');
  })

  it('case 11', () => {
    const { _state, display } = click('0.');
    expect(display).toBe('0.');
    expect(_state).toBe('FIRST_ARG_FLOAT');
  })

  it('case 12', () => {
    const { _state, display } = click('=');
    expect(display).toBe('0');
    expect(_state).toBe('START');
  })

  it('case 13', () => {
    const { _state, display } = click('/');
    expect(display).toBe('0');
    expect(_state).toBe('START');
  })

  it('case 14', () => {
    const { _state, display } = click('1+2=5');
    expect(display).toBe('5');
    expect(_state).toBe('FIRST_ARG');
  })

  it('case 15', () => {
    const { _state, display } = click('1+2=/');
    expect(display).toBe('3');
    expect(_state).toBe('OP');
  })

  it('case 16', () => {
    const { _state, display } = click('1/+=');
    expect(display).toBe('1');
    expect(_state).toBe('OP');
  })

  it('case 17', () => {
    const { _state, display } = click('1+2=*3=');
    expect(display).toBe('9');
    expect(_state).toBe('EQ');
  })

  it('case 18', () => {
    const { _state, display, arg1, arg2 } = click('1+2*3=');
    expect(display).toBe('7');
    expect(arg1).toBe(1);
    expect(arg2).toBe(6);
    expect(_state).toBe('EQ');
  })

  it('case 19', () => {
    const { _state, display, arg1, arg2 } = click('1*2+3=');
    expect(display).toBe('5');
    expect(arg1).toBe(2);
    expect(arg2).toBe(3);
    expect(_state).toBe('EQ');
  })

  it('case 20', () => {
    const { _state, display } = click('1+2*3*');
    expect(display).toBe('6');
    expect(_state).toBe('OP');
  })

});
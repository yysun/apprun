import { onInput } from './calculator';

const state = {
  value: '0',
  input: '',
  done: true
};

const click = (keys: string[]) => {
  let s = state;
  keys.forEach(key => {
    const new_state = onInput(s, key);
    s = new_state
  })
  return s;
}

describe('calculator', () => {

  it('case 1', () => {
    const { value, input, done } = click(['0']);
    expect(value).toBe('0');
    expect(input).toBe('0');
    expect(done).toBe(false);
  })

  it('case 2', () => {
    const { value, input, done } = click(['1']);
    expect(value).toBe('1');
    expect(input).toBe('1');
    expect(done).toBe(false);
  })

  it('case 3', () => {
    const { value, input, done } = click(['1', '2']);
    expect(value).toBe('12');
    expect(input).toBe('12');
    expect(done).toBe(false);
  })

  it('case 4', () => {
    const { value, input, done } = click(['1', '/']);
    expect(value).toBe('1');
    expect(input).toBe('1/');
    expect(done).toBe(true);
  })

  it('case 5', () => {
    const { value, input, done } = click(['1', '/', '2']);
    expect(value).toBe('2');
    expect(input).toBe('1/2');
    expect(done).toBe(false);
  })

  it('case 6', () => {
    const { value, input, done } = click(['1', '/', '/']);
    expect(value).toBe('1');
    expect(input).toBe('1/');
    expect(done).toBe(true);
  })

  // it('case 7', () => {
  //   const { value, input, done } = click(['1', '/', '=']);
  //   expect(value).toBe('1');
  //   expect(input).toBe('1/1=1');
  //   expect(done).toBe(true);
  // })

  it('case 8', () => {
    const { value, input, done } = click(['1', '/', '+']);
    expect(value).toBe('1');
    expect(input).toBe('1+');
    expect(done).toBe(true);
  })

  it('case 9', () => {
    const { value, input, done } = click(['1', '/', '1', '0']);
    expect(value).toBe('10');
    expect(input).toBe('1/10');
    expect(done).toBe(false);
  })

  it('case 10', () => {
    const { value, input, done } = click(['.']);
    expect(value).toBe('.');
    expect(input).toBe('.');
    expect(done).toBe(false);
  })

  it('case 11', () => {
    const { value, input, done } = click(['0', '.']);
    expect(value).toBe('0.');
    expect(input).toBe('0.');
    expect(done).toBe(false);
  })

  it('case 12', () => {
    const { value, input, done } = click(['=']);
    expect(value).toBe('0');
    expect(input).toBe('0=0');
    expect(done).toBe(true);
  })

  it('case 13', () => {
    const { value, input, done } = click(['/']);
    expect(value).toBe('0');
    expect(input).toBe('0/');
    expect(done).toBe(true);
  })

  it('case 14', () => {
    const { value, input, done } = click(['1', '+', '2', '=', '5']);
    expect(value).toBe('5');
    expect(input).toBe('5');
    expect(done).toBe(false);
  })

});
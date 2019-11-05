import app from '../../src/apprun';

const state = {
  value: 0,
  input: '',
  done: true
};
const view = ({ input, value }) => {
  return (
    <>
      <style>{`
    .calculator { width: 200px; }
    .buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 2px;
    }
    button { padding: 10px; width:100%; }
    button:nth-of-type(1) {
      grid-column: span 3;
    }
    button:nth-of-type(15) {
      grid-column: span 2;
    }
    `}</style>
      <div class='calculator'>
        <h1>{value}</h1>
        <div class='buttons' $onclick='oninput'>
          <button>C</button>
          <button>/</button>
          <button>7</button>
          <button>8</button>
          <button>9</button>
          <button>*</button>
          <button>4</button>
          <button>5</button>
          <button>6</button>
          <button>-</button>
          <button>1</button>
          <button>2</button>
          <button>3</button>
          <button>+</button>
          <button>0</button>
          <button>.</button>
          <button>=</button>
        </div>
        <small>{input}</small>
      </div>
    </>
  );
};

export const onInput = ({ value, input, done }, c) => {
  switch (c) {
    case 'C':
      return { value: '0', input: '', done: true }
    case '=':
      input = input || 0;
      value = eval(input).toString();
      return { value, input: `${input}=${value}`, done: true }
    default:
      const isNumber = /\d|\./.test(c);
      done && isNumber && (value = 0);
      done && !isNumber && (input = !input ? value : input.substring(0, input.length - 1))
      input.indexOf('=') > 0 && (input = value || '');
      return {
        value: isNumber ? (value || '') + c : value,
        input: input + c, done: !isNumber
      }
  }
}
const update = {
  '#calculator': state => state,
  oninput: ({ value, input, done }, e) => {
    const c = e.target.textContent;
    return onInput({ value, input, done }, c);
  }
};

export default element => app.start(element, state, view, update);

import app, { Component } from '../../src/apprun';
import { StateMachine, find_transition } from './state-machine';

type Events = 'NUM' | 'OP' | 'DOT' | 'CE' | 'EQ' | '+/-';

type States = 'START' | 'FIRST_ARG' | 'FIRST_ARG_FLOAT' | 'OP' | 'SECOND_ARG' | 'SECOND_ARG_FLOAT' | 'EQ';

const state = {
  _state: 'START' as States,
  display: '0',
  arg1: 0,
  arg2: 0,
  op: '',
  stack: []
};
export type State = typeof state;

const view = ({ _state, op, arg1, arg2, display, stack }: State) => <>
  <style> {`
    .calculator { width: 200px; }
    .buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 2px;
    }
    button { padding: 10px; width:100%; }
    button:nth-of-type(1) {
      grid-column: span 2;
    }
    button:nth-of-type(16) {
      grid-column: span 2;
    }
  `}
  </style>
  <div class="calculator">
    <h1>{display}</h1>
    <div class="buttons" $onclick={button_click}>
      <button>CE</button>
      <button>+/-</button>
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
    <small>
      {stack.length > 0 && `${stack[0][0]} ${stack[0][1]} `}
      {_state.startsWith("FIRST_") && `${display}`}
      {_state === "OP" && `${arg1} ${op}`}
      {_state.startsWith("SECOND_") && `${arg1} ${op} ${display}`}
      {_state === "EQ" && `${arg1} ${op} ${arg2} = ${display}`}
    </small>
  </div>
</>;

export const button_click = (state: State, e: any) => {

  const priority = {
    '*': 2,
    '/': 2,
    '+': 1,
    '-': 1
  }

  const getEvent = (c: string): Events => {
    switch (c) {
      case '+/-':
        return '+/-';
      case 'CE':
        return 'CE';
      case '.':
        return 'DOT';
      case '=':
        return 'EQ';
      default:
        return /\d/.test(c) ? 'NUM' : 'OP';
    }
  };

  const key = e.target?.textContent || e;
  const event = getEvent(key);

  let { _state, op, arg1, arg2, display, stack } = state;

  const clear = () => {
    display = '0';
    arg1 = arg2 = 0;
    op = '';
    stack.length = 0;
  }

  const negative = () => {
    display = display.startsWith('-') ? display.substring(1) : '-' + display;
  };

  const calc = () => {
    display = eval(`${arg1}${op}${arg2}`).toString();
  };

  const op1 = () => {
    op = key;
    arg1 = parseFloat(display);
  };

  const op2 = () => {
    if (priority[key] === priority[op]) {
      arg2 = parseFloat(display);
      calc();
      op = key;
      arg1 = parseFloat(display);
    } else if (priority[key] < priority[op]) {
      arg2 = parseFloat(display);
      calc();
      arg1 = parseFloat(display);
      op = key;
      if (stack.length) {
        const f = stack.pop();
        arg1 = eval(`${f[0]}${f[1]}${display}`);
        display = arg1.toString();
      }
    } else {
      stack.push([arg1, op]);
      arg1 = parseFloat(display);
      op = key;
    }

  };

  const eq0 = () => {
    arg1 = parseFloat(display);
    calc();
  };

  const eq2 = () => {
    arg2 = parseFloat(display);
    calc();
    if (stack.length) {
      arg2 = parseFloat(display);
      const f = stack.pop();
      display = eval(`${f[0]}${f[1]}${display}`).toString();
      arg1 = f[0];
      op = f[1];
    }
  };

  const state_machine: StateMachine<States, Events> = {
    START: [
      ['NUM', 'FIRST_ARG', () => display = key],
      ['DOT', 'FIRST_ARG_FLOAT', () => display = '0.']
    ],

    FIRST_ARG: [
      ['+/-', 'FIRST_ARG', negative],
      ['NUM', 'FIRST_ARG', () => display += key],
      ['DOT', 'FIRST_ARG_FLOAT', () => display += key],
      ['OP', 'OP', op1],
      ['CE', 'START', clear]
    ],

    FIRST_ARG_FLOAT: [
      ['+/-', 'FIRST_ARG_FLOAT', negative],
      ['NUM', 'FIRST_ARG_FLOAT', () => display += key],
      ['OP', 'OP', op1],
      ['CE', 'START', clear]
    ],

    OP: [
      ['NUM', 'SECOND_ARG', () => display = key],
      ['DOT', 'SECOND_ARG', () => display = '0.'],
      ['OP', 'OP', () => op = key],
      ['CE', 'START', clear]
    ],

    SECOND_ARG: [
      ['+/-', 'SECOND_ARG', negative],
      ['NUM', 'SECOND_ARG', () => display += key],
      ['DOT', 'SECOND_ARG_FLOAT', () => display += key],
      ['EQ', 'EQ', eq2],
      ['OP', 'OP', op2],
      ['CE', 'OP', () => display = '0']
    ],

    SECOND_ARG_FLOAT: [
      ['+/-', 'SECOND_ARG_FLOAT', negative],
      ['NUM', 'SECOND_ARG_FLOAT', () => display += key],
      ['EQ', 'EQ', eq2],
      ['OP', 'OP', op2],
      ['CE', 'OP', () => display = '0']
    ],

    EQ: [
      ['+/-', 'FIRST_ARG', negative],
      ['NUM', 'FIRST_ARG', () => display = key],
      ['DOT', 'FIRST_ARG_FLOAT', () => display = '0.'],
      ['EQ', 'EQ', eq0],
      ['OP', 'OP', op1],
      ['CE', 'START', clear]
    ]
  };

  const { next_state, transition } = find_transition(state_machine, _state, event);
  _state = next_state || _state;
  transition && transition();

  return { _state, op, arg1, arg2, display, stack };
};

const update = {
  '#calculator': state => state
};

export default element => new Component(state, view, update).mount(element);

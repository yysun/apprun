import app from '../../index'

const model = [];

const Counter = ({num, idx}) => (
  <div>
    <h1>{num}</h1>
    <button onclick={() => app.run("-1", idx)}>-1</button>
    <button onclick={() => app.run("+1", idx)}>+1</button>
    <button onclick={() => app.run("remove-counter", idx)}>x</button>
  </div>
);

const CounterList = ({counters}) => counters.map((num, idx) =>
  <Counter num={num} idx={idx} />
);

const view = (state) => {
  console.log(state);
  return (
  <div>
    <div>
      <button onclick={() => app.run("history-prev")}> &lt;&lt; </button>
      <button onclick={() => app.run("history-next")}> &gt;&gt; </button>
      <button onclick={() => app.run("add-counter")}>add counter</button>
      <button onclick={() => app.run("remove-counter", state.length-1)} disabled={state.length <= 0}>remove counter</button>
    </div>
    <br/>
    <CounterList counters={state} />
  </div>);
};

const update = {
  '#counters': (model) => model,
  'add-counter': (state) => [...state, 0],
  'remove-counter': (state, idx) => [
     ...state.slice(0, idx),
     ...state.slice(idx + 1)
   ],
  '+1': (state, idx) => [
    ...state.slice(0, idx),
    state[idx] + 1,
    ...state.slice(idx + 1)
  ],
  '-1': (state, idx) => [
    ...state.slice(0, idx),
    state[idx] - 1,
    ...state.slice(idx + 1)
  ]
};

export default (element) => app.start(element, model, view, update, {history: true});
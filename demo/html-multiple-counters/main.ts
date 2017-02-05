import app from '../../index';

const model = [];

const view = (state) => {
  console.log(state);
  const counters = state.map((_, idx) => {
    return `<div>
      <h1>${state[idx]}</h1>
      <button onclick='app.run("-1",${idx})'>-1</button>
      <button onclick='app.run("+1",${idx})'>+1</button>
      <button onclick='app.run("remove-counter", ${idx})'>x</button>
    </div>`;
  }).join('');

  return `<div>
  <div>
    <button onclick='app.run("history-prev")'> &lt;&lt; </button>
    <button onclick='app.run("history-next")'> &gt;&gt; </button>
  </div><br>
  <div>
    <button onclick='app.run("add-counter")'>add counter</button>
    <button onclick='app.run("remove-counter", ${state.length - 1})'>remove counter</button>
  </div>
  ${counters}
  </div>`;
};

const update = {
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

const element = document.getElementById('my-app');
const component = app.start(element, model, view, update, {history: true});
  // {history: {prev: 'history-prev', next: 'history-next'}});


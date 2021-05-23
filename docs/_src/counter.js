// initial state object
const state = {
  count: 0,
  count_plus: 0,
  count_minus: 0
}

// one view function to render the state, its' a pure function
const view = ({ count, count_plus, count_minus }) => html`
  <h1>${count}</h1>
  <button onclick="app.run('minus')">- (${count_minus})</button>
  <button onclick="app.run('plus')">+ (${count_plus})</button>
`

// collection of state updates, state is immutable
const minus = (state) => ({
  ...state,
  count: state.count - 1,
  count_minus: state.count_minus + 1
});

const plus = (state) => ({
  ...state,
  count: state.count + 1,
  count_plus: state.count_plus + 1
});

app.start(document.body, state, view, { plus, minus });
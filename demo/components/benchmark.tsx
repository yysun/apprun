import app, { Component } from '../../src/apprun'
import actions from './store';
const { run, runLots, add, update, swapRows, clear } = actions;

const state = {
  data: [],
  selected: null
}

type State = typeof state;
type Events = 'delete'| 'select';

let startTime;
const startMeasure = function () {
  startTime = performance.now();
}
  const stopMeasure = function () {
    window.setTimeout(function () {
      const stop = performance.now();
      console.log(stop - startTime);
    }, 0);
  }

const Row = ({ selected, id, label }) => <tr class={selected} id={id} key={id}>
  <td class="col-md-1">{id}</td>
  <td class="col-md-4">
    <a class="lbl">{label}</a>
  </td>
  <td class="col-md-1">
    <a class="remove">
      <span class="glyphicon glyphicon-remove remove" aria-hidden="true"></span>
    </a>
  </td>
  <td class="col-md-6"></td>
</tr>;

const view = state => {
  startMeasure();
  return <div id="benchmark">
    <div>
      <button $onclick={run}>Create 1,000 rows</button>
      <button $onclick={runLots}>Create 10,000 rows</button>
      <button $onclick={add}>Append 1,000 rows</button>
      <button $onclick={update}>Update every 10th row</button>
      <button $onclick={clear}>Clear</button>
      <button $onclick={swapRows}>Swap Rows</button>
    </div>
    <br />
    <table class="table table-hover table-striped test-data" id="main-table" onclick={click}>
      <tbody>
        {state.data.map(item => {
          const selected = item.id == state.selected ? 'danger' : undefined;
          return <Row {...{ selected, ...item }} />;
        })}
      </tbody>
    </table>
    <span class="preloadicon glyphicon glyphicon-remove hidden" aria-hidden="true"></span>
  </div>
}

const getId = (elem) => {
  while (elem) {
    if (elem.tagName === "TR") {
      return elem.id;
    }
    elem = elem.parentNode;
  }
  return undefined;
}

const click = e => {
  const t = e.target as HTMLElement;
  if (!t) return;
  if (t.matches('.remove')) {
    startMeasure();
    component.run('delete', getId(t));
  } else if (t.matches('.lbl')) {
    startMeasure();
    component.run('select', getId(t));
  }
};

const component = new Component<State, Events>(state, view, actions);
component['-patch-vdom-on'] = true;
component.unload = () => { actions.clear(); console.log('benchmark.unload') };
component.rendered = () => stopMeasure();

export default (element) => component.mount(element, {route: '#benchmark'});

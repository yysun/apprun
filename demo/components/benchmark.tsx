import app, { Component } from '../../src/apprun'
import Store from './store';

let startTime;
let lastMeasure;

const startMeasure = function (name) {
  startTime = performance.now();
  lastMeasure = name;
}
const stopMeasure = function () {
  window.setTimeout(function () {
    const stop = performance.now();
    console.log(lastMeasure + " took " + (stop - startTime));
  }, 0);
}

const store = new Store();

const update = {
  '#benchmark': (store) => store,

  run(store) {
    store.run();
    return store;
  },

  add(store) {
    store.add();
    return store;
  },

  remove(store, id) {
    store.delete(id);
    document.getElementById(id).remove();
  },

  select(store, id) {
    if (store.selected) {
      document.getElementById(store.selected).className = '';
    }
    store.select(id);
    document.getElementById(id).className = 'danger';
  },

  updaterow(store) {
    store.update();
    return store;
  },

  runlots(store) {
    store.runLots();
    return store;
  },

  clear(store) {
    store.clear();
    document.getElementById("main-table").innerHTML = "";
    //return store;
  },

  swaprows(store) {
    store.swapRows();
    return store;
  }
}

const view = (model) => {
  const rows = model.data.map((curr) => {
    const selected = curr.id === model.selected ? 'danger' : '';
    const id = curr.id;
    return <tr class={selected} id={id} key={id}>
    <td class="col-md-1">{id}</td>
      <td class="col-md-4">
        <a class="lbl">{curr.label}</a>
      </td>
      <td class="col-md-1">
        <a class="remove">
          <span class="glyphicon glyphicon-remove remove" aria-hidden="true"></span>
        </a>
      </td>
      <td class="col-md-6"></td>
    </tr>;
  });

  return <div id="benchmark" onclick={click}>
    <div>
      <button type='button' id='run'>Create 1,000 rows</button>
      <button type='button' id='runlots'>Create 10,000 rows</button>
      <button type='button' id='add'>Append 1,000 rows</button>
      <button type='button' id='updaterow'>Update every 10th row</button>
      <button type='button' id='clear'>Clear</button>
      <button type='button' id='swaprows'>Swap Rows</button>
    </div>
    <br />
    <table class="table table-hover table-striped test-data" id="main-table">
      <tbody>{rows}</tbody>
    </table>
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

const click = (e) => {
  const t = e.target as HTMLElement;
  if (!t) return;
  if (t.tagName === 'BUTTON' && t.id) {
    e.preventDefault();
    startMeasure(t.id);
    component.run(t.id);
    stopMeasure();
  } else if (t.matches('.remove')) {
    e.preventDefault();
    startMeasure('remove');
    component.run('remove', getId(t));
    stopMeasure();
  } else if (t.matches('.lbl')) {
    e.preventDefault();
    startMeasure('select');
    component.run('select', getId(t));
    stopMeasure();
  }
};

const component = new Component(store, view, update);
component.unload = () => { console.log('benchmark.unload') };
component.rendered = () => {
  store.selected && (document.getElementById(store.selected).className = 'danger');
}
export default (element) => component.mount(element);

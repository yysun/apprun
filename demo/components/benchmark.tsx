import { app, Component, View } from '../../src/apprun'
import { state, update, State, Events } from './store';

let startTime;
let lastName;

const startMeasure = function (name: string) {
  lastName = name
  startTime = performance.now();
}

const stopMeasure = function () {
  window.setTimeout(function () {
    const stop = performance.now();
    console.log(lastName + ' took ' + (stop - startTime));
  }, 0);
}

const view: View<State> = state => <div class="container" $onclick={click}>
  <div>
    <button id="run">Create 1,000 rows</button>
    <button id="runlots">Create 10,000 rows</button>
    <button id="add">Append 1,000 rows</button>
    <button id="update">Update every 10th row</button>
    <button id="clear">Clear</button>
    <button id="swaprows">Swap Rows</button>
  </div>
  <br />
  <table class="table table-hover table-striped test-data" id="main-table">
    <tbody>
      {state.data.map(item => {
        const selected = item.id == state.selected ? 'danger' : undefined;
        return <tr class={selected} id={item.id} key={item.id}>
          <td class="col-md-1">{item.id}</td>
          <td class="col-md-4">
            <a class="lbl">{item.label}</a>
          </td>
          <td class="col-md-1">
            <a class="remove">
              <span class="glyphicon glyphicon-remove remove" aria-hidden="true"></span>
            </a>
          </td>
          <td class="col-md-6"></td>
        </tr>;
      })}
    </tbody>
  </table>
  <span class="preloadicon glyphicon glyphicon-remove hidden" aria-hidden="true"></span>
</div>;

const getId = (elem: any) => elem.closest('tr').id;

const click = (state: State, e: Event) => {
  const t = e.target as HTMLElement;
  if (!t) return;
  e.preventDefault();

  if (t.tagName === 'BUTTON' && t.id) {
    startMeasure(t.id);
    component.run(t.id as Events);
  } else if (t.matches('.remove')) {
    startMeasure('delete');
    const id = getId(t);
    component.run('delete', id);
  } else if (t.matches('.lbl')) {
    startMeasure('select');
    const id = getId(t);
    component.run('select', id);
  }
  stopMeasure();
}

const component = new Component(state, view, update);
component.unload = () => { console.log('benchmark.unload') };

component.rendered = () => {
  let nonKeyedDetector_tradded = [];
  let nonKeyedDetector_trremoved = [];
  let nonKeyedDetector_removedStoredTr = [];

  const target = document.querySelector('#main-table');

  function filterTRInNodeList(nodeList) {
    let trs = [];
    nodeList.forEach(n => {
      if (n.tagName === 'TR') {
        trs.push(n);
        trs = trs.concat(filterTRInNodeList(n.childNodes));
      }
    });
    return trs;
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        nonKeyedDetector_tradded = nonKeyedDetector_tradded.concat(filterTRInNodeList(mutation.addedNodes));
        nonKeyedDetector_trremoved = nonKeyedDetector_trremoved.concat(filterTRInNodeList(mutation.removedNodes));
      }
      // console.log(mutation.type, mutation.addedNodes.length, mutation.removedNodes.length, mutation);
    });
    console.log('tr addded: ', nonKeyedDetector_tradded.length, 'tr removed: ', nonKeyedDetector_trremoved.length);
  });
  var config = { childList: true, attributes: true, subtree: true, characterData: true };

  if (!target['observed']) {
    observer.observe(target, config);
    target['observed'] = true;
  }
}
export default (element) => component.mount(element, {route: '#benchmark'});

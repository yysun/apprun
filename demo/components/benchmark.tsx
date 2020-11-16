import { app, Component, View } from '../../src/apprun'
import { startMeasure, stopMeasure, state, update, State, Events } from './store';

const view: View<State> = state => <div class="container" $onclick={click}>
  <div class="row">JSX</div>
  <div class="row">
    <button id="run">Create 1,000 rows</button>
    <button id="runlots">Create 10,000 rows</button>
    <button id="add">Append 1,000 rows</button>
    <button id="update">Update every 10th row</button>
    <button id="clear">Clear</button>
    <button id="swaprows">Swap Rows</button>
    <span class="pull-right" id="measure"></span>
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

const getId = (elem: any) => {
  while (elem) {
    if (elem.tagName === "TR") {
      return elem.id;
    }
    elem = elem.parentNode;
  }
  return undefined;
}

const click = (state: State, e: Event) => {
  const t = e.target as HTMLElement;
  if (!t) return;
  e.preventDefault();

  if (t.tagName === 'BUTTON' && t.id) {
    startMeasure(t.id);
    component.run(t.id as Events);
    stopMeasure();
  } else if (t.matches('.remove')) {
    startMeasure('delete');
    const id = getId(t);
    component.run('delete', id);
  } else if (t.matches('td')) {
    startMeasure('select');
    const id = getId(t);
    component.run('select', id);
  }
  stopMeasure();
}

const component = new Component<State, Events>(state, view, update);
export default (element) => component.mount(element, { route: '#benchmark' });

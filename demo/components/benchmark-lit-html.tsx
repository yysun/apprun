import { repeat } from 'lit-html/directives/repeat.js';

import { html, run, Component, View } from '../../src/apprun-html'
import { startMeasure, stopMeasure, state, update, Data, State, Events } from './store';

const view: View<State> = state => {
  const selected = state.selected;
  return html`<div class="container" @click=${run(click)}>
  <div class="row">lit-html</div>
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
  <table class="table table-hover table-striped test-data">
    <tbody>${repeat(state.data, (item: Data) => item.id, item => html`
      <tr id=${item.id} class=${item.id === selected ? 'danger' : ''}>
        <td class="col-md-1">${item.id}</td>
        <td class="col-md-4">
          <a class="lbl">${item.label}</a>
        </td>
        <td data-interaction='delete' class="col-md-1">
          <a>
            <span class="glyphicon glyphicon-remove remove" aria-hidden="true"></span>
          </a>
        </td>
        <td class="col-md-6"></td>
      </tr>`)}
    </tbody>
  </table>
  <span class="preloadicon glyphicon glyphicon-remove hidden" aria-hidden="true"></span>
</div>`;
}

const getId = (elem: any) => {
  const tr = elem.closest('tr');
  return parseInt(tr.id);
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
    stopMeasure();
  } else if (t.matches('td')) {
    startMeasure('select');
    const id = getId(t);
    component.run('select', id);
    stopMeasure();
  }
}

const my_update = {
  '#benchmark-lit-html': state => state,
  ...update,
}
const component = new Component<State, Events>(state, view, my_update);
export default (element) => component.mount(element, { route: '' });


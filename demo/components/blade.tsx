import app, { on, Component } from '../../src/apprun'

const Panel = ({ id, title }) => (
  <div className="panel panel-default">
    <div className="panel-heading">
      {title}
      <span className="pull-right">
        <a href="#" onclick={(e) => {
          e.preventDefault()
          app.run('#clear-panel', id)
        }}>x</a>
      </span>
    </div>
    <div className="panel-body" id={id} />
  </div>
)

let idx = 0

class ChildComponent extends Component {
  state = idx

  view = state => <div>
    <h1>{state}</h1>
  </div>

  @on('render')
  _render = state => state
}

const addPanel = () => {
  const id = `${++idx}`
  const component = new ChildComponent().mount(id)
  app.run('#add-panel', {id, title: `#${idx}`, component})
}

export class BladeHostComponent extends Component {
  state = {
    panels: {}
  }

  view = state => {
    const panels = Object.keys(state.panels).map(key => state.panels[key])
    return <div>
      <div>
        <button onclick={() => this.run('clear')}>Clear All</button>&nbsp;
        <button onclick={() => addPanel()}>Add blade</button>
      </div>
      <br/>
      <div className="row panel-container">
        {panels.map(p => <Panel id={p.id} title={p.title} />)}
      </div>
    </div>
  }

  rendered = () => {
    Object.keys(this.state.panels)
      .map(key => this.state.panels[key])
      .forEach(p => p && p.component && p.component.run('render'))
    const el = document.querySelector('.panel-container')
    el.scrollLeft = el.scrollWidth - el.clientWidth
  }

  update = {
    '#blade': state => state,
    '#add-panel': (state, panel, remove) => {
      state.panels[panel.id] = panel
      remove && remove.forEach(id => delete state.panels[id])
      return state;
    },
    '#clear-panel': (state, id) => {
      delete state.panels[id];
      return state;
    },
    'clear': state => {
      idx = 0;
      return { panels: { } }
    }
  }
}

export default (element) => new BladeHostComponent().mount(element);

// @ts-nocheck

import { app, Component } from '../../src/apprun'

class MyWebcomp extends Component {
  css = `section { border: 1px solid #ccc; margin: 0.2em 0; }
span { display: inline-block; width: 6em }
button { width: 6em }`
  state = 0
  view = (state, props = this.props) => {
    const { name, value, handleClick } = props
    return (
      <>
        <style innerHTML={this.css} />
        <section>
          <span>{name}</span>
          <button $onclick='inc'>
            state: {state}
          </button>
          {handleClick
            ? (
              <button onclick={() => handleClick(10)}>
                props: {value}
              </button>
            )
            : null
          }
        </section>
      </>
    )
  }
  update = {
    inc: (state) => {
      state += 1
      this.dispatchEvent(new CustomEvent('my-webcomp-inc', {
        composed: true,
        bubbles: true,
        detail: { name: this.props.name, state }
      }))
      return state
    },
    attributeChanged: (state, name, oldValue, value) => {
      console.log('attributeChanged', {state, name, oldValue, value})
    }
  }
  mounted = (props) => {
    this.props = props
    return this.state
  }
}

app.webComponent('my-webcomp', MyWebcomp, {
  shadow: true,
  observedAttributes: ['name', 'value', 'handleClick']
})

// ---- a web-component container for my-webcomp ----

class MyContainer extends HTMLElement {
  state = 2
  update = (n) => {
    this.$state.textContent = this.$el.value = n
  }
  handleClick = () => this.update(this.state = 0)
  connectedCallback () {
    this.innerHTML = `<div class='box app'>
      <h4>A Web-Component Container</h4>
      <button>reset: <span>${this.state}</span></button>
      <my-webcomp name='name: wc'/>
    </div>`
    this.$reset = this.querySelector('button')
    this.$state = this.querySelector('span')
    this.$el = this.querySelector('my-webcomp')
    this.update(this.state)
    this.$el.handleClick = (n) => this.update(this.state += n)
    this.$reset.addEventListener('click', this.handleClick)
  }
  disconnectedCallback () {
    this.$reset.removeEventListener('click', this.handleClick)
  }
}

customElements.define('my-container', MyContainer)

// ---- a jsx container accessing my-webcomp and listening on custom event ----

class MyJsxContainer extends Component {
  state = 5
  view = (state) => (
    <div className='box jsx' ref={ref => this.attachCustomEvent(ref)}>
      <h4>A JSX Container</h4>
      <button onclick={() => this.run('reset') }>reset: {state}</button>
      <my-webcomp name='name: local' />
      <my-webcomp name='name: bidir'
        value={state}
        handleClick={(n) => this.run('change', n)} />
    </div>
  )
  update = {
    reset: (state) => 0,
    change: (state, n) => state + n
  }
  unload = () => {
    this.detachCustomEvent(this.ref)
  }
  handleCustomEvent = (ev) => {
    console.log('handleCustomEvent', ev.detail)
  }
  attachCustomEvent = (ref) => {
    if (this.ref !== ref) {
      this.detachCustomEvent(this.ref)
      this.ref = ref
      this.ref.addEventListener('my-webcomp-inc', this.handleCustomEvent.bind(this))
    }
  }
  detachCustomEvent = (ref) => {
    ref && ref.removeEventListener('my-webcomp-inc', this.handleCustomEvent.bind(this))
  }
}

// ---- the application ----

const style = `html { font-family: sans-serif; }
.box { margin: 0.5em 0; padding: 0.5em; border: 1px solid #ccc; }
`

const view = () => (
  <>
    <style innerHTML={style} />
    <div>
      <h2>Web-Components Demo</h2>
      <p>This Demo passes properties from a container to the web-component <code>&lt;my-webcomp&gt;</code>.</p>
      <p>Clicking on "props:" buttons increase the counter in the container, which then passes on the new value back to the component. "state:" changes only the local state</p>
    </div>
    <my-container />
    <MyJsxContainer />
  </>
)
const update = {
  '#webcomponents': (model) => model
}

export default element => new Component({}, view, update).mount(element);

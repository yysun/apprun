/**
 * CounterComponent - MVU pattern demonstration with counter functionality
 * Features: MVU pattern with increment/decrement/reset operations
 * Implementation: Object state with multiple update event handlers
 */

export class CounterComponent extends Component {
  state = { count: 0 };

  view = (state) => html`
    <div>
      <h2>Counter: ${state.count}</h2>
      <div class="counter-buttons">
        <button @click=${() => this.run('increment')}>+1</button>
        <button @click=${() => this.run('decrement')}>-1</button>
        <button @click=${() => this.run('reset')}>Reset</button>
      </div>
      <div style="margin-top: 15px;">
        <small>This demonstrates a counter component - dynamic import: </small>
        <pre>
  '/counter': async () => {
    const { CounterComponent } = await import('./components/CounterComponent.js');
    return CounterComponent;
  },        
        </pre>
      </div>
    </div>
  `;

  update = {
    'increment': (state) => ({ ...state, count: state.count + 1 }),
    'decrement': (state) => ({ ...state, count: state.count - 1 }),
    'reset': (state) => ({ ...state, count: 0 })
  };
}

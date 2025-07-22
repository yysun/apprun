/**
 * HomeComponent - A simple home page component
 * Features: String state management, message update functionality
 * Implementation: Uses string state with update event handler
 */

export class HomeComponent extends Component {
  state = 'Welcome to Home!';

  view = (state) => html`
    <div>
      <h2>Home Page</h2>
      <p>${state}</p>
      <button @click=${() => this.run('set-home-message', 'Message updated!')}>
        Update Message
      </button>
      <div style="margin-top: 15px;">
        <small>This component will be used as a class: </small>
        <pre>
'/': HomeComponent,
        </pre>
      </div>
    </div>
  `;

  update = {
    'set-home-message': (state, message) => message
  };
}

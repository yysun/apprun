/**
 * ContactComponent - Static contact information display
 * Features: Static object state displaying contact information
 * Implementation: Simple state display without update handlers
 */

export class ContactComponent extends Component {
  state = { email: 'contact@example.com', phone: '555-0123' };

  view = (state) => html`
    <div>
      <h2>Contact Us</h2>
      <p><strong>Email:</strong> ${state.email}</p>
      <p><strong>Phone:</strong> ${state.phone}</p>
      <div style="margin-top: 15px;">
        <small>This component class will be returned by a function: </small>
      </div>
      <pre>
'/contact': () => ContactComponent,
      </pre>
    </div>
  `;
}

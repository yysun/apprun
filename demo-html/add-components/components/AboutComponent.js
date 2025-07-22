/**
 * AboutComponent - About page with object state management
 * Features: Object state management, content update capability  
 * Implementation: Uses object state with spread operator for updates
 */

export class AboutComponent extends Component {
  state = { title: 'About Us', content: 'Learn more about our company' };

  view = (state) => html`
    <div>
      <h2>${state.title}</h2>
      <p>${state.content}</p>
      <button @click=${() => this.run('update-about', { content: 'Updated company information!' })}>
        Update Content
      </button>
      <div style="margin-top: 15px;">
        <small>This component will be used as a instance:</small>
      </div>
        <pre>
'/about': new AboutComponent(),
        </pre>      
    </div>
  `;

  update = {
    'update-about': (state, newData) => ({ ...state, ...newData })
  };
}

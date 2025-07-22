/**
 * AppComponent - Main application component with navigation and routing
 * Features: Navigation UI, route state management, component registration display
 * Implementation: Object state with route tracking, contains main app structure
 */

export class AppComponent extends Component {
  state = { currentRoute: '/home' };

  view = (state) => html`
    <div class="container">
      <h1>AppRun Add-Components Demo</h1>
      <div class="navigation">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/counter">Counter</a>
        <a href="/svu">state-view-update</a>
        <a href="/function">Function</a>
      </div>

      <div class="content" id="pages">
        <!-- Component content will be rendered here -->
        <p>Select a navigation link above to see the component content.</p>
      </div>

      <div class="component-list">
        <h3>Registered Components</h3>
        <p><strong>Current Route:</strong> ${state.currentRoute}</p>
        <ul>
          <li><strong>/</strong> - HomeComponent (string state with message update functionality)</li>
          <li><strong>/about</strong> - AboutComponent (object state with content update capability)</li>
          <li><strong>/contact</strong> - ContactComponent (static object state displaying contact information)</li>
          <li><strong>/counter</strong> - CounterComponent (SVU pattern with increment/decrement/reset operations)</li>
          <li><strong>/svu</strong> - SVUComponent (demonstrates SVU architecture with text input handling)</li>
          <li><strong>/function</strong> - function returning a template literal or vdom</li>
        </ul>
      </div>
    </div>
  `;

  update = {
    '//': (state, route) => ({ ...state, currentRoute: route })
  };
}

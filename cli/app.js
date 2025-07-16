const { app, html } = window["apprun"];

// Routing (component event)
class Home extends Component {
  view = () => html`<div>Home</div>`;
  update = { '/, /home': state => state };
}

class Contact extends Component {
  view = () => html`<div>Contact</div>`;
  update = { '/contact': state => state };
}

class About extends Component {
  view = () => html`<div>About</div>`;
  update = { '/about': state => state };
}

const App = () => html`<div id="menus">
  <a href="/home">Home</a> |
  <a href="/contact">Contact</a> |
  <a href="/about">About</a></div>
  <div id="pages"></div>
`;

// app.basePath = '/'; // Uncomment this line if you want to set a base path for routing
app.start('#app', {}, App);

[About, Contact, Home].map(C => new C().start('pages'));

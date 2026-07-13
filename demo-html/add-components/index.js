/**
 * Standalone addComponents demo bootstrap.
 *
 * Enables pretty-link routing before mounting because the demo navigation uses
 * browser path links under a configured base path.
 */
import { AppComponent } from './components/AppComponent.js';
import { HomeComponent } from './components/HomeComponent.js';
import { AboutComponent } from './components/AboutComponent.js';
import { ContactComponent } from './components/ContactComponent.js';
// import { CounterComponent } from './components/CounterComponent.js';
import { SVUComponent } from './components/SVUComponent.js';
import functionComponent from './components/FunctionComponent.js';

app.basePath = '/demo-html/add-components'; // Set the base path for the app
app.use_prettyLink();

// Initialize the main app
const mainApp = new AppComponent();
mainApp.start(document.body);

// Use addComponents to register all route-component pairs
app.addComponents('#pages', {
  '/': HomeComponent,
  '/about': new AboutComponent(),
  '/contact': () => ContactComponent,
  '/counter': async () => {
    const { CounterComponent } = await import('./components/CounterComponent.js');
    return CounterComponent;
  },
  '/svu': SVUComponent,
  '/function': functionComponent
});

// Log registered routes for verification
console.log('Registered routes:', ['/', '/about', '/contact', '/counter', '/svu', '/function']);

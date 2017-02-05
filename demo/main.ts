import app from '../index-zero';
import home from './router-components/home';
import counter from './router-components/counter';
import counters from './router-components/counters';
import echo from './router-components/echo';

const element = document.getElementById('my-app');
[home, counter, counters, echo].forEach(c => c(element));

app.run('/');



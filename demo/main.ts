import app from '../index-zero';
import home from './router-components/home';
import counter from './router-components/counter';
import counters from './router-components/counters';
import echo from './router-components/echo';
import dragdrop from './router-components/dragdrop';
import todo from './router-components/todo';

const element = document.getElementById('my-app');
[home, counter, counters, echo, dragdrop, todo].forEach(c => c(element));

app.run('/');



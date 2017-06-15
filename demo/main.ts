
import home from './router-components/home';
import counter from './router-components/counter';
import counters from './router-components/counters';
import echo from './router-components/echo';
import dragdrop from './router-components/dragdrop';
import todo from './router-components/todo';
import typeahead from './router-components/typeahead';
// import multi from './router-components/typeahead-multi-selection';
import benchmark from './router-components/benchmark';
import hello from './router-components/hello';

const element = document.getElementById('my-app');
[home, echo, counter, counters, dragdrop, todo, typeahead, benchmark, hello].forEach(c => c(element));
// [hello].forEach(c => c(element));




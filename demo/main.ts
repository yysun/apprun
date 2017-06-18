
import home from './router-components/home';
import counter from './router-components/counter';
import counters from './router-components/counters';
import dragdrop from './router-components/dragdrop';
import todo from './router-components/todo';
import typeahead from './router-components/typeahead';
import benchmark from './router-components/benchmark';
import hello from './router-components/hello';
import hacker_news from './router-components/hacker-news';

const element = document.getElementById('my-app');
[home, hello, counter, counters, dragdrop, todo, typeahead, benchmark, hacker_news].forEach(c => c(element));




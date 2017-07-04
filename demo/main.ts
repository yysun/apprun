import app from '../index';

import home from './router-components/home';
import counter from './router-components/counter';
import counters from './router-components/counters';
import dragdrop from './router-components/dragdrop';
import todo from './router-components/todo';
import multi from './router-components/typeahead-multi-selection';
import benchmark from './router-components/benchmark';
import hello from './router-components/hello';
import hacker_news from './router-components/hacker-news';

const element = document.getElementById('my-app');
[home, hello, counter, counters, dragdrop, todo, multi, benchmark, hacker_news].forEach(c => c(element));

app.on('//', route => {
  const menus = document.querySelectorAll('.navbar-nav li');
  for (let i = 0; i < menus.length; ++i) menus[i].classList.remove('active');
  const item = document.querySelector(`[href='${route}']`);
  item && item.parentElement.classList.add('active');
})
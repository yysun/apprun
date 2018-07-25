import app from '../src/apprun';

app.on('//', route => {
  const menus = document.querySelectorAll('.navbar-nav li');
  for (let i = 0; i < menus.length; ++i) menus[i].classList.remove('active');
  const item = document.querySelector(`[href='${route}']`);
  item && item.parentElement.classList.add('active');
})

import home from './components/home';
import counter from './components/counter';
import counters from './components/counters';
import dragdrop from './components/dragdrop';
import blade from './components/blade';
import todo from './components/todo';
import multi from './components/typeahead-multi-selection';
import benchmark from './components/benchmark';
import hello from './components/hello';
import svg from './components/svg';
// import hacker_news from './components/hacker-news';

const element = document.getElementById('my-app');
[home, hello, blade, counter, counters, dragdrop, todo, multi, benchmark, svg].forEach(c => c(element));


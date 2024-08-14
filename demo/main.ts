import app, { ROUTER_EVENT } from '../src/apprun';

app['no-init-route'] = true;
app.on(ROUTER_EVENT, route => {
  const menus = document.querySelectorAll('.navbar-nav li');
  for (let i = 0; i < menus.length; ++i) menus[i].classList.remove('active');
  const item = document.querySelector(`[href='${route}']`);
  item && item.parentElement.classList.add('active');
});

import home from './components/home';
import counter from './components/counter';
import counters from './components/counters';
import dragdrop from './components/dragdrop';
import calculator from './components/calculator';
import todo from './components/todo';
import benchmark_lit from './components/benchmark-lit-html';
import benchmark from './components/benchmark';
import hello from './components/hello';
import svg from './components/svg';
import animation from './components/animation';
import play from './components/play';
import webcomponents from './components/web-components';
import '../src/apprun-code';
import '../src/apprun-dev-tools';

const element = document.getElementById('my-app');
[home, hello, counter, counters, todo, calculator, dragdrop, svg, animation,
  benchmark, benchmark_lit,
  play, webcomponents].forEach(c => c(element));

// trigger the initial route to demo apprun-no-init in html head
app.route(location.hash);
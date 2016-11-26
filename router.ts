import app from './app';

const route = (url) => {
  if(url && url.indexOf('/') > 0) {
    const ss = url.split('/');
    app.run(ss[0], ss[1]);
  } else {
    app.run(url);
  }
}

export const router = (element, components, home = '/') => {
  components.forEach( c => c(element));
  window.onpopstate = e => {
    element.removeChild(element.firstElementChild);
    route(location.hash || home);
  }
  route(location.hash || home);
}

export default router;
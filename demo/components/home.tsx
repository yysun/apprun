import app from '../../src/apprun';
declare var $: any;
let _element;

const HTML =  ({ url }) => {
  _element.innerHTML = '<div></div>';
  $(_element.firstChild).load(url);
}
app.on('#', () => app.render(_element, <HTML url='demo/home.html' />));
app.on('#new', () => app.render(_element, <HTML url='demo/new.html' />));

export default (element) => _element = element;
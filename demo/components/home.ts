import app from '../../src/apprun';
//import * as $ from "jquery";
declare var $: any;

let _element;
app.on('#', () => {
  _element.innerHTML = '<div></div>'
  $(_element.firstChild).load('demo/components/home.html')
})
export default (element) => _element = element;

import { VDOM } from './types';

function getProp(prop) {
  if (typeof prop === 'object') {
    return Object.keys(prop).map(name => `${name}:${prop[name]}`).join(';');
  }
  else return prop.toString();
}

function toProps(props) {
  return Object.keys(props)
    .map(name => ` ${name === 'className' ? 'class' : name}="${getProp(props[name])}"`)
    .join('');
}

function toHTMLArray(nodes) {
  return nodes.map(node => toHTML(node)).join('');
}

function clean(obj) {
  for (var i in obj) {
    if (obj[i] == null) {
      delete obj[i];
    } else if (typeof obj[i] === 'object') {
      clean(obj[i]);
    }
  }
}

function toHTML (vdom: VDOM) {
  if (!vdom) return '';
  clean(vdom);
  if (Array.isArray(vdom)) return toHTMLArray(vdom);
  if (typeof vdom === 'string') {
    return vdom.startsWith('_html:') ? vdom.substring(6) : vdom;
  } else if (vdom.tag) {
    const props = vdom.props ? toProps(vdom.props) : '';
    const children = vdom.children ? toHTMLArray(vdom.children) : '';
    return `<${vdom.tag}${props}>${children}</${vdom.tag}>`;
  }
  if (typeof vdom === 'object') return JSON.stringify(vdom);
}

export default toHTML;
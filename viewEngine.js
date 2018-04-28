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

function toHTML(vdom) {
  if (Array.isArray(vdom)) return toHTMLArray(vdom)
  if (vdom.tag) {
    const props = vdom.props ? toProps(vdom.props) : '';
    const children = vdom.children ? toHTMLArray(vdom.children) : '';
    return `<${vdom.tag}${props}>${children}</${vdom.tag}>`;
  }
  if (typeof vdom === 'object') return JSON.stringify(vdom);
  else return vdom.toString();
}

function toHTMLArray(nodes) {
  return nodes.map(node => toHTML(node)).join('');
}

function engine(name, options, callback) {
  const fn = require(name).default;
  const rendered = fn(options);
  return global.ssr ?
    callback(null, toHTML(rendered)) :
    callback(null, rendered);
}

module.exports = function(mode) {
  return mode === 'html' ? toHTML: engine
}
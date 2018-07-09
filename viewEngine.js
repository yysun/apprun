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
  if (!vdom) return '';
  if (Array.isArray(vdom)) return toHTMLArray(vdom)
  if (vdom.tag) {
    const props = vdom.props ? toProps(vdom.props) : '';
    const children = vdom.children ? toHTMLArray(vdom.children) : '';
    return `<${vdom.tag}${props}>${children}</${vdom.tag}>`;
  }
  if (typeof vdom === 'object') return JSON.stringify(vdom);
  else {
    const html = vdom.toString();
    return html.startsWith('_html:') ? html.substring(6) : html;
  }
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

function engine(name, options, callback) {
  const fn = require(name).default;
  const rendered = fn(options);
  clean(rendered);
  return options.ssr ?
    callback(null, toHTML(rendered)) :
    callback(null, rendered);
}

module.exports = function (mode) {
  return mode === 'html' ? toHTML : engine
}
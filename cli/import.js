import ymal from 'js-yaml';
import { readFileSync } from 'fs';

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

export default function import_yaml(fn) {

  const def = ymal.load(readFileSync(fn, 'utf8'))

  const { name, state, view, update } = def;

  const jsx = toHTML(view);

  // const update_text = JSON.stringify(update, null, 2)
  //   .replace(/\\n/g, '\n');

  const update_text =
  Object.keys(update).map(key => `
    "${key}" : ${update[key].replace(/\\n/g, '\n')}`).join(',\n'
  );

  const component = `
  import { app, Component } from 'apprun';

  class ${name} extends Component {

    state = ${JSON.stringify(state)};

    view = ${jsx};

    update = {
      ${update_text}
    };
  };
`;

  console.log(component);
}
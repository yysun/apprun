import app from './app';

const getStateValue = (component, name) => {
  return (name ? component['state'][name] : component['state']) || '';
}

const setStateValue = (component, name, value) => {
  if (name) {
    const state = component['state'] || {};
    state[name] = value;
    component.setState(state);
  } else {
    component.setState(value);
  }
}

const apply_directive = (key: string, props: {}, tag, component) => {
  if (key.startsWith('$on')) {
    const event = props[key];
    key = key.substring(1)
    if (typeof event === 'boolean') {
      props[key] = e => component.run(key, e);
    } else if (typeof event === 'string') {
      props[key] = e => component.run(event, e);
    } else if (typeof event === 'function') {
      props[key] = e => component.setState(event(component.state, e));
    } else if (Array.isArray(event)) {
      const [handler, ...p] = event;
      if (typeof handler === 'string') {
        props[key] = e => component.run(handler, ...p, e);
      } else if (typeof handler === 'function') {
        props[key] = e => component.setState(handler(component.state, ...p, e));
      }
    }

  } else if (key === '$bind') {
    const type = props['type'] || 'text';
    const name = typeof props[key] === 'string' ? props[key] : props['name'];
    if (tag === 'input') {
      switch (type) {
        case 'checkbox':
          props['checked'] = getStateValue(component, name);
          props['onclick'] = e => setStateValue(component, name || e.target.name, e.target.checked);
          break;
        case 'radio':
          props['checked'] = getStateValue(component, name) === props['value'];
          props['onclick'] = e => setStateValue(component, name || e.target.name, e.target.value);
          break;
        case 'number':
        case 'range':
          props['value'] = getStateValue(component, name);
          props['oninput'] = e => setStateValue(component, name || e.target.name, Number(e.target.value));
          break;
        default:
          props['value'] = getStateValue(component, name);
          props['oninput'] = e => setStateValue(component, name || e.target.name, e.target.value);
      }
    } else if (tag === 'select') {
      props['value'] = getStateValue(component, name);
      props['onchange'] = e => {
        if (!e.target.multiple) { // multiple selection use $bind on option
          setStateValue(component, name || e.target.name, e.target.value);
        }
      }
    } else if (tag === 'option') {
      props['selected'] = getStateValue(component, name);
      props['onclick'] = e => setStateValue(component, name || e.target.name, e.target.selected);
    } else if (tag === 'textarea') {
      props['innerHTML'] = getStateValue(component, name);
      props['oninput'] = e => setStateValue(component, name || e.target.name, e.target.value);
    }
  } else {
    app.run('$', { key, tag, props, component });
  }
}

const directive = (vdom, component) => {
  if (Array.isArray(vdom)) {
    return vdom.map(element => directive(element, component));
  } else {
    let { tag, props, children } = vdom;
    if (tag && props) {
      Object.keys(props).forEach(key => {
        if (key.startsWith('$')) {
          apply_directive(key, props, tag, component);
          delete props[key];
        }
      });
      if (children) children = directive(children, component);
      return { tag, props, children };
    } else {
      return vdom;
    }
  }
}

export default directive;
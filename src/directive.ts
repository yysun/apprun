app.on('$', () => { });

const setStateValue = (component, name, value) => {
  if (name) {
    const state = { ...component['state'] };
    state[name] = value;
    component.setState(state);
  } else {
    component.setState(value);
  }
}

export default (key: string, props: [], tag, component) => {
  if (key.startsWith('$on')) {
    const event = props[key];
    key = key.substring(1)
    if (typeof event === 'boolean') {
      props[key] = e => component.run(key, e);
    } else if (typeof event === 'string') {
      props[key] = e => component.run(event, e)
    }
  } else if (key === '$bind' && tag === 'input') {
    const type = props['type'] || 'text';
    const name = typeof props[key]==='string' ? props[key] : null;
    switch (type) {
      case 'checkbox':
        props['onclick'] = e => setStateValue(component, name || e.target.name, e.target.checked);
        break;
      case 'number':
      case 'range':
        props['oninput'] = e => setStateValue(component, name || e.target.name, Number(e.target.value));
        break;
      case 'date':
      case 'time':
      case 'datetime-local':
        props['onchange'] = e => setStateValue(component, name || e.target.name, Date.parse(e.target.value));
        break;
      default:
        props['oninput'] = e => setStateValue(component, name || e.target.name, e.target.value);
    }
  } else if (key === '$bind' && tag === 'select') {
    const name = typeof props[key] === 'string' ? props[key] : null;
    props['onselect'] = e => {
      if (!e.target.multiple) {
        setStateValue(component, name || e.target.name, e.target.selectedIndex);
      } else {
        setStateValue(component, name || e.target.name, e.target.selectedOptions.map(o=>e.target.options.indexOf(o)));
      }
    }
  } else {
    app.run('$', key, props, component);
  }
}
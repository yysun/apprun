export default (key: string, props: [], component) => {
  if (key.startsWith('$on')) {
    const event = props[key];
    key = key.substring(1)
    if (typeof event === 'boolean') {
      props[key] = e => component.run(key, e);
    } else if (typeof event === 'string') {
      props[key] = e => component.run(event, e)
    }
  } else if (key === '$bind') {
    const name = props[key];
    props['oninput'] = e => {
      if (typeof name === 'string') {
        const state = { ...component['state'] };
        state[name] = e.target.value;
        component.setState(state);
      } else {
        component.setState(e.target.value);
      }
    }
  } else if (key === '$watch') {
    const event = props[key];
    const id = '_c' + component['_tracking'].length;
    component['_tracking'].push({ id, event });
    props['class'] = props['class'] || props['className'] || [];
    props['class'] += ` ${id}`;
  } else {
    app.run('$', key, props, component);
  }
}
import { useState } from 'react';

const toReact = (componentClass) => {
  const component = new componentClass().mount();
  const { state, view } = component;
  return () => {
    const [_state, setState] = useState(state);
    component.view = setState;
    return view(_state);
  }
}

export default toReact;
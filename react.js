import app from 'apprun';
import React from 'react';
import ReactDOM from 'react-dom/client'
import { useState } from 'react';

export const user_react = () => {
  app.h = app.createElement = React.createElement;
  app.Fragment = React.Fragment;
  app.render = (el, vdom) => ReactDOM.render(vdom, el);
  if (React.version && React.version.startsWith('18')) {
    app.render = (el, vdom) => {
      if (!el || !vdom) return;
      if (!el._root) el._root = ReactDOM.createRoot(el);
      el._root.render(vdom);
    }
  }
}
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
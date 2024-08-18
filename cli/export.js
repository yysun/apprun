import { exec } from 'child_process';
import yaml from 'js-yaml';
import { unlinkSync } from 'fs';

function replacer(key, value) {
  if (typeof value === 'function') return value.toString();
  return ['', null].includes(value) || (typeof value === 'object' && (value.length === 0 || Object.keys(value).length === 0)) ? undefined : value;
}

function createProxy(obj) {
  const handler = {
    get(target, property, receiver) {

      // Get the property value
      const value = Reflect.get(target, property, receiver);

      // If the value is an object (including arrays), proxy it
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          // Proxy each element of the array if it's an object
          return value.map(item => createProxy(item));
        } else {
          // Recursively proxy the object
          return createProxy(value);
        }
      }

      return `{${property}}`
    },

  };

  return Array.isArray(obj) ?
    obj.map(item => createProxy(item)) : new Proxy(obj, handler);
}

function getVDOM(component) {
  let view;
  if (typeof component.state === 'object') {
    const proxy = createProxy(component.state);
    view = component.view(proxy);
  } else {
    view = component.view(component.state);
  }
  return view;
}

export default function export_yaml(fn) {

  const tmp = process.cwd() + '/_tmp.js';
  exec(`npx esbuild ${fn} --outfile=${tmp} --format=esm --bundle`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    import(tmp).then((m) => {

      const defaul_export = m.default
      let component;
      if (typeof defaul_export === 'function' &&
        /^class\s/.test(Function.prototype.toString.call(defaul_export))) {
        component = new m.default();
        component = component.mount();
      } else if (typeof defaul_export === 'function') {
        component = defaul_export();
      } else {
        component = defaul_export;
      }

      const vdom = getVDOM(component);
      const events = component['_actions'].map(a => a.name);

      const component_def = {
        name: component.constructor.name,
        file: fn,
        state: component.state,
        view: vdom,
        actions: events,
        update: component.update,
      };

      const yaml_def = yaml.dump(component_def, { replacer });
      console.log(yaml_def);

      unlinkSync(tmp);
    });
  });
}




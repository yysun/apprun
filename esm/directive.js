/**
 * Component Directives Implementation
 *
 * This file provides built-in directives for components:
 * 1. Event Binding ($on directives)
 *    - $on: Bind DOM events to component events
 *    - Supports event delegation and parameters
 *    - Handles function, string, and array event handlers
 *    - Type-safe event target handling
 *
 * 2. Two-way Data Binding ($bind directive)
 *    - $bind: Sync form elements with component state
 *    - Handles input types: text, checkbox, radio, number, range
 *    - Supports select (single/multiple) and textarea elements
 *    - Automatic value type conversion for numbers
 *    - Support for complex property paths
 *
 * 3. Custom Directives
 *    - Extensible directive system via '$' events
 *    - Processes virtual DOM during rendering
 *    - Supports custom attribute directives
 *
 * Features:
 * - Automatic state synchronization
 * - Type conversion for form inputs
 * - Event delegation support
 * - Multiple event handler formats
 * - Nested property binding
 * - Custom directive extensibility
 *
 * Type Safety Improvements (v3.35.1):
 * - Added null checks for event targets before type assertions
 * - Proper typing for different HTML element types
 * - Enhanced error handling for invalid event targets
 * - Safer DOM element property access
 *
 * Nested State Binding Support (v3.37.4):
 * - Enhanced $bind directive to support nested object and array paths
 * - Supports dot notation: 'user.name', 'user.profile.settings.theme'
 * - Supports bracket notation: 'items[0]', 'users[1].name'
 * - Supports mixed notation: 'users[0].settings.theme', 'data["key"].value'
 * - Safe traversal with automatic intermediate object/array creation
 * - Maintains backward compatibility with simple property binding
 *
 * Usage:
 * ```tsx
 * // Event binding
 * <button $onclick="event-name">Click</button>
 * <input $oninput={e => setState(e.target.value)} />
 *
 * // Simple two-way binding
 * <input $bind="state.property" />
 * <select $bind="selected">...</select>
 *
 * // Nested object binding
 * <input $bind="user.profile.name" />
 * <input $bind="user.settings.theme" />
 *
 * // Array element binding
 * <input $bind="items[0]" />
 * <input $bind="todos[1].title" />
 *
 * // Mixed nested binding
 * <input $bind="users[0].profile.settings.notifications.email" />
 * <select $bind="config.display.mode">...</select>
 *
 * // Array handlers
 * <button $onclick={['handler', param1, param2]}>Click</button>
 * ```
 */
import app from './app';
import { safeEventTarget } from './type-utils';
/**
 * Parse a path string into an array of keys and indices
 * Supports paths like: 'a.b', 'a[0]', 'a[0].b', 'a["key"]'
 */
const parsePath = (path) => {
    if (!path)
        return [];
    const keys = [];
    let current = '';
    let inBracket = false;
    let quoteChar = '';
    for (let i = 0; i < path.length; i++) {
        const char = path[i];
        if (char === '[' && !inBracket) {
            if (current) {
                keys.push(current);
                current = '';
            }
            inBracket = true;
        }
        else if (char === ']' && inBracket) {
            if (quoteChar) {
                // Remove quotes from string keys
                current = current.slice(1, -1);
            }
            else if (/^\d+$/.test(current)) {
                // Convert numeric strings to numbers
                current = parseInt(current, 10);
            }
            keys.push(current);
            current = '';
            inBracket = false;
            quoteChar = '';
        }
        else if ((char === '"' || char === "'") && inBracket) {
            if (!quoteChar) {
                quoteChar = char;
            }
            else if (char === quoteChar) {
                quoteChar = '';
            }
            current += char;
        }
        else if (char === '.' && !inBracket) {
            if (current) {
                keys.push(current);
                current = '';
            }
        }
        else {
            current += char;
        }
    }
    if (current) {
        keys.push(current);
    }
    return keys;
};
/**
 * Safely get a nested value from an object using a path
 */
const getNestedValue = (obj, path) => {
    let current = obj;
    for (const key of path) {
        if (current == null)
            return undefined;
        current = current[key];
    }
    return current;
};
/**
 * Safely set a nested value in an object using a path
 * Creates intermediate objects/arrays as needed
 */
const setNestedValue = (obj, path, value) => {
    if (path.length === 0)
        return value;
    const result = { ...obj };
    let current = result;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        const nextKey = path[i + 1];
        if (current[key] == null) {
            // Create array if next key is numeric, object otherwise
            current[key] = typeof nextKey === 'number' ? [] : {};
        }
        else if (Array.isArray(current[key])) {
            current[key] = [...current[key]];
        }
        else if (typeof current[key] === 'object') {
            current[key] = { ...current[key] };
        }
        current = current[key];
    }
    current[path[path.length - 1]] = value;
    return result;
};
const getStateValue = (component, name) => {
    if (!name)
        return component['state'] || '';
    const path = parsePath(name);
    const value = getNestedValue(component['state'], path);
    return value !== undefined ? value : '';
};
const setStateValue = (component, name, value) => {
    if (!name) {
        component.setState(value);
        return;
    }
    const path = parsePath(name);
    const currentState = component['state'] || {};
    const newState = setNestedValue(currentState, path, value);
    component.setState(newState);
};
const apply_directive = (key, props, tag, component) => {
    if (key.startsWith('$on')) {
        const event = props[key];
        key = key.substring(1);
        if (typeof event === 'boolean') {
            props[key] = e => component.run ? component.run(key, e) : app.run(key, e);
        }
        else if (typeof event === 'string') {
            props[key] = e => component.run ? component.run(event, e) : app.run(event, e);
        }
        else if (typeof event === 'function') {
            props[key] = e => component.setState(event(component.state, e));
        }
        else if (Array.isArray(event)) {
            const [handler, ...p] = event;
            if (typeof handler === 'string') {
                props[key] = e => component.run ? component.run(handler, ...p, e) : app.run(handler, ...p, e);
            }
            else if (typeof handler === 'function') {
                props[key] = e => component.setState(handler(component.state, ...p, e));
            }
        }
    }
    else if (key === '$bind') {
        const type = props['type'] || 'text';
        const name = typeof props[key] === 'string' ? props[key] : props['name'];
        if (tag === 'input') {
            switch (type) {
                case 'checkbox':
                    props['checked'] = getStateValue(component, name);
                    props['onclick'] = e => {
                        const target = safeEventTarget(e);
                        if (target) {
                            setStateValue(component, name || target.name, target.checked);
                        }
                    };
                    break;
                case 'radio':
                    props['checked'] = getStateValue(component, name) === props['value'];
                    props['onclick'] = e => {
                        const target = safeEventTarget(e);
                        if (target) {
                            setStateValue(component, name || target.name, target.value);
                        }
                    };
                    break;
                case 'number':
                case 'range':
                    props['value'] = getStateValue(component, name);
                    props['oninput'] = e => {
                        const target = safeEventTarget(e);
                        if (target) {
                            setStateValue(component, name || target.name, Number(target.value));
                        }
                    };
                    break;
                default:
                    props['value'] = getStateValue(component, name);
                    props['oninput'] = e => {
                        const target = safeEventTarget(e);
                        if (target) {
                            setStateValue(component, name || target.name, target.value);
                        }
                    };
            }
        }
        else if (tag === 'select') {
            props['value'] = getStateValue(component, name);
            props['onchange'] = e => {
                const target = safeEventTarget(e);
                if (target && !target.multiple) { // multiple selection use $bind on option
                    setStateValue(component, name || target.name, target.value);
                }
            };
        }
        else if (tag === 'option') {
            props['selected'] = getStateValue(component, name);
            props['onclick'] = e => {
                const target = safeEventTarget(e);
                if (target) {
                    setStateValue(component, name || target.name, target.selected);
                }
            };
        }
        else if (tag === 'textarea') {
            props['innerHTML'] = getStateValue(component, name);
            props['oninput'] = e => {
                const target = safeEventTarget(e);
                if (target) {
                    setStateValue(component, name || target.name, target.value);
                }
            };
        }
    }
    else {
        app.run('$', { key, tag, props, component });
    }
};
const directive = (vdom, component) => {
    if (Array.isArray(vdom)) {
        return vdom.map(element => directive(element, component));
    }
    else {
        let { type, tag, props, children } = vdom;
        tag = tag || type;
        children = children || props?.children;
        if (props)
            Object.keys(props).forEach(key => {
                if (key.startsWith('$')) {
                    apply_directive(key, props, tag, component);
                    delete props[key];
                }
            });
        if (children)
            directive(children, component);
        return vdom;
    }
};
export default directive;
//# sourceMappingURL=directive.js.map
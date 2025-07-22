/** * VDOM Implementation for AppRun
 *
 * Notes for AppRun’s key prop
 * Use the key prop only if you need to preserve browser-side DOM state (such as cursor
 * position in an <input>, focus, or maintaining state in inline components).
 *
 * For most use cases, especially with stateless or purely data-driven UIs, key is not
 * needed and may decrease performance by forcing DOM moves.
 *
 * AppRun aggressively updates DOM to match your vdom, so DOM node preservation is
 * only valuable when you intentionally depend on browser-managed state.
 *
 * | Use Case                      | Should I use `key`? | Why                   |
 * | ----------------------------- | ------------------- | --------------------- |
 * | Preserve input cursor/focus   | ✅ Yes               | Keeps browser state   |
 * | Inline stateful component     | ✅ Yes               | Preserves component   |
 * | Regular data list (stateless) | 🚫 No               | Unnecessary DOM moves |
 * | Purely visual updates         | 🚫 No               | No state to preserve  |
 *
 * Features:
 * - Virtual DOM rendering and diffing for efficient DOM updates
 * - JSX Fragment support for both Babel and TypeScript
 * - Element creation with props, children, and event handling
 * - SVG element support with proper namespace handling
 * - Component lifecycle management and caching
 * - Keyed element optimization with automatic cleanup for memory management
 * - Safe HTML insertion and text node creation
 * - Directive processing integration
 *
 * Implementation:
 * - Uses plain JavaScript object for keyCache instead of Map for better performance
 * - Implements automatic cleanup of disconnected elements from keyCache
 * - Supports both string and function-based tags
 * - Handles component mounting and state management
 * - Optimized children updating with minimal DOM operations
 * - Memory-efficient caching with configurable thresholds (500 ops, 1000 max size)
 *
 * Recent Changes:
 * - 2025-07-15: Converted keyCache from Map to plain object ({}) for improved performance
 * - Updated cleanup functions to use object property deletion instead of Map methods
 * - Enhanced memory management with automatic cleanup of disconnected elements
 * - Added comprehensive key prop usage documentation and guidelines
 */
import directive from './directive';
import { updateProps } from './vdom-my-prop-attr';
export function Fragment(props, ...children) {
    return collect(children);
}
function collect(children) {
    const ch = [];
    const push = (c) => {
        if (c !== null && c !== undefined && c !== '' && c !== false) {
            ch.push((typeof c === 'function' || typeof c === 'object') ? c : `${c}`);
        }
    };
    children && children.forEach(c => {
        if (Array.isArray(c)) {
            c.forEach(i => push(i));
        }
        else {
            push(c);
        }
    });
    return ch;
}
const keyCache = {};
let cleanupCounter = 0;
const CLEANUP_THRESHOLD = 500; // Cleanup every 500 operations
const MAX_CACHE_SIZE = 1000;
// Lightweight cleanup function - only runs when needed
function cleanupKeyCache() {
    if (Object.keys(keyCache).length <= MAX_CACHE_SIZE)
        return; // Skip if under limit
    for (const [key, element] of Object.entries(keyCache)) {
        if (!element.isConnected) {
            delete keyCache[key];
        }
    }
}
// Export cleanup function for manual cleanup if needed
export function clearKeyCache() {
    for (const key in keyCache) {
        delete keyCache[key];
    }
    cleanupCounter = 0;
}
export function createElement(tag, props, ...children) {
    const ch = collect(children);
    if (typeof tag === 'string')
        return { tag, props, children: ch };
    else if (Array.isArray(tag))
        return tag; // JSX fragments - babel
    else if (tag === undefined && children)
        return ch; // JSX fragments - typescript
    else if (Object.getPrototypeOf(tag).__isAppRunComponent)
        return { tag, props, children: ch }; // createComponent(tag, { ...props, children });
    else if (typeof tag === 'function')
        return tag(props, ch);
    else
        throw new Error(`Unknown tag in vdom ${tag}`);
}
;
export const updateElement = (element, nodes, component = {}) => {
    // tslint:disable-next-line
    if (nodes == null || nodes === false)
        return;
    const el = (typeof element === 'string' && element) ?
        document.getElementById(element) || document.querySelector(element) : element;
    nodes = directive(nodes, component);
    render(el, nodes, component);
};
function render(element, nodes, parent = {}) {
    // tslint:disable-next-line
    if (nodes == null || nodes === false)
        return;
    nodes = createComponent(nodes, parent);
    if (!element)
        return;
    const isSvg = element.nodeName === "SVG";
    if (Array.isArray(nodes)) {
        updateChildren(element, nodes, isSvg);
    }
    else {
        updateChildren(element, [nodes], isSvg);
    }
}
function same(el, node) {
    // if (!el || !node) return false;
    const key1 = el.nodeName;
    const key2 = `${node.tag || ''}`;
    return key1.toUpperCase() === key2.toUpperCase();
}
function update(element, node, isSvg) {
    // console.assert(!!element);
    isSvg = isSvg || node.tag === "svg";
    if (!same(element, node)) {
        element.parentNode.replaceChild(create(node, isSvg), element);
        return;
    }
    updateChildren(element, node.children, isSvg);
    updateProps(element, node.props, isSvg);
}
function updateChildren(element, children, isSvg) {
    const old_len = element.childNodes?.length || 0;
    const new_len = children?.length || 0;
    const len = Math.min(old_len, new_len);
    for (let i = 0; i < len; i++) {
        const child = children[i];
        const el = element.childNodes[i];
        if (typeof child === 'string') {
            if (el.textContent !== child) {
                if (el.nodeType === 3) {
                    el.nodeValue = child;
                }
                else {
                    element.replaceChild(createText(child), el);
                }
            }
        }
        else if (child instanceof HTMLElement || child instanceof SVGElement) {
            element.insertBefore(child, el);
        }
        else {
            const key = child.props && child.props['key'];
            if (key) {
                if (el.key === key) {
                    update(element.childNodes[i], child, isSvg);
                }
                else {
                    // console.log(el.key, key);
                    const old = keyCache[key];
                    if (old) {
                        // const temp = old.nextSibling;
                        element.insertBefore(old, el);
                        // temp ? element.insertBefore(el, temp) : element.appendChild(el);
                        update(element.childNodes[i], child, isSvg);
                    }
                    else {
                        element.replaceChild(create(child, isSvg), el);
                    }
                }
            }
            else {
                update(element.childNodes[i], child, isSvg);
            }
        }
    }
    let n = element.childNodes?.length || 0;
    while (n > len) {
        element.removeChild(element.lastChild);
        n--;
    }
    if (new_len > len) {
        const d = document.createDocumentFragment();
        for (let i = len; i < children.length; i++) {
            d.appendChild(create(children[i], isSvg));
        }
        element.appendChild(d);
    }
}
export const safeHTML = (html) => {
    const div = document.createElement('section');
    div.insertAdjacentHTML('afterbegin', html);
    return Array.from(div.children);
};
function createText(node) {
    if (node?.indexOf('_html:') === 0) { // ?
        const div = document.createElement('div');
        div.insertAdjacentHTML('afterbegin', node.substring(6));
        return div;
    }
    else {
        return document.createTextNode(node ?? '');
    }
}
function create(node, isSvg) {
    // console.assert(node !== null && node !== undefined);
    if ((node instanceof HTMLElement) || (node instanceof SVGElement))
        return node;
    if (typeof node === "string")
        return createText(node);
    if (!node.tag || (typeof node.tag === 'function'))
        return createText(JSON.stringify(node));
    isSvg = isSvg || node.tag === "svg";
    const element = isSvg
        ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
        : document.createElement(node.tag);
    updateProps(element, node.props, isSvg);
    if (node.children)
        node.children.forEach(child => element.appendChild(create(child, isSvg)));
    if (node.props && node.props.key !== undefined) {
        element.key = node.props.key;
        keyCache[node.props.key] = element;
        // Lightweight cleanup - only when counter reaches threshold
        if (++cleanupCounter >= CLEANUP_THRESHOLD) {
            cleanupKeyCache();
            cleanupCounter = 0;
        }
    }
    return element;
}
function render_component(node, parent, idx) {
    const { tag, props, children } = node;
    let key = `_${idx}`;
    let id = props && props['id'];
    if (!id)
        id = `_${idx}${Date.now()}`;
    else
        key = id;
    let asTag = 'section';
    if (props && props['as']) {
        asTag = props['as'];
        delete props['as'];
    }
    if (!parent.__componentCache)
        parent.__componentCache = {};
    let component = parent.__componentCache[key];
    if (!component || !(component instanceof tag) || !component.element) {
        const element = document.createElement(asTag);
        component = parent.__componentCache[key] = new tag({ ...props, children }).mount(element, { render: true });
    }
    else {
        component.renderState(component.state);
    }
    if (component.mounted) {
        const new_state = component.mounted(props, children, component.state);
        (typeof new_state !== 'undefined') && component.setState(new_state);
    }
    updateProps(component.element, props, false);
    return component.element;
}
function createComponent(node, parent, idx = 0) {
    if (typeof node === 'string')
        return node;
    if (Array.isArray(node))
        return node.map(child => createComponent(child, parent, idx++));
    let vdom = node;
    if (node && typeof node.tag === 'function' && Object.getPrototypeOf(node.tag).__isAppRunComponent) {
        vdom = render_component(node, parent, idx);
    }
    if (vdom && Array.isArray(vdom.children)) {
        const new_parent = vdom.props?._component;
        if (new_parent) {
            let i = 0;
            vdom.children = vdom.children.map(child => createComponent(child, new_parent, i++));
        }
        else {
            vdom.children = vdom.children.map(child => createComponent(child, parent, idx++));
        }
    }
    return vdom;
}
//# sourceMappingURL=vdom-my.js.map
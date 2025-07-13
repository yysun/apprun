import webComponent from './web-component';
/**
 * TypeScript Decorators for AppRun Components
 *
 * This file provides decorators that enable:
 * 1. Event Handler Registration
 *    - @on(): Subscribe to events with options (global, once, delay)
 *    - @update(): Define state updates with metadata and options
 *    - Supports method and class decoration patterns
 *
 * 2. Web Component Integration
 *    - @customElement(): Register as custom element with options
 *    - Handles shadow DOM and attribute observation
 *    - Automatic lifecycle management for web components
 *
 * 3. Metadata Management
 *    - Custom Reflect implementation for decorator metadata
 *    - Stores event handler and update metadata for runtime use
 *    - Supports runtime reflection for dynamic behavior
 *    - Metadata keys for event bindings and updates
 *
 * Features:
 * - Event handler decoration with options
 * - State update method decoration
 * - Web component registration
 * - Metadata-driven event binding
 * - Flexible decorator patterns
 * - Runtime metadata access
 *
 * Type Safety Improvements (v3.35.1):
 * - Enhanced decorator typing for better IDE support
 * - Improved metadata key management
 * - Better type inference for decorated methods
 *
 * Usage:
 * ```ts
 * @customElement('my-element')
 * class MyComponent extends Component {
 *   @on('event', { global: true })
 *   handler(state, ...args) {
 *     // Handle event
 *   }
 *
 *   @update('event', { render: true })
 *   updater(state, ...args) {
 *     // Update state
 *     return newState;
 *   }
 * }
 * ```
 */
// tslint:disable:no-invalid-this
export const Reflect = {
    meta: new WeakMap(),
    defineMetadata(metadataKey, metadataValue, target) {
        if (!this.meta.has(target))
            this.meta.set(target, {});
        this.meta.get(target)[metadataKey] = metadataValue;
    },
    getMetadataKeys(target) {
        target = Object.getPrototypeOf(target);
        return this.meta.get(target) ? Object.keys(this.meta.get(target)) : [];
    },
    getMetadata(metadataKey, target) {
        target = Object.getPrototypeOf(target);
        return this.meta.get(target) ? this.meta.get(target)[metadataKey] : null;
    }
};
export function update(events, options = {}) {
    return (target, key, descriptor) => {
        const name = events ? events.toString() : key;
        Reflect.defineMetadata(`apprun-update:${name}`, { name, key, options }, target);
        return descriptor;
    };
}
export function on(events, options = {}) {
    return function (target, key) {
        const name = events ? events.toString() : key;
        Reflect.defineMetadata(`apprun-update:${name}`, { name, key, options }, target);
    };
}
export function customElement(name, options) {
    return function _customElement(constructor) {
        webComponent(name, constructor, options);
        return constructor;
    };
}
//# sourceMappingURL=decorator.js.map
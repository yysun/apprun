import webComponent from './web-component';
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
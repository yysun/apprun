import webComponent, { CustomElementOptions } from './web-component';

// tslint:disable:no-invalid-this
export const Reflect = {

  meta: new WeakMap(),

  defineMetadata(metadataKey, metadataValue, target) {
    if (!this.meta.has(target)) this.meta.set(target, {});
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
}

export function update<E = string>(events?: E, options: any = {}): Function {
  return (target: any, key: string, descriptor: any) => {
    const name = events ? events.toString() : key;
    Reflect.defineMetadata(`apprun-update:${name}`,
      { name, key, options }, target);
    return descriptor;
  }
}

export function on<E = string>(events?: E, options: any = {}): Function {
  return function (target: any, key: string) {
    const name = events ? events.toString() : key;
    Reflect.defineMetadata(`apprun-update:${name}`,
      { name, key, options }, target)
  }
}

export function customElement(name: string, options?: CustomElementOptions): Function {
  return function _customElement<T extends { new(...args: any[]): {} }>(constructor: T) {
    webComponent(name, constructor, options);
    return constructor;
  }
}


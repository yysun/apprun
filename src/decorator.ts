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

export function update<E=string>(events?: E, options: any = {}) {
  return (target: any, key: string, descriptor: any) => {
    const name = events ? events.toString() : key;
    Reflect.defineMetadata(`apprun-update:${name}`,
      { name, key, options }, target);
    return descriptor;
  }
}

export function on<E>(events?: E, options: any = {}) {
  return function (target: any, key: string) {
    const name = events ? events.toString() : key;
    Reflect.defineMetadata(`apprun-update:${name}`,
        { name, key, options }, target)
  }
}

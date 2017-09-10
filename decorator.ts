import 'reflect-metadata';
export function update(name: string, options: any = {}) {
  return (target: any, key: string, descriptor: any) => {
    Reflect.defineMetadata(`apprun-update:${name}`,
      { name, action: [descriptor.value, options] }, target)
    return descriptor;
  }
}

export function on(name: string, options: any = {}) {
  return function (target: any, key: string) {
    Reflect.defineMetadata(`apprun-update:${name}`, { name, key }, target)
  }
}

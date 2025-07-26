import { App } from './app';
import { Component } from './component';

declare global {
  var app: App;
  var _AppRunVersions: string;
  interface Window {
    app: App;
    _AppRunVersions: string;
    Component: typeof Component & {
      <T = unknown>(options?: any): (constructor: Function) => void;
    };
    _React: any;
    React: App;
    on: {
      <T = unknown>(options?: any): (constructor: Function) => void;
      <E = string>(events?: E, options?: any): (target: any, key: string) => void;
    };
    customElement: (name: string) => (constructor: Function) => void;
    safeHTML: (html: string) => any[];
  }
}

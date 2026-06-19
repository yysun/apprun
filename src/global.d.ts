/**
 * Optional AppRun browser global declarations
 *
 * These globals are installed only when app.use_globals() is called. Normal module
 * imports should use named exports instead of relying on ambient browser globals.
 */

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
    trustedHTML: (html: string) => any[];
    /** @deprecated Use trustedHTML() for caller-owned trusted markup. */
    safeHTML: (html: string) => any[];
  }
}

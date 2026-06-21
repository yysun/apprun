/**
 * AppRun browser global declarations
 *
 * Core builds install the AppRun browser authoring globals. The apprun-html
 * script-tag build also installs html, svg, and run for no-build browser apps.
 */

import { App } from './app';
import { html as litHtml, svg as litSvg, run as litRun } from './vdom-lit-html';

declare global {
  var app: App;
  var _AppRunVersions: string;
  var Component: typeof import('./component').Component;
  var on: typeof import('./decorator').on;
  var customElement: typeof import('./decorator').customElement;
  var trustedHTML: typeof import('./vdom').trustedHTML;
  /** @deprecated Use trustedHTML() for caller-owned trusted markup. */
  var safeHTML: typeof import('./vdom').safeHTML;
  var html: typeof litHtml;
  var svg: typeof litSvg;
  var run: typeof litRun;
  interface Window {
    app: App;
    _AppRunVersions: string;
    Component: typeof import('./component').Component;
    on: typeof import('./decorator').on;
    customElement: typeof import('./decorator').customElement;
    trustedHTML: typeof import('./vdom').trustedHTML;
    /** @deprecated Use trustedHTML() for caller-owned trusted markup. */
    safeHTML: typeof import('./vdom').safeHTML;
    html: typeof litHtml;
    svg: typeof litSvg;
    run: typeof litRun;
  }
}

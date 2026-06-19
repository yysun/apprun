/**
 * AppRun browser global declarations
 *
 * Core builds install the app singleton. The apprun-html script-tag build also
 * installs html, svg, and run for no-build browser apps.
 */

import { App } from './app';
import { html as litHtml, svg as litSvg, run as litRun } from './vdom-lit-html';

declare global {
  var app: App;
  var _AppRunVersions: string;
  var html: typeof litHtml;
  var svg: typeof litSvg;
  var run: typeof litRun;
  interface Window {
    app: App;
    _AppRunVersions: string;
    html: typeof litHtml;
    svg: typeof litSvg;
    run: typeof litRun;
  }
}

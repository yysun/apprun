# Change Log

## Releases

## 3.29.0

* Resolve async state before running the event

## 3.28.15

* Support css selector in _mount_, _start_, and _app.render_

## 3.28.12

* Export safeHTML funciton

## 3.28.11

* Make the package type module

## 3.28.10

* Apply directive to _app.render_

## 3.28.9

* retire CLI

## 3.28.8

* Use lit-html@2

## 3.28.3 merged into master

* Replaced _morphdom_ with _lit-html_

## 1.28/ 2.28 / 3.28

* New app.query function that returns the returned values of all then event handlers
  ```ts
  app.query(name: string, ...args): Promise<any[]>;
  ```
* Event pattern matching
  ```ts
  app.on('ws:*', _ => 0); // handles all events that have name start with ws:
  ```
* Event context
  ```ts
  @on('event', {c:1})  // define the context
  fn = ({c}) => {...}; // get the context in the handler

  ```

## 1.27/ 2.27 / 3.27

* BREAKING CHANGES: New logic for creating stateful components
* BREAKING CHANGES: remove props from the view function call
* Support _as_ prop for naming the root element of components
* Support prop _apprun-no-init_ in _body_ to skip the init route call
* CLI: -e, --esbuild option to use esbuild instead of webpack
* CLI: -o, --story option to generate stories for a component

## 1.26/ 2.26 / 3.26

* Support initial state as a function or an async function
* Support promise returned from the _mounted_ function
* Wait for all promises before set new state
* Dev Tools: save debugging flag to local storage
* Dev Tools: handle messages from redux dev tools
* Dev Tools: improve debugging event content
* Dev Tools: publish two debugging events for each event
* CLI: Support the unbundled development experiences with [esm-server](https://github.com/yysun/apprun-esm-server)
* CLI: add -e option for adding ESLint
* CLI: use Jest preset: ts-jest
* CLI: use jsxFactory to app.h

## 1.24 / 2.25 / 3.25

* Support the list attribute
* Support webpack 5
* Set jsxFactory to app.h for TypeScript 4

## 1.24 / 2.24 / 3.24

* Support the list attribute

## 1.23 / 2.23 / 3.23

* Support style attribute using string
* Support element event handler using string
* Support xlink:href in SVG
* Add -patch-vdom-on flag on component for patching vdom before rendering
* Add _route_ to mount options
* Add app start options type
* PR #90 - observable properties on web-component, thanks to @spurreiter
* Add @on and @customElement to window
* Export Fragment and app.h
* Add more examples to play-ground
* CLI installs ES2015 by default
* fix vdom update for child svg, remove console.assert
* Fix bug: view function called twice in create component

## 1.22 / 2.22 / 3.22

* Call ref attribute in JSX as a function
* Allow event to be turned or off inside a run call
* Allow mounted life cycle function to return state and Promise of state
* Pass _state_ to mounted function
* Merge dev-tools into one file: apprun-dev-tools.js


## 1.21 / 2.21 / 3.21

* Allow embedding elements in JSX
* Use app['debug'] to turn on/off debug events and component cache

## 1.20 / 2.20 / 3.20

* Add . event to Component,a.k.s the refresh event
* Add ES6 module build: apprun.esm.js (2.20+)
* Add @customElement decorator (2.20+)
* Store _AppRunVersions in global
* New docs

## 1.19 / 2.19

* $on directive use tuple for event parameters
* Add event type to app, component and decorators
* Support _Update_ as array of tuple to enforce the event type
* Set window['React']=app for using babel in browser
* $bind to function and tuple

## 1.18 / 2.18

* Support JSX directives $on and $bind
* Add $ event for custom directives
* Change the component wrapper element from <div> to <section>
* Fixed #57, #58

## 1.17 / 2.17

* Pull requests: #48, #49, #50, #52, #53, #54, #55 thanks to @phBalance, @Sebring
* Added lifecycle function: unload (beta)
* Add props to the wrapper div of stateful component, #57, thanks to @bo-kh
* Pass props to view, children to mounted functions of the stateful component

## 1.16 / 2.16

* Support class attribute in JSX
* Support class and className attribute for SVG
* Support custom attribute (with kebab case/snake case)
* Export app (non-default)
* CLI: use src and dist folder, es6 flag
* Fix CLI error: #45, thanks to @srlopez

## 1.15

* Support SVG
* Convert kebab-case to camelCase for data- attributes

## 1.14

* New logic for creating stateful component
* Add unmount function
* Add app.off function
* Server-side rendering
* Don't render vnode of false
* Add dev-tools (dist/apprun-dev-tools.js)

## 1.13

* Add lifecycle method: mounted
* Add event 'get-components' to retrieve the stateful component cache

## 1.12

* Support dataset attribute
* Add app.once function to one-time event subscription
* Add template engine for express js

## 1.11

* Support JSX fragments at root level

## 1.10

* Add debug event, use app.on('debug', p=>console.log(p)) to log state changes

## 1.9

* Add generic typed Component<T> and StatelessComponent<T>
* Support JSX fragments
* Make Component class plain class without inheritance
* Use Bootstrap 4 for CLI SPA boilerplate
* CLI generates webpack 4 configurations
* CLI targets ES2015
* Add examples of l10n, authentication, parcel, hot module reload, and server-side rendering

## 1.8

* Decorator converts method name and property name to action name
* Optimized Virtual DOM algorithm
* Enabled source map
* Add CLI options to generate SPA boilerplate

## 1.7

* Add decorator (on and update) for subscribing to event
* Not to save null or undefined state, nor to call view
* Add CLI options to initialize karma and create test spec

## 1.6

* Move HTML view support to apprun-html.js
* Remove rxjs

## 1.5

* Support stateful component
* Allow callback function in update tuple
* Attach component to element
* Add updateState function to update state properties

## 1.4

* Support update name alias
* Support mount to element id
* Make _mount_ just mount, _start_ mount and render initial state
* Publish the _route_ event from app

## 1.3

* Support tuple in update for setting event options
* Use _model_ property as initial state, if _state_ property is undefined

## 1.2

* Support async update
* Added start function to component
* Added generic routing event
* Output JSON when rendering objects

## 1.1

* Compiled apprun.js to UMD
* Added index.d.ts

## 1.0

* Added CLI
* Convert component instance methods to local event
* Use _html: as the flag to render raw html
* Added hacker news demo

## 0.10

* Added component scoped events

## 0.9

* Developed own virtual dom
* Added JS framework performance demo

## 0.7

* Use RxJS for event pubsub
* Use morphdom

## 0.6

* Added router

......

## 0.1 - 0.5

* Event pubsub
* Used virtual-dom, virtual-dom-html
* Three versions: zero, jsx and html
* Demo apps
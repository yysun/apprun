# Change Log

## Releases
* apprun@latet: 1.x, stable, es5
* apprun@beta: 2.x, stable, es2015, web component
* apprun@next: 3.x, development, es5
* apprun@es6: 4.x, development, es2015, web component

## 2.0 beta (ES6)

* Make AppRun component web component

## 1.14

* New logic for creating stateful component
* Add unmount function
* Add app.off function
* Server-side rendering
* Don't render vnode of false
* Add dev-tools (dist/apprun-dev-tools.js)

## 1.13

* Add lifecyle method: mounted
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
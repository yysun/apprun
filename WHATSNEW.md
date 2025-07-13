## What's New

> July 12, 2025, V3.36.0

Code review by using Copilot and Claude Sonnet 4
  - Enhanced type definitions (apprun.d.ts) for better TypeScript support
  - Fixed minor bugs and edge cases in virtual DOM handling
  - Fixed bugs in router initialization logic

> July 11, 2025, V3.35.0


### Support auto use router for pretty links

AppRun now supports pretty links. 

```html
<a href="/about">About</a>
```

You can subscribe components to events like `'/about'`.

```js
// Routing (component event)
class Home extends Component {
  view = () => <div>Home</div>;
  update = {'/, /home': state => state };
}

class Contact extends Component {
  view = () => <div>Contact</div>;
  update = {'/contact': state => state };
}

class About extends Component {
  view = () => <div>About</div>;
  update = {'/about': state => state };
}

const App = () => <>
  <div id="menus">
    <a href="/home">Home</a>{' | '}
    <a href="/contact">Contact</a>{' | '}
    <a href="/about">About</a></div>
  <div id="pages"></div>
</>

app.render(document.body, <App />);
[About, Contact, Home].map(C => new C().start('pages'));
```
<apprun-code></apprun-code>



AppRun will catch the `'/about'` route as event and render the component that is subscribed to it.

If you have components subscribe to '#', or '#/', Apprun will fallback to the hash-based routing.

> July 6, 2025, V3.33.10

### Support async generator for event handlers

You can now use async generator functions for event handlers. The async generator function can return multiple values. AppRun will render each value in the order they are generated.

```js
  const state = {};
  const view = state => html`
  <div><button @click=${run(getComic)}>fetch ...</button></div>
  ${state.loading && html`<div>loading ... </div>`}
  ${state.comic && html`<img src=${state.comic.img} />`}
`;
  async function* getComic() {  // async generator function returns loading flag and then the comic object
    yield { loading: true };
    const response = await fetch('https://my-xkcd-api.glitch.me');
    const comic = await response.json();
    yield { comic };
  }

  app.start(document.body, state, view);
```
<apprun-code></apprun-code>


### use lit-html V3 for apprun-html.js

The `apprun-html.js` now uses `lit-html` V3 for rendering the view. The `apprun-html.js` is a standalone version of AppRun that uses `lit-html` for rendering the view without JSX.

```html
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Counter</title>
</head>
<body>
  <script src="https://unpkg.com/dist/apprun-html"></script>
  <script>
  const add = (state, delta) => state + delta;
  const view = state => {
    return html`<div>
    <h1>${state}</h1>
      <button @click=${run(add, -1)}>-1</button>
      <button @click=${run(add, +1)}>+1</button>
    </div>`;
  };
  app.start(document.body, 0, view);
  </script>
</body>

</html>
```
<apprun-code></apprun-code>




> Aug 12, 2024, V3.33.4

### Add app.use_render and app.use_react function

The `app.use_render` function allows you to use a custom render function for rendering the view. The `app.use_react` function allows you to use React for rendering the view.

```js
import ReactDOM from 'react-dom/client'
import { flushSync } from 'react-dom';
import app from 'apprun';
use_react(React, ReactDOM);
```

See https://github.com/yysun/apprun-antd-demo-js for an example.

### Support the _mounted_ function when starting a component manually

> Dec, 8, 2023

When using a component in JSX, AppRun always invokes the the _mounted_ lifecycle function each time the component is loaded.

```js
class ComponentClass extends Component {
  mounted = () => console.log('mounted is called');
}
app.render(document.body, <ComponentClass />);
```

However, the _mounted_ function is not called when you start the component manully in the previous versions.

```js
class ComponentClass extends Component {
  mounted = () => console.log('mounted is called'); // not called in previous versions
}
new ComponentClass().start(document.body);
```

Now, the _mounted_ function is called when the component is started.

```js
class ComponentClass extends Component {
  mounted = () => console.log('mounted is called'); // called in this version
}
new ComponentClass().start(document.body);
```

This change make the _mounted_ funciton compatible in JSX and in manual start.


### Support View Transition API

> September, 27, 2023

AppRun now supports the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent) at the event level, component level and app level.

Event level example:

```js
const update = {
  '+1': [state => state + 1, {transition: true}],
  '-1': [state => state - 1, {transition: true}]
};
```

Component level example:

```js
class C extends Component {

}
new C().mount(document.body, {transition: true});
```


App level example:

```js
app.start(document.body, {transition: true});
```

### Vite Support

> December 11, 2022

The command `npm create apprun-app` supports [Vite](https://vitejs.dev/) in addition to esbuild and webpack.

### Use React for Rendering View

You can use React for rendering view. See [apprun-use-react](https://github.com/yysun/apprun-use-react) for details.

> React 18 has breaking changes. Please use React 17 for now.

### Create-AppRun-App CLI

> April 5 , 2022

You can create an AppRun app by running command `npm create apprun-app`.

```sh
npm create apprun-app [my-app]
```

> Note: AppRun CLI `npx apprun init` is deprecated. Please use `npm create apprun-app` instead.


## Recent Posts and Publications

### [All the Ways to Make a Web Component - May 2021 Update](https://webcomponents.dev/blog/all-the-ways-to-make-a-web-component/)

This post compares the coding style, bundle size, and performance of 55 different ways to make a Web Component. It put AppRun on the top 1/3 of the list of bundle size and performance.


### [A Dev Server Supports ESM](https://dev.to/yysun/a-dev-server-supports-esm-3cea)

This post introduces [apprun-dev-server](https://dev.to/yysun/a-dev-server-supports-esm-3cea), a dev server that provides fast and productive experiences to AppRun application development, so-called unbundled development.

### [Observerble HQ Notebooks](https://observablehq.com/@yysun)

* [Introducing AppRun](https://observablehq.com/@yysun/introducing-apprun)

### [Rust WebAssembly and AppRun](https://dev.to/yysun/rust-webassembly-and-apprun-3bei)

### [Serverless App Using Firebase and AppRun](https://dev.to/yysun/serverless-app-on-firebase-using-apprun-1k46)

### [Avoid Spaghetti Code using AppRun](https://dev.to/yysun/apprun-helps-to-avoid-spaghetti-code-1835)

### [Create a Phoenix LiveView Like App in JS with AppRun](https://dev.to/yysun/create-a-phoenix-liveview-like-app-in-js-with-apprun-dc8)

### [Reactivity in AppRun](https://dev.to/yysun/reactivity-in-apprun-31po)

### [AppRun Event Directives](https://dev.to/yysun/apprun-events-directives-4jph)

### [Ceremony vs. Essence Revisited](https://dev.to/yysun/ceremony-vs-essence-revisited-5e77)

### [Database-Driven Applications Using WebSockets](https://dev.to/yysun/database-driven-applications-using-websockets-2b9o)

This post introduces a new application architecture that allows event handling between the frontend apps and the backend business logic modules without REST API.

![](https://res.cloudinary.com/practicaldev/image/fetch/s--ydBm2YgN--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/yysun/apprun-websockets-sqlite/raw/master/architecture-new.png)

Published on Mar 9, 2020 6 min read

### [Use State Machine in AppRun Applications](https://dev.to/yysun/use-state-machine-in-apprun-applications-odo)

This post describes how to create a state machine in AppRun applications to help event handling using a calculator as an example.

![](https://dev-to-uploads.s3.amazonaws.com/i/fp4aodv0sdnbkosvuxgt.png)

Published on Mar 3, 2020 ・ 6 min read

### [Advanced View Features in AppRun](https://dev.to/yysun/advanced-view-features-in-apprun-17g5)

This post describes the advanced usage of the AppRun _ref_, _element embedding_, and _directive_ in the JSX view.

Published on Feb 28, 2020 ・ 4 min read

### [Strong Typing in AppRun](https://medium.com/@yiyisun/strong-typing-in-apprun-78520be329c1)

This post is a complete guide for those want to opted-in TypeScript and strong typing for AppRun application development.

![](https://cdn-images-1.medium.com/max/1600/1*RY-DEfVgOjj_clIEW4HeTA.png)

Published on May 17, 2019 · 8 min read

### [Announcing AppRun Directives](https://medium.com/@yiyisun/announcing-apprun-directives-6a063f88379c)

This post introduces the two built-in directives and then describes how to create custom directives.

Published on May 12, 2019 · 3 min read

### [AppRun Book from Apress](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)

[![Order from Amazon](https://camo.githubusercontent.com/99fad1f024c274a3d752a1583cf125037583811c/68747470733a2f2f696d616765732e737072696e6765722e636f6d2f7367772f626f6f6b732f6d656469756d2f393738313438343234303638372e6a7067)](https://www.amazon.com/Practical-Application-Development-AppRun-High-Performance/dp/1484240685/)

Published on Jan 9, 2019

### [Make CLI Run in the Console](https://dev.to/yysun/make-cli-run-in-the-console-42ho)

We have been using the command-line interface (CLI) in the terminal window and the command prompt. Have you thought of a CLI in the console of the browser's developer tool?

![](https://res.cloudinary.com/practicaldev/image/fetch/s--5p8ESaes--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://thepracticaldev.s3.amazonaws.com/i/khumq8np94i5uwo9bwn1.png)

Published on Aug 10, 2018 · 1 min read

### [Making ASP.NET Core MVC Apps into Single Page Apps using AppRun](https://medium.com/@yiyisun/making-asp-net-core-mvc-apps-into-single-page-apps-using-apprun-e1ae4dbc60da)

A single-page application (SPA) is a web application or web site that interacts with the user by dynamically rewriting the current page…

![](https://cdn-images-1.medium.com/max/1600/1*1ZtgK-R4YDb8P4ahLq60Hg.png)

Published on Aug 7, 2018 · 3 min read

### [I Also Created the Exact Same App Using AppRun](https://medium.com/@yiyisun/i-also-created-the-exact-same-app-using-apprun-dd1860cb8112)

I felt it was quite fun to compare AppRun with Redux and React Context API last time. Today, I found another great post titled “I created…

![](https://cdn-images-1.medium.com/max/1600/1*DWsG3B2utcEmD1rKSbIVpA.png)

Published on Aug 5, 2018 · 7 min read

### [Redux vs. The React Context API vs. AppRun](https://medium.com/@yiyisun/redux-vs-the-react-context-api-vs-apprun-f324bee8cbbf)
Recently, I have read a great post titled ‘Redux vs. The React Context API’ (https://daveceddia.com/context-api-vs-redux). It is the type…

![](https://cdn-images-1.medium.com/max/1600/1*_bvkERxKewur67C5zowOBQ.png)

Published on Jul 31, 2018 · 3 min read

### [Deep Dive into AppRun Events](https://medium.com/@yiyisun/deep-dive-into-apprun-events-1650dc7811ea)
Published on Sep 10, 2017 · 8 min read

### [Deep Dive into AppRun State](https://medium.com/@yiyisun/deep-dive-into-apprun-state-3d6fb58b1521)
Published on Sep 9, 2017 · 6 min read

### [Building Applications with AppRun](https://medium.com/@yiyisun/building-applications-with-apprun-d103cd461bae)

AppRun is a Javascript library for building reliable, high-performance web applications using the Elm inspired Architecture, events and components.

![](logo.png)

Published on Jul 2, 2017 · 5 min read


## Video Tutorials

* [Building Applications with AppRun, Part 1 - Getting Started](https://www.youtube.com/watch?v=RuRmXEN2-xI)
* [Building Applications with AppRun, Part 2 - Components](https://www.youtube.com/watch?v=qkP6HvZmhtY)



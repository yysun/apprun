# Getting Started

## Installation

AppRun is distributed on npm.
```sh
npm install apprun
```

You can also load AppRun directly from the unpkg.com CDN:

```javascript
<script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
```

## Use in Browser

### Use ES5

```html
<html lang="en">
<head>
  <title>AppRun App</title>
  <script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
</head>
<body>
<script>
  const view = state => `<div>${state}</div>`;
  app.start(document.body, 0, view);
</script>
</body>
</html>
```

### Use JSX

```html
<html lang="en">
<head>
  <title>AppRun App</title>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/apprun@es6/dist/apprun-html.js"></script>
</head>
<body>
<script type="text/babel" data-presets="es2017, react">
  const view = state => <div>${state}</div>;
  app.start(document.body, 0, view);
</script>
</body>
</html>
```

### Use ES Module

```html
<html lang="en">
<head>
  <title>AppRun App</title>
</head>
<body>
<script type="module">
  import { app } from 'https://unpkg.com/apprun@es6/esm/apprun-html?module';
  const view = state => `<div>${state}</div>`;
  app.start(document.body, 0, view);
</script>
</body>
</html>
```

### Use lit-html

```html
<html lang="en">
<head>
  <title>AppRun App</title>
</head>
<body>
<script type="module">
  import { app, html } from 'https://unpkg.com/apprun@next/esm/apprun-html?module';
  const view = state => html`<div>${state}</div>`;
  app.start(document.body, 0, view);
</script>
</body>
</html>
```

## TypeScript and Webpack

AppRun includes a command-line tool (CLI) for creating a TypeScript and webpack configured project.

You can initialize a SPA project.

```sh
npx apprun --init --spa
```

To initialize a project that targets ES6/ES2015, use the AppRun CLI with the --es6 flag:
```sh
npx apprun --init --spa --es6
```

After the command finishes execution, you can start the application and then navigate to https://localhost:8080 in a browser.

```sh
npm start
```

## Starter Template

Optionally, if not using the CLI you can directly scaffold AppRun project from the AppRun starter templates.
```sh
npx degit apprunjs/apprun-webpack my-app
npx degit apprunjs/apprun-rollup my-app
npx degit apprunjs/apprun-parcel my-app
npx degit apprunjs/apprun-web-components my-app

```

AppRun is so flexible that you can choose your favorite ways of using it.


## AppRun Site Framework

[AppRun Site](https://github.com/yysun/apprun-site) is a framework for building AppRun applications. It has the following features:

* Progressive Web App (PWA) - support offline
* Single Page App (SPA) - routing using / or #
* four built-in layouts and bring your own
* Compile HTML, markdown pages to AppRun components
* Auto generate the index of pages
* Build app logic using AppRun/Web components
* Targets ES5 or ES Module

You can create AppRun Site apps using the apprun-site package.

```sh
npx apprun-site init my-app
```

Please visit [AppRun Site Documentations](https://yysun.github.io/apprun-site).

Next, you will see the [tutorial](02-tutorial) of creating AppRun apps.
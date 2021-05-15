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

### Use Global AppRun app

```html
<html lang="en">
<head>
  <title>AppRun App</title>
  <script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
</head>
<body>
<script>
  const view = state => `<div>${state}</div>`;
  app.start(document.body, 'hello world', view);
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
  import { app } from 'https://unpkg.com/apprun/esm/apprun-html?module';
  const view = state => `<div>${state}</div>`;
  app.start(document.body, 'hello world', view);
</script>
</body>
</html>
```

### Use lit-html

[lit-html](https://lit-html.polymer-project.org/) is an efficient, expressive, extensible HTML templating library for JavaScript from the Polumer project.
```html
<html lang="en">
<head>
  <title>AppRun App</title>
</head>
<body>
<script type="module">
  import app from 'https://unpkg.com/apprun?module';
  import { render, html } from 'https://unpkg.com/lit-html?module';
  app.render = (e, vdom) => render(vdom, e);
  const view = state => html`<div>${state}</div>`;
  app.start(document.body, 'hello world', view);
</script>
</body>
</html>
```

### Use µhtml

[µhtml](https://github.com/WebReflection/uhtml) (micro html) is a ~2.5K lighterhtml subset to build declarative and reactive UI via template literals tags.

```html
<html lang="en">
<head>
  <title>AppRun App</title>
</head>
<body>
<script type="module">
  import app from 'https://unpkg.com/apprun?module';
  import { render, html } from 'https://unpkg.com/uhtml?module';
  app.render = render;
  const view = state => html`<div>${state}</div>`;
  app.start(document.body, 'hello world', view);
</script>
</body>
</html>
```

### Use JSX

[JSX](https://reactjs.org/docs/introducing-jsx.html) is a syntax exntension to JavaScript. It makes JavaScript functions look like HTML.

You can use JSX in the browser or compile JSX ahead of time. See AppRun CLI below.

```html
<html lang="en">
<head>
  <title>AppRun App</title>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
</head>
<body>
<script type="text/babel" data-presets="es2017, react">
  const view = state => <div>${state}</div>;
  app.start(document.body, 'hello world', view);
</script>
</body>
</html>
```

## AppRun CLI


AppRun includes a command-line tool (CLI) for creating a TypeScript and webpack configured project.

### esbuild

You can initialize a SPA project that uses [esbuild](https://esbuild.github.io/).

```sh
npx apprun --init --spa --esbuild
```

### TypeScript and Webpack

You can initialize a SPA project that uses TypeScript and WebPack.

```sh
npx apprun --init --spa
```

To initialize a project that targets ES5, use the AppRun CLI with the --es5 flag:

```sh
npx apprun --init --spa --es5
```


After the command finishes execution, you can start the application and then navigate to https://localhost:8080 in a browser.

```sh
npm start
```

## Starter Template

Optionally, if not using the CLI you can directly scaffold AppRun project from the AppRun starter templates.
```sh
npx degit apprunjs/apprun-esbuild my-app
npx degit apprunjs/apprun-rollup my-app
npx degit apprunjs/apprun-rollup-lit-html my-app
npx degit apprunjs/apprun-webpack my-app
npx degit apprunjs/apprun-parcel my-app
npx degit apprunjs/apprun-web-components my-app
npx degit apprunjs/apprun-bootstrap my-app
npx degit apprunjs/apprun-coreui my-app
npx degit apprunjs/apprun-pwa my-app
npx degit apprunjs/apprun-pwa-workbox my-app
npx degit yysun/apprun-d3 my-app
npx degit yysun/apprun-electron my-app
npx degit yysun/apprun-electron-forge my-app
npx degit yysun/apprun-websockets my-app
```

AppRun is so flexible that you can choose your favorite ways of using it.


Next, you will see the [tutorial](02-tutorial) of creating AppRun apps.
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
</html>`;

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
</html>`;

```

### Use ES Module

```html
<html lang="en">
<head>
  <title>AppRun App</title>
</head>
<body>
<script type="module">
  import { app } from 'https://unpkg.com/apprun@es6/dist/apprun.esm';
  const view = state => `<div>${state}</div>`;
  app.start(document.body, 0, view);
</script>
</body>
</html>`;

```

### Use lit-html

```html
<html lang="en">
<head>
  <title>AppRun App</title>
</head>
<body>
<script type="module">
  import { html, render } from 'https://unpkg.com/lit-html?module';
  import { app } from 'https://unpkg.com/apprun@es6/dist/apprun.esm';
  app.render = (element, html) => render(html, element); // overwrite AppRun render
  const view = state => html`<div>${state}</div>`;
  app.start(document.body, 0, view);
</script>
</body>
</html>`;

```

## Use TypeScript

#### CLI

AppRun includes a command line tool (CLI) for creating TypeScript and webpack configured project.

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
npx degit apprunjs/apprun-starter
```

You can see AppRun is so flexible that you can choose your favorite ways of using it.

Next, you will see the [tutorial](02-tutorial) of creating AppRun apps.
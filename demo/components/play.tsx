import app, { Component } from '../../src/apprun';
import examples from './play-examples';


const html = code => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/custom-elements/1.1.2/custom-elements.min.js"></script>
  <title>AppRun Playground</title>
  <style>
    body {
      font-family: "Benton Sans", "Helvetica Neue", helvetica, arial, sans-serif;
      margin: 2em;
    }
    img { width: 100%; }
  </style>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="dist/apprun-dev-tools.js"></script>
  <script src="dist/apprun-html.js"></script>
</head>
<body>
<script>
  Babel.registerPlugin("d", [Babel.availablePlugins["proposal-decorators"], {legacy: true}]);
  Babel.registerPlugin("c", [Babel.availablePlugins["proposal-class-properties"], {loose: true}]);
  Babel.registerPlugin("b", [Babel.availablePlugins["proposal-private-methods"], {loose: true}]);
</script>
<script type="text/babel" data-plugins="d, c, b">
  ${code}
</script>
</body>
</html>`;

const tab = ({ code }) => {
  const doc = window.open().document;
  doc.open();
  doc.write(html(code));
  doc.close();
};

const editor = (e) => {
  const editor = document.createElement('apprun-code');
  editor.style.height = '80vh';
  editor.setAttribute('code-width', '60%');
  e.appendChild(editor)
};

export class PlayComponent extends Component {

  state = {...examples[0], selectedIndex: 0}

  view = (state) => <div class="playground" ref={e => editor(e)}>
    <div class="row">
      <div class="col-sm-6">
        Examples:&nbsp;
      <select $onchange="select">
          {examples.map((ex, idx) => <option selected={idx===state.selectedIndex}>{ex.name}</option>)}
        </select>
      </div>
      <div class="col-sm-6">
        <button class="btn btn-default btn-sm pull-right" $onclick='openTab'>Open in a new tab</button>
      </div>
    </div>
    <textarea>
      {state.code}
    </textarea>
  </div>;

  update = {
    '#play': (state, idx) => {
      const selectedIndex = parseInt(idx);
      if (!isNaN(selectedIndex)) {
        state = {
          ...examples[selectedIndex],
          selectedIndex
        };
      }
      return state;
    },
    'select': (state, e) => {
      state = {
        ...examples[e.target.selectedIndex],
        selectedIndex: e.target.selectedIndex
      };
      history.pushState(null, null, '#play/' + e.target.selectedIndex);
      return state;
    },
    'openTab': (state, e) => {
      e.preventDefault();
      tab(state);
    }
  }
}

export default (element) => new PlayComponent().mount(element);
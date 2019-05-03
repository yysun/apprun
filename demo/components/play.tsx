import app, { Component } from '../../src/apprun';
import examples from './play-examples';

declare var CodeMirror;

const run = ({ code }) => {
  let iframe = document.getElementById('iframe') as HTMLIFrameElement;
  iframe.parentNode.replaceChild(iframe.cloneNode(), iframe);
  iframe = document.getElementById('iframe') as HTMLIFrameElement;
  const doc = iframe.contentWindow.document;
  const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <style>
          body {
            font-family: "Benton Sans", "Helvetica Neue", helvetica, arial, sans-serif;
            margin: 2em;
          }
        </style>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://unpkg.com/apprun@es6/dist/apprun-html.js"></script>
      </head>
      <body>
      <script type="text/babel">
          //app.on('debug', p=>console.log(p))
          const React = app;
          ${code}
      </script>
    </body>
    </html>`;
  doc.open();
  doc.write(html);
  doc.close();
};
export class PlayComponent extends Component {

  codeEditor = null
  state = {...examples[0], selectedIndex: 0}

  view = (state) => <div class="playground">
    <div class="row">
      <div class="col-sm-12">
        Examples:&nbsp;
      <select $onchange="select">
          {examples.map((ex, idx) => <option selected={idx===state.selectedIndex}>{ex.name}</option>)}
        </select>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-6">
        <textarea id="playground-code">
            {state.code}
        </textarea>
      </div>
      <div class="col-sm-6">
        <iframe id="iframe" />
      </div>
    </div>
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
      this.codeEditor = null;
      return state;
    },
    'select': (state, e) => {
      this.state = {
        ...examples[e.target.selectedIndex],
        selectedIndex: e.target.selectedIndex
      };
      history.pushState(null, null, '#play/' + e.target.selectedIndex);
      this.codeEditor.setValue(this.state.code);
    },
    'change': (state, code) => {
      state.code = code;
      run(state);
    }
  }

  rendered = (state) => {
    if (!this.codeEditor) {
      this.codeEditor = CodeMirror.fromTextArea(document.getElementById('playground-code'), {
        lineNumbers: true,
        mode: "jsx"
      });
      this.codeEditor.on('change', (cm) => this.run('change', cm.getValue()));
    }
    run(state);
  }

  unload = () => this.codeEditor = null
}

export default (element) => new PlayComponent().mount(element);
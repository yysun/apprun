import { app, Component } from './apprun';

declare var CodeMirror;

const styles = `
.CodeMirror, .apprun-play iframe {
  height: 100%;
  border: dotted gray 1px;
}

.apprun-play {
  height: 100%;
  display: flex;
}

.apprun-play .col {
  margin: 2px;
}

.apprun-play .editor, .apprun-play .preview {
  width: 100%;
  height: 100%;
}
`;

const code_html = code => `<!DOCTYPE html>
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
  </style>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
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


class Play extends Component {
  view = ({ code, hide_code }) => {
    return <>
      <style>{styles}</style>
      {hide_code ?
        <div class="apprun-play">
          <iframe class="preview" />
        </div>
        :
        <div class="apprun-play">
          <div class="col" style="width:75%" >
            <textarea class="editor">{code}</textarea>
          </div>
          <div class="col" style="flex:1" >
            <iframe class="preview" />
          </div>
        </div>}
    </>;
  }

  mounted = props => {
    const element = this['element'];
    const code_id = props['code-id'];
    const hide_code = props['hide-code'];
    const code_width = props['code-width'];

    let code_area;
    if (code_id) {
      code_area = document.getElementById(code_id);
    } else {
      code_area = element.previousElementSibling ||
        element.parentElement.previousElementSibling;
    }

    const code = code_area?.innerText // from div
      || code_area?.value // from textarea
      || element.textContent // from child node

    if (code_area) code_area.style.display = 'none';

    return { code, hide_code, code_width };
  }


  rendered = ({ code, hide_code, code_width }) => {
    const element = this['element'];

    const textarea = element.querySelector(".apprun-play .editor") as any;
    let iframe = element.querySelector('.apprun-play .preview');
    if (!iframe || !textarea) return;

    const run_code = code => {
      const iframe_clone = iframe.cloneNode();
      iframe.parentNode?.replaceChild(iframe_clone, iframe);
      iframe = iframe_clone;
      const doc = iframe.contentWindow?.document;
      if (!doc) return;
      doc.open();
      if (code.indexOf('<html') >= 0)
        doc.write(code);
      else
        doc.write(code_html(code));
      doc.close();
    }

    if (code) run_code(code);
    if (hide_code || !textarea) return;

    if (code_width) textarea.parentElement.style.width = code_width;

    if (typeof CodeMirror === 'undefined') {
      textarea.onkeyup = () => run_code(textarea.value);
    } else {
      const editor = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        mode: 'jsx'
      });
      editor.setValue(code);
      editor.on('change', (cm) => run_code(cm.getValue()));
    }
  }
}

app.webComponent('apprun-code', Play);

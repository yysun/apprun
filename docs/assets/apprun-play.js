//import { app, Component, html, run } from 'https://unpkg.com/apprun/dist/apprun-html.esm'; // no need in JS
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
  <script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
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

const write_code = (iframe, code) => {
  const doc = iframe.contentWindow.document;
  doc.open();
  if (code.indexOf('<html') >= 0)
    doc.write(code);
  else
    doc.write(code_html(code));
  doc.close();
}

const preview_code = code => {
  let iframe = document.querySelector('.preview');
  iframe.parentNode.replaceChild(iframe.cloneNode(), iframe);
  iframe = document.querySelector('.preview');
  write_code(iframe, code);
};

let editor;
class Play extends Component {
  view = _ => {
    if (!document.getElementById('play-popup')) document.body.insertAdjacentHTML('beforeend',
`<div id="play-popup" class="overlay">
	<div class="popup apprun-play">
		<a class="close" href="javascript:app.run('@close-popup')">&times;</a>
		<div class="content">
			<div class="col">
        <textarea class="editor"></textarea>
      </div>
      <div class="col">
      <iframe class="preview"/>
      </div>
    </div>
	</div>
</div>`);
    return html`
<div class="box">
	<a class="button" @click=${run('show-popup')}>Try the Code</a>
</div>`;
  }

  rendered = ({ style }) => {
    const code = this.element.previousElementSibling.innerText;
    const iframe = document.createElement('iframe');
    iframe.classList.add('apprun-preview');
    iframe.style.cssText = style;
    this.element.before(iframe);
    write_code(iframe, code);
  }

  update = {
    'show-popup': _ => {
      const code = this.element.previousElementSibling.previousElementSibling.innerText;
      if (!editor) {
        editor = CodeMirror.fromTextArea(document.querySelector(".editor"), {
          lineNumbers: true,
          mode: 'jsx'
        });
        editor.on('change', (cm) => this.run('change', cm.getValue()));
      }
      editor.setValue(code);
      document.getElementById('play-popup').classList.add('show');
    },
    '@close-popup': () => { document.getElementById('play-popup').classList.remove('show') },
    'change': [(_, code) => {
      preview_code(code);
    }, { delay: 500 }],
  }
}

app.webComponent('apprun-play', Play);
window.addEventListener('popstate', () => app.route(location.hash));

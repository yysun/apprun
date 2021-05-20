import { app, Component, html, run } from 'https://unpkg.com/apprun/esm/apprun-html?module';

const code_html = code => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/custom-elements/1.1.2/custom-elements.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.min.css">
  <title>AppRun Playground</title>
  <style>
    body {
      font-family: "Benton Sans", "Helvetica Neue", helvetica, arial, sans-serif;
      margin: 2em;
    }
  </style>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/apprun/dist/apprun-dev-tools.js"></script>
  <script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
</head>
<body>
<script>
  Babel.registerPlugin("d", [Babel.availablePlugins["proposal-decorators"], {legacy: true}]);
  Babel.registerPlugin("c", [Babel.availablePlugins["proposal-class-properties"], {loose: true}]);
</script>
<script type="text/babel" data-plugins="d, c">
  ${code}
</script>
</body>
</html>`;

const run_code = code => {
  let iframe = document.querySelector('.preview');
  iframe.parentNode.replaceChild(iframe.cloneNode(), iframe);
  iframe = document.querySelector('.preview');
  const doc = iframe.contentWindow.document;
  doc.open();
  if(code.indexOf('<html')>=0)
    doc.write(code);
  else
    doc.write(code_html(code));
  doc.close();
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

  update = {
    'show-popup': _ => {
      const code = this.element.previousElementSibling.innerText;
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
    '@close-popup': () => { document.getElementById('play-popup').classList.remove('show')},
    'change': [(_, code) => {
      run_code(code);
    }, { delay: 500 }],
  }
}

app.webComponent('apprun-play', Play);
window.addEventListener('popstate', () => app.route(location.hash));

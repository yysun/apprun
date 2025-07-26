import { app, Component } from './apprun';

const popup_div = `<div id="play-popup" class="overlay">
<style id="apprun-play-style">
.apprun-play .col {
  height: 100%;
  flex: 1;
}
.apprun-preview {
  width: 100%
}
.apprun-play .editor, .apprun-play .preview {
  display: inline-block;
  width: calc(100% - 20px);
  height: calc(100% - 10px);
}

a.button {
  font-size: .8em;
  padding: 10px;
  cursor: pointer;
  color: var(--md-primary-bg-color);
  background: var(--md-primary-fg-color)
}
a.button:hover {
  color: var(--md-primary-fg-color);
  background: var(--md-primary-bg-color)
}

.overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  visibility: hidden;
  opacity: 0;
  z-index: 999;
}
.overlay.show {
  visibility: visible;
  opacity: 1;
}

.popup {
  margin: 80px auto;
  padding: 20px;
  background: #fff;
  border-radius: 3px;
  position: relative;
  width: 90%;
  height: calc(100% - 150px);
}

.popup .close {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 20px;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}
.popup .close:hover {
  color: #06D85F;
}
.popup .content {
  height: 100%;
  overflow: hidden;
  display: flex;
}

.cm-s-default {
  height: 100%;
  font-size: small;
  line-height: 1.5em;
  z-index: 0;
}
</style>

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
</div>`;

const encodeHTML = code => {
  return code.replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
}

const code_html = code => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>AppRun Playground</title>
  <style>
    body {
      font-family: "Benton Sans", "Helvetica Neue", helvetica, arial, sans-serif;
      margin: 2em;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/typescript@latest"></script>
  <script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
</head>
<body>
<pre id="code" style="display:none">${encodeHTML(code)}</pre>
<script type="module">
const code = document.getElementById('code').innerText;
const compiled = ts.transpileModule(code, {
  compilerOptions: {
    "jsx": "react",
    "jsxFactory": "app.h",
    "jsxFragmentFactory": "app.Fragment",
    "target": "es2020",
    "module": "esnext",
  },
  reportDiagnostics: true,
});

if (compiled.diagnostics && compiled.diagnostics.length) {
  const pre = document.createElement('pre');
  pre.style = 'font-size: 10px;';
  pre.innerText = compiled.diagnostics.map(d => {
    const start = d.start;
    const end = d.start + d.length;
    const line = code.substring(0, end).split('\\n').length;
    const column = code.substring(0, end).split('\\n').pop().length;
    return \`Line: \${line}, Column: \${column}, \${d.messageText}\`;
  }).join('\\n');
  document.body.appendChild(pre);
} else {
  window.onerror = function () {
    const pre = document.createElement('pre');
    pre.style = 'font-size: 10px;';
    pre.innerText = compiled.outputText;;
    document.body.appendChild(pre);
  };
  const script = document.createElement('script');
  script.type = 'module';
  script.text = compiled.outputText;
  document.body.appendChild(script);
}
</script>
</body>
</html>`;

declare var CodeMirror;

const setup_editor = (textarea, iframe, code, hide_src) => {

  if (!iframe || !code) return;

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

  run_code(code);

  if (hide_src || !textarea || textarea.nodeName !== 'TEXTAREA') return;
  if (typeof CodeMirror === 'undefined') {
    textarea.onkeyup = () => run_code(textarea.value);
  } else {
    if (!textarea.editor) {
      textarea.editor = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        mode: 'jsx'
      });
      textarea.editor.on('change', (cm) => run_code(cm.getValue()));
    }
  }
}

class Play extends Component<any> {
  view = (state) => {
    const code_id = state['code-element-id'];
    const element = this.element;
    let code_area, code;
    if (code_id) {
      code_area = document.getElementById(code_id);
    } else {
      code_area = element.previousElementSibling ||
        element.parentElement.previousElementSibling;
    }
    code = code_area?.innerText // from div-code
      || code_area?.value // from textarea
      || state['code']; // from code attr

    this.state.code_area = code_area;
    this.state.code = code;

    return code ? <>
      <div class="toolbox">
        {!state.hide_button && <a class="button" $onclick="show-popup">Try the Code</a>}
      </div></>
      : <div>AppRun Play cannot find code to run, please set code-element-id or code.</div>
  };

  rendered = ({ style, hide_src, code_area, code }) => {
    if (!code) return;
    if (!document.getElementById('play-popup')) {
      document.body.insertAdjacentHTML('beforeend', popup_div);
      const textarea = document.querySelector(".apprun-play .editor") as any;
      const iframe = document.querySelector('.apprun-play .preview');
      textarea.value = code;
      setup_editor(textarea, iframe, code, false);
    }
    const iframe = document.createElement('iframe');
    iframe.classList.add('apprun-preview');
    iframe.style.cssText = style;
    this.element.before(iframe);
    if (hide_src) code_area.style.display = 'none';
    setup_editor(code_area, iframe, code, hide_src);
  }

  update = {
    'show-popup': ({ code }) => {
      const textarea = document.querySelector(".apprun-play .editor") as any;
      textarea.editor?.setValue(code);
      document.getElementById('play-popup').classList.add('show');
    },
    '@close-popup': () => { document.getElementById('play-popup').classList.remove('show') },
  }
}

app.webComponent('apprun-play', Play);

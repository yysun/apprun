import { app, Component } from './apprun';
const popup_div = `<div id="play-popup" class="overlay">
<style id="apprun-play-style">
.apprun-play .col {
  display: inline-block;
  width: calc(50% - 3px);
  height: 100%;
}
.apprun-preview {
  width: 100%
}
.apprun-play .editor, .apprun-play .preview {
  display: inline-block;
  width: calc(100% - 20px);
  height: 100%;
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
}

.cm-s-default {
  height: 100%;
  font-size: small;
  line-height: 1.5em;
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
};
const preview_code = code => {
    let iframe = document.querySelector('.preview');
    iframe.parentNode.replaceChild(iframe.cloneNode(), iframe);
    iframe = document.querySelector('.preview');
    write_code(iframe, code);
};
let editor;
class Play extends Component {
    constructor() {
        super(...arguments);
        this.view = _ => app.h("div", { class: "box" },
            app.h("a", { class: "button", "$onclick": "show-popup" }, "Try the Code"));
        this.rendered = ({ style, hide_src }) => {
            const element = this.element;
            const code = element.previousElementSibling.innerText // for div-code
                || element.previousElementSibling.value; // for textarea
            if (hide_src)
                element.previousElementSibling.style.display = 'none';
            const iframe = document.createElement('iframe');
            iframe.classList.add('apprun-preview');
            iframe.style.cssText = style;
            element.before(iframe);
            write_code(iframe, code);
            if (!document.getElementById('play-popup')) {
                document.body.insertAdjacentHTML('beforeend', popup_div);
            }
            return;
        };
        this.update = {
            'show-popup': _ => {
                const code = this.element.previousElementSibling.previousElementSibling.innerText;
                const textarea = document.querySelector(".editor");
                textarea.value = code;
                if (typeof CodeMirror !== 'undefined' && !editor) {
                    editor = CodeMirror.fromTextArea(textarea, {
                        lineNumbers: true,
                        mode: 'jsx'
                    });
                    editor.on('change', (cm) => this.run('change', cm.getValue()));
                }
                document.getElementById('play-popup').classList.add('show');
            },
            '@close-popup': () => { document.getElementById('play-popup').classList.remove('show'); },
            'change': [(_, code) => {
                    preview_code(code);
                }, { delay: 300 }],
        };
    }
}
app.webComponent('apprun-play', Play);
//# sourceMappingURL=apprun-play.js.map
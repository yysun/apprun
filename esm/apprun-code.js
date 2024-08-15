import { app, Component } from './apprun';
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
class Play extends Component {
    constructor() {
        super(...arguments);
        this.view = ({ code, hide_code }) => {
            return app.h(app.Fragment, null,
                app.h("style", null, styles),
                hide_code ?
                    app.h("div", { class: "apprun-play" },
                        app.h("iframe", { class: "preview" }))
                    :
                        app.h("div", { class: "apprun-play" },
                            app.h("div", { class: "col", style: "width:75%" },
                                app.h("textarea", { class: "editor" }, code)),
                            app.h("div", { class: "col", style: "flex:1" },
                                app.h("iframe", { class: "preview" }))));
        };
        this.mounted = props => {
            const element = this['element'];
            const code_id = props['code-id'];
            const hide_code = props['hide-code'];
            const code_width = props['code-width'];
            let code_area;
            if (code_id) {
                code_area = document.getElementById(code_id);
            }
            else {
                code_area = element.previousElementSibling ||
                    element.parentElement.previousElementSibling;
            }
            const code = (code_area === null || code_area === void 0 ? void 0 : code_area.innerText // from div
            )
                || (code_area === null || code_area === void 0 ? void 0 : code_area.value) // from textarea
                || element.textContent; // from child node
            if (code_area)
                code_area.style.display = 'none';
            return { code, hide_code, code_width };
        };
        this.rendered = ({ code, hide_code, code_width }) => {
            const element = this['element'];
            const textarea = element.querySelector(".apprun-play .editor");
            let iframe = element.querySelector('.apprun-play .preview');
            if (!iframe || !textarea)
                return;
            const run_code = code => {
                var _a, _b;
                const iframe_clone = iframe.cloneNode();
                (_a = iframe.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(iframe_clone, iframe);
                iframe = iframe_clone;
                const doc = (_b = iframe.contentWindow) === null || _b === void 0 ? void 0 : _b.document;
                if (!doc)
                    return;
                doc.open();
                if (code.indexOf('<html') >= 0)
                    doc.write(code);
                else
                    doc.write(code_html(code));
                doc.close();
            };
            if (code)
                run_code(code);
            if (hide_code || !textarea)
                return;
            if (code_width)
                textarea.parentElement.style.width = code_width;
            if (typeof CodeMirror === 'undefined') {
                textarea.onkeyup = () => run_code(textarea.value);
            }
            else {
                const editor = CodeMirror.fromTextArea(textarea, {
                    lineNumbers: true,
                    mode: 'jsx'
                });
                editor.setValue(code);
                editor.on('change', (cm) => run_code(cm.getValue()));
            }
        };
    }
}
app.webComponent('apprun-code', Play);
//# sourceMappingURL=apprun-code.js.map
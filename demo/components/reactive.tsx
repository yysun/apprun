import app from '../../src/apprun'

const state = new Proxy({
  text: ''
  }, {
    get: (target, name) => {
      const text = target.text || '';
      switch (name) {
        case 'text': return target.text;
        case 'characters': return text.replace(/\s/g, '').length;
        case 'words': return !text ? 0 :target.text?.split(' ').length;
        default: return null
      }
    }
  }
);

const view = state => <div>
  <textarea rows="10" cols="50" $bind="text"></textarea>
  <div>{state.characters} {state.words}</div>
  {state.text}
</div>;

export default (element) => app.start(element, state, view, null, {route: '#reactive'});
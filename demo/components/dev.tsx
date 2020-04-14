import app from '../../src/apprun';

const view = state => <>
  <button $onclick="test">$onclick</button>
  <button onclick="alert('You have clicked the button.')">onclick</button>
  <button onclick="this.run('test', event)">this.run</button>
  <button onclick="app.run('test', event)">app.run</button>
  <svg viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="90" height="40" fill="#aaa" $onclick="test" />
    <rect x="10" y="80" width="90" height="40" fill="#aaa" onclick="alert('You have clicked the rect.')" />
    <rect x="10" y="150" width="90" height="40" fill="#aaa" onclick="this.run('test', event)" />
    <rect x="10" y="220" width="90" height="40" fill="#aaa" onclick="app.run('test', event)" />
  </svg>
</>

const update = {
  "#test": state => state,
  "test": (state, evt) => {
    alert("You have clicked the " + evt.target.tagName);
    return state;
  }
}

export default (element) => app.start(element, '', view, update);
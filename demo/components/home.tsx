import { app, Component, safeHTML } from '../../src/apprun';
import { marked } from 'marked';

// Module-level helper function added at the top of the file
async function getDoc(doc: string) {
  const response = await fetch(doc);
  if (!response.ok) {
    console.error(`Failed to fetch document: ${doc}`);
    return '404 Not Found';
  }
  const text = await response.text();
  if (doc.endsWith('.md')) {
    const html = await marked(text);
    return safeHTML(html);
  } else {
    return safeHTML(text);
  }
}

class HomeComponent extends Component {
  state = 'Welcome to AppRun';
  view = (state) => <div>{state}</div>;
  update = {
    '#': () => getDoc('./README.md'),
    '#new': () => getDoc('./WHATSNEW.md'),
    '#docs': async (_, ...doc) => {
      if (!doc || doc.length === 0) return getDoc('./README.md');
      const docPath = `./docs/${doc.join('/')}`;
      return getDoc(docPath);
    }
  };
}

export default (element) => new HomeComponent().start(element);
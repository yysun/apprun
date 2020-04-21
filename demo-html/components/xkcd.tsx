import app, { Component, customElement } from '../../src/apprun';

// example of async fetch using mounted

@customElement('my-xkcd', {shadow: true, render: false})
export default class extends Component {
  state = {};

  view = (state) => <>
    <div><button $onclick='fetchComic'>XKCD</button></div>
    {state.loading ? <div>loading ... </div> : ''}
    {state.comic && <>
      <h3>{state.comic.title}</h3>
      <img src={state.comic.url} />
    </>}
  </>;

  update = {
    'loading': (_, loading) => ({ loading: true }),
    'fetchComic': async _ => {
      this.run('loading', true);
      const response = await fetch('https://xkcd-imgs.herokuapp.com/');
      const comic = await response.json();
      return { comic, loading: false };
    }
  };

  mounted = () => this.run('fetchComic');
}
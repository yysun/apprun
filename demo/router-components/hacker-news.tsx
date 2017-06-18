import app, { Component } from '../../index';
import watch from './hacker-news-api';

type ListType =
  'top' | 'new' | 'show' | 'ask' | 'job'

type List = {
  pageno: number,
  items: Array<any>,
  ref?: any, // firebase ref
}
type State = {
  title: ListType
}

const page_size = 20;

export class HackerNewsComponent extends Component {

  state: State = {
    title: 'top'
  };

  Item = ({ item }) => <li>{item}</li>
  List = ({ list }) => {
    if (!list) return;
    return <ul>
      {
        list.items.filter((_, i) => Math.floor(i / page_size) === list.pageno)
          .map(item => <this.Item item={item} />)
      }
      </ul>;
  }

  ListHeader = ({ list, title }) => {
    if (!list) return;
    const pages = Math.ceil(list.items.length / page_size);
    const style = (enable: boolean) => enable ?
      { cursor: 'pointer'} :
      { 'pointer-events': 'none'};

    return <div style={{ 'margin-left': '50px' }}>
      <span> {list.pageno + 1} / {pages} ({list.items.length})</span>
      &nbsp;&nbsp;<a style={style(list.pageno > 0)} onclick={()=>this.run('page-1', title)}>&lt;&lt;</a>
      &nbsp;&nbsp;<a style={style(list.pageno < pages-1)} onclick={()=>this.run('page+1', title)}>&gt;&gt;</a>
    </div>
  }
  view = (state) => {
    const style = (title) => {
      return { 'font-weight': state.title === title ? 'bold' : 'normal' }
    }
    const list = state[state.title];
    return <div>
      <div style={{'display': 'flex', 'align-items': 'baseline'}}>
        <h3 style={{ 'margin-right': '20px' }}>Hacker News</h3>
        <div>
          <a style={style('top')} href='#hacker-news/top'>Top</a> |&nbsp;
          <a style={style('new')} href='#hacker-news/new'>New</a> |&nbsp;
          <a style={style('show')} href='#hacker-news/show'>Show</a> |&nbsp;
          <a style={style('ask')} href='#hacker-news/ask'>Ask</a> |&nbsp;
          <a style={style('job')} href='#hacker-news/job'>Jobs</a>
        </div>
        <this.ListHeader list={list} title={state.title}/>
      </div>
      <this.List list={list}/>
    </div>
  }

  update = {
    '#hacker-news': (state, ...args) => {
      const title = args[0] || 'top';
      const new_state = { ...this.state, title };
      if (!new_state[title]) {
        console.log(`watch: ${title}`);

        new_state[title] = {
          pageno: 0,
          items: [],
        }
        new_state[title].ref = watch(`${title}stories`, list => {
          new_state[title].items = list;
          this.run('render', new_state);
        });
      }

      return new_state;
    },
    'render': (state, new_state) => new_state,
    'page-1': (state, title) => {
      state[title].pageno--; return state
    },
    'page+1': (state, title) => {
      state[title].pageno++; return state
    }
  }
}

export default (element) => new HackerNewsComponent().mount(element);
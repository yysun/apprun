import app, { Component } from '../../index';
import fetch from './hacker-news-api';

type ListType = 'top' | 'new' | 'show' | 'ask' | 'job'

type State = {
  title: ListType
}

const root = '#hacker-news';
const page_size = 10;

export class HackerNewsComponent extends Component {

  state: State = {
    title: 'top'
  };

  Item = ({ item, idx }) => {
    return <li style={{ 'padding': '5px 0' }}>
      <div>{idx}. <a href={item.url}>{item.title}</a></div>
      <div style={{ 'color': '#aaa' }}>
        <span>{pluralize(item.score, ' point')}</span> |&nbsp;
        <span>by {item.by}</span> |&nbsp;
        <span>{timeAgo(item.time)}</span> |&nbsp;
        <span>{pluralize(item.descendants, ' comment')}</span>
      </div>
    </li>
  }

  List = ({ list }) => {
    if (!list) return;
    return <ul style={{ 'list-style': 'none', 'margin-left': '-40px'}}>
      {
        list.items.filter((_, i) => Math.floor(i / page_size) === list.pageno - 1)
          .map(item => <this.Item item={item} idx={list.items.indexOf(item) + 1} />)
      }
    </ul>;
  }

  ListHeader = ({ list, title }) => {
    if (!list) return;
    const style = (enable: boolean) => enable ?
      { cursor: 'pointer' } :
      { 'pointer-events': 'none' };
    return <div style={{ 'margin-left': '50px' }}>
      <span>{list.pageno} / {list.pages} ({list.items.length})</span>
      &nbsp;&nbsp;<a href={`${root}/${title}/${list.pageno - 1}`} style={style(list.pageno > 1)}>&lt;&lt;</a>
      &nbsp;&nbsp;<a href={`${root}/${title}/${list.pageno + 1}`} style={style(list.pageno < list.pages)}>&gt;&gt;</a>
    </div>
  }

  view = (state) => {
    if (state instanceof Promise) return; // ?
    const style = (title) => {
      return { 'font-weight': state.title === title ? 'bold' : 'normal' }
    }
    const list = state[state.title];
    return <div>
      <div style={{ 'display': 'flex', 'align-items': 'baseline' }}>
        <h3 style={{ 'margin-right': '20px' }}>Hacker News</h3>
        <div>
          <a style={style('top')} href={`${root}/top`}>Top</a> |&nbsp;
          <a style={style('new')} href={`${root}/new`}>New</a> |&nbsp;
          <a style={style('show')} href={`${root}/show`}>Show</a> |&nbsp;
          <a style={style('ask')} href={`${root}/ask`}>Ask</a> |&nbsp;
          <a style={style('job')} href={`${root}/job`}>Jobs</a>
        </div>
        <this.ListHeader list={list} title={state.title} />
      </div>
      <this.List list={list} />
    </div>
  }

  update = {
    '#hacker-news': async (state, title?, pageno?) => {
      if (!title || !pageno) {
        title = title || state.title || 'top';
        pageno = pageno || (state[title] && state[title].pageno) || 1;
        history.replaceState(null, null, `${root}/${title}/${pageno}`);
      }
      const new_state = { ...this.state, title };
      if (!new_state[title]) {
        console.log(`fetch: ${title}`);
        new_state[title] = {}
        new_state[title].items = await fetch(`${title}stories`);
      }
      await this.load(new_state[title], parseInt(pageno));
      this.setState(new_state); // ?
      // console.log(new_state);
      return new_state;
    }
  }

  load = async (list, pageno) => {
    list.pageno = pageno;
    list.pages = Math.ceil(list.items.length / page_size);
    if (isNaN(list.pageno) || list.pageno < 1) list.pageno = 1;
    if (list.pageno > list.pages) list.pageno = list.pages;

    list.items = await Promise.all(list.items.map(async (item, idx) => {
      return ((Math.floor(idx / page_size) === list.pageno - 1) && (typeof item === 'number')) ?
        await fetch(`item/${item}`) : item
    }));
  }
}

function pluralize(number, label) {
  if (!number) number = 0;
  return (number === 1) ? number + label: number + label + 's'
}

function timeAgo(time) {
  const between = Date.now() / 1000 - Number(time)
  if (between < 3600) {
    return pluralize(~~(between / 60), ' minute')
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ' hour')
  } else {
    return pluralize(~~(between / 86400), ' day')
  }
}

export default (element) => new HackerNewsComponent().mount(element);
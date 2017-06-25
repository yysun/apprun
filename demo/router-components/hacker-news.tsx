import app, { Component } from '../../index';
import Firebase = require('firebase');

Firebase.initializeApp({ databaseURL: 'https://hacker-news.firebaseio.com' });
const db = Firebase.database().ref('/v0');

export async function fetch(path): Promise<any> {
  const ref = db.child(path);
  return new Promise((resolve, reject) => {
    ref.once('value', snapshot => resolve(snapshot.val()), reject);
  })
}

const page_size = 20;
export async function fetchList(type): Promise<any> {
  return fetch(`${type}stories`);
}

export async function fetchListItems(list): Promise<any> {
  list.items = await Promise.all(list.items.map(async (item, idx) => {
    return (idx >= list.min && idx< list.max && (typeof item === 'number')) ?
      await fetch(`item/${item}`) : item
  }));
}

export async function fetchItem(id): Promise<any> {
  const item = await fetch(`item/${id}`);
  if (item && item.kids) item.kids = await Promise.all(item.kids.map(async (item) => {
    return typeof item === 'number' ?
      await fetchItem(item) : item
  }));
  return item;
}

const root = '#hacker-news';

export class HackerNewsComponent extends Component {

  state = {
    type: 'top',
  };

  Loading = () => <div className='loading'>Loading ... </div>;

  Comment = ({ comment }) => {
    if (!comment) return;
    return <li className='comment'>
      <div className='meta'>
        <span>by {comment.by}</span> |&nbsp;
        <span>{timeAgo(comment.time)} ago</span>
      </div>
      <div className='text'>{`_html:${comment.text}`}</div>
      <this.Comments item={comment} />
    </li>
  }

  Comments = ({ item }) => {
    if (!item || !item.kids) return;
    const list = item.kids;
    const num = item.kids && item.kids.filter(items => !item.deleted && !item.dead).length;
    return <div>
      {num && <div className='toggle'>{pluralize(num, ' comment')} </div>}
      <ul className='comment-list'> {
        list.filter(item => !item.deleted)
          .map(item => <this.Comment comment={item} />)
      }
      </ul>
    </div>;
  }

  Item = ({ item }) => {
    if (!item) return;
    return <div className='story'>
      <h4><a href={item.url}>{item.title}</a></h4>
      { (item.text) && <div className='text'>{`_html:${item.text}`}</div>  }
      <div className='meta'>
        <span>{pluralize(item.score, ' point')}</span> |&nbsp;
        <span>by {item.by}</span> |&nbsp;
        <span>{timeAgo(item.time)} ago</span> |&nbsp;
        <span>{pluralize(item.descendants, ' comment')} (in total)  |&nbsp;</span>
        <span><a onclick={() => history.back()}>back</a></span>
      </div>
    </div>
  }

  ListItem = ({ item, idx }) => {
    if (!item) return;
    const item_link = `${root}/item/${item.id}`;
    return <li>
      <div className={'score'}>{item.score}</div>
      <div><a href={item.url || item_link}>{item.title}</a></div>
      <div className='meta'>
        <span>by {item.by}</span> |&nbsp;
        <span>{timeAgo(item.time)} ago</span> |&nbsp;
        <span><a href={`${item_link}`} >{pluralize(item.descendants, ' comment')}</a></span>
      </div>
    </li>
  }

  List = ({ list }) => {
    if (!list) return;
    return <div>
      <ul className='story-list'> {
        list.items.filter((_, i) => i>=list.min && i<list.max)
          .map(item => <this.ListItem item={item} idx={list.items.indexOf(item) + 1} />)
      }
      </ul>
      {list.items && list.max < list.items.length &&
        <div className='more'><a onclick={() => this.run('more')}>More ...</a></div>}
    </div>;
  }

  ListHeader = ({ list, type }) => {
    if (!list) return;
    const style = (enable: boolean) => enable ?
      { cursor: 'pointer' } :
      { 'pointer-events': 'none' };
    return <div style={{ 'padding-left': '250px' }}>
      <span>{list.min + 1} - {list.max} ({list.items.length})</span>
      {/*&nbsp;&nbsp;<a href={`${root}/${type}/${list.pageno - 1}`} style={style(list.pageno > 1)}>&lt;&lt;</a>
      &nbsp;&nbsp;<a href={`${root}/${type}/${list.pageno + 1}`} style={style(list.pageno < list.pages)}>&gt;&gt;</a>*/}
    </div>
  }

  view = (state) => {
    let extra, more
    if (state instanceof Promise) {
      // extra = <this.Loading />
      return
    } else if (state.type === 'item') {
      const item = state[state.key];
      extra = <this.Item item={item} />
      more = <this.Comments item={item} />
    } else {
      const list = state[state.type];
      extra = <this.ListHeader list={list} type={state.type} />
      more = <this.List list={list} />
    }
    const style = (mtype) => {
      return { 'font-weight': mtype === state.type ? 'bold' : 'normal' }
    }
    return <div className={`hn ${state.type}`}>
      <div className='header'>
        <div style={{ 'float': 'left' }}>
          <a style={style('top')} href={`${root}/top`}>Top</a> |&nbsp;
          <a style={style('new')} href={`${root}/new`}>New</a> |&nbsp;
          <a style={style('best')} href={`${root}/best`}>Best</a> |&nbsp;
          <a style={style('show')} href={`${root}/show`}>Show</a> |&nbsp;
          <a style={style('ask')} href={`${root}/ask`}>Ask</a> |&nbsp;
          <a style={style('job')} href={`${root}/job`}>Jobs</a>
        </div>
        {extra}
      </div>
      <div className='list'>
        {more}
      </div>
    </div>
  }

  update = {
    '#hacker-news': async (state, type, ...args) => {
      type = type || state.type
      return type === 'item' ?
        this.showItem(state, args[0]) :
        this.showList(state, type, args[0])
    },
    'more': async (state) => {
      const list = state[state.type];
      if (list && list.items) {
        list.max = Math.min(list.max + 20, list.items.length)
        await fetchListItems(state[state.type]);
      }
      this.setState(state); // ?
      return state;
    }
  }

  showList = async (state, type?, pageno?) => {
    if (!type || !pageno) {
      type = type || state.type || 'top';
      pageno = pageno || (state[type] && state[type].pageno) || 1;
      history.replaceState(null, null, `${root}/${type}`);
    }
    const new_state = { ...state, type };
    if (!new_state[type]) {
      console.log(`fetch: ${type}`);
      new_state[type] = {
        items: await fetchList(type),
        min: 0,
        max: page_size
      }
    }

    pageno = parseInt(pageno) || 1;
    new_state[type] = {
      ...new_state[type],
      // min: (pageno - 1) * page_size,
      // max: pageno * page_size,
      pageno,
      pages: Math.ceil(new_state[type].items.length / page_size)
    }

    await fetchListItems(new_state[type]);
    this.setState(new_state); // ?
    return new_state;
  }

  showItem = async (state, id) => {
    if (!id || isNaN(parseInt(id))) {
      id = state.key;
      history.replaceState(null, null, `${root}/item/${id}`);
    }
    const key = `${id}`;
    const new_state = { ...state, type: 'item', key };
    if (!new_state[key]) {
      console.log(`fetch: ${key}`);
      new_state[key] = await fetchItem(id);
    }
    this.setState(new_state); // ?
    return new_state;
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

document.body.addEventListener('click', e => {
  const t = e.target as HTMLElement;
  if (t.matches('.toggle')) {
    t.classList.toggle('closed');
    t.nextElementSibling && t.nextElementSibling.classList.toggle('collapsed');
  }
});

export default (element) => new HackerNewsComponent().mount(element);
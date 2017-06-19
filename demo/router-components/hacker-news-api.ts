import Firebase = require('firebase');

Firebase.initializeApp({ databaseURL: 'https://hacker-news.firebaseio.com'});
const db = Firebase.database().ref('/v0');

export async function fetch(path): Promise<any> {
  // console.log(path)
  const ref = db.child(path);
  return new Promise((resolve, reject) => {
    ref.once('value', snapshot => resolve(snapshot.val()), reject);
  })
}

type Item = any & {
  type: 'story' | 'comment' | 'job' | 'poll',
  items: List
} //any?

type ListType = 'top' | 'new' | 'best' | 'show' | 'ask' | 'job' | 'comment';

type List = {
  pageno: number,
  pages: number,
  items: Array<Item>
}

type State = any & { type: ListType } //any?

const page_size = 20;
export async function fetchList(type): Promise<any> {
  return fetch(`${type}stories`);
}

export async function fetchListItems(list, pageno): Promise<any> {
  list.pageno = pageno;
  list.pages = Math.ceil(list.items.length / page_size);
  if (isNaN(list.pageno) || list.pageno < 1) list.pageno = 1;
  if (list.pageno > list.pages) list.pageno = list.pages;
  list.items = await Promise.all(list.items.map(async (item, idx) => {
    return ((Math.floor(idx / page_size) === list.pageno - 1) && (typeof item === 'number')) ?
      await fetch(`item/${item}`) : item
  }));
}

export async function fetchItem(id): Promise<any> {
  const item = await fetch(`item/${id}`);
  if(item.kids) item.kids = await Promise.all(item.kids.map(async (item) => {
    return typeof item === 'number' ?
      await fetchItem(item) : item
  }));
  return item;
}

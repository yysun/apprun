import app from '../../index-jsx';

enum Filters { all = 0, todo = 1, done = 2 }

declare interface ITodo {
  value: string,
  done: boolean
}

declare interface IModel {
  filter: Filters,
  todos: Array<ITodo>;
}

const ENTER = 13

const model = {
  filter: 0,
  todos: [],
  input: ''
};

const Todo = ({todo, idx}) => (<li onclick={()=>app.run('toggle', idx)}
  style = {{
    color: todo.done ? 'green': 'red',
    textDecoration: todo.done ? "line-through" : "none",
    cursor: 'pointer'
  }}>
  {todo.value}
</li>);

const view = (model) => {
  const styles = (filter) => ({
    'font-weight': model.filter === filter ? 'bold' : 'normal',
    cursor: 'pointer'
  })
  return <div>
    <h1>Todo</h1>
    <span>Show:</span>
    <span> <a style={styles(0)} onclick={()=>app.run('filter', 0)}>All</a></span> |
    <span> <a style={styles(1)} onclick={()=>app.run('filter', 1)}>Todo</a></span> |
    <span> <a style={styles(2)} onclick={()=>app.run('filter', 2)}>Done</a></span>
    <ul>
      {
        model.todos
          .filter(todo => model.filter === 0 ||
            (model.filter === 1 && !todo.done) ||
            (model.filter === 2 && todo.done) )
          .map((todo, idx) => <Todo todo={todo} idx={idx} />)
      }
    </ul>
    <div>
      <input id='new-todo' placeholder='add todo' onkeyup={e => add(e.keyCode)} />
      <button onclick={e=>add(ENTER)}>Add</button>
      <button onclick={()=>app.run('clear')}>Clear</button>
    </div>
  </div>
}

const add = (keyCode) => {
  const input = document.getElementById('new-todo') as HTMLInputElement;
  if (keyCode === ENTER && input.value) { 
    app.run('add', input.value);
    input.value = '';
  }
};

const update = {
  '#todo': model => model,
  add: (model, value) => ({...model,
    todos: [...model.todos, {value, done:false}]
  }),
  toggle: (model, idx) => ({...model,
    todos: [
      ...model.todos.slice(0, idx),
      {...model.todos[idx], done: !model.todos[idx].done},
      ...model.todos.slice(idx + 1)
    ]
  }),
  filter: (model, filter) => ({...model, filter}),
  clear: (model) => ({...model, todos:[] })
}

export default (element) => app.start(element, model, view, update);
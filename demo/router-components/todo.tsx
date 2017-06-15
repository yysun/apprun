import app, { Component } from '../../index'

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

const model: IModel = {
  filter: 0,
  todos: []
}

const Todo = ({todo, idx}) => (<li onclick={()=>component.run('toggle', idx)}
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
    <div>
      <span>Show:</span>
      <span> <a style={styles(0)} onclick={()=>component.run('filter', 0)}>All</a></span> |
      <span> <a style={styles(1)} onclick={()=>component.run('filter', 1)}>Todo</a></span> |
      <span> <a style={styles(2)} onclick={()=>component.run('filter', 2)}>Done</a></span>
    </div>
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
      <button onclick={()=>component.run('clear')}>Clear</button>
    </div><br/>
    <div>
      <button onclick={() => component.run("todo-undo")}> Undo </button>
      <button onclick={() => component.run("todo-redo")}> Redo </button>
    </div>
  </div>
}

const add = (keyCode) => {
  const input = document.getElementById('new-todo') as HTMLInputElement;
  if (keyCode === ENTER && input.value) {
    component.run('add', input.value);
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

let component = new Component(model, view, update);
export default (element) => component.mount(element,
  {history:{prev:'todo-undo', next:'todo-redo'}});
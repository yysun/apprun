import app from '../src/apprun';
import patch from '../src/vdom-patch';

describe('vdom', () => {

  it('should add mark _op', () => {
    const state = {
      title: "title",
      id: "1",
      todos:[]
    };

    const view = state => <>
      <div id={state.id}>{state.title}</div>
      <ul>
        {state.todos.map(todo => <li id={todo.id}>{todo.title}</li>)}
      </ul>
    </>;

    let vdom1 = view(state);

    // no change
    patch(vdom1, vdom1);
    expect(vdom1[0]._op).toBe(3);
    expect(vdom1[1]._op).toBe(3);

    // prop change -> no tree change
    state.id = "2";
    let vdom2 = view(state);
    patch(vdom1, vdom2);
    expect(vdom2[0]._op).toBe(2);
    expect(vdom2[1]._op).toBe(3);

    state.todos = [
      {id: 1, title: '1'},
      {id: 2, title: '2'},
      {id: 3, title: '3'},
    ]

    // tree change -> no prop change
    state.id = "1";
    state.title = "2";
    vdom2 = view(state);
    patch(vdom1, vdom2);

    expect(vdom2[0]._op).toBe(1);
    expect(vdom2[1]._op).toBe(1);
  })

  it('should patch null vdom', () => {
    patch(null, null);
    patch([null], [null]);
    patch({}, [{}]);
    patch(null, [[]]);
  })

})

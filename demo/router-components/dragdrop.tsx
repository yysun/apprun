import app from '../../src/index'

const NOOP = () => {}

const model = {
  dragging: false,
  position: { x: 100, y: 100 },
  start: { x: 0, y: 0 },
}

const view = (model) => {

  const style = {
    userSelect: 'none',
    cursor: 'move',
    position: 'absolute',
    padding: '50px',
    border: '1px solid black',
    color: model.dragging ? 'gold' : 'white',
    "background-color": '#3C8D2F',
    left: `${model.position.x}px`,
    top:  `${model.position.y}px`
  };

  return <div
    onmousedown = { e => app.run('drag', e)}
    onmousemove = { e => app.run('move', e)}
    onmouseup =   { e => app.run('drop')}
    style={style}
    > Drag me!
  </div>
}

const update = {
  '#dragdrop': (model) => model,
  drag: (model, e) => ({ ...model,
    dragging: true,
    start: {x: e.pageX, y: e.pageY}
  }),
  move: (model, e) => {
    if (!model.dragging) return { ...model,
      view: NOOP // this is tells app not to call view function
    };
    const start = {x: e.pageX, y: e.pageY}
    const position = {
      x: model.position.x + e.pageX - model.start.x,
      y: model.position.y + e.pageY - model.start.y
    }
    return ({...model, start, position})
  },
  drop: (model) => ({ ...model, dragging: false })
}

export default (element) => app.start(element, model, view, update);

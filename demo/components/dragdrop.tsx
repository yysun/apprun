import { app, Component } from '../../src/apprun'

class DragDemo extends Component {

  model = {
    dragging: false,
    position: { x: 100, y: 100 },
    start: { x: 0, y: 0 },
  }

  view = (model) => {

    const style = {
      userSelect: 'none',
      cursor: 'move',
      position: 'absolute',
      padding: '50px',
      border: '1px solid black',
      color: model.dragging ? 'gold' : 'white',
      "background-color": '#3C8D2F',
      left: `${model.position.x}px`,
      top: `${model.position.y}px`
    };

    return <div ref= { el=> model.el=el }
      $onpointerdown='drag'
      $onpointermove='move'
      $onpointerup='drop'
      style={style}
    > Drag me!
  </div>
  }

  update = {
    '#dragdrop': (model) => model,
    drag: (model, e) => {
      e.target.setPointerCapture(e.pointerId);
      return {
        ...model,
        dragging: true,
        start: { x: e.pageX, y: e.pageY }
      }
    },
    move: (model, e) => {
      if (!model.dragging) return;
      const start = { x: e.pageX, y: e.pageY }
      const position = {
        x: model.position.x + e.pageX - model.start.x,
        y: model.position.y + e.pageY - model.start.y
      }
      return ({ ...model, start, position })
    },
    drop: (model, e) => {
      e.target.releasePointerCapture(e.pointerId);
      return {
        ...model, dragging: false
      }
    }
  }
  unload = ({ el }) => {
    console.log('dragdrop.unload'); 
    el.onpointerdown = el.onpointerup = el.onpointermove = null;
  };
}

export default (element) => new DragDemo().mount(element);

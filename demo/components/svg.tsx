import app, { Component } from '../../src/apprun'

const triangles = [
{id: "yellow", rot: 0},
{id: "green", rot: 60},
{id: "magenta", rot: 120},
{id: "red", rot: 180},
{id: "cyan", rot: 240},
{id: "blue", rot: 300}
];

class SvgComponent extends Component {
  state = 0;

  view = state => {
    return <div className="view">
      <h1>AppRun SVG Carousel</h1>
      <svg width="380" height="380" viewBox="-190,-190,380,380">
        <g id="carousel" transform={`rotate(${state})`}>
          {triangles.map(t =>
            <polygon id={t.id}
              points="-50,-88 0,-175 50,-88"
              transform={`rotate(${t.rot})`}
              stroke-width="3" />
          )}
        </g>
      </svg>
      <button onclick={() => this.run("rot+60")}>Rotate Clockwise</button>
      <button onclick={() => this.run("rot-60")}>Rotate Anticlockwise</button>
      <button onclick={() => this.run("reset")}>Reset</button>
      <div>It is a reimplementation of <a href="https://github.com/snabbdom/snabbdom/tree/master/examples/carousel-svg">a snabbdom example</a>.</div>
    </div>
  };

  update = {
    "rot+60": state => state + 60,
    "rot-60": state => state - 60,
    "reset": state => 0,
    "#svg": state => state
  };
}

let component = new SvgComponent();
export default (element) => component.mount(element);

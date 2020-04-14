import app, { Component } from '../../src/apprun-html'

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
    return `<div class="view">
      <h1>AppRun SVG Carousel</h1>
      <svg width="380" height="380" viewBox="-190,-190,380,380">
        <g id="carousel" style="transform: rotate(${state}deg);">
          ${triangles.map(t =>
            `<polygon id="${t.id}"
              points="-50,-88 0,-175 50,-88"
              transform="rotate(${t.rot})"
              stroke-width="3" />`
            ).join("")}
        </g>
      </svg>
      <button onclick='app.run("@rot+60")'>Rotate Clockwise</button>
      <button onclick='app.run("@rot-60")'>Rotate Anticlockwise</button>
      <button onclick='app.run("@reset")'>Reset</button>
      <div>It is a reimplementation of <a href="https://github.com/snabbdom/snabbdom/tree/master/examples/carousel-svg">a snabbdom example</a> by Jon Kleiser.</div>
    </div>`;
  };

  update = {
    "@rot+60": state => state + 60,
    "@rot-60": state => state - 60,
    "@reset": () => 0,
    "#svg": state => state
  };
}

let component = new SvgComponent();
export default (element) => component.mount(element);

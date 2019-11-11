# 3rd Party Libraries

Using jQuery and jQuery plugins is not an anti-pattern. It is welcomed and encouraged. AppRun embraces 3rd libraries and recommends you to use them in your AppRun application development.

AppRun was designed to support 3rd party libraries in mind. The AppRun VDOM is resilient to allow other libraries to change to DOM. The AppRun also has event life cycle callback functions to allow other libraries in AppRun applications.

You can embed a DOM element into JSX or use the JSX _ref_ attribute.

## Embed Element

It is straightforward to create a DOM element and modify it using the 3rd party library. The DOM element can be embedded into JSX directly. e.g., the example of using chart.js below. The chart.js example above also demonstrates using the _unload_ function to destroy the Chart object.

```javascript
export default class extends Component {
  state = {
    data: {
      /* ... */
    }
  };

  view = state => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    state.chart = new Chart(ctx, state.data);
    return (
      <Card header="Chart JS">
        {canvas}
      </Card>
    );
  };

  unload = state => {
    state.chart?.destroy();
    console.log('chart destroyed');
  }
}
```

## Ref Attribute

The JSX _ref_ attribute is a call back function called when the specific DOM element is rendered. The DOM element can be any element in JSX. e.g., the d3 example below. The d3 example also demonstrates using the _mounted_ function to initialize the state as a _Promise_.

```javascript
const map = (element, features) => { /*...*/}
export default class extends Component {
  state = {};
  view = features => (
    <Card header={<div id="map-text">D3 Map</div>}>
      <svg ref={el => map(el, features)}></svg>
    </Card>
  );
  mounted = () =>
    new Promise((resolve, reject) => {
      d3.json('./world-110m.json', (error, topo) => {
        if (error) throw reject(error);
        const features = topojson.feature(topo, topo.objects.countries)
          .features;
        resolve(features);
      });
    });
}
```

Combing component life cycle events and embed DOM and the _ref_ attribute provides a convenient way to use 3rd party libraries in the AppRun application. You can find out more from the following examples.

## Bootstrap Admin Dashboard

The [bootstrap admin dashboard]() uses Bootstrap layout. It also uses jQuery plugin DataTables and FullCalendar and chart.js and D3.

![admin dashboard](https://github.com/yysun/apprun-bootstrap/raw/master/screenshot.png)

## CoreUI Admin Template

Another example is using the [CoreUI for AppRun application](https://github.com/apprunjs/apprun-coreui).

![core ui](https://github.com/apprunjs/apprun-coreui/raw/master/screen.png)
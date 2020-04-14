import app from '../src/apprun';


describe('svg', () => {

  it('should embed', () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svg.id = 'my-svg';
    app.render(document.body, <div></div>);
    app.render(document.body, <>{svg}</>);
    expect(document.getElementById('my-svg')).not.toBeNull();
  });

  it('should render animation', () => {

    app.render(document.body,
      <svg>
        <circle>
          {/* <animate /> */}
        </circle>
      </svg>);

    app.render(document.body,
      <svg>
        <circle>
          <animate id="ani"
            attributeType="XML"
            attributeName="fill"
            values="yellow;lightgrey;yellow;lightgrey"
            dur="1s"
            repeatCount="indefinite" />
        </circle>
      </svg>);

    const attr = document.getElementById('ani').getAttribute('dur')
    expect(attr).toBe('1s');

  });

})

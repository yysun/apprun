import app, { Component } from '../src/apprun';

class Base extends Component {
  view = state => <div>{state}</div>
}

class Header extends Base {
  state = 'Header';
}

class Footer extends Base {
  state = 'Footer';
}

class Sidebar extends Base {
  state = 'Sidebar';
}

class Breadcrumb extends Base {
  state = 'Breadcrumb';
}

class Aside extends Base {
  state = 'Aside';
}

class Child extends Base {
  state = 'Home';
}

class Home extends Base {
  state = 'Home';

  view = _ => <>
    <Child />
    <Child />
    <Child />
  </>
}


describe('Nested Stateful Component', () => {

  it('should not generate same id', () => {

    const element = document.createElement('div');
    document.body.appendChild(element);

    app.render(element, <>
      <Header />
      <div class="app-body">
        <div class="sidebar">
          <nav class="sidebar-nav ps ps--active-y">
            <Sidebar />
            <div class="ps__rail-x">
              <div class="ps__thumb-x" tabindex="0"></div>
            </div>
            <div class="ps__rail-y">
              <div class="ps__thumb-y" tabindex="0"></div>
            </div>
          </nav>
          <button class="sidebar-minimizer brand-minimizer" type="button"></button>
        </div>

        <main class="main">
          <Breadcrumb />
          <div class="container-fluid" id="apprun-app-main">
          </div>
        </main>
        <aside class="aside-menu">
          <Aside />
        </aside>
      </div>
      <Footer />
    </>);

    new Home().start('apprun-app-main');
    const ids = [].slice.call(document.querySelectorAll('*[id]')).map(e => e._props.id);
    const dis = [...new Set(ids)];
    expect(ids.length).toEqual(dis.length);

  })

})
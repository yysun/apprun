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

class Home extends Base {
  state = 'Home';
}


describe('Nested Stateful Component', () => {

  it('should load correctly', () => {

    const element = document.createElement('div');
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
            <Home />
          </div>
        </main>
        <aside class="aside-menu">
          <Aside />
        </aside>
      </div>
      <Footer />
    </>);

    expect(element.innerHTML.toString().indexOf('_31_') > 0).toBeTruthy()

  })

})
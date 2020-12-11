
import app from 'apprun';

app.on('//', (route) => {
  const menus = document.querySelectorAll('.navbar-nav li');
  for (let i = 0; i < menus.length; ++i) {menus[i].classList.remove('active');}
  const item = document.querySelector(`[href='${route}']`);
  item && item.parentElement.classList.add('active');
});

export default () => <div class="container">
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">Project Name</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
      aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item active">
          <a class="nav-link" href="#Home">Home
            <span class="sr-only">(current)</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#About">About</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#Contact">Contact</a>
        </li>
      </ul>
    </div>
  </nav>
  <div class="container" id="my-app"></div>
</div>;

const app = require('../dist/apprun').default;

app.on('print', p => console.log(
  app.createElement('div', null, p)
));

app.run('print', 'hello');
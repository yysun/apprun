const app = require('../dist/apprun-html').app;
app.on('log', p => console.log(p))
app.run('log', 'hi node')

const app1 = require('./app1')
app1();
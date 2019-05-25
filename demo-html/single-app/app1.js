import app from "/dist/apprun.esm.js";
app.on('log', (...p) => console.log(...p));
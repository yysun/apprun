/// <reference path="smurfs.d.ts" />
var model = 0;
var view = function (model) {
    return "<div>\n    <h1>" + model + "</h1>\n    <button onclick='app.run(\"-1\")'>-1</button>\n    <button onclick='app.run(\"+1\")'>+1</button>\n  </div>";
};
var update = {
    '+1': function (model) { return model + 1; },
    '-1': function (model) { return model - 1; }
};
var element = document.getElementById('my-app');
app.start(element, model, view, update);

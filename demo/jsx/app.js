/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var index_1 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../../apprun-jsx/index\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var model = 'world';
	var Hello = function (_a) {
	    var name = _a.name;
	    return index_1.default.createElement("div", null, 
	        "Hello: ", 
	        name);
	};
	var view = function (val) {
	    return index_1.default.createElement("div", null, 
	        index_1.default.createElement(Hello, {name: val}), 
	        index_1.default.createElement("input", {value: val, oninput: function () { index_1.default.run('render', this.value); }}));
	};
	var update = {
	    'render': function (_, val) { return val; }
	};
	var element = document.getElementById('my-app');
	index_1.default.start(element, model, view, update);


/***/ }
/******/ ]);
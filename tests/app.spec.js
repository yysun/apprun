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
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 114);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ function(module, exports) {

"use strict";
"use strict";
var App = (function () {
    function App() {
        this._events = {};
    }
    App.prototype.on = function (name, fn, options) {
        if (options === void 0) { options = {}; }
        if (options.debug)
            console.debug('on: ' + name);
        this._events[name] = this._events[name] || [];
        this._events[name].push({ fn: fn, options: options });
    };
    App.prototype.run = function (name) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var subscribers = this._events[name];
        console.assert(!!subscribers, 'No subscriber for event: ' + name);
        if (subscribers)
            this._events[name] = subscribers.filter(function (sub) {
                var fn = sub.fn, options = sub.options;
                if (options.delay) {
                    _this.delay(name, fn, args, options);
                }
                else {
                    if (options.debug)
                        console.debug('run: ' + name, args);
                    fn.apply(_this, args);
                }
                return !sub.options.once;
            });
    };
    App.prototype.delay = function (name, fn, args, options) {
        var _this = this;
        if (options._t)
            clearTimeout(options._t);
        options._t = setTimeout(function () {
            clearTimeout(options._t);
            if (options.debug)
                console.debug("run-delay " + options.delay + ":" + name, args);
            fn.apply(_this, args);
        }, options.delay);
    };
    return App;
}());
exports.App = App;
var app = new App();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app;


/***/ },

/***/ 114:
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var app_1 = __webpack_require__(1);
describe('app events', function () {
    var app;
    beforeEach(function () { return app = new app_1.App(); });
    it('should be able to register(on) and trigger(run)', function () {
        var hi_called = false;
        app.on('hi', function () {
            hi_called = true;
        });
        app.run('hi');
        expect(hi_called).toBeTruthy();
    });
    it('should pass parameters to execution', function () {
        var hi_called = false;
        app.on('hi', function (p1, p2, p3, p4) {
            hi_called = true;
            expect(p1).toBe(1);
            expect(p2).toBe('xx');
            expect(p3).toBeNull;
            expect(p4).toEqual({ a: 1 });
        });
        app.run('hi', 1, 'xx', null, { a: 1 });
        expect(hi_called).toBeTruthy();
    });
    it('should take debug option', function () {
        spyOn(console, 'debug');
        app.on('hi', function (p1, p2, p3, p4) { }, { debug: true });
        app.run('hi', 1, 'xx', null, { a: 1 });
        expect(console.debug).toHaveBeenCalled();
    });
    it('should take once option', function () {
        spyOn(console, 'assert');
        app.on('hi', function (p1, p2, p3, p4) { }, { once: true });
        app.run('hi', 1, 'xx', null, { a: 1 });
        app.run('hi', 1, 'xx', null, { a: 1 });
        expect(console.assert).toHaveBeenCalled();
    });
    it('should take delay option', function (done) {
        var i = 0;
        app.on('hi', function () { i++; }, { delay: 200 });
        app.run('hi');
        app.run('hi');
        app.run('hi');
        expect(i).toBe(0);
        setTimeout(function () {
            expect(i).toBe(1);
            done();
        }, 250);
    });
    it('should mix delay and debug option', function (done) {
        spyOn(console, 'debug');
        var i = 0;
        app.on('hi', function () { i++; }, { debug: true, delay: 200 });
        app.run('hi');
        app.run('hi');
        app.run('hi');
        expect(i).toBe(0);
        expect(console.debug).toHaveBeenCalledTimes(1);
        setTimeout(function () {
            expect(i).toBe(1);
            expect(console.debug).toHaveBeenCalledTimes(2);
            done();
        }, 250);
    });
    it('should mix delay and non-delay events', function (done) {
        var i = 0;
        var j = 0;
        app.on('hi', function () { j++; });
        app.on('hi', function () { i++; }, { delay: 200 });
        app.run('hi');
        app.run('hi');
        app.run('hi');
        expect(i).toBe(0);
        expect(j).toBe(3);
        setTimeout(function () {
            expect(i).toBe(1);
            done();
        }, 250);
    });
    it('should mix delay and once option', function (done) {
        spyOn(console, 'assert');
        var i = 0;
        app.on('hi', function () { i++; }, { one: true, delay: 200 });
        app.run('hi');
        app.run('hi');
        app.run('hi');
        expect(i).toBe(0);
        setTimeout(function () {
            expect(i).toBe(1);
            expect(console.assert).toHaveBeenCalled();
            done();
        }, 250);
    });
    it('should remove only subscription that is once', function () {
        spyOn(console, 'assert');
        spyOn(console, 'log');
        app.on('hi', function () {
            console.log('hi');
        });
        app.on('hi', function () { }, { once: true });
        app.run('hi');
        app.run('hi');
        expect(console.log).toHaveBeenCalledTimes(2);
        expect(console.assert).toHaveBeenCalled();
    });
});


/***/ }

/******/ });
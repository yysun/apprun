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
/******/ 	return __webpack_require__(__webpack_require__.s = 115);
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

/***/ 115:
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var index_zero_1 = __webpack_require__(27);
var model = 'x';
var view = function (_) { return ''; };
var update = {
    hi: function (_, val) { return val; }
};
describe('Component', function () {
    it('should trigger update', function () {
        spyOn(update, 'hi');
        var component = new index_zero_1.Component(document.body, model, view, update);
        index_zero_1.default.run('hi', 'xx');
        expect(update.hi).toHaveBeenCalledWith('x', 'xx');
    });
    it('should trigger view', function () {
        var view = jasmine.createSpy('view');
        var component = new index_zero_1.Component(document.body, model, view, update);
        expect(view).toHaveBeenCalledWith('x');
        index_zero_1.default.run('hi', 'xx');
        expect(view).toHaveBeenCalledWith('xx');
    });
    it('should track history', function () {
        var view = jasmine.createSpy('view');
        var component = new index_zero_1.Component(document.body, model, view, update, { history: true });
        index_zero_1.default.run('hi', 'xx');
        index_zero_1.default.run('hi', 'xxx');
        index_zero_1.default.run('history-prev');
        index_zero_1.default.run('history-next');
        expect(view.calls.allArgs()).toEqual([['x'], ['xx'], ['xxx'], ['xx'], ['xxx']]);
    });
    it('should track history with custom event name', function () {
        var view = jasmine.createSpy('view');
        var component = new index_zero_1.Component(document.body, model, view, update, { history: { prev: 'prev', next: 'next' } });
        index_zero_1.default.run('hi', 'xx');
        index_zero_1.default.run('hi', 'xxx');
        index_zero_1.default.run('prev');
        index_zero_1.default.run('next');
        expect(view.calls.allArgs()).toEqual([['x'], ['xx'], ['xxx'], ['xx'], ['xxx']]);
    });
    it('should overwrite view', function () {
        var view_spy = jasmine.createSpy('view');
        var view2 = function (_) { };
        var view_spy2 = jasmine.createSpy('view2');
        update['hi2'] = function (_) {
            return {
                view: view_spy2
            };
        };
        var component = new index_zero_1.Component(document.body, {}, view_spy, update);
        index_zero_1.default.run('hi2', {});
        expect(view_spy).toHaveBeenCalledTimes(1);
        expect(view_spy2).toHaveBeenCalledTimes(1);
    });
    it('should trigger state changed event with default event name', function () {
        var spy = jasmine.createSpy('spy');
        index_zero_1.default.on('state_changed', function (state) { spy(state); });
        var component = new index_zero_1.Component(document.body, model, view, update, { event: true });
        expect(spy).toHaveBeenCalledWith('x');
        index_zero_1.default.run('hi', 'abc');
        expect(spy).toHaveBeenCalledWith('abc');
    });
    it('should trigger state changed event with custom event name', function () {
        var spy = jasmine.createSpy('spy');
        index_zero_1.default.on('changed', function (state) { spy(state); });
        var component = new index_zero_1.Component(document.body, model, view, update, { event: { name: 'changed' } });
        expect(spy).toHaveBeenCalledWith('x');
        index_zero_1.default.run('hi', 'ab');
        expect(spy).toHaveBeenCalledWith('ab');
    });
});


/***/ },

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var app_1 = __webpack_require__(1);
var ComponentBase = (function () {
    function ComponentBase(element, state, view, update, options) {
        if (update === void 0) { update = {}; }
        var _this = this;
        this.element = element;
        this.state = state;
        this.view = view;
        this._history = [];
        this._history_idx = -1;
        this.initVdom();
        console.assert(!!element);
        options = options || {};
        this.enable_history = !!options.history;
        if (this.enable_history) {
            app_1.default.on(options.history.prev || 'history-prev', function () {
                _this._history_idx--;
                if (_this._history_idx >= 0) {
                    _this.set_state(_this._history[_this._history_idx]);
                }
                else {
                    _this._history_idx = 0;
                }
            });
            app_1.default.on(options.history.next || 'history-next', function () {
                _this._history_idx++;
                if (_this._history_idx < _this._history.length) {
                    _this.set_state(_this._history[_this._history_idx]);
                }
                else {
                    _this._history_idx = _this._history.length - 1;
                }
            });
        }
        this.state_changed = options.event && (options.event.name || 'state_changed');
        this.view = view;
        this.add_actions(update);
        this.push_state(state);
    }
    ComponentBase.prototype.initVdom = function () {
    };
    Object.defineProperty(ComponentBase.prototype, "State", {
        get: function () {
            return this.state;
        },
        enumerable: true,
        configurable: true
    });
    ComponentBase.prototype.set_state = function (state) {
        this.state = state;
        if (state && state.view && typeof state.view === 'function') {
            state.view(this.state);
            state.view = undefined;
            if (this.element.firstChild && this.updateElementVtree)
                this.updateElementVtree(this.element);
        }
        else if (this.view) {
            var html = this.view(this.state);
            if (html && this.updateElement)
                this.updateElement(this.element, html);
        }
    };
    ComponentBase.prototype.push_state = function (state) {
        this.set_state(state);
        if (this.enable_history) {
            this._history = this._history.concat([state]);
            this._history_idx = this._history.length - 1;
        }
        if (this.state_changed) {
            app_1.default.run(this.state_changed, this.state);
        }
    };
    ComponentBase.prototype.add_actions = function (actions) {
        var _this = this;
        Object.keys(actions).forEach(function (action) {
            app_1.default.on(action, function () {
                var p = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    p[_i - 0] = arguments[_i];
                }
                _this.push_state(actions[action].apply(actions, [_this.State].concat(p)));
            });
        });
    };
    return ComponentBase;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ComponentBase;
;


/***/ },

/***/ 27:
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var app_1 = __webpack_require__(1);
var router_1 = __webpack_require__(40);
var component_1 = __webpack_require__(12);
exports.Component = component_1.default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app_1.default;
app_1.default.start = function (element, model, view, update, options) {
    return new component_1.default(element, model, view, update, options);
};
app_1.default.router = function (element, components, home) {
    if (home === void 0) { home = '/'; }
    return router_1.default(element, components, home);
};
if (typeof window === 'object') {
    window['app'] = app_1.default;
}


/***/ },

/***/ 40:
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var app_1 = __webpack_require__(1);
var route = function (url) {
    if (url && url.indexOf('/') > 0) {
        var ss = url.split('/');
        app_1.default.run(ss[0], ss[1]);
    }
    else {
        app_1.default.run(url);
    }
};
exports.router = function (element, components, home) {
    if (home === void 0) { home = '/'; }
    components.forEach(function (c) { return c(element); });
    window.onpopstate = function (e) {
        element.removeChild(element.firstElementChild);
        route(location.hash || home);
    };
    route(location.hash || home);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.router;


/***/ }

/******/ });
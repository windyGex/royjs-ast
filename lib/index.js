'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.View = exports.Store = exports.Element = exports.Action = undefined;

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* 兼容代码 */
var Action = exports.Action = _store2.default;
var Element = exports.Element = _view2.default;

var Store = exports.Store = _store2.default;
var View = exports.View = _view2.default;

exports.default = {
    Store: _store2.default,
    View: _view2.default
};
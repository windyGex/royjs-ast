'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-use-before-define, consistent-return*/


var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Action = function () {
    function Action(code) {
        _classCallCheck(this, Action);

        this.code = code;
    }

    _createClass(Action, [{
        key: 'parse',
        value: function parse() {
            var ast = (0, _util.parse)(this.code);
            var ret = [];
            (0, _babelTraverse2.default)(ast, {
                Property: function Property(path) {
                    var node = path.node;

                    if (node.key.name === 'actions' && node.value.type === 'ObjectExpression') {
                        node.value.properties.forEach(function (prop) {
                            ret.push(prop.key.name);
                        });
                    }
                }
            });
            return ret;
        }
    }, {
        key: 'remove',
        value: function remove(name) {
            var ast = (0, _util.parse)(this.code);
            var changes = [];
            (0, _babelTraverse2.default)(ast, {
                ObjectMethod: function ObjectMethod(path) {
                    var node = path.node;

                    if (assertName(path, name)) {
                        var isLast = path.parent.properties.indexOf(node) === path.parent.properties.length - 1;
                        changes.push({
                            start: node.start,
                            end: node.end + (isLast ? 0 : 1),
                            replacement: ''
                        });
                    }
                }
            });
            this.code = (0, _util.updateCode)(this.code, changes);
            return this.code;
        }
    }, {
        key: 'rename',
        value: function rename(oldName, newName) {
            var ast = (0, _util.parse)(this.code);
            var changes = [];
            (0, _babelTraverse2.default)(ast, {
                ObjectMethod: function ObjectMethod(path) {
                    var node = path.node;

                    if (assertName(path, oldName)) {
                        changes.push({
                            start: node.key.start,
                            end: node.key.end,
                            replacement: newName
                        });
                    }
                }
            });
            this.code = (0, _util.updateCode)(this.code, changes);
            return this.code;
        }
    }, {
        key: 'add',
        value: function add(name) {
            var _this = this;

            var list = this.parse();
            var changes = [];
            if (list.indexOf(name) > -1) {
                console.warn('\u5B58\u5728\u540C\u540D\u7684action ' + name);
            } else {
                var tpl = '\n' + name + '(state, payload) {\n\n      }';
                var ast = (0, _util.parse)(this.code);
                var lastAction = list[list.length - 1];
                (0, _babelTraverse2.default)(ast, {
                    ObjectMethod: function ObjectMethod(path) {
                        var node = path.node;

                        if (assertName(path, lastAction)) {
                            var hasComma = _this.code.charAt(node.end + 1) === ',';
                            changes.push({
                                start: node.end,
                                end: node.end,
                                replacement: (hasComma ? '' : ',') + tpl
                            });
                        }
                    }
                });
                this.code = (0, _util.updateCode)(this.code, changes);
                return this.code;
            }
        }
    }]);

    return Action;
}();

exports.default = Action;
;

function assertName(path, name) {
    var node = path.node;
    return node.key.name === name && path.parentPath.parent.key.name === 'actions';
}
module.exports = exports['default'];
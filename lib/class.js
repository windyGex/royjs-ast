'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-use-before-define, no-unused-vars*/


var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _babelGenerator = require('babel-generator');

var _babelGenerator2 = _interopRequireDefault(_babelGenerator);

var _babelTypes = require('babel-types');

var _babelTypes2 = _interopRequireDefault(_babelTypes);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Class = function () {
    function Class(code) {
        _classCallCheck(this, Class);

        this.code = code;
    }

    _createClass(Class, [{
        key: 'remove',
        value: function remove(name) {
            var path = this.find(name, true)[0];
            if (path) {
                path.replaceWith(_babelTypes2.default.identifier(''));
            } else {
                console.warn('Cant find ${name} method');
            }
        }
    }, {
        key: 'find',
        value: function find(name, isPath) {
            var ast = (0, _util.parse)(this.code);
            var ret = [];
            (0, _babelTraverse2.default)(ast, {
                ClassMethod: function ClassMethod(path) {
                    var node = path.node;

                    var method = node.key.name;
                    if (method === name) {
                        ret.push(isPath ? path : node);
                    }
                }
            });
            return ret;
        }
    }]);

    return Class;
}();

exports.default = Class;
module.exports = exports['default'];
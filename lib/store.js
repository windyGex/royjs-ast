'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-use-before-define, consistent-return*/


var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 解析Royjs的Store数据
 */
var Store = function () {
    /**
     * Store的构造函数
     * @param {String} code 传入的store的代码
     */
    function Store(code) {
        _classCallCheck(this, Store);

        this.code = code;
    }
    /**
     * 解析store文件
     * @return 返回state，actions，urls
     */


    _createClass(Store, [{
        key: 'parse',
        value: function parse() {
            var ast = (0, _util.parse)(this.code);
            var code = this.code;
            var ret = {
                state: [],
                actions: [],
                urls: []
            };
            (0, _babelTraverse2.default)(ast, {
                ObjectProperty: function ObjectProperty(path) {
                    var node = path.node;

                    if (node.key.name === 'state') {
                        node.value.properties.forEach(function (prop) {
                            ret.state.push({
                                name: prop.key.name,
                                value: code.substring(prop.value.start, prop.value.end)
                            });
                        });
                    }
                    if (node.key.name === 'actions' && node.value.type === 'ObjectExpression') {
                        node.value.properties.forEach(function (prop) {
                            ret.actions.push({
                                name: prop.key.name,
                                value: code.substring(prop.start, prop.end)
                            });
                        });
                    }
                },
                CallExpression: function CallExpression(path) {
                    var _path$node = path.node,
                        callee = _path$node.callee,
                        args = _path$node.arguments;
                    // this.request(url),
                    // this.request.post(url),
                    // this.request.get(url)

                    if (callee.type === 'MemberExpression' && callee.object.type === 'ThisExpression' && callee.property.name === 'request' || callee.type === 'MemberExpression' && callee.object.type === 'MemberExpression' && ['get', 'post'].indexOf(callee.property.name) > -1) {
                        args.forEach(function (arg) {
                            if (arg.type === 'StringLiteral') {
                                ret.urls.push(arg);
                            }
                        });
                    }
                }
            });
            return ret;
        }
        /**
         * 根据name移除某个定义的action
         * @param {String} name action的名字
         * @return 修改后的代码
         */

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
        /**
         * 重命名某个state
         * @param {String} oldName 旧的state的名字
         * @param {String} newName 新的state的名字
         * @return 修改后的代码
         */

    }, {
        key: 'renameState',
        value: function renameState(oldName, newName) {
            var ast = (0, _util.parse)(this.code);
            var changes = [];
            (0, _babelTraverse2.default)(ast, {
                ObjectProperty: function ObjectProperty(path) {
                    var node = path.node;

                    if (assertStateName(path, oldName)) {
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
        /**
         * 修改状态的值
         * @param {String} name 状态的名称
         * @param {String} value 状态的值
         * @return 修改后的代码
         */

    }, {
        key: 'modifyState',
        value: function modifyState(name, value) {
            var ast = (0, _util.parse)(this.code);
            var changes = [];
            (0, _babelTraverse2.default)(ast, {
                ObjectProperty: function ObjectProperty(path) {
                    var node = path.node;

                    if (assertStateName(path, name)) {
                        changes.push({
                            start: node.value.start,
                            end: node.value.end,
                            replacement: value
                        });
                    }
                }
            });
            this.code = (0, _util.updateCode)(this.code, changes);
            return this.code;
        }
        /**
         * 根据action的名字，修改action内容
         * @param {String} name action的名字
         * @param {String} content action的内容
         * @return 修改后的代码
         */

    }, {
        key: 'modify',
        value: function modify(name, content) {
            var ast = (0, _util.parse)(this.code);
            var changes = [];
            (0, _babelTraverse2.default)(ast, {
                ObjectMethod: function ObjectMethod(path) {
                    var node = path.node;

                    if (assertName(path, name)) {
                        changes.push({
                            start: node.start,
                            end: node.end,
                            replacement: content
                        });
                    }
                }
            });
            this.code = (0, _util.updateCode)(this.code, changes);
            return this.code;
        }
        /**
         * 重命名某个action
         * @param {String} oldName action的名称
         * @param {String} newName action的新的名称
         * @return 修改后的代码
         */

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
        /**
         * 增加一个action， 如果存在同名action则不会添加
         * @param {String} name action的名称
         * @return 修改后的代码
         */

    }, {
        key: 'add',
        value: function add(name) {
            var _this = this;

            var ret = this.parse();
            var list = ret.actions.map(function (item) {
                return item.name;
            });
            var changes = [];
            if (list.indexOf(name) > -1) {
                console.warn('\u5B58\u5728\u540C\u540D\u7684action ' + name);
            } else {
                var tpl = '\n\t' + name + '(state, payload) {\n\n      \t}';
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
        /**
         * 修改store中请求url
         * @param {Node} node 指定的节点，该节点需包含start和end两个属性
         * @param {String} url  替换的URL
         * @return 返回修改的代码
         */

    }, {
        key: 'modifyUrl',
        value: function modifyUrl(node, url) {
            var changes = [{
                start: node.start,
                end: node.end,
                replacement: url
            }];
            this.code = (0, _util.updateCode)(this.code, changes);
            return this.code;
        }
    }]);

    return Store;
}();

function assertName(path, name) {
    var node = path.node;
    return node.key.name === name && path.parentPath.parent.key.name === 'actions';
}

function assertStateName(path, name) {
    var node = path.node;
    return node.key.name === name && path.parentPath.parent.key && path.parentPath.parent.key.name === 'state';
}

exports.default = Store;
module.exports = exports['default'];
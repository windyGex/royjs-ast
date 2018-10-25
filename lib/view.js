'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-use-before-define*/


var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _babelGenerator = require('babel-generator');

var _babelGenerator2 = _interopRequireDefault(_babelGenerator);

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _util = require('./util');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var generate = function generate(ast) {
    var ret = (0, _babelGenerator2.default)(ast, {
        jsonCompatibleStrings: true,
        jsescOption: {
            minimal: true
        }
    });
    ret.code = (0, _util.decodeUnicode)(ret.code);
    return ret;
};

var getNodeName = function getNodeName(openingElement) {
    var name = openingElement.name;
    if (name.type === 'JSXMemberExpression') {
        name = name.object.name + '.' + name.property.name;
        return name;
    }
    return name.name;
};

/**
 * 解析Royjs的视图数据
 */

var View = function () {
    /**
     * View的构造函数
     * @param {String} code 传入的view的代码
     */
    function View(code) {
        _classCallCheck(this, View);

        this.code = code;
    }
    /**
     * 解析视图数据
     * @return 返回 class和elements值
     */


    _createClass(View, [{
        key: 'parse',
        value: function parse() {
            this.ast = (0, _util.parse)(this.code);
            var ret = {
                elements: [],
                class: []
            };
            var cache = {};
            var loopNode = function loopNode(node) {
                var ret = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

                cache[node.start] = true;
                if (node.type === 'JSXElement') {
                    var openingElement = node.openingElement;
                    var obj = {
                        name: getNodeName(openingElement),
                        start: node.start,
                        end: node.end,
                        loc: node.loc,
                        children: []
                    };
                    if (node.children) {
                        node.children.forEach(function (node) {
                            loopNode(node, obj.children);
                        });
                    }
                    ret.push(obj);
                }
                return ret;
            };

            (0, _babelTraverse2.default)(this.ast, {
                JSXElement: function JSXElement(path) {
                    var node = path.node;

                    if (cache[node.start]) {
                        return;
                    }
                    loopNode(node, ret.elements);
                },
                ClassDeclaration: function ClassDeclaration(path) {
                    var node = path.node;

                    if (cache[node.start]) {
                        return;
                    }
                    var className = node.id.name;
                    var obj = {
                        name: className,
                        methods: []
                    };
                    node.body.body.forEach(function (method) {
                        obj.methods.push({
                            name: method.key.name,
                            start: method.start,
                            end: method.end,
                            loc: method.loc
                        });
                    });
                    ret.class.push(obj);
                }
            });
            return ret;
        }
        /**
         * 为一个节点设置属性
         * @param {Node|String} node
         * @param {String} name
         * @param {String} value
         */

    }, {
        key: 'attrs',
        value: function attrs(node, name, value) {
            if (typeof node === 'string') {
                node = this.find(node)[0];
            }
            if (node) {
                var _node = node,
                    openingElement = _node.openingElement;
                var attributes = openingElement.attributes;

                var templates = '<div ' + name + '={' + value + '}/>';
                var ast = (0, _util.parseExpression)(templates);
                if (this.hasAttr(node, name)) {
                    var index = this.indexAttr(node, name);
                    attributes[index] = ast.openingElement.attributes[0];
                } else {
                    attributes.push(ast.openingElement.attributes[0]);
                }
            }
            this.code = generate(this.ast).code;
            return this.code;
        }
        /**
         * 移除一个节点属性
         * @param {Node | String} node
         * @param {String} name  要移除的属性名称
         */

    }, {
        key: 'removeAttr',
        value: function removeAttr(node, name) {
            if (typeof node === 'string') {
                node = this.find(node)[0];
            }
            if (node) {
                var index = this.indexAttr(node, name);
                if (index > -1) {
                    node.openingElement.attributes.splice(index, 1);
                }
            }
            this.code = generate(this.ast).code;
            return this.code;
        }
    }, {
        key: 'indexAttr',
        value: function indexAttr(node, name) {
            var openingElement = node.openingElement;
            var attributes = openingElement.attributes;

            var attrList = attributes.map(function (attr) {
                return attr.name.name;
            });
            return attrList.indexOf(name);
        }
    }, {
        key: 'hasAttr',
        value: function hasAttr(node, name) {
            return this.indexAttr(node, name) > -1;
        }
        /**
         * 根据名称移除一个节点
         * @param {String} name
         */

    }, {
        key: 'remove',
        value: function remove(name) {
            var path = this.find(name, true)[0];
            if (path) {
                path.replaceWith(t.identifier(''));
            } else {
                console.warn('Cant find ' + name + ' \u8282\u70B9');
            }
            this.code = generate(this.ast).code;
            return this.code;
        }
        /**
         * 根据起始位置移除一个节点
         * @param {String | Int} start
         */

    }, {
        key: 'removeByStart',
        value: function removeByStart(start) {
            var path = this.findByStart(start, true);
            if (path) {
                path.remove();
            }
            this.code = generate(this.ast).code;
            return this.code;
        }
        /**
         * 根据起始位置复制一个节点
         * @param {String | Int} start
         */

    }, {
        key: 'cloneByStart',
        value: function cloneByStart(start) {
            var path = this.findByStart(start, true);
            if (path) {
                var node = path.node;
                var code = generate(node).code;
                var ast = (0, _util.parseExpression)(code);
                var children = path.parentPath.node.children;
                var index = children.indexOf(node);
                // .push(ast);
                children.splice(index, 0, ast);
            }
            this.code = generate(this.ast).code;
            return this.code;
        }
        /**
         * 为一个节点加入子节点
         * @param {String | node} node 父节点
         * @param {String} child 子节点的代码
         */

    }, {
        key: 'add',
        value: function add(node, child) {
            if (typeof node === 'string') {
                node = this.find(node)[0];
            }
            if (node) {
                var ast = (0, _util.parseExpression)(child);
                node.children.push(ast);
            }
            this.code = generate(this.ast).code;
            return this.code;
        }
        /**
         * 重命名一个节点，如果寻找到多个节点，只会重命名第一个
         * @param {String}} oldName
         * @param {String} newName
         */

    }, {
        key: 'rename',
        value: function rename(oldName, newName) {
            var node = this.find(oldName)[0];
            if (node) {
                node.openingElement.name.name = newName;
                if (node.closingElement) {
                    node.closingElement.name.name = newName;
                }
            } else {
                console.warn('\u4E0D\u5B58\u5728' + oldName + '\u8282\u70B9!');
            }
            this.code = generate(this.ast).code;
            return this.code;
        }
        /**
         * 根据name寻找节点
         * @param {String}} name
         * @return {Array}
         */

    }, {
        key: 'find',
        value: function find(name, isPath, start) {
            this.ast = (0, _util.parse)(this.code);
            var ret = [];
            (0, _babelTraverse2.default)(this.ast, {
                JSXOpeningElement: function JSXOpeningElement(path) {
                    var node = path.node;

                    var nodeName = getNodeName(node);
                    if (nodeName === name) {
                        if (start && node.start === start || !start) {
                            ret.push(isPath ? path.parentPath : path.parent);
                        }
                    }
                }
            });
            return ret;
        }
        /**
         * 根据起始位置寻找节点，如果第二个参数为true，则返回节点的路径
         * @param {String | Int} start
         * @param {Boolean} isPath
         */

    }, {
        key: 'findByStart',
        value: function findByStart(start, isPath) {
            var callback = function callback(node, parent) {
                return node.start === parseInt(start, 10);
            };
            var ret = this.findBy(callback, isPath);
            return ret[0];
        }
    }, {
        key: 'findById',
        value: function findById(id, isPath) {
            var _this = this;

            var callback = function callback(node, parent) {
                var attributes = node.attributes;

                var index = _this.indexAttr(parent, 'data-roy-id');
                if (index > -1) {
                    var value = attributes[index].value.value;
                    if (value === id) {
                        return true;
                    }
                }
                return false;
            };
            var ret = this.findBy(callback, isPath);
            return ret[0];
        }
        /**
         * 根据callback过滤节点，如果第二个参数为true，则返回节点的路径
         * @param {Function} callback
         * @param {Boolean} isPath
         */

    }, {
        key: 'findBy',
        value: function findBy(callback, isPath) {
            this.ast = (0, _util.parse)(this.code);
            var ret = [];
            (0, _babelTraverse2.default)(this.ast, {
                JSXOpeningElement: function JSXOpeningElement(path) {
                    if (callback(path.node, path.parent)) {
                        ret.push(isPath ? path.parentPath : path.parent);
                    }
                }
            });
            return ret;
        }
    }]);

    return View;
}();

exports.default = View;
module.exports = exports['default'];
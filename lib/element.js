'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

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

var getNodeName = function getNodeName(openingElement) {
    var name = openingElement.name;
    if (name.type === 'JSXMemberExpression') {
        name = name.object.name + '.' + name.property.name;
        return name;
    }
    return name.name;
};

var Element = function () {
    function Element(code) {
        _classCallCheck(this, Element);

        this.code = code;
    }

    _createClass(Element, [{
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
                            end: method.end
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
            this.code = (0, _babelGenerator2.default)(this.ast).code;
            return this.code;
        }
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
            this.code = (0, _babelGenerator2.default)(this.ast).code;
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
    }, {
        key: 'remove',
        value: function remove(name) {
            var path = this.find(name, true)[0];
            if (path) {
                path.replaceWith(t.identifier(''));
            } else {
                console.warn('Cant find ' + name + ' \u8282\u70B9');
            }
            this.code = (0, _babelGenerator2.default)(this.ast).code;
            return this.code;
        }
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
            this.code = (0, _babelGenerator2.default)(this.ast).code;
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
            this.code = (0, _babelGenerator2.default)(this.ast).code;
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
    }, {
        key: 'findByStart',
        value: function findByStart(start) {
            var callback = function callback(node, parent) {
                return node.start === start;
            };
            var ret = this.findBy(callback);
            return ret[0];
        }
        /**
         * 寻找data-roy-id为id的节点
         * @param {String} id
         */

    }, {
        key: 'findById',
        value: function findById(id) {
            var callback = function callback(node, parent) {
                var attributes = node.attributes;

                var index = this.indexAttr(parent, 'data-roy-id');
                if (index > -1) {
                    var value = attributes[index].value.value;
                    if (value === id) {
                        return true;
                    }
                }
                return false;
            };
            var ret = this.findBy(callback);
            return ret[0];
        }
    }, {
        key: 'findBy',
        value: function findBy(callback) {
            this.ast = (0, _util.parse)(this.code);
            var ret = [];
            (0, _babelTraverse2.default)(this.ast, {
                JSXOpeningElement: function JSXOpeningElement(path) {
                    if (callback(path.node, path.parent)) {
                        ret.push(path.parent);
                    }
                }
            });
            return ret;
        }
    }]);

    return Element;
}();

exports.default = Element;
module.exports = exports['default'];
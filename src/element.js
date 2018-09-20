/* eslint-disable no-use-before-define*/
import traverse from 'babel-traverse';
import babelGenerate from 'babel-generator';
import * as t from 'babel-types';
import { parse, parseExpression } from './util';

const generate = function (ast) {
    return babelGenerate(ast, {
        jsonCompatibleStrings: true,
        jsescOption: {
            minimal: true
        }
    });
};

const getNodeName = function getNodeName(openingElement) {
    let name = openingElement.name;
    if (name.type === 'JSXMemberExpression') {
        name = name.object.name + '.' + name.property.name;
        return name;
    }
    return name.name;
};

export default class Element {
    constructor(code) {
        this.code = code;
    }
    parse() {
        this.ast = parse(this.code);
        const ret = {
            elements: [],
            class: []
        };
        const cache = {};
        const loopNode = function loopNode(node, ret = []) {
            cache[node.start] = true;
            if (node.type === 'JSXElement') {
                const openingElement = node.openingElement;
                const obj = {
                    name: getNodeName(openingElement),
                    start: node.start,
                    end: node.end,
                    loc: node.loc,
                    children: []
                };
                if (node.children) {
                    node.children.forEach(node => {
                        loopNode(node, obj.children);
                    });
                }
                ret.push(obj);
            }
            return ret;
        };

        traverse(this.ast, {
            JSXElement(path) {
                const { node } = path;
                if (cache[node.start]) {
                    return;
                }
                loopNode(node, ret.elements);
            },
            ClassDeclaration(path) {
                const { node } = path;
                if (cache[node.start]) {
                    return;
                }
                const className = node.id.name;
                const obj = {
                    name: className,
                    methods: []
                };
                node.body.body.forEach(method => {
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
    attrs(node, name, value) {
        if (typeof node === 'string') {
            node = this.find(node)[0];
        }
        if (node) {
            const { openingElement } = node;
            const { attributes } = openingElement;
            const templates = `<div ${name}={${value}}/>`;
            const ast = parseExpression(templates);
            if (this.hasAttr(node, name)) {
                const index = this.indexAttr(node, name);
                attributes[index] = ast.openingElement.attributes[0];
            } else {
                attributes.push(ast.openingElement.attributes[0]);
            }
        }
        this.code = generate(this.ast).code;
        return this.code;
    }
    removeAttr(node, name) {
        if (typeof node === 'string') {
            node = this.find(node)[0];
        }
        if (node) {
            const index = this.indexAttr(node, name);
            if (index > -1) {
                node.openingElement.attributes.splice(index, 1);
            }
        }
        this.code = generate(this.ast).code;
        return this.code;
    }
    indexAttr(node, name) {
        const { openingElement } = node;
        const { attributes } = openingElement;
        const attrList = attributes.map(attr => attr.name.name);
        return attrList.indexOf(name);
    }
    hasAttr(node, name) {
        return this.indexAttr(node, name) > -1;
    }
    remove(name) {
        const path = this.find(name, true)[0];
        if (path) {
            path.replaceWith(t.identifier(''));
        } else {
            console.warn(`Cant find ${name} 节点`);
        }
        this.code = generate(this.ast).code;
        return this.code;
    }
    removeByStart(start) {
        const path = this.findByStart(start, true);
        if (path) {
            path.remove();
        }
        this.code = generate(this.ast).code;
        return this.code;
    }
    cloneByStart(start) {
        const path = this.findByStart(start, true);
        if (path) {
            const node = path.node;
            const code = generate(node).code;
            const ast = parseExpression(code);
            path.parentPath.node.children.push(ast);
        }
        this.code = generate(this.ast).code;
        return this.code;
    }
    add(node, child) {
        if (typeof node === 'string') {
            node = this.find(node)[0];
        }
        if (node) {
            const ast = parseExpression(child);
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
    rename(oldName, newName) {
        const node = this.find(oldName)[0];
        if (node) {
            node.openingElement.name.name = newName;
            if (node.closingElement) {
                node.closingElement.name.name = newName;
            }
        } else {
            console.warn(`不存在${oldName}节点!`);
        }
        this.code = generate(this.ast).code;
        return this.code;
    }
    /**
     * 根据name寻找节点
     * @param {String}} name
     * @return {Array}
     */
    find(name, isPath, start) {
        this.ast = parse(this.code);
        const ret = [];
        traverse(this.ast, {
            JSXOpeningElement(path) {
                const { node } = path;
                const nodeName = getNodeName(node);
                if (nodeName === name) {
                    if ((start && node.start === start) || !start) {
                        ret.push(isPath ? path.parentPath : path.parent);
                    }
                }
            }
        });
        return ret;
    }
    findByStart(start, isPath) {
        const callback = function (node, parent) {
            return node.start === parseInt(start, 10);
        };
        const ret = this.findBy(callback, isPath);
        return ret[0];
    }
    /**
     * 寻找data-roy-id为id的节点
     * @param {String} id
     * @deprecated
     */
    findById(id, isPath) {
        const callback = function (node, parent) {
            const { attributes } = node;
            const index = this.indexAttr(parent, 'data-roy-id');
            if (index > -1) {
                const value = attributes[index].value.value;
                if (value === id) {
                    return true;
                }
            }
            return false;
        };
        const ret = this.findBy(callback, isPath);
        return ret[0];
    }
    findBy(callback, isPath) {
        this.ast = parse(this.code);
        const ret = [];
        traverse(this.ast, {
            JSXOpeningElement: path => {
                if (callback(path.node, path.parent)) {
                    ret.push(isPath ? path.parentPath : path.parent);
                }
            }
        });
        return ret;
    }
}

/* eslint-disable no-use-before-define*/
import traverse from 'babel-traverse';
import generate from 'babel-generator';
import t from 'babel-types';
import { parse, parseExpression } from './util';

export default class Element {
    constructor(code) {
        this.code = code;
    }
    parse() {
        this.ast = parse(this.code);
        const ret = [];
        traverse(this.ast, {
            JSXOpeningElement(path) {
                const { node } = path;
                if (
                    node.key.name === 'actions' &&
                    node.value.type === 'ObjectExpression'
                ) {
                    node.value.properties.forEach(prop => {
                        ret.push(prop.key.name);
                    });
                }
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
        const {openingElement} = node;
        const {attributes} = openingElement;
        const attrList = attributes.map(attr => attr.name.name);
        return attrList.indexOf(name);
    }
    hasAttr(node, name) {
        return this.indexAttr(node, name) > -1;
    }
    remove(name) {
        const path = this.find(name, true)[0];
        if (path) {
            path.replaceWith(t.stringLiteral(''));
        } else {
            console.warn(`Cant find ${name} 节点`);
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
    find(name, isPath) {
        this.ast = parse(this.code);
        const ret = [];
        traverse(this.ast, {
            JSXOpeningElement(path) {
                const { node } = path;
                const { name: nodeName } = node.name;
                if (nodeName === name) {
                    ret.push(isPath ? path.parentPath : path.parent);
                }
            }
        });
        return ret;
    }
    /**
     * 寻找data-roy-id为id的节点
     * @param {String} id
     */
    findById(id) {
        this.ast = parse(this.code);
        let activeNode;
        traverse(this.ast, {
            JSXOpeningElement: (path) => {
                const {node} = path;
                const {attributes} = node;
                const index = this.indexAttr(path.parent, 'data-roy-id');
                if (index > -1) {
                    const value = attributes[index].value.value;
                    if (value === id) {
                        activeNode = path.parent;
                    }
                }
            }
        });
        return activeNode;
    }
}

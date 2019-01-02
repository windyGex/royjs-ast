/* eslint-disable no-use-before-define*/
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { parse, parseExpression, formatter, generate } from './util';

const getNodeName = function getNodeName(openingElement) {
    let name = openingElement.name;
    if (name.type === 'JSXMemberExpression') {
        name = name.object.name + '.' + name.property.name;
        return name;
    }
    return name.name;
};

/**
 * 解析Royjs的视图数据
 */
class View {
    /**
     * View的构造函数
     * @param {String} code 传入的view的代码
     */
    constructor(code) {
        this.code = code;
    }
    /**
     * 解析视图数据
     * @return 返回 class和elements值
     */
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
            let templates = `<div ${name}={${value}}/>`;
            if (value === 'true' || value === true) {
                templates = `<div ${name}/>`;
            } else if (typeof value === 'string' && /^(['"]).*\1$/.test(value.trim())) {
                templates = `<div ${name}=${value}/>`;
            }
            const ast = parseExpression(templates);
            if (this.hasAttr(node, name)) {
                const index = this.indexAttr(node, name);
                attributes[index] = ast.openingElement.attributes[0];
            } else {
                attributes.push(ast.openingElement.attributes[0]);
            }
        }
        this.code = formatter(this.code, this.ast);
        return this.code;
    }
    /**
     * 移除一个节点属性
     * @param {Node | String} node
     * @param {String} name  要移除的属性名称
     */
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
        this.code = formatter(this.code, this.ast);
        return this.code;
    }
    indexAttr(node, name) {
        const { openingElement } = node;
        const { attributes } = openingElement;
        const attrList = attributes.map(attr => {
            if (attr.type === 'JSXAttribute') {
                return attr.name.name;
            }
            return attr.argument.name;
        });
        return attrList.indexOf(name);
    }
    hasAttr(node, name) {
        return this.indexAttr(node, name) > -1;
    }
    /**
     * 根据名称移除一个节点
     * @param {String} name
     */
    remove(name) {
        const path = this.find(name, true)[0];
        if (path) {
            path.replaceWith(t.identifier(''));
        } else {
            console.warn(`Cant find ${name} 节点`);
        }
        this.code = formatter(this.code, this.ast);
        return this.code;
    }
    /**
     * 根据起始位置移除一个节点
     * @param {String | Int} start
     */
    removeByStart(start) {
        const path = this.findByStart(start, true);
        if (path) {
            path.remove();
        }
        this.code = formatter(this.code, this.ast);
        return this.code;
    }
    /**
     * 根据起始位置复制一个节点
     * @param {String | Int} start
     */
    cloneByStart(start) {
        const path = this.findByStart(start, true);
        if (path) {
            const node = path.node;
            const code = generate(node).code;
            const ast = parseExpression(code);
            const children = path.parentPath.node.children;
            const index = children.indexOf(node);
            children.splice(index + 1, 0, ast);
        }
        // this.code = formatter(this.code, this.ast);
        this.code = formatter(this.code, this.ast);
        return this.code;
    }
    addPkgName(component, pkgName, returnCode = true) {
        if (!component || !pkgName || (component && component.toLowerCase() === component)) {
            return '';
        }
        let matched,
            defaults = 'react',
            afterPkg,
            root;

        traverse(this.ast, {
            Program(path) {
                root = path.node;
            },
            ImportDeclaration(path) {
                const { node } = path;
                if (node.source.value === pkgName) {
                    matched = path;
                }
                if (node.source.value === defaults) {
                    afterPkg = path;
                }
            }
        });
        const code = `import {${component}} from '${pkgName}'`;
        let ast = parse(code);
        traverse(ast, {
            ImportDeclaration(path) {
                ast = path.node;
            }
        });
        if (!matched) {
            if (afterPkg) {
                afterPkg.insertAfter(ast);
            } else {
                root.body.unshift(ast);
            }
        } else {
            const { specifiers } = matched.node;
            const names = specifiers.map(spec => {
                return spec.imported.name;
            });
            component.split(',').forEach((c, i) => {
                if (names.indexOf(c.trim()) === -1) {
                    specifiers.push(ast.specifiers[i]);
                }
            });
        }
        if (returnCode) {
            this.code = formatter(this.code, this.ast);
            return this.code;
        }
        return '';
    }
    beforeByStart(start, code, component, pkgName) {
        const path = this.findByStart(start, true);
        if (path) {
            const ast = parseExpression(code);
            const node = path.parentPath.node;
            const index = node.children.indexOf(path.node);
            if (index === 0) {
                node.children.unshift(ast);
            } else if (index === node.children.length - 1) {
                node.children.push(ast);
            } else {
                node.children.splice(index - 1, 0, ast);
            }
            this.addPkgName(component, pkgName, false);
        }
        this.code = formatter(this.code, this.ast);
        return this.code;
    }
    afterByStart(start, code, component, pkgName) {
        const path = this.findByStart(start, true);
        if (path) {
            const ast = parseExpression(code);
            path.insertAfter(ast);
            this.addPkgName(component, pkgName, false);
        }
        this.code = formatter(this.code, this.ast);
        return this.code;
    }
    addByStart(start, code, component, pkgName) {
        const path = this.findByStart(start, true);
        if (path) {
            const ast = parseExpression(code);
            console.log(code, ast);
            const node = path.node;
            if (!node.children) {
                node.children = [];
            }
            node.children.push(ast);
            this.addPkgName(component, pkgName, false);
        }
        this.code = formatter(this.code, this.ast);
        return this.code;
    }
    /**
     * 为一个节点加入子节点
     * @param {String | node} node 父节点
     * @param {String} child 子节点的代码
     */
    add(node, child) {
        if (typeof node === 'string') {
            node = this.find(node)[0];
        }
        if (node) {
            const ast = parseExpression(child);
            node.children.push(ast);
        }
        this.code = formatter(this.code, this.ast);
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
        this.code = formatter(this.code, this.ast);
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
    /**
     * 根据起始位置寻找节点，如果第二个参数为true，则返回节点的路径
     * @param {String | Int} start
     * @param {Boolean} isPath
     */
    findByStart(start, isPath) {
        const callback = function (node, parent) {
            return node.start === parseInt(start, 10);
        };
        const ret = this.findBy(callback, isPath);
        return ret[0];
    }
    findById(id, isPath) {
        const callback = (node, parent) => {
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
    /**
     * 根据callback过滤节点，如果第二个参数为true，则返回节点的路径
     * @param {Function} callback
     * @param {Boolean} isPath
     */
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

    findTextByStart(start, isPath) {
        this.ast = parse(this.code);
        let ret;
        traverse(this.ast, {
            JSXText: path => {
                if (path.node.start === parseInt(start, 10)) {
                    ret = isPath ? path : path.node;
                }
            }
        });
        return ret;
    }

    attrText(start, value) {
        const node = this.findTextByStart(start);
        node.value = value;
        node.extra.raw = value;
        node.extra.rawValue = value;
        this.code = formatter(this.code, this.ast);
        return this.code;
    }

    addState(start, name, value) {
        const path = this.findByStart(start, true);
        // find method
        let method = path.parentPath;
        while (method.node.type !== 'ClassMethod') {
            method = method.parentPath;
        }
        const methodNode = method.node;
        // find class
        const cls = method.parentPath.parentPath.node;
        const matchName = getDecorators(cls);
        if (!matchName) {
            return this.code;
        }
        // find varibles
        const body = method.node.body.body;
        const vars = body.filter(bodyItem => bodyItem.type === 'VariableDeclaration');
        const allVars = getAllVars(vars);
        // 没有变量定义
        if (allVars.indexOf(value) === -1) {
            // inject 的情况下访问 this.store.state;
            if (matchName === 'inject') {
                // 开始寻找有没有this.store.state的定义的代码
                const codes = body.map(bodyItem => ({
                    code: generate(bodyItem).code,
                    node: bodyItem
                }));
                const matchedStateNode = codes.filter(code => code.code.indexOf('this.store.state') > -1)[0];
                if (matchedStateNode && matchedStateNode.node) {
                    if (!addVarsToNode(matchedStateNode.node, value)) {
                        const template = `const {${value}} = this.store.state`;
                        const ast = parse(template);
                        methodNode.body.body.unshift(ast.program.body[0]);
                    }
                } else {
                    const template = `const {${value}} = this.store.state`;
                    const ast = parse(template);
                    methodNode.body.body.unshift(ast.program.body[0]);
                }
            } else if (matchName === 'connect') {
                // nothing to do;
            }
        }
        return this.attrs(path.node, name, value);
    }
}

function getDecorators(cls) {
    const decorators = cls.decorators;
    let matchName;
    for (let i = 0; i < decorators.length; i++) {
        const decorator = decorators[i];
        const name = decorator.expression.callee.name;
        if (name === 'inject' || name === 'connect') {
            matchName = name;
            break;
        }
    }
    return matchName;
}

function getAllVars(vars) {
    let ret = [];
    vars.forEach(varItem => {
        const declarations = varItem.declarations;
        declarations.forEach(node => {
            if (node.id.type === 'Identifier') {
                ret.push(node.id.name);
            } else if (node.id.type === 'ObjectPattern') {
                const vs = node.id.properties.map(item => item.value.name);
                ret = ret.concat(vs);
            }
        });
    });
    return ret;
}

function addVarsToNode(varItem, name) {
    const declarations = varItem.declarations;
    let success = false;
    declarations.forEach(node => {
        if (node.id.type === 'ObjectPattern') {
            node.id.properties.unshift(t.objectProperty(t.identifier(name), t.identifier(name), false, true));
            success = true;
        }
    });
    return success;
}

export default View;

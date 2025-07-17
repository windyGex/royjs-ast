/* eslint-disable no-use-before-define, consistent-return*/
import traverse from '@babel/traverse';
import { parse, formatter, generate, validateAST } from './util';
import { parseExpression } from '@babel/parser';

/**
 * Checks if a path represents a service property within a batchCreateServices call.
 * 
 * @private
 * @param {Object} path - Babel traverse path
 * @returns {boolean} True if the path is within a batchCreateServices call
 */
function assertName(path) {
    const node = path.parentPath.parent;
    if (node && node.callee && node.callee.name === 'batchCreateServices') {
        return true;
    }
    return false;
}

/**
 * Checks if a path represents a service object within a batchCreateServices call.
 * 
 * @private
 * @param {Object} path - Babel traverse path
 * @returns {boolean} True if the path is a service object in batchCreateServices
 */
function assertCreateService(path) {
    return path.parent && path.parent.callee && path.parent.callee.name === 'batchCreateServices';
}

/**
 * Service class for manipulating Roy.js service configurations.
 * 
 * This class provides methods to analyze, modify, and generate service
 * configuration code. It supports CRUD operations on service definitions
 * within batchCreateServices calls.
 * 
 * @class Service
 * @example
 * const service = new Service(`
 *   batchCreateServices({
 *     userService: {
 *       url: '/api/users',
 *       method: 'GET'
 *     },
 *     postService: {
 *       url: '/api/posts',
 *       method: 'POST'
 *     }
 *   });
 * `);
 * 
 * const services = service.parse();
 * service.modify('commentService', '{ url: "/api/comments", method: "GET" }');
 * console.log(service.code);
 */
class Service {
    /**
     * Creates a new Service instance.
     * 
     * @param {string} code - The source code of the service file
     * @throws {Error} When code is not a valid string
     * @example
     * const service = new Service(serviceCode);
     */
    constructor(code) {
        if (typeof code !== 'string') {
            throw new Error('Service code must be a string');
        }
        this.code = code;
        this._ast = null; // Cache AST to avoid re-parsing
        this._parsed = null; // Cache parsed result
    }

    /**
     * Gets or creates the AST for the current code.
     * 
     * @private
     * @returns {Object} The parsed AST
     */
    _getAST() {
        if (!this._ast) {
            this._ast = parse(this.code);
            if (!validateAST(this._ast)) {
                throw new Error('Invalid AST generated from service code');
            }
        }
        return this._ast;
    }

    /**
     * Invalidates the cached AST and parsed result.
     * 
     * @private
     */
    _invalidateCache() {
        this._ast = null;
        this._parsed = null;
    }
    /**
     * 解析Service文件
     */
    parse() {
        this.ast = parse(this.code);
        const ret = [];
        traverse(this.ast, {
            ObjectExpression: path => {
                if (assertCreateService(path)) {
                    path.node.properties.forEach(item => {
                        const o = {
                            name: item.key.name
                        };
                        const { properties } = item.value;
                        properties.forEach(prop => {
                            if (prop.value.type === 'StringLiteral' || prop.value.type === 'NumericLiteral') {
                                o[prop.key.name] = prop.value.value;
                            } else {
                                o[prop.key.name] = this.code.substring(prop.value.start, prop.value.end);
                            }
                        });
                        ret.push(o);
                    });
                }
            }
        });
        return ret;
    }
    /**
     * 根据name移除某个定义的service
     * @param {String} name service的名字
     * @return 修改后的代码
     */
    remove(name) {
        const ast = parse(this.code);
        traverse(ast, {
            ObjectProperty(path) {
                if (assertName(path)) {
                    const node = path.node;
                    if (node.key.name === name) {
                        const index = path.parent.properties.indexOf(node);
                        path.parent.properties.splice(index, 1);
                    }
                }
            }
        });
        this.code = formatter(this.code, ast);
        return this.code;
    }
    /**
     * 重命名某个service
     * @param {String} oldName 旧的service的名字
     * @param {String} newName 新的service的名字
     * @return 修改后的代码
     */
    rename(oldName, newName) {
        const ast = parse(this.code);
        traverse(ast, {
            ObjectProperty(path) {
                if (assertName(path)) {
                    const node = path.node;
                    if (node.key.name === oldName) {
                        node.key.name = newName;
                    }
                }
            }
        });
        this.code = formatter(this.code, ast);
        return this.code;
    }
    /**
     * 创建一个service或者更新一个service
     * @param {String} name 状态的名称
     * @param {String} object 状态的值
     */
    modify(name, object) {
        const ast = parse(this.code);
        const t = parseExpression(`({${name} : ${object}})`);
        let override;
        traverse(ast, {
            ObjectProperty(path) {
                if (assertName(path)) {
                    const node = path.node;
                    if (node.key.name === name) {
                        path.parent.properties = t.properties;
                        override = true;
                    }
                }
            }
        });
        if (!override) {
            traverse(ast, {
                ObjectExpression(path) {
                    if (assertCreateService(path)) {
                        const {properties} = path.node;
                        properties.push(t.properties[0]);
                    }
                }
            });
        }
        this.code = generate(ast).code;
        this.code = formatter(this.code, parse(this.code));
        return this.code;
    }
}

export default Service;

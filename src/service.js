/* eslint-disable no-use-before-define, consistent-return*/
import traverse from '@babel/traverse';
import { parse, formatter, generate } from './util';
import { parseExpression } from '@babel/parser';

function assertName(path) {
    const node = path.parentPath.parent;
    if (node && node.callee && node.callee.name === 'batchCreateServices') {
        return true;
    }
    return false;
}
function assertCreateService(path) {
    return path.parent && path.parent.callee && path.parent.callee.name === 'batchCreateServices';
}
/**
 * 解析Service数据
 */
class Service {
    /**
     * Service的构造函数
     * @param {String} code 传入的Service的代码
     */
    constructor(code) {
        this.code = code;
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

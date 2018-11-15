/* eslint-disable no-use-before-define, consistent-return*/
import traverse from '@babel/traverse';
import { parse, updateCode, formatter, generate} from './util';

/**
 * 解析Royjs的Store数据
 */
class Store {
    /**
     * Store的构造函数
     * @param {String} code 传入的store的代码
     */
    constructor(code) {
        this.code = code;
    }
    /**
     * 解析store文件
     * @return 返回state，actions，urls
     */
    parse() {
        this.ast = parse(this.code);
        const code = this.code;
        const ret = {
            state: [],
            actions: [],
            dataSource: []
        };
        traverse(this.ast, {
            ObjectProperty(path) {
                const { node } = path;
                if (node.key.name === 'state') {
                    node.value.properties.forEach(prop => {
                        ret.state.push({
                            name: prop.key.name,
                            value: code.substring(prop.value.start, prop.value.end)
                        });
                    });
                }
                if (node.key.name === 'actions' && node.value.type === 'ObjectExpression') {
                    node.value.properties.forEach(prop => {
                        ret.actions.push({
                            name: prop.key.name,
                            value: code.substring(prop.start, prop.end)
                        });
                    });
                }
            },
            CallExpression(path) {
                const { callee, arguments: args } = path.node;
                // this.request(url),
                // this.request.post(url),
                // this.request.get(url)
                if (
                    (callee.type === 'MemberExpression' &&
                        callee.object.type === 'ThisExpression' &&
                        callee.property.name === 'request') ||
                    (callee.type === 'MemberExpression' &&
                        callee.object.type === 'MemberExpression' &&
                        ['get', 'post', 'put', 'delete'].indexOf(callee.property.name) > -1)
                ) {
                    let parentPath = path.parentPath, actionName;
                    while (parentPath) {
                        if (parentPath.node.type !== 'ObjectMethod') {
                            parentPath = parentPath.parentPath;
                        } else {
                            actionName = parentPath.node.key.name;
                            break;
                        }
                    }
                    const normalizedArgs = args.map(arg => {
                        const ret = {
                            start: arg.start,
                            end: arg.end
                        };
                        if (arg.type === 'StringLiteral') {
                            ret.value = arg.extra.raw;
                        } else {
                            ret.value = code.substring(arg.start, arg.end);
                        }
                        return ret;
                    });
                    ret.dataSource.push({
                        args: normalizedArgs,
                        method: {
                            start: callee.property.start,
                            end: callee.property.end,
                            name: callee.property.name
                        },
                        actionName
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
    remove(name) {
        const ast = parse(this.code);
        traverse(ast, {
            ObjectMethod(path) {
                const { node } = path;
                if (assertName(path, name)) {
                    const index = path.parent.properties.indexOf(node);
                    path.parent.properties.splice(index, 1);
                }
            }
        });
        this.code = formatter(this.code, ast);
        return this.code;
    }
    /**
     * 重命名某个state
     * @param {String} oldName 旧的state的名字
     * @param {String} newName 新的state的名字
     * @return 修改后的代码
     */
    renameState(oldName, newName) {
        const ast = parse(this.code);
        traverse(ast, {
            ObjectProperty(path) {
                const { node } = path;
                if (assertStateName(path, oldName)) {
                    node.key.name = newName;
                }
            }
        });
        this.code = formatter(this.code, ast);
        return this.code;
    }
    /**
     * 修改状态的值
     * @param {String} name 状态的名称
     * @param {String} value 状态的值
     * @return 修改后的代码
     */
    modifyState(name, value) {
        const ast = parse(this.code);
        const changes = [];
        traverse(ast, {
            ObjectProperty(path) {
                const { node } = path;
                if (assertStateName(path, name)) {
                    changes.push({
                        start: node.value.start,
                        end: node.value.end,
                        replacement: value
                    });
                }
            }
        });
        this.code = updateCode(this.code, changes);
        return this.code;
    }
    /**
     * 根据action的名字，修改action内容
     * @param {String} name action的名字
     * @param {String} content action的内容
     * @return 修改后的代码
     */
    modify(name, content) {
        const ast = parse(this.code);
        const changes = [];
        traverse(ast, {
            ObjectMethod(path) {
                const { node } = path;
                if (assertName(path, name)) {
                    changes.push({
                        start: node.start,
                        end: node.end,
                        replacement: content
                    });
                }
            }
        });
        this.code = updateCode(this.code, changes);
        return this.code;
    }
    /**
     * 重命名某个action
     * @param {String} oldName action的名称
     * @param {String} newName action的新的名称
     * @return 修改后的代码
     */
    rename(oldName, newName) {
        const ast = parse(this.code);
        const changes = [];
        traverse(ast, {
            ObjectMethod(path) {
                const { node } = path;
                if (assertName(path, oldName)) {
                    changes.push({
                        start: node.key.start,
                        end: node.key.end,
                        replacement: newName
                    });
                }
            }
        });
        this.code = updateCode(this.code, changes);
        return this.code;
    }
    /**
     * 增加一个action， 如果存在同名action则不会添加
     * @param {String} name action的名称
     * @return 修改后的代码
     */
    add(name) {
        const ret = this.parse();
        const list = ret.actions.map(item => item.name);
        if (list.indexOf(name) > -1) {
            console.warn(`存在同名的action ${name}`);
        } else {
            const tpl = `var a = {${name}(state, payload) {}}`;
            const ast = parse(this.code);
            const ret = parse(tpl);
            let newNode;
            traverse(ret, {
                ObjectMethod: path => {
                    newNode = path.node;
                }
            });
            const lastAction = list[list.length - 1];
            traverse(ast, {
                ObjectMethod: path => {
                    if (assertName(path, lastAction)) {
                        path.parent.properties.push(newNode);
                    }
                }
            });
            this.code = generate(ast).code;
            this.code = formatter(this.code, parse(this.code));
            return this.code;
        }
    }
    /**
     * 根据位置修改内容
     * @param {Node} node 指定的节点，该节点需包含start和end两个属性
     * @param {String} content  替换的content
     * @return 返回修改的代码
     */
    modifyByStartEnd(node, content) {
        const changes = [
            {
                start: node.start,
                end: node.end,
                replacement: content
            }
        ];
        this.code = updateCode(this.code, changes);
        this.code = formatter(this.code, parse(this.code));
        return this.code;
    }
}

function assertName(path, name) {
    const node = path.node;
    return node.key.name === name && path.parentPath.parent.key.name === 'actions';
}

function assertStateName(path, name) {
    const node = path.node;
    return node.key.name === name && path.parentPath.parent.key && path.parentPath.parent.key.name === 'state';
}

export default Store;

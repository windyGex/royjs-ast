/* eslint-disable no-use-before-define, consistent-return*/
import traverse from 'babel-traverse';
import {parse, updateCode} from './util';

export default class Action {
    constructor(code) {
        this.code = code;
    }
    parse() {
        const ast = parse(this.code);
        const ret = [];
        traverse(ast, {
            Property(path) {
                const {node} = path;
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
    remove(name) {
        const ast = parse(this.code);
        const changes = [];
        traverse(ast, {
            ObjectMethod(path) {
                const {node} = path;
                if (assertName(path, name)) {
                    const isLast =
            path.parent.properties.indexOf(node) ===
            path.parent.properties.length - 1;
                    changes.push({
                        start: node.start,
                        end: node.end + (isLast ? 0 : 1),
                        replacement: ''
                    });
                }
            }
        });
        this.code = updateCode(this.code, changes);
        return this.code;
    }
    rename(oldName, newName) {
        const ast = parse(this.code);
        const changes = [];
        traverse(ast, {
            ObjectMethod(path) {
                const {node} = path;
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
    add(name) {
        const list = this.parse();
        const changes = [];
        if (list.indexOf(name) > -1) {
            console.warn(`存在同名的action ${name}`);
        } else {
            const tpl = `\n${name}(state, payload) {

      }`;
            const ast = parse(this.code);
            const lastAction = list[list.length - 1];
            traverse(ast, {
                ObjectMethod: (path) => {
                    const {node} = path;
                    if (assertName(path, lastAction)) {
                        const hasComma = this.code.charAt(node.end + 1) === ',';
                        changes.push({
                            start: node.end,
                            end: node.end,
                            replacement: (hasComma ? '' : ',') + tpl
                        });
                    }
                }
            });
            this.code = updateCode(this.code, changes);
            return this.code;
        }
    }
};

function assertName(path, name) {
    const node = path.node;
    return node.key.name === name &&
    path.parentPath.parent.key.name === 'actions';
}

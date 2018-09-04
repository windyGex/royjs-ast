/* eslint-disable no-use-before-define*/
import traverse from 'babel-traverse';

export default class Element {
    constructor(code) {
        this.code = code;
    }
    parse() {
        const ast = parse(this.code);
        const ret = [];
        traverse(ast, {
            JSXOpeningElement(path) {
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
    attrs(node, name, value) {

    }
    remove(name) {

    }
    add(node, name, props, children) {

    }
    rename(oldName, newName) {

    }
    findNode(name) {

    }
    findNodebyHooks(hookId) {
        
    }
};

/* eslint-disable no-use-before-define, no-unused-vars*/
import traverse from 'babel-traverse';
import generate from 'babel-generator';
import t from 'babel-types';
import { parse, parseExpression } from './util';

export default class Class {
    constructor(code) {
        this.code = code;
    }
    remove(name) {
        const path = this.find(name, true)[0];
        if (path) {
            path.replaceWith(t.identifier(''));
        } else {
            console.warn('Cant find ${name} method');
        }
    }
    find(name, isPath) {
        const ast = parse(this.code);
        const ret = [];
        traverse(ast, {
            ClassMethod(path) {
                const {node} = path;
                const method = node.key.name;
                if (method === name) {
                    ret.push(isPath ? path : node);
                }
            }
        });
        return ret;
    }
}

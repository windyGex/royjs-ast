/* eslint-disable no-use-before-define, no-unused-vars*/
import traverse from 'babel-traverse';
import generate from 'babel-generator';
import t from 'babel-types';
import { parse, parseExpression } from './util';

export default class Class {
    constructor(code) {
        this.code = code;
    }
}

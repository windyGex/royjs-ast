import * as babylon from '@babel/parser';
import prettier from 'prettier/standalone';
import babelGenerate from '@babel/generator';

const config = {
    sourceType: 'module',
    plugins: [
        'jsx',
        'flow',
        'doExpressions',
        'objectRestSpread',
        'decorators-legacy',
        'classProperties',
        'exportExtensions',
        'asyncGenerators',
        'functionBind',
        'functionSent',
        'dynamicImport'
    ]
};
export const parse = function parse(code) {
    // if (CACHE[code]) {
    //     return CACHE[code];
    // }
    const ast = babylon.parse(code, config);
    // CACHE[code] = ast;
    return ast;
};

export const parseExpression = function parseExpression(code) {
    const ast = babylon.parseExpression(code, config);
    return ast;
};

export const updateCode = function updateCode(code, changes) {
    changes.forEach(change => {
        code = code.split('');
        code.splice(change.start, change.end - change.start, change.replacement);
        code = code.join('');
    });
    return code;
};

export const decodeUnicode = function decodeUnicode(str) {
    str = str.replace(/\\u/g, '%u');
    return unescape(str);
};

export const formatter = function (text, ast) {
    const config = {
        'arrowParens': 'avoid',
        'bracketSpacing': true,
        'htmlWhitespaceSensitivity': 'css',
        'insertPragma': false,
        'jsxBracketSameLine': true,
        'jsxSingleQuote': false,
        'printWidth': 160,
        'proseWrap': 'preserve',
        'requirePragma': false,
        'semi': true,
        'singleQuote': true,
        'tabWidth': 4,
        'trailingComma': 'none',
        'useTabs': false,
        'parser': () => ast
    };
    return prettier.format(text, config);
};

export const generate = function (ast) {
    const ret = babelGenerate(ast, {
        jsonCompatibleStrings: true,
        jsescOption: {
            minimal: true
        }
    });
    ret.code = decodeUnicode(ret.code);
    return ret;
};

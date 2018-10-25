import * as babylon from 'babylon';

const config = {
    sourceType: 'module',
    plugins: [
        'jsx',
        'flow',
        'doExpressions',
        'objectRestSpread',
        'decorators',
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


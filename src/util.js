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
    const ast = babylon.parse(code, config);
    return ast;
};

export const parseExpression = function parseExpression(code) {
    return babylon.parseExpression(code, config);
};

export const updateCode = function updateCode(code, changes) {
    changes.forEach(change => {
        code = code.split('');
        code.splice(change.start, change.end - change.start, change.replacement);
        code = code.join('');
    });
    return code;
};


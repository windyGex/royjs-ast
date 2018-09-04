import * as babylon from 'babylon';

export const parse = function parse(code) {
    const ast = babylon.parse(code, {
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
    });
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


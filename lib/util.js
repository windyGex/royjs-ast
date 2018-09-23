'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.decodeUnicode = exports.updateCode = exports.parseExpression = exports.parse = undefined;

var _babylon = require('babylon');

var babylon = _interopRequireWildcard(_babylon);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var CACHE = {};
var config = {
    sourceType: 'module',
    plugins: ['jsx', 'flow', 'doExpressions', 'objectRestSpread', 'decorators', 'classProperties', 'exportExtensions', 'asyncGenerators', 'functionBind', 'functionSent', 'dynamicImport']
};
var parse = exports.parse = function parse(code) {
    // if (CACHE[code]) {
    //     return CACHE[code];
    // }
    var ast = babylon.parse(code, config);
    // CACHE[code] = ast;
    return ast;
};

var parseExpression = exports.parseExpression = function parseExpression(code) {
    var ast = babylon.parseExpression(code, config);
    return ast;
};

var updateCode = exports.updateCode = function updateCode(code, changes) {
    changes.forEach(function (change) {
        code = code.split('');
        code.splice(change.start, change.end - change.start, change.replacement);
        code = code.join('');
    });
    return code;
};

var decodeUnicode = exports.decodeUnicode = function decodeUnicode(str) {
    str = str.replace(/\\u/g, '%u');
    return unescape(str);
};
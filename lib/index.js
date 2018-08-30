import babylon from 'babylon';
import traverse from 'babel-traverse';

export const Action = class Action {
  constructor(code) {
    this.code = code;
  }
  parse() {
    const ast = parse(this.code);
    const ret = [];
    traverse(ast, {
      Property(node) {
        if (node.key.name === 'actions' && node.value.type === 'ObjectExpression') {
          node.value.properties.forEach(prop => {
            ret.push(prop.key.name);
          });
          console.log(ret);
        }
      }
    });
    return ret;
  }
  remove(name) {
    const ast = parse(this.code);
    const changes = [];
    traverse(ast, {
      Property(node) {
        if (node.key.name === name && node.value.type === 'FunctionExpression') {
          changes.push({
            start: node.start,
            end: node.end,
            replacement: ''
          });
        }
      }
    });
    this.code = updateCode(this.code, changes);
  }
};

function updateCode(code, changes) {
  changes.forEach(change => {
    code = code.split('').splice(change.start, change.end, replacement).join('');
  });
  return code;
}

function parse(code) {
  const ast = babylon.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'flow', 'doExpressions', 'objectRestSpread', 'decorators', 'classProperties', 'exportExtensions', 'asyncGenerators', 'functionBind', 'functionSent', 'dynamicImport']
  });
  return ast;
}
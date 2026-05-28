// fix-useeffect-setstate.js
// This script uses jscodeshift to transform React components.
// It searches for useEffect callbacks that contain direct setState calls (e.g., setFoo(...)).
// The transformation moves the state update into a separate function or uses functional updater.
// WARNING: This is a heuristic and may require manual review.

const { parse } = require('recast');
const { statement } = require('jscodeshift');

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find all useEffect calls
  root
    .find(j.CallExpression, {
      callee: { name: 'useEffect' }
    })
    .forEach(path => {
      const effectFn = path.node.arguments[0];
      if (!effectFn || effectFn.type !== 'ArrowFunctionExpression' && effectFn.type !== 'FunctionExpression') return;

      const body = effectFn.body;
      // Only handle block statements
      if (body.type !== 'BlockStatement') return;

      // Find setState calls inside the effect body
      const setStateCalls = j(body).find(j.CallExpression, node => {
        return (
          node.callee.type === 'Identifier' &&
          node.callee.name.startsWith('set') &&
          node.callee.name.length > 3 &&
          node.callee.name[3] === node.callee.name[3].toUpperCase()
        );
      });

      setStateCalls.forEach(callPath => {
        const setName = callPath.node.callee.name;
        const args = callPath.node.arguments;
        // Replace with functional updater if argument is an expression referencing previous state
        // For simplicity, wrap argument in prev => ...
        const newCall = j.callExpression(j.identifier(setName), [
          j.arrowFunctionExpression([
            j.identifier('prev')
          ], args[0] || j.identifier('undefined'))
        ]);
        j(callPath).replaceWith(newCall);
      });
    });

  return root.toSource({ quote: 'single' });
};

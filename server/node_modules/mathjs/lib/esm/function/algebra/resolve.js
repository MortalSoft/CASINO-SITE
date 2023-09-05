import { createMap, isMap } from '../../utils/map.js';
import { isFunctionNode, isNode, isOperatorNode, isParenthesisNode, isSymbolNode } from '../../utils/is.js';
import { factory } from '../../utils/factory.js';
var name = 'resolve';
var dependencies = ['parse', 'ConstantNode', 'FunctionNode', 'OperatorNode', 'ParenthesisNode'];
export var createResolve = /* #__PURE__ */factory(name, dependencies, _ref => {
  var {
    parse,
    ConstantNode,
    FunctionNode,
    OperatorNode,
    ParenthesisNode
  } = _ref;

  /**
   * resolve(expr, scope) replaces variable nodes with their scoped values
   *
   * Syntax:
   *
   *     resolve(expr, scope)
   *
   * Examples:
   *
   *     math.resolve('x + y', {x:1, y:2})           // Node {1 + 2}
   *     math.resolve(math.parse('x+y'), {x:1, y:2}) // Node {1 + 2}
   *     math.simplify('x+y', {x:2, y:'x+x'}).toString()      // "6"
   *
   * See also:
   *
   *     simplify, evaluate
   *
   * @param {Node | Node[]} node
   *     The expression tree (or trees) to be simplified
   * @param {Object} scope
   *     Scope specifying variables to be resolved
   * @return {Node | Node[]} Returns `node` with variables recursively substituted.
   * @throws {ReferenceError}
   *     If there is a cyclic dependency among the variables in `scope`,
   *     resolution is impossible and a ReferenceError is thrown.
   */
  function resolve(node, scope) {
    var within = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();

    // note `within`:
    // `within` is not documented, since it is for internal cycle
    // detection only
    if (!scope) {
      return node;
    }

    if (!isMap(scope)) {
      scope = createMap(scope);
    }

    if (isSymbolNode(node)) {
      if (within.has(node.name)) {
        var variables = Array.from(within).join(', ');
        throw new ReferenceError("recursive loop of variable definitions among {".concat(variables, "}"));
      }

      var value = scope.get(node.name);

      if (isNode(value)) {
        var nextWithin = new Set(within);
        nextWithin.add(node.name);
        return resolve(value, scope, nextWithin);
      } else if (typeof value === 'number') {
        return parse(String(value));
      } else if (value !== undefined) {
        return new ConstantNode(value);
      } else {
        return node;
      }
    } else if (isOperatorNode(node)) {
      var args = node.args.map(function (arg) {
        return resolve(arg, scope, within);
      });
      return new OperatorNode(node.op, node.fn, args, node.implicit);
    } else if (isParenthesisNode(node)) {
      return new ParenthesisNode(resolve(node.content, scope, within));
    } else if (isFunctionNode(node)) {
      var _args = node.args.map(function (arg) {
        return resolve(arg, scope, within);
      });

      return new FunctionNode(node.name, _args);
    } // Otherwise just recursively resolve any children (might also work
    // for some of the above special cases)


    return node.map(child => resolve(child, scope, within));
  }

  return resolve;
});
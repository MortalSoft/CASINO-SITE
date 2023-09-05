"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSimplifyCore = void 0;

var _is = require("../../utils/is.js");

var _util = require("./simplify/util.js");

var _factory = require("../../utils/factory.js");

var name = 'simplifyCore';
var dependencies = ['equal', 'isZero', 'add', 'subtract', 'multiply', 'divide', 'pow', 'AccessorNode', 'ArrayNode', 'ConstantNode', 'FunctionNode', 'IndexNode', 'ObjectNode', 'OperatorNode', 'ParenthesisNode', 'SymbolNode'];
var createSimplifyCore = /* #__PURE__ */(0, _factory.factory)(name, dependencies, function (_ref) {
  var equal = _ref.equal,
      isZero = _ref.isZero,
      add = _ref.add,
      subtract = _ref.subtract,
      multiply = _ref.multiply,
      divide = _ref.divide,
      pow = _ref.pow,
      AccessorNode = _ref.AccessorNode,
      ArrayNode = _ref.ArrayNode,
      ConstantNode = _ref.ConstantNode,
      FunctionNode = _ref.FunctionNode,
      IndexNode = _ref.IndexNode,
      ObjectNode = _ref.ObjectNode,
      OperatorNode = _ref.OperatorNode,
      ParenthesisNode = _ref.ParenthesisNode,
      SymbolNode = _ref.SymbolNode;
  var node0 = new ConstantNode(0);
  var node1 = new ConstantNode(1);

  var _createUtil = (0, _util.createUtil)({
    FunctionNode: FunctionNode,
    OperatorNode: OperatorNode,
    SymbolNode: SymbolNode
  }),
      hasProperty = _createUtil.hasProperty,
      isCommutative = _createUtil.isCommutative;
  /**
   * simplifyCore() performs single pass simplification suitable for
   * applications requiring ultimate performance. In contrast, simplify()
   * extends simplifyCore() with additional passes to provide deeper
   * simplification.
   *
   * Syntax:
   *
   *     simplifyCore(expr)
   *
   * Examples:
   *
   *     const f = math.parse('2 * 1 * x ^ (2 - 1)')
   *     math.simpifyCore(f)                          // Node {2 * x}
   *     math.simplify('2 * 1 * x ^ (2 - 1)', [math.simplifyCore]) // Node {2 * x}
   *
   * See also:
   *
   *     simplify, resolve, derivative
   *
   * @param {Node} node
   *     The expression to be simplified
   * @param {Object} options
   *     Simplification options, as per simplify()
   * @return {Node} Returns expression with basic simplifications applied
   */


  function simplifyCore(node, options) {
    var context = options ? options.context : undefined;

    if (hasProperty(node, 'trivial', context)) {
      // This node does nothing if it has only one argument, so if so,
      // return that argument simplified
      if ((0, _is.isFunctionNode)(node) && node.args.length === 1) {
        return simplifyCore(node.args[0], options);
      } // For other node types, we try the generic methods


      var simpChild = false;
      var childCount = 0;
      node.forEach(function (c) {
        ++childCount;

        if (childCount === 1) {
          simpChild = simplifyCore(c, options);
        }
      });

      if (childCount === 1) {
        return simpChild;
      }
    }

    if ((0, _is.isOperatorNode)(node) && node.isUnary()) {
      var a0 = simplifyCore(node.args[0], options);

      if (node.op === '-') {
        // unary minus
        if ((0, _is.isOperatorNode)(a0)) {
          if (a0.isUnary() && a0.op === '-') {
            return a0.args[0];
          } else if (a0.isBinary() && a0.fn === 'subtract') {
            return new OperatorNode('-', 'subtract', [a0.args[1], a0.args[0]]);
          }
        }

        return new OperatorNode(node.op, node.fn, [a0]);
      }
    } else if ((0, _is.isOperatorNode)(node) && node.isBinary()) {
      var _a = simplifyCore(node.args[0], options);

      var a1 = simplifyCore(node.args[1], options);

      if (node.op === '+') {
        if ((0, _is.isConstantNode)(_a)) {
          if (isZero(_a.value)) {
            return a1;
          } else if ((0, _is.isConstantNode)(a1)) {
            return new ConstantNode(add(_a.value, a1.value));
          }
        }

        if ((0, _is.isConstantNode)(a1) && isZero(a1.value)) {
          return _a;
        }

        if ((0, _is.isOperatorNode)(a1) && a1.isUnary() && a1.op === '-') {
          return new OperatorNode('-', 'subtract', [_a, a1.args[0]]);
        }

        return new OperatorNode(node.op, node.fn, a1 ? [_a, a1] : [_a]);
      } else if (node.op === '-') {
        if ((0, _is.isConstantNode)(_a) && a1) {
          if ((0, _is.isConstantNode)(a1)) {
            return new ConstantNode(subtract(_a.value, a1.value));
          } else if (isZero(_a.value)) {
            return new OperatorNode('-', 'unaryMinus', [a1]);
          }
        } // if (node.fn === "subtract" && node.args.length === 2) {


        if (node.fn === 'subtract') {
          if ((0, _is.isConstantNode)(a1) && isZero(a1.value)) {
            return _a;
          }

          if ((0, _is.isOperatorNode)(a1) && a1.isUnary() && a1.op === '-') {
            return simplifyCore(new OperatorNode('+', 'add', [_a, a1.args[0]]), options);
          }

          return new OperatorNode(node.op, node.fn, [_a, a1]);
        }
      } else if (node.op === '*') {
        if ((0, _is.isConstantNode)(_a)) {
          if (isZero(_a.value)) {
            return node0;
          } else if (equal(_a.value, 1)) {
            return a1;
          } else if ((0, _is.isConstantNode)(a1)) {
            return new ConstantNode(multiply(_a.value, a1.value));
          }
        }

        if ((0, _is.isConstantNode)(a1)) {
          if (isZero(a1.value)) {
            return node0;
          } else if (equal(a1.value, 1)) {
            return _a;
          } else if ((0, _is.isOperatorNode)(_a) && _a.isBinary() && _a.op === node.op && isCommutative(node, context)) {
            var a00 = _a.args[0];

            if ((0, _is.isConstantNode)(a00)) {
              var a00a1 = new ConstantNode(multiply(a00.value, a1.value));
              return new OperatorNode(node.op, node.fn, [a00a1, _a.args[1]], node.implicit); // constants on left
            }
          }

          if (isCommutative(node, context)) {
            return new OperatorNode(node.op, node.fn, [a1, _a], node.implicit); // constants on left
          } else {
            return new OperatorNode(node.op, node.fn, [_a, a1], node.implicit);
          }
        }

        return new OperatorNode(node.op, node.fn, [_a, a1], node.implicit);
      } else if (node.op === '/') {
        if ((0, _is.isConstantNode)(_a)) {
          if (isZero(_a.value)) {
            return node0;
          } else if ((0, _is.isConstantNode)(a1) && (equal(a1.value, 1) || equal(a1.value, 2) || equal(a1.value, 4))) {
            return new ConstantNode(divide(_a.value, a1.value));
          }
        }

        return new OperatorNode(node.op, node.fn, [_a, a1]);
      } else if (node.op === '^') {
        if ((0, _is.isConstantNode)(a1)) {
          if (isZero(a1.value)) {
            return node1;
          } else if (equal(a1.value, 1)) {
            return _a;
          } else {
            if ((0, _is.isConstantNode)(_a)) {
              // fold constant
              return new ConstantNode(pow(_a.value, a1.value));
            } else if ((0, _is.isOperatorNode)(_a) && _a.isBinary() && _a.op === '^') {
              var a01 = _a.args[1];

              if ((0, _is.isConstantNode)(a01)) {
                return new OperatorNode(node.op, node.fn, [_a.args[0], new ConstantNode(multiply(a01.value, a1.value))]);
              }
            }
          }
        }
      }

      return new OperatorNode(node.op, node.fn, [_a, a1]);
    } else if ((0, _is.isFunctionNode)(node)) {
      return new FunctionNode(simplifyCore(node.fn), node.args.map(function (n) {
        return simplifyCore(n, options);
      }));
    } else if ((0, _is.isArrayNode)(node)) {
      return new ArrayNode(node.items.map(function (n) {
        return simplifyCore(n, options);
      }));
    } else if ((0, _is.isAccessorNode)(node)) {
      return new AccessorNode(simplifyCore(node.object, options), simplifyCore(node.index, options));
    } else if ((0, _is.isIndexNode)(node)) {
      return new IndexNode(node.dimensions.map(function (n) {
        return simplifyCore(n, options);
      }));
    } else if ((0, _is.isObjectNode)(node)) {
      var newProps = {};

      for (var prop in node.properties) {
        newProps[prop] = simplifyCore(node.properties[prop], options);
      }

      return new ObjectNode(newProps);
    } else {// cannot simplify
    }

    return node;
  }

  return simplifyCore;
});
exports.createSimplifyCore = createSimplifyCore;
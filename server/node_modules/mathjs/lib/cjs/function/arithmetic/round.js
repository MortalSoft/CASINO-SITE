"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRound = void 0;

var _factory = require("../../utils/factory.js");

var _collection = require("../../utils/collection.js");

var _algorithm = require("../../type/matrix/utils/algorithm11.js");

var _algorithm2 = require("../../type/matrix/utils/algorithm12.js");

var _algorithm3 = require("../../type/matrix/utils/algorithm14.js");

var _index = require("../../plain/number/index.js");

var NO_INT = 'Number of decimals in function round must be an integer';
var name = 'round';
var dependencies = ['typed', 'matrix', 'equalScalar', 'zeros', 'BigNumber', 'DenseMatrix'];
var createRound = /* #__PURE__ */(0, _factory.factory)(name, dependencies, function (_ref) {
  var typed = _ref.typed,
      matrix = _ref.matrix,
      equalScalar = _ref.equalScalar,
      zeros = _ref.zeros,
      BigNumber = _ref.BigNumber,
      DenseMatrix = _ref.DenseMatrix;
  var algorithm11 = (0, _algorithm.createAlgorithm11)({
    typed: typed,
    equalScalar: equalScalar
  });
  var algorithm12 = (0, _algorithm2.createAlgorithm12)({
    typed: typed,
    DenseMatrix: DenseMatrix
  });
  var algorithm14 = (0, _algorithm3.createAlgorithm14)({
    typed: typed
  });
  /**
   * Round a value towards the nearest integer.
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.round(x)
   *    math.round(x, n)
   *
   * Examples:
   *
   *    math.round(3.22)             // returns number 3
   *    math.round(3.82)             // returns number 4
   *    math.round(-4.2)             // returns number -4
   *    math.round(-4.7)             // returns number -5
   *    math.round(3.22, 1)          // returns number 3.2
   *    math.round(3.88, 1)          // returns number 3.9
   *    math.round(-4.21, 1)         // returns number -4.2
   *    math.round(-4.71, 1)         // returns number -4.7
   *    math.round(math.pi, 3)       // returns number 3.142
   *    math.round(123.45678, 2)     // returns number 123.46
   *
   *    const c = math.complex(3.2, -2.7)
   *    math.round(c)                // returns Complex 3 - 3i
   *
   *    math.round([3.2, 3.8, -4.7]) // returns Array [3, 4, -5]
   *
   * See also:
   *
   *    ceil, fix, floor
   *
   * @param  {number | BigNumber | Fraction | Complex | Array | Matrix} x  Number to be rounded
   * @param  {number | BigNumber | Array} [n=0]                            Number of decimals
   * @return {number | BigNumber | Fraction | Complex | Array | Matrix} Rounded value
   */

  return typed(name, {
    number: _index.roundNumber,
    'number, number': _index.roundNumber,
    'number, BigNumber': function numberBigNumber(x, n) {
      if (!n.isInteger()) {
        throw new TypeError(NO_INT);
      }

      return new BigNumber(x).toDecimalPlaces(n.toNumber());
    },
    Complex: function Complex(x) {
      return x.round();
    },
    'Complex, number': function ComplexNumber(x, n) {
      if (n % 1) {
        throw new TypeError(NO_INT);
      }

      return x.round(n);
    },
    'Complex, BigNumber': function ComplexBigNumber(x, n) {
      if (!n.isInteger()) {
        throw new TypeError(NO_INT);
      }

      var _n = n.toNumber();

      return x.round(_n);
    },
    BigNumber: function BigNumber(x) {
      return x.toDecimalPlaces(0);
    },
    'BigNumber, BigNumber': function BigNumberBigNumber(x, n) {
      if (!n.isInteger()) {
        throw new TypeError(NO_INT);
      }

      return x.toDecimalPlaces(n.toNumber());
    },
    Fraction: function Fraction(x) {
      return x.round();
    },
    'Fraction, number': function FractionNumber(x, n) {
      if (n % 1) {
        throw new TypeError(NO_INT);
      }

      return x.round(n);
    },
    'Fraction, BigNumber': function FractionBigNumber(x, n) {
      if (!n.isInteger()) {
        throw new TypeError(NO_INT);
      }

      return x.round(n.toNumber());
    },
    'Array | Matrix': function ArrayMatrix(x) {
      // deep map collection, skip zeros since round(0) = 0
      return (0, _collection.deepMap)(x, this, true);
    },
    'SparseMatrix, number | BigNumber': function SparseMatrixNumberBigNumber(x, y) {
      return algorithm11(x, y, this, false);
    },
    'DenseMatrix, number | BigNumber': function DenseMatrixNumberBigNumber(x, y) {
      return algorithm14(x, y, this, false);
    },
    'Array, number | BigNumber': function ArrayNumberBigNumber(x, y) {
      // use matrix implementation
      return algorithm14(matrix(x), y, this, false).valueOf();
    },
    'number | Complex | BigNumber | Fraction, SparseMatrix': function numberComplexBigNumberFractionSparseMatrix(x, y) {
      // check scalar is zero
      if (equalScalar(x, 0)) {
        // do not execute algorithm, result will be a zero matrix
        return zeros(y.size(), y.storage());
      }

      return algorithm12(y, x, this, true);
    },
    'number | Complex | BigNumber | Fraction, DenseMatrix': function numberComplexBigNumberFractionDenseMatrix(x, y) {
      // check scalar is zero
      if (equalScalar(x, 0)) {
        // do not execute algorithm, result will be a zero matrix
        return zeros(y.size(), y.storage());
      }

      return algorithm14(y, x, this, true);
    },
    'number | Complex | BigNumber | Fraction, Array': function numberComplexBigNumberFractionArray(x, y) {
      // use matrix implementation
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  });
});
exports.createRound = createRound;
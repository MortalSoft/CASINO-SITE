"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFloorNumber = exports.createFloor = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _decimal = _interopRequireDefault(require("decimal.js"));

var _factory = require("../../utils/factory.js");

var _collection = require("../../utils/collection.js");

var _number = require("../../utils/number.js");

var _nearlyEqual = require("../../utils/bignumber/nearlyEqual.js");

var _algorithm = require("../../type/matrix/utils/algorithm11.js");

var _algorithm2 = require("../../type/matrix/utils/algorithm12.js");

var _algorithm3 = require("../../type/matrix/utils/algorithm14.js");

var name = 'floor';
var dependencies = ['typed', 'config', 'round', 'matrix', 'equalScalar', 'zeros', 'DenseMatrix'];
var createFloorNumber = /* #__PURE__ */(0, _factory.factory)(name, ['typed', 'config', 'round'], function (_ref) {
  var typed = _ref.typed,
      config = _ref.config,
      round = _ref.round;
  return typed(name, {
    number: function number(x) {
      if ((0, _number.nearlyEqual)(x, round(x), config.epsilon)) {
        return round(x);
      } else {
        return Math.floor(x);
      }
    },
    'number, number': function numberNumber(x, n) {
      if ((0, _number.nearlyEqual)(x, round(x, n), config.epsilon)) {
        return round(x, n);
      } else {
        var _split = "".concat(x, "e").split('e'),
            _split2 = (0, _slicedToArray2.default)(_split, 2),
            number = _split2[0],
            exponent = _split2[1];

        var result = Math.floor(Number("".concat(number, "e").concat(Number(exponent) + n)));

        var _split3 = "".concat(result, "e").split('e');

        var _split4 = (0, _slicedToArray2.default)(_split3, 2);

        number = _split4[0];
        exponent = _split4[1];
        return Number("".concat(number, "e").concat(Number(exponent) - n));
      }
    }
  });
});
exports.createFloorNumber = createFloorNumber;
var createFloor = /* #__PURE__ */(0, _factory.factory)(name, dependencies, function (_ref2) {
  var typed = _ref2.typed,
      config = _ref2.config,
      round = _ref2.round,
      matrix = _ref2.matrix,
      equalScalar = _ref2.equalScalar,
      zeros = _ref2.zeros,
      DenseMatrix = _ref2.DenseMatrix;
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
  var floorNumber = createFloorNumber({
    typed: typed,
    config: config,
    round: round
  });
  /**
   * Round a value towards minus infinity.
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.floor(x)
   *    math.floor(x, n)
   *
   * Examples:
   *
   *    math.floor(3.2)              // returns number 3
   *    math.floor(3.8)              // returns number 3
   *    math.floor(-4.2)             // returns number -5
   *    math.floor(-4.7)             // returns number -5
   *
   *    math.floor(3.212, 2)          // returns number 3.21
   *    math.floor(3.288, 2)          // returns number 3.28
   *    math.floor(-4.212, 2)         // returns number -4.22
   *    math.floor(-4.782, 2)         // returns number -4.79
   *
   *    const c = math.complex(3.24, -2.71)
   *    math.floor(c)                 // returns Complex 3 - 3i
   *    math.floor(c, 1)              // returns Complex 3.2 - 2.8i
   *
   *    math.floor([3.2, 3.8, -4.7])       // returns Array [3, 3, -5]
   *    math.floor([3.21, 3.82, -4.71], 1)  // returns Array [3.2, 3.8, -4.8]
   *
   *    math.floor(math.tau, [2, 3])  // returns Array [6.28, 6.283]
   *
   *    // Note that floor(array, array) currently not implemented.
   *
   * See also:
   *
   *    ceil, fix, round
   *
   * @param  {number | BigNumber | Fraction | Complex | Array | Matrix} x  Number to be rounded
   * @param  {number | BigNumber | Array} [n=0]                            Number of decimals
   * @return {number | BigNumber | Fraction | Complex | Array | Matrix} Rounded value
   */

  return typed('floor', {
    number: floorNumber.signatures.number,
    'number,number': floorNumber.signatures['number,number'],
    Complex: function Complex(x) {
      return x.floor();
    },
    'Complex, number': function ComplexNumber(x, n) {
      return x.floor(n);
    },
    'Complex, BigNumber': function ComplexBigNumber(x, n) {
      return x.floor(n.toNumber());
    },
    BigNumber: function BigNumber(x) {
      if ((0, _nearlyEqual.nearlyEqual)(x, round(x), config.epsilon)) {
        return round(x);
      } else {
        return x.floor();
      }
    },
    'BigNumber, BigNumber': function BigNumberBigNumber(x, n) {
      if ((0, _nearlyEqual.nearlyEqual)(x, round(x, n), config.epsilon)) {
        return round(x, n);
      } else {
        return x.toDecimalPlaces(n.toNumber(), _decimal.default.ROUND_FLOOR);
      }
    },
    Fraction: function Fraction(x) {
      return x.floor();
    },
    'Fraction, number': function FractionNumber(x, n) {
      return x.floor(n);
    },
    'Fraction, BigNumber': function FractionBigNumber(x, n) {
      return x.floor(n.toNumber());
    },
    'Array | Matrix': function ArrayMatrix(x) {
      // deep map collection, skip zeros since floor(0) = 0
      return (0, _collection.deepMap)(x, this, true);
    },
    'Array, number | BigNumber': function ArrayNumberBigNumber(x, n) {
      var _this = this;

      // deep map collection, skip zeros since ceil(0) = 0
      return (0, _collection.deepMap)(x, function (i) {
        return _this(i, n);
      }, true);
    },
    'SparseMatrix, number | BigNumber': function SparseMatrixNumberBigNumber(x, y) {
      return algorithm11(x, y, this, false);
    },
    'DenseMatrix, number | BigNumber': function DenseMatrixNumberBigNumber(x, y) {
      return algorithm14(x, y, this, false);
    },
    'number | Complex | Fraction | BigNumber, Array': function numberComplexFractionBigNumberArray(x, y) {
      // use matrix implementation
      return algorithm14(matrix(y), x, this, true).valueOf();
    },
    'number | Complex | Fraction | BigNumber, Matrix': function numberComplexFractionBigNumberMatrix(x, y) {
      if (equalScalar(x, 0)) return zeros(y.size(), y.storage());

      if (y.storage() === 'dense') {
        return algorithm14(y, x, this, true);
      }

      return algorithm12(y, x, this, true);
    }
  });
});
exports.createFloor = createFloor;
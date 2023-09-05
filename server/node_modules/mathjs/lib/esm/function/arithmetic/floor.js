import Decimal from 'decimal.js';
import { factory } from '../../utils/factory.js';
import { deepMap } from '../../utils/collection.js';
import { nearlyEqual } from '../../utils/number.js';
import { nearlyEqual as bigNearlyEqual } from '../../utils/bignumber/nearlyEqual.js';
import { createAlgorithm11 } from '../../type/matrix/utils/algorithm11.js';
import { createAlgorithm12 } from '../../type/matrix/utils/algorithm12.js';
import { createAlgorithm14 } from '../../type/matrix/utils/algorithm14.js';
var name = 'floor';
var dependencies = ['typed', 'config', 'round', 'matrix', 'equalScalar', 'zeros', 'DenseMatrix'];
export var createFloorNumber = /* #__PURE__ */factory(name, ['typed', 'config', 'round'], _ref => {
  var {
    typed,
    config,
    round
  } = _ref;
  return typed(name, {
    number: function number(x) {
      if (nearlyEqual(x, round(x), config.epsilon)) {
        return round(x);
      } else {
        return Math.floor(x);
      }
    },
    'number, number': function numberNumber(x, n) {
      if (nearlyEqual(x, round(x, n), config.epsilon)) {
        return round(x, n);
      } else {
        var [number, exponent] = "".concat(x, "e").split('e');
        var result = Math.floor(Number("".concat(number, "e").concat(Number(exponent) + n)));
        [number, exponent] = "".concat(result, "e").split('e');
        return Number("".concat(number, "e").concat(Number(exponent) - n));
      }
    }
  });
});
export var createFloor = /* #__PURE__ */factory(name, dependencies, _ref2 => {
  var {
    typed,
    config,
    round,
    matrix,
    equalScalar,
    zeros,
    DenseMatrix
  } = _ref2;
  var algorithm11 = createAlgorithm11({
    typed,
    equalScalar
  });
  var algorithm12 = createAlgorithm12({
    typed,
    DenseMatrix
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  var floorNumber = createFloorNumber({
    typed,
    config,
    round
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
      if (bigNearlyEqual(x, round(x), config.epsilon)) {
        return round(x);
      } else {
        return x.floor();
      }
    },
    'BigNumber, BigNumber': function BigNumberBigNumber(x, n) {
      if (bigNearlyEqual(x, round(x, n), config.epsilon)) {
        return round(x, n);
      } else {
        return x.toDecimalPlaces(n.toNumber(), Decimal.ROUND_FLOOR);
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
      return deepMap(x, this, true);
    },
    'Array, number | BigNumber': function ArrayNumberBigNumber(x, n) {
      // deep map collection, skip zeros since ceil(0) = 0
      return deepMap(x, i => this(i, n), true);
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
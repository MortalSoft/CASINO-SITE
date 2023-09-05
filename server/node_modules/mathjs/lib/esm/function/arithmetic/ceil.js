import Decimal from 'decimal.js';
import { factory } from '../../utils/factory.js';
import { deepMap } from '../../utils/collection.js';
import { nearlyEqual } from '../../utils/number.js';
import { nearlyEqual as bigNearlyEqual } from '../../utils/bignumber/nearlyEqual.js';
import { createAlgorithm11 } from '../../type/matrix/utils/algorithm11.js';
import { createAlgorithm12 } from '../../type/matrix/utils/algorithm12.js';
import { createAlgorithm14 } from '../../type/matrix/utils/algorithm14.js';
var name = 'ceil';
var dependencies = ['typed', 'config', 'round', 'matrix', 'equalScalar', 'zeros', 'DenseMatrix'];
export var createCeilNumber = /* #__PURE__ */factory(name, ['typed', 'config', 'round'], _ref => {
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
        return Math.ceil(x);
      }
    },
    'number, number': function numberNumber(x, n) {
      if (nearlyEqual(x, round(x, n), config.epsilon)) {
        return round(x, n);
      } else {
        var [number, exponent] = "".concat(x, "e").split('e');
        var result = Math.ceil(Number("".concat(number, "e").concat(Number(exponent) + n)));
        [number, exponent] = "".concat(result, "e").split('e');
        return Number("".concat(number, "e").concat(Number(exponent) - n));
      }
    }
  });
});
export var createCeil = /* #__PURE__ */factory(name, dependencies, _ref2 => {
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
  var ceilNumber = createCeilNumber({
    typed,
    config,
    round
  });
  /**
   * Round a value towards plus infinity
   * If `x` is complex, both real and imaginary part are rounded towards plus infinity.
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.ceil(x)
   *    math.ceil(x, n)
   *
   * Examples:
   *
   *    math.ceil(3.2)               // returns number 4
   *    math.ceil(3.8)               // returns number 4
   *    math.ceil(-4.2)              // returns number -4
   *    math.ceil(-4.7)              // returns number -4
   *
   *    math.ceil(3.212, 2)          // returns number 3.22
   *    math.ceil(3.288, 2)          // returns number 3.29
   *    math.ceil(-4.212, 2)         // returns number -4.21
   *    math.ceil(-4.782, 2)         // returns number -4.78
   *
   *    const c = math.complex(3.24, -2.71)
   *    math.ceil(c)                 // returns Complex 4 - 2i
   *    math.ceil(c, 1)              // returns Complex 3.3 - 2.7i
   *
   *    math.ceil([3.2, 3.8, -4.7])  // returns Array [4, 4, -4]
   *    math.ceil([3.21, 3.82, -4.71], 1)  // returns Array [3.3, 3.9, -4.7]
   *
   * See also:
   *
   *    floor, fix, round
   *
   * @param  {number | BigNumber | Fraction | Complex | Array | Matrix} x  Number to be rounded
   * @param  {number | BigNumber | Array} [n=0]                            Number of decimals
   * @return {number | BigNumber | Fraction | Complex | Array | Matrix} Rounded value
   */

  return typed('ceil', {
    number: ceilNumber.signatures.number,
    'number,number': ceilNumber.signatures['number,number'],
    Complex: function Complex(x) {
      return x.ceil();
    },
    'Complex, number': function ComplexNumber(x, n) {
      return x.ceil(n);
    },
    'Complex, BigNumber': function ComplexBigNumber(x, n) {
      return x.ceil(n.toNumber());
    },
    BigNumber: function BigNumber(x) {
      if (bigNearlyEqual(x, round(x), config.epsilon)) {
        return round(x);
      } else {
        return x.ceil();
      }
    },
    'BigNumber, BigNumber': function BigNumberBigNumber(x, n) {
      if (bigNearlyEqual(x, round(x, n), config.epsilon)) {
        return round(x, n);
      } else {
        return x.toDecimalPlaces(n.toNumber(), Decimal.ROUND_CEIL);
      }
    },
    Fraction: function Fraction(x) {
      return x.ceil();
    },
    'Fraction, number': function FractionNumber(x, n) {
      return x.ceil(n);
    },
    'Fraction, BigNumber': function FractionBigNumber(x, n) {
      return x.ceil(n.toNumber());
    },
    'Array | Matrix': function ArrayMatrix(x) {
      // deep map collection, skip zeros since ceil(0) = 0
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
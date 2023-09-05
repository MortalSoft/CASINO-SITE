import { deepMap } from '../../utils/collection.js';
import { factory } from '../../utils/factory.js';
import { gammaG, gammaNumber, gammaP } from '../../plain/number/index.js';
var name = 'gamma';
var dependencies = ['typed', 'config', 'multiplyScalar', 'pow', 'BigNumber', 'Complex'];
export var createGamma = /* #__PURE__ */factory(name, dependencies, _ref => {
  var {
    typed,
    config,
    multiplyScalar,
    pow,
    BigNumber: _BigNumber,
    Complex: _Complex
  } = _ref;

  /**
   * Compute the gamma function of a value using Lanczos approximation for
   * small values, and an extended Stirling approximation for large values.
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.gamma(n)
   *
   * Examples:
   *
   *    math.gamma(5)       // returns 24
   *    math.gamma(-0.5)    // returns -3.5449077018110335
   *    math.gamma(math.i)  // returns -0.15494982830180973 - 0.49801566811835596i
   *
   * See also:
   *
   *    combinations, factorial, permutations
   *
   * @param {number | Array | Matrix} n   A real or complex number
   * @return {number | Array | Matrix}    The gamma of `n`
   */
  return typed(name, {
    number: gammaNumber,
    Complex: function Complex(n) {
      if (n.im === 0) {
        return this(n.re);
      } // Lanczos approximation doesn't work well with real part lower than 0.5
      // So reflection formula is required


      if (n.re < 0.5) {
        // Euler's reflection formula
        // gamma(1-z) * gamma(z) = PI / sin(PI * z)
        // real part of Z should not be integer [sin(PI) == 0 -> 1/0 - undefined]
        // thanks to imperfect sin implementation sin(PI * n) != 0
        // we can safely use it anyway
        var _t = new _Complex(1 - n.re, -n.im);

        var r = new _Complex(Math.PI * n.re, Math.PI * n.im);
        return new _Complex(Math.PI).div(r.sin()).div(this(_t));
      } // Lanczos approximation
      // z -= 1


      n = new _Complex(n.re - 1, n.im); // x = gammaPval[0]

      var x = new _Complex(gammaP[0], 0); // for (i, gammaPval) in enumerate(gammaP):

      for (var i = 1; i < gammaP.length; ++i) {
        // x += gammaPval / (z + i)
        var gammaPval = new _Complex(gammaP[i], 0);
        x = x.add(gammaPval.div(n.add(i)));
      } // t = z + gammaG + 0.5


      var t = new _Complex(n.re + gammaG + 0.5, n.im); // y = sqrt(2 * pi) * t ** (z + 0.5) * exp(-t) * x

      var twoPiSqrt = Math.sqrt(2 * Math.PI);
      var tpow = t.pow(n.add(0.5));
      var expt = t.neg().exp(); // y = [x] * [sqrt(2 * pi)] * [t ** (z + 0.5)] * [exp(-t)]

      return x.mul(twoPiSqrt).mul(tpow).mul(expt);
    },
    BigNumber: function BigNumber(n) {
      if (n.isInteger()) {
        return n.isNegative() || n.isZero() ? new _BigNumber(Infinity) : bigFactorial(n.minus(1));
      }

      if (!n.isFinite()) {
        return new _BigNumber(n.isNegative() ? NaN : Infinity);
      }

      throw new Error('Integer BigNumber expected');
    },
    'Array | Matrix': function ArrayMatrix(n) {
      return deepMap(n, this);
    }
  });
  /**
   * Calculate factorial for a BigNumber
   * @param {BigNumber} n
   * @returns {BigNumber} Returns the factorial of n
   */

  function bigFactorial(n) {
    if (n < 8) {
      return new _BigNumber([1, 1, 2, 6, 24, 120, 720, 5040][n]);
    }

    var precision = config.precision + (Math.log(n.toNumber()) | 0);

    var Big = _BigNumber.clone({
      precision
    });

    if (n % 2 === 1) {
      return n.times(bigFactorial(new _BigNumber(n - 1)));
    }

    var p = n;
    var prod = new Big(n);
    var sum = n.toNumber();

    while (p > 2) {
      p -= 2;
      sum += p;
      prod = prod.times(sum);
    }

    return new _BigNumber(prod.toPrecision(_BigNumber.precision));
  }
});
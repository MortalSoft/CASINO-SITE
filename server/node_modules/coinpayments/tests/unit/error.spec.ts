import CoinpaymentsError from '../../src/error';
import { types } from 'util';

describe('Coinpayments Error unit tests', () => {
  it('Should have proper customer error implementation', () => {
    const extra = { prop: 1 };
    const message = 'My custom message';
    const err = new CoinpaymentsError(message, extra);
    expect(err).toBeInstanceOf(CoinpaymentsError);
    expect(types.isNativeError(err)).toBeTruthy();
    expect(!!err.stack).toBeTruthy();
    expect(err.toString()).toBe(`${err.name}: ${message}`);
    expect(err.stack.split('\n')[0]).toBe(`${err.name}: ${message}`);
    expect(err.extra).toBe(extra);
  });
});

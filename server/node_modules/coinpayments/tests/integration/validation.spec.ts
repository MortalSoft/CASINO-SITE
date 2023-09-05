import { validatePayload } from '../../src/validation';

import { CMDS } from '../../src/constants';
import CoinpaymentsError from '../../src/error';

describe('Validation integration tests', () => {
  describe('validatePayload tests', () => {
    it('Should throw error on invalid payload - mass withdrawal', () => {
      const INVALID_PAYLOAD = {
        cmd: CMDS.CREATE_MASS_WITHDRAWAL,
        'wd[wd1]E[amount]': 1.0,
        'wd[wd1]R[address]': '1BitcoinAddress',
        'wd[wd1]R[currency]': 'BTC',
        'wd[wd2]O[amount]': 0.0001,
        'wd[wd2]R[address]': '1BitcoinAddress',
        'wd[wd2][currency]': 'BTC',
        'wd[wd3][amount]': 0.0001,
        'wd[wd3][address]': '1BitcoinAddress',
        'wd[wd3][currency]': 'LTC',
        'wd[wd4][amount]': 0.01,
        'wd[wd4][address]': '1BitcoinAddress',
        'wd[wd4][currency]': 'BTC',
      };
      try {
        validatePayload(INVALID_PAYLOAD);
      } catch (e) {
        expect(e).toBeInstanceOf(CoinpaymentsError);
      }
    });
  });
});

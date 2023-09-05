import {
  getValidationSchema,
  getVariations,
  validateMassWithDrawal,
  hasOneOfFields,
  validateMassWithdrawalOpts,
  filterMassWithdrawalOpts,
} from '../../src/validation';

import { CMDS } from '../../src/constants';

describe('Validation unit tests', () => {
  describe('getVariations tests', () => {
    it('Should return array on no variation', () => {
      const NO_VARIATION = ['prop1', 'prop2', 'prop3'];
      const variations = getVariations(NO_VARIATION);
      expect(variations).toBeInstanceOf(Array);
      expect(variations.length).toBe(1);
      expect(variations[0]).toStrictEqual(NO_VARIATION);
      expect(variations).toMatchSnapshot();
    });
    it('Should return array on variation', () => {
      const VARIATION = ['prop1', 'prop2', 'prop3', ['prop4a', 'prop4b']];
      const EXPECTED_VARIATION_1 = ['prop1', 'prop2', 'prop3', 'prop4a'];
      const EXPECTED_VARIATION_2 = ['prop1', 'prop2', 'prop3', 'prop4b'];
      const variations = getVariations(VARIATION);
      expect(variations).toBeInstanceOf(Array);
      expect(variations.length).toBe(2);
      expect(variations[0]).toBeInstanceOf(Array);
      expect(variations[0]).toStrictEqual(EXPECTED_VARIATION_1);
      expect(variations[1]).toBeInstanceOf(Array);
      expect(variations[1]).toStrictEqual(EXPECTED_VARIATION_2);
      expect(variations).toMatchSnapshot();
    });
  });
  describe('validateMassWithDrawal tests', () => {
    it('Should return false on invalid payload', () => {
      const INVALID_PAYLOAD = {
        cmd: CMDS.CREATE_MASS_WITHDRAWAL,
        'wd[wd1][amount]': 1.0,
        'wd[wd1][address]': '1BitcoinAddress',
        'wd[wd1][currency]': 'BTC',
        'wd[wd2][amount]': 0.0001,
        'wd[wd2][address]': '1BitcoinAddress',
        'wd[wdError][currency]': 'BTC',
        'wd[wd3][amount]': 0.0001,
        'wd[wd3][address]': '1BitcoinAddress',
        'wd[wd3][currency]': 'LTC',
        'wd[wd4][amount]': 0.01,
        'wd[wd4][address]': '1BitcoinAddress',
        'wd[wd4][currency]': 'BTC',
      };
      expect(validateMassWithDrawal(INVALID_PAYLOAD)).toBeFalsy();
    });
    it('Should return true on valid payload', () => {
      const VALID_PAYLOAD = {
        cmd: CMDS.CREATE_MASS_WITHDRAWAL,
        'wd[wd1][amount]': 1.0,
        'wd[wd1][address]': '1BitcoinAddress',
        'wd[wd1][currency]': 'BTC',
        'wd[wd2][amount]': 0.0001,
        'wd[wd2][address]': '1BitcoinAddress',
        'wd[wd2][currency]': 'BTC',
        'wd[wd3][amount]': 0.0001,
        'wd[wd3][address]': '1BitcoinAddress',
        'wd[wd3][currency]': 'LTC',
        'wd[wd4][amount]': 0.01,
        'wd[wd4][address]': '1BitcoinAddress',
        'wd[wd4][currency]': 'BTC',
      };
      expect(validateMassWithDrawal(VALID_PAYLOAD)).toBeTruthy();
    });
  });
  describe('getValidationSchema tests', () => {
    it('Should throw error on undefined', () => {
      let done = 0;
      try {
        getValidationSchema(undefined);
      } catch (e) {
        done++;
        expect(e.message).toBe('No method passed');
      }
      expect(done).toBeTruthy();
    });
    it('Should throw error on unknown command', () => {
      const UNKNOWN = 'unknown';
      let done = 0;
      try {
        getValidationSchema(UNKNOWN);
      } catch (e) {
        done++;
        expect(e.message).toBe(`No such method ${UNKNOWN}`);
      }
      expect(done).toBeTruthy();
    });
    it('Should return validation schema', () => {
      Object.keys(CMDS).forEach(cmd => {
        const schema = getValidationSchema(CMDS[cmd]);
        expect(schema).toMatchSnapshot();
      });
    });
  });
  describe('hasOneOfFields', () => {
    it('Should return true on mutually exclusive', () => {
      const object = {
        x: 'x',
        y: 'y',
        z: 'z',
      };
      const keys1 = ['x', 's', 'q'];
      const keys2 = ['s', 'q', 'x'];
      expect(hasOneOfFields(object, keys1)).toBe(true);
      expect(hasOneOfFields(object, keys2)).toBe(true);
    });
    it('Should return false on mutually non-exclusive', () => {
      const object = {
        x: 'x',
        y: 'y',
        z: 'z',
      };
      const keys1 = ['x', 'y', 'q'];
      const keys2 = ['s', 'y', 'z'];
      const keys3 = ['x', 'y', 'z'];
      expect(hasOneOfFields(object, keys1)).toBe(false);
      expect(hasOneOfFields(object, keys2)).toBe(false);
      expect(hasOneOfFields(object, keys3)).toBe(false);
    });
  });
  describe('validateMassWithdrawalOpts', () => {
    it('Should be true on valid payload', () => {
      const validPayload1 = {
        currency: 'BTC',
        amount: 1,
        address: 'x',
      };
      const validPayload2 = {
        currency: 'BTC',
        amount: 1,
        domain: 'x',
      };
      const validPayload3 = {
        currency: 'BTC',
        amount: 1,
        pbntag: 'x',
      };
      expect(validateMassWithdrawalOpts(validPayload1)).toBe(true);
      expect(validateMassWithdrawalOpts(validPayload2)).toBe(true);
      expect(validateMassWithdrawalOpts(validPayload3)).toBe(true);
    });
    it('Should be false on invalid payload', () => {
      const invalidPayload1 = {
        currency: 'BTC',
        amount: 1,
        address: 'x',
        domain: 'x',
      };
      const invalidPayload2 = {
        currency: 'BTC',
        domain: 'x',
        pbntag: 'x',
        amount: 1,
      };
      const invalidPayload3 = {
        currency: 'BTC',
        amount: 1,
        pbntag: 'x',
        address: 'x',
        domain: 'x',
      };
      expect(validateMassWithdrawalOpts(invalidPayload1)).toBe(false);
      expect(validateMassWithdrawalOpts(invalidPayload2)).toBe(false);
      expect(validateMassWithdrawalOpts(invalidPayload3)).toBe(false);
    });
  });
  describe('filterMassWithdrawalOpts', () => {
    it('Should return same array if all payload is valid', () => {
      const validPayload1 = {
        currency: 'BTC',
        amount: 1,
        address: 'x',
      };
      const validPayload2 = {
        currency: 'BTC',
        amount: 1,
        domain: 'x',
      };
      const validPayload3 = {
        currency: 'BTC',
        amount: 1,
        pbntag: 'x',
      };
      const validPayload = [validPayload1, validPayload2, validPayload3];
      const filteredArray = filterMassWithdrawalOpts(validPayload);
      expect(filteredArray.sort()).toEqual(validPayload.sort());
    });
    it('Should filter out invalid payloads', () => {
      const validPayload1 = {
        currency: 'BTC',
        amount: 1,
        address: 'x',
      };
      const validPayload2 = {
        currency: 'BTC',
        amount: 1,
        domain: 'x',
      };
      const validPayload3 = {
        currency: 'BTC',
        amount: 1,
        pbntag: 'x',
        domain: 'x',
      };
      const invalidPayload = [validPayload1, validPayload2, validPayload3];
      const validPayload = [validPayload1, validPayload2];
      const filteredArray = filterMassWithdrawalOpts(invalidPayload);
      expect(filteredArray.sort()).toEqual(validPayload.sort());
    });
  });
});

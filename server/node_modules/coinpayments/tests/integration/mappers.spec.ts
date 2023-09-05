import {
  mapMassWithdrawalPayload,
  mapGetTxMultiPayload,
} from '../../src/mappers';

import { validateMassWithDrawal } from '../../src/validation';

describe('Mappers integration tests', () => {
  describe('mapMassWithdrawalPayload integration tests', () => {
    it('Should return proper payload', () => {
      const VALID_PAYLOAD = [
        { currency: 'x', address: 'y', amount: 1000 },
        { currency: 'p', address: 'q', amount: 2000, dest_tag: 'dest' },
      ];
      const VALID_DEFAULTS = {
        cmd: 'very-cmd',
      };
      const payload = mapMassWithdrawalPayload(VALID_PAYLOAD, VALID_DEFAULTS);
      expect(payload).toHaveProperty('cmd', VALID_DEFAULTS.cmd);
      expect(validateMassWithDrawal(payload)).toBeTruthy();
      expect(payload).toMatchSnapshot();
    });
  });
  describe('mapGetTxMultiPayload integration tests', () => {
    it('Should return proper payload', () => {
      const VALID_PAYLOAD = ['a', 'b', 'c'];
      const VALID_DEFAULTS = {
        cmd: 'very-cmd',
      };
      const payload = mapGetTxMultiPayload(VALID_PAYLOAD, VALID_DEFAULTS);
      expect(payload).toHaveProperty('txid', VALID_PAYLOAD.join('|'));
      expect(payload).toHaveProperty('cmd', VALID_DEFAULTS.cmd);
      expect(payload).toMatchSnapshot();
    });
  });
});

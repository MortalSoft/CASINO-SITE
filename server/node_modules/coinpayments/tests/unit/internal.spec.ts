import { getPrivateHeaders } from '../../src/internal';

describe('Internal unit tests', () => {
  describe('getPrivateHeaders unit tests', () => {
    it('Should return headers', () => {
      const CREDENTIALS = { key: 'very-key', secret: 'very-secret' };
      const OPTS = {
        cmd: 'very-cmd',
      };
      expect(getPrivateHeaders(CREDENTIALS, OPTS)).toMatchSnapshot();
    });
  });
});

import { mapPayload } from '../../src/mappers';

describe('Mappers unit tests', () => {
  describe('mapPayload tests', () => {
    it('Should override correctly', () => {
      const OPT_1 = {
        prop1: 'overwriten',
      };
      const OPT_2 = {
        cmd: 'some_cmd',
        prop1: 'override_this',
      };
      const payload = mapPayload(OPT_1, OPT_2);
      expect(payload).toHaveProperty('cmd', OPT_2.cmd);
      expect(payload).toHaveProperty('prop1', OPT_1.prop1);
      expect(payload).toMatchSnapshot();
    });
  });
});

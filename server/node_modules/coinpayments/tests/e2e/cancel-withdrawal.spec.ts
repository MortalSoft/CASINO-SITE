import {
  prepareHTTPInterceptor,
  mockCredentials,
  assertDefaultResponseCallback,
} from '../helpers';
import CoinpaymentsClient from '../../src';

import { CMDS } from '../../src/constants';

describe('Cancel withdrawal e2e test', () => {
  let client: CoinpaymentsClient;
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  it('Should work with valid payload', done => {
    const VALID_API_PAYLOAD = {
      id: 1,
    };
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.CANCEL_WITHDRAWAL,
      ...VALID_API_PAYLOAD,
    };
    const scope = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    const { cancelWithdrawal } = client;
    const mockCallback = assertDefaultResponseCallback(scope, done);
    cancelWithdrawal(VALID_API_PAYLOAD, mockCallback);
  });
});

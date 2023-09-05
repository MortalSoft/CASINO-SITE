import {
  prepareHTTPInterceptor,
  mockCredentials,
  generateInvalidPayloadTests,
} from '../helpers';
import CoinpaymentsClient from '../../src';

import { CMDS } from '../../src/constants';

describe('Get transaction e2e test', () => {
  let client: CoinpaymentsClient;
  const VALID_API_PAYLOAD = {
    txid: 'txid',
  };
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  it('Should not throw error on valid payload', async () => {
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.GET_TX,
      ...VALID_API_PAYLOAD,
    };
    const scope = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    await client.getTx(VALID_API_PAYLOAD);
    expect(scope.isDone()).toBeTruthy();
  });
  generateInvalidPayloadTests('getTx', VALID_API_PAYLOAD);
});

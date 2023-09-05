import {
  prepareHTTPInterceptor,
  mockCredentials,
  generateInvalidPayloadTests,
} from '../helpers';
import CoinpaymentsClient from '../../src';

import { CMDS } from '../../src/constants';

describe('Get deposit address integration test', () => {
  let client: CoinpaymentsClient;
  const VALID_API_PAYLOAD = {
    currency: 'x',
  };
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  it('Should not throw error on valid payload', async () => {
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.GET_DEPOSIT_ADDRESS,
      ...VALID_API_PAYLOAD,
    };
    const scope = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    await client.getDepositAddress(VALID_API_PAYLOAD);
    expect(scope.isDone()).toBeTruthy();
  });
  generateInvalidPayloadTests('getDepositAddress', VALID_API_PAYLOAD);
});

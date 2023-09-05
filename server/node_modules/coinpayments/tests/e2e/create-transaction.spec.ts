import {
  prepareHTTPInterceptor,
  mockCredentials,
  generateInvalidPayloadTests,
} from '../helpers';
import CoinpaymentsClient from '../../src';

import { CMDS } from '../../src/constants';

describe('Create transaction e2e test', () => {
  let client: CoinpaymentsClient;
  const VALID_API_PAYLOAD = {
    currency1: 'x',
    currency2: 'y',
    amount: 1,
    buyer_email: 'buyer@email.com',
  };
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  it('Should not throw error on valid payload', async () => {
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.CREATE_TRANSACTION,
      ...VALID_API_PAYLOAD,
    };
    const scope = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    await client.createTransaction(VALID_API_PAYLOAD);
    expect(scope.isDone()).toBeTruthy();
  });

  generateInvalidPayloadTests('createTransaction', VALID_API_PAYLOAD);
});

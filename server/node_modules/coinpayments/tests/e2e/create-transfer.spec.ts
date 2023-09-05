import {
  prepareHTTPInterceptor,
  mockCredentials,
  generateInvalidPayloadTests,
} from '../helpers';
import CoinpaymentsClient from '../../src';

import { CMDS } from '../../src/constants';

describe('Create transfer integration test', () => {
  let client: CoinpaymentsClient;
  const VALID_API_PAYLOAD_1 = {
    currency: 'x',
    amount: '1',
    merchant: 'merchant',
  };
  const VALID_API_PAYLOAD_2 = {
    auto_confirm: false,
    currency: 'x',
    amount: 1,
    pbntag: 'pbntag',
  };
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  it('Should not throw error on valid payload', async () => {
    const VALID_PAYLOAD_MOCK_1 = {
      cmd: CMDS.CREATE_TRANSFER,
      auto_confirm: true,
      ...VALID_API_PAYLOAD_1,
    };
    const scope1 = prepareHTTPInterceptor(
      mockCredentials,
      VALID_PAYLOAD_MOCK_1,
    );
    await client.createTransfer(VALID_API_PAYLOAD_1);
    expect(scope1.isDone()).toBeTruthy();

    const VALID_PAYLOAD_MOCK_2 = {
      cmd: CMDS.CREATE_TRANSFER,
      ...VALID_API_PAYLOAD_2,
    };
    const scope2 = prepareHTTPInterceptor(
      mockCredentials,
      VALID_PAYLOAD_MOCK_2,
    );
    await client.createTransfer(VALID_API_PAYLOAD_2);
    expect(scope2.isDone()).toBeTruthy();
  });

  it('Should throw error on mutually exclusive option', async () => {
    await expect(
      client.createTransfer({ ...VALID_API_PAYLOAD_1, ...VALID_API_PAYLOAD_2 }),
    ).rejects.toThrow();
  });

  generateInvalidPayloadTests('convertLimits', VALID_API_PAYLOAD_1);
});

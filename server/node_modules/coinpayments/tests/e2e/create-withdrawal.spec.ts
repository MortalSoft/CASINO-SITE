import {
  prepareHTTPInterceptor,
  mockCredentials,
  generateInvalidPayloadTests,
} from '../helpers';
import CoinpaymentsClient from '../../src';

import { CMDS } from '../../src/constants';

describe('Create mass withdrawal e2e test', () => {
  let client: CoinpaymentsClient;
  const VALID_API_PAYLOAD_1 = {
    currency: 'x',
    add_tx_fee: true,
    amount: 1,
    address: 'address',
    ipn_url: 'url',
  };
  const VALID_API_PAYLOAD_2 = {
    currency: 'x',
    amount: 1,
    currency2: 'y',
    pbntag: 'pbntag',
    auto_confirm: 0,
    note: 'note',
  };
  const VALID_API_PAYLOAD_3 = {
    currency: 'x',
    amount: 1,
    pbntag: 'domain',
    auto_confirm: 0,
  };
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  it('Should not throw error on valid payload', async () => {
    const VALID_PAYLOAD_MOCK_1 = {
      cmd: CMDS.CREATE_WITHDRAWAL,
      auto_confirm: 1,
      ...VALID_API_PAYLOAD_1,
    };
    const VALID_PAYLOAD_MOCK_2 = {
      cmd: CMDS.CREATE_WITHDRAWAL,
      auto_confirm: 0,
      ...VALID_API_PAYLOAD_2,
    };
    const scope1 = prepareHTTPInterceptor(
      mockCredentials,
      VALID_PAYLOAD_MOCK_1,
    );
    await client.createWithdrawal(VALID_API_PAYLOAD_1);
    expect(scope1.isDone()).toBeTruthy();

    const scope2 = prepareHTTPInterceptor(
      mockCredentials,
      VALID_PAYLOAD_MOCK_2,
    );
    await client.createWithdrawal(VALID_API_PAYLOAD_2);
    expect(scope2.isDone()).toBeTruthy();
  });
  it('Should throw error on mutually exclusive option', async () => {
    await expect(
      client.createWithdrawal({
        ...VALID_API_PAYLOAD_1,
        ...VALID_API_PAYLOAD_2,
      }),
    ).rejects.toThrow();
    await expect(
      client.createWithdrawal({
        ...VALID_API_PAYLOAD_2,
        ...VALID_API_PAYLOAD_3,
      }),
    ).rejects.toThrow();
    await expect(
      client.createWithdrawal({
        ...VALID_API_PAYLOAD_1,
        ...VALID_API_PAYLOAD_3,
      }),
    ).rejects.toThrow();
  });
  generateInvalidPayloadTests('createWithdrawal', VALID_API_PAYLOAD_1);
});

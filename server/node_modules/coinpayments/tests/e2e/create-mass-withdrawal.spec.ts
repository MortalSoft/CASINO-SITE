import { prepareHTTPInterceptor, mockCredentials } from '../helpers';
import CoinpaymentsClient from '../../src';
import { mapMassWithdrawalPayload } from '../../src/mappers';

import { CMDS } from '../../src/constants';

describe('Create transaction e2e test', () => {
  let client: CoinpaymentsClient;
  const VALID_API_PAYLOAD = [
    {
      currency: 'BTC',
      amount: 1,
      address: 'SomeAddress1',
      currency2: 'y',
      auto_confirm: 0,
    },
    {
      currency: 'BTC',
      amount: 1,
      domain: 'SomeUnstoppableDomain',
      ipn_url: 'url',
    },
    {
      currency: 'BTC',
      amount: 1,
      pbntag: 'SomeUnstoppableDomain',
      auto_confirm: 0,
    },
    {
      currency: 'LTC',
      amount: 1,
      address: 'SomeAddress2',
      dest_tag: 'DestTag',
      note: 'note',
    },
    {
      currency: 'NEM',
      amount: 1,
      address: 'SomeAddress3',
      dest_tag: 'DestTag',
      add_tx_fee: true,
    },
    {
      currency: 'XRP',
      amount: 1,
      address: 'SomeAddress4',
      dest_tag: 'DestTag',
    },
    {
      currency: 'XRP',
      amount: 1,
      address: 'SomeAddress4',
      dest_tag: 'DestTag',
    },
    {
      currency: 'XRP',
      amount: 1,
      address: 'SomeAddress4',
      dest_tag: 'DestTag',
    },
    {
      currency: 'XRP',
      amount: 1,
      address: 'SomeAddress4',
      dest_tag: 'DestTag',
    },
    {
      currency: 'XRP',
      amount: 1,
      address: 'SomeAddress4',
      dest_tag: 'DestTag',
    },
    {
      currency: 'XRP',
      amount: 1,
      address: 'SomeAddress4',
      dest_tag: 'DestTag',
    },
    {
      currency: 'XRP',
      amount: 1,
      address: 'SomeAddress4',
      dest_tag: 'DestTag',
    },
    {
      currency: 'XRP',
      amount: 1,
      address: 'SomeAddress4',
      dest_tag: 'DestTag',
    },
  ];
  const INVALID_API_PAYLOAD = [
    {
      amount: 1,
      address: 'SomeAddress1',
    },
    {
      currency: 'XRP',
      amount: 1,
      address: 'SomeAddress4',
      dest_tag: 'DestTag',
    },
  ];
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  it('Should not throw error on valid payload', async () => {
    const VALID_PAYLOAD_MOCK = mapMassWithdrawalPayload(VALID_API_PAYLOAD, {
      cmd: CMDS.CREATE_MASS_WITHDRAWAL,
    });

    const scope = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    await client.createMassWithdrawal(VALID_API_PAYLOAD);
    expect(scope.isDone()).toBeTruthy();
  });
  it('Should throw error on invalid payload', async () => {
    await expect(
      client.createMassWithdrawal.call(client, INVALID_API_PAYLOAD),
    ).rejects.toThrow();
  });
  it('Should throw error on mixed destination/target', async () => {
    const INVALID_TARGET_API_PAYLOAD = [
      {
        currency: 'BTC',
        amount: 1,
        address: 'SomeAddress1',
        domain: 'xxxx',
        pbntag: 'xxxx',
      },
      {
        currency: 'LTC',
        amount: 1,
        domain: 'xxxx',
        dest_tag: 'DestTag',
        pbntag: 'xxxx',
      },
    ];
    await expect(
      client.createMassWithdrawal.call(client, INVALID_TARGET_API_PAYLOAD),
    ).rejects.toThrow();
  });
});

import {
  prepareHTTPInterceptor,
  mockCredentials,
  assertDefaultResponseCallback,
} from '../helpers';
import CoinpaymentsClient from '../../src';

import { CMDS } from '../../src/constants';

describe('Rates e2e test', () => {
  let client: CoinpaymentsClient;
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  it('Should not throw error on valid payload - no args', async () => {
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.RATES,
    };
    const scope = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    const { rates } = client;
    await rates();
    expect(scope.isDone()).toBeTruthy();
  });
  it('Should not throw error on valid payload - only callback', done => {
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.RATES,
    };
    const scope = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    const { rates } = client;
    const mockCallback = assertDefaultResponseCallback(scope, done);
    rates(mockCallback);
  });
  it('Should not throw error on valid payload - args & callback', done => {
    const VALID_API_PAYLOAD = {
      accepted: 1,
      short: 1,
    };
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.RATES,
      ...VALID_API_PAYLOAD,
    };

    const scope = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    const { rates } = client;
    const mockCallback = assertDefaultResponseCallback(scope, done);
    rates(VALID_API_PAYLOAD, mockCallback);
  });
});

import {
  prepareHTTPInterceptor,
  mockCredentials,
  assertDefaultResponseCallback,
} from '../helpers';
import CoinpaymentsClient from '../../src';

import { CMDS } from '../../src/constants';

describe('Get tag list e2e test', () => {
  let client: CoinpaymentsClient;
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  it('Should not throw error on valid payload', async () => {
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.GET_TAG_LIST,
    };
    const scope1 = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    await client.tagList();
    expect(scope1.isDone()).toBeTruthy();

    const scope2 = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    return client.tagList(assertDefaultResponseCallback(scope2));
  });
});

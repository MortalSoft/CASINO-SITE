import { format } from 'url';
import { stringify } from 'querystring';

import nock from 'nock';

import CoinpaymentsClient from '../../src';

import {
  API_PROTOCOL,
  API_HOST,
  API_PATH,
  API_VALID_RESPONSE,
} from '../../src/constants';

import {
  applyDefaultOptionValues,
  getPrivateHeaders,
} from '../../src/internal';

const mockUrl = format({
  protocol: API_PROTOCOL,
  hostname: API_HOST,
});

export const defaultResponseMock = {
  error: API_VALID_RESPONSE,
  result: true,
};

export const mockCredentials = {
  key: 'mockKey',
  secret: 'mockSecret',
};

export const assertDefaultResponseCallback = (scope, done?) =>
  jest.fn((error, data) => {
    expect(error).toBe(null);
    expect(data).toBe(true);
    expect(scope.isDone()).toBeTruthy();
    if (done) return done();
  });

export const generateInvalidPayloadTests = (fnName, VALID_API_PAYLOAD) => {
  let client: CoinpaymentsClient;
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  describe('Invalidation tests', () => {
    for (const key in VALID_API_PAYLOAD) {
      it(`Should throw error on ${fnName} invalid payload: Missing ${key}`, async () => {
        const invalidPayloadOverride = { ...VALID_API_PAYLOAD };
        delete invalidPayloadOverride[key];
        expect(client[fnName](invalidPayloadOverride)).rejects.toThrow();
      });
    }
  });
};

export const prepareHTTPInterceptor = (
  credentials,
  payload,
  responseMock: any = defaultResponseMock,
) => {
  const expectedPayload = applyDefaultOptionValues(credentials, payload);
  const reqheaders = getPrivateHeaders(credentials, expectedPayload);

  return nock(mockUrl, { reqheaders })
    .post(API_PATH, stringify(expectedPayload))
    .reply(200, responseMock);
};

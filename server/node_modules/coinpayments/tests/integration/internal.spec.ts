import { prepareHTTPInterceptor, mockCredentials } from '../helpers';
import CoinpaymentsClient from '../../src';
import CoinpaymentsError from '../../src/error';

import { CMDS } from '../../src/constants';

describe('Internal integration tests', () => {
  let client;
  beforeAll(() => {
    client = new CoinpaymentsClient(mockCredentials);
  });
  // Validation - callback
  it('Should trigger callback on valid validation', done => {
    const VALID_PAYLOAD = { txid: 'txid' };
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.GET_TX,
      ...VALID_PAYLOAD,
    };
    const scope = prepareHTTPInterceptor(mockCredentials, VALID_PAYLOAD_MOCK);
    client.getTx(VALID_PAYLOAD, (err, response) => {
      expect(err).toBeNull();
      expect(response).toBeTruthy();
      expect(scope.isDone()).toBeTruthy();
      return done();
    });
  });
  // Invalidation - callback
  it('Should trigger callback on valid validation', () => {
    const INVALID_PAYLOAD = {};
    return client.getTx(INVALID_PAYLOAD, err => {
      expect(err).toBeInstanceOf(CoinpaymentsError);
    });
  });
  // resolveRequest Callback
  it('Should trigger callback on resolveRequest - API Error', done => {
    const VALID_PAYLOAD = { txid: 'txid' };
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.GET_TX,
      ...VALID_PAYLOAD,
    };
    const API_ERROR = { error: 'not-ok' };
    const scope = prepareHTTPInterceptor(
      mockCredentials,
      VALID_PAYLOAD_MOCK,
      API_ERROR,
    );
    client.getTx(VALID_PAYLOAD, err => {
      expect(err).toBeInstanceOf(CoinpaymentsError);
      expect(scope.isDone()).toBeTruthy();
      return done();
    });
  });
  it('Should throw proper error on invalid JSON response', async () => {
    const INVALID_JSON = 'not-json';
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.RATES,
    };
    const scope = prepareHTTPInterceptor(
      mockCredentials,
      VALID_PAYLOAD_MOCK,
      INVALID_JSON,
    );
    await expect(client.rates()).rejects.toThrow('Invalid response');
    expect(scope.isDone()).toBeTruthy();
  });
  it('Should throw proper error on Coinpayments API error', async () => {
    const API_ERROR = { error: 'not-ok' };
    const VALID_PAYLOAD_MOCK = {
      cmd: CMDS.RATES,
    };
    const scope = prepareHTTPInterceptor(
      mockCredentials,
      VALID_PAYLOAD_MOCK,
      API_ERROR,
    );
    await expect(client.rates()).rejects.toThrow('not-ok');
    expect(scope.isDone()).toBeTruthy();
  });
});

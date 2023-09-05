import { createHmac } from 'crypto';
import { request as httpsRequest } from 'https';
import { stringify } from 'querystring';

import {
  API_HOST,
  API_PATH,
  API_PROTOCOL,
  API_VERSION,
  API_FORMAT,
  API_VALID_RESPONSE,
} from './constants';
import CoinpaymentsError from './error';
import { validatePayload } from './validation';

import {
  CoinpaymentsCredentials,
  CoinpaymentsRequest,
  CoinpaymentsInternalRequestOps,
  CoinpaymentsInternalResponse,
  CoinpaymentsReturnCallback,
} from './types/base';

export const getPrivateHeaders = (
  credentials: CoinpaymentsCredentials,
  options: CoinpaymentsRequest,
) => {
  const { secret } = credentials;

  const paramString = stringify(options);
  const signature = createHmac('sha512', secret)
    .update(paramString)
    .digest('hex');

  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    HMAC: signature,
  };
};

export const makeRequest = <ExpectedResponse>(
  reqOps: CoinpaymentsInternalRequestOps,
  options: CoinpaymentsRequest,
): Promise<ExpectedResponse> => {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(reqOps, res => {
      let chunks = '';

      res.setEncoding('utf8');

      res.on('data', chunk => {
        chunks += chunk;
      });

      res.on('end', () => {
        let data: CoinpaymentsInternalResponse<ExpectedResponse> = {
          error: API_VALID_RESPONSE,
        };
        try {
          data = JSON.parse(chunks);
        } catch (e) {
          return reject(
            new CoinpaymentsError('Invalid response', { data: chunks }),
          );
        }

        if (data.error !== API_VALID_RESPONSE) {
          return reject(new CoinpaymentsError(data.error, { data }));
        }
        return resolve(data.result);
      });
    });
    req.on('error', reject);
    req.write(stringify(options));
    return req.end();
  });
};

export const getRequestOptions = (
  credentials: CoinpaymentsCredentials,
  options: CoinpaymentsRequest,
): CoinpaymentsInternalRequestOps => {
  return {
    protocol: API_PROTOCOL,
    method: 'post',
    host: API_HOST,
    path: API_PATH,
    headers: getPrivateHeaders(credentials, options),
  };
};

export const applyDefaultOptionValues = (
  credentials: CoinpaymentsCredentials,
  options: CoinpaymentsRequest,
): CoinpaymentsRequest => {
  return {
    ...options,
    version: API_VERSION,
    format: API_FORMAT,
    key: credentials.key,
  };
};

export const request = async <ExpectedResponse>(
  credentials: CoinpaymentsCredentials,
  options: CoinpaymentsRequest,
  callback?: CoinpaymentsReturnCallback<ExpectedResponse>,
): Promise<ExpectedResponse> => {
  try {
    validatePayload(options);
    options = applyDefaultOptionValues(credentials, options);
    const reqOps = getRequestOptions(credentials, options);
    const response: ExpectedResponse = await makeRequest<ExpectedResponse>(
      reqOps,
      options,
    );
    if (callback) {
      return callback(null, response);
    }
    return response;
  } catch (e) {
    if (callback) {
      return callback(e);
    }
    return Promise.reject(e);
  }
};

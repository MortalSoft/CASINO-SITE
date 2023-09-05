import { CMDS } from './constants';
import CoinpaymentsError from './error';
import {
  mapPayload,
  mapMassWithdrawalPayload,
  mapGetTxMultiPayload,
} from './mappers';
import { request } from './internal';

import {
  CoinpaymentsCredentials,
  CoinpaymentsReturnCallback,
} from './types/base';
import {
  CoinpaymentsRatesOpts,
  CoinpaymentsGetBasicInfoOpts,
  CoinpaymentsGetCallbackAddressOpts,
  CoinpaymentsCreateTransactionOpts,
  CoinpaymentsGetTxOpts,
  CoinpaymentsGetTxMultiOpts,
  CoinpaymentsGetTxListOpts,
  CoinpaymentsBalancesOpts,
  CoinpaymentsGetDepositAddressOpts,
  CoinpaymentsCreateMassWithdrawalOpts,
  CoinpaymentsConvertCoinsOpts,
  CoinpaymentsConvertLimitsOpts,
  CoinpaymentsGetWithdrawalHistoryOpts,
  CoinpaymentsGetWithdrawalInfoOpts,
  CoinpaymentsCancelWithdrawalOpts,
  CoinpaymentsGetConversionInfoOpts,
  CoinpaymentsGetProfileOpts,
  CoinpaymentsTagListOpts,
  CoinpaymentsClaimTagOpts,
  CoinpaymentsUpdateTagProfileOpts,
  CoinpaymentsRenewTagOpts,
  CoinpaymentsDeleteTagOpts,
  CoinpaymentsClaimCouponOpts,
  CoinpaymentsBuyTagOpts,
  CoinpaymentsCreateTransferOpts,
  CoinpaymentsCreateWithdrawalOpts,
} from './types/options';

import {
  CoinpaymentsRatesResponse,
  CoinpaymentsCreateTransactionResponse,
  CoinpaymentsBalancesResponse,
  CoinpaymentsCreateWithdrawalResponse,
  CoinpaymentsCreateMassWithdrawalResponse,
  CoinpaymentsGetTxResponse,
  CoinpaymentsGetWithdrawalInfoResponse,
  CoinpaymentsGetTxListResponse,
  CoinpaymentsGetTxMultiResponse,
  CoinpaymentsGetBasicInfoResponse,
  CoinpaymentsGetDepositAddressResponse,
  CoinpaymentsGetCallbackAddressResponse,
  CoinpaymentsCreateTransferResponse,
  CoinpaymentsConvertCoinsResponse,
  CoinpaymentsConvertLimitsResponse,
  CoinpaymentsGetWithdrawalHistoryResponse,
  CoinpaymentsConversionInfoResponse,
  CoinpaymentsGetProfileResponse,
  CoinpaymentsTagListResponse,
  CoinpaymentsUpdateTagProfileResponse,
  CoinpaymentsClaimTagResponse,
  CoinpaymentsRenameTagResponse,
  CoinpaymentsDeleteTagResponse,
  CoinpaymentsClaimCouponResponse,
  CoinpaymentsBuyTagResponse,
} from './types/response';
import { filterMassWithdrawalOpts } from './validation';

class Coinpayments {
  private credentials: CoinpaymentsCredentials;

  constructor({ key = '', secret = '' }: CoinpaymentsCredentials) {
    if (!key) {
      throw new CoinpaymentsError('Missing public key');
    }
    if (!secret) {
      throw new CoinpaymentsError('Missing private key');
    }

    this.credentials = { key, secret };

    this.getBasicInfo = this.getBasicInfo.bind(this);
    this.rates = this.rates.bind(this);
    this.balances = this.balances.bind(this);
    this.getDepositAddress = this.getDepositAddress.bind(this);
    this.createTransaction = this.createTransaction.bind(this);
    this.getCallbackAddress = this.getCallbackAddress.bind(this);
    this.getTx = this.getTx.bind(this);
    this.getTxList = this.getTxList.bind(this);
    this.getTxMulti = this.getTxMulti.bind(this);
    this.createTransfer = this.createTransfer.bind(this);
    this.convertCoins = this.convertCoins.bind(this);
    this.convertLimits = this.convertLimits.bind(this);
    this.getWithdrawalHistory = this.getWithdrawalHistory.bind(this);
    this.getWithdrawalInfo = this.getWithdrawalInfo.bind(this);
    this.getConversionInfo = this.getConversionInfo.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.tagList = this.tagList.bind(this);
    this.updateTagProfile = this.updateTagProfile.bind(this);
    this.claimTag = this.claimTag.bind(this);
    this.cancelWithdrawal = this.cancelWithdrawal.bind(this);
    this.createWithdrawal = this.createWithdrawal.bind(this);
    this.createMassWithdrawal = this.createMassWithdrawal.bind(this);
  }

  public rates(
    options?:
      | CoinpaymentsRatesOpts
      | CoinpaymentsReturnCallback<CoinpaymentsRatesResponse>,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsRatesResponse>,
  ): Promise<CoinpaymentsRatesResponse> {
    if (!options && !callback) {
      options = {};
    }
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const requestPayload = mapPayload<CoinpaymentsRatesOpts>(options, {
      cmd: CMDS.RATES,
    });

    return request<CoinpaymentsRatesResponse>(
      this.credentials,
      requestPayload,
      callback,
    );
  }

  public createTransaction(
    options: CoinpaymentsCreateTransactionOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsCreateTransactionResponse>,
  ) {
    return request<CoinpaymentsCreateTransactionResponse>(
      this.credentials,
      mapPayload<CoinpaymentsCreateTransactionOpts>(options, {
        cmd: CMDS.CREATE_TRANSACTION,
      }),
      callback,
    );
  }

  public balances(
    options?:
      | CoinpaymentsBalancesOpts
      | CoinpaymentsReturnCallback<CoinpaymentsBalancesResponse>,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsBalancesResponse>,
  ) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    return request<CoinpaymentsBalancesResponse>(
      this.credentials,
      mapPayload<CoinpaymentsBalancesOpts>(options, {
        cmd: CMDS.BALANCES,
      }),
      callback,
    );
  }

  public createWithdrawal(
    options: CoinpaymentsCreateWithdrawalOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsCreateWithdrawalResponse>,
  ) {
    options = { auto_confirm: 1, ...options };
    return request<CoinpaymentsCreateWithdrawalResponse>(
      this.credentials,
      mapPayload<CoinpaymentsCreateWithdrawalOpts>(options, {
        cmd: CMDS.CREATE_WITHDRAWAL,
      }),
      callback,
    );
  }

  public createMassWithdrawal(
    withdrawalArray: CoinpaymentsCreateMassWithdrawalOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsCreateMassWithdrawalResponse>,
  ) {
    return request<CoinpaymentsCreateMassWithdrawalResponse>(
      this.credentials,
      mapMassWithdrawalPayload(filterMassWithdrawalOpts(withdrawalArray), {
        cmd: CMDS.CREATE_MASS_WITHDRAWAL,
      }),
      callback,
    );
  }

  public cancelWithdrawal(
    options: CoinpaymentsCancelWithdrawalOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsCancelWithdrawalOpts>,
  ) {
    return request<CoinpaymentsCancelWithdrawalOpts>(
      this.credentials,
      mapPayload<CoinpaymentsCancelWithdrawalOpts>(options, {
        cmd: CMDS.CANCEL_WITHDRAWAL,
      }),
      callback,
    );
  }

  public getTx(
    options: CoinpaymentsGetTxOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsGetTxResponse>,
  ) {
    return request<CoinpaymentsGetTxResponse>(
      this.credentials,
      mapPayload<CoinpaymentsGetTxOpts>(options, {
        cmd: CMDS.GET_TX,
      }),
      callback,
    );
  }

  public getWithdrawalInfo(
    options: CoinpaymentsGetWithdrawalInfoOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsGetWithdrawalInfoResponse>,
  ) {
    return request<CoinpaymentsGetWithdrawalInfoResponse>(
      this.credentials,
      mapPayload<CoinpaymentsGetWithdrawalInfoOpts>(options, {
        cmd: CMDS.GET_WITHDRAWAL_INFO,
      }),
      callback,
    );
  }

  public getTxMulti(
    txIdArray: CoinpaymentsGetTxMultiOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsGetTxMultiResponse>,
  ) {
    if (!(txIdArray instanceof Array) || !txIdArray.length) {
      const error = new CoinpaymentsError('Invalid argument', { txIdArray });
      if (callback) {
        return callback(error);
      }
      return Promise.reject(error);
    }
    return request<CoinpaymentsGetTxMultiResponse>(
      this.credentials,
      mapGetTxMultiPayload(txIdArray, {
        cmd: CMDS.GET_TX_MULTI,
      }),
      callback,
    );
  }

  public getTxList(
    options?:
      | CoinpaymentsGetTxListOpts
      | CoinpaymentsReturnCallback<CoinpaymentsGetTxListResponse>,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsGetTxListResponse>,
  ) {
    if (!options && !callback) {
      options = {};
    }
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    return request<CoinpaymentsGetTxListResponse>(
      this.credentials,
      mapPayload<CoinpaymentsGetTxListOpts>(options, {
        cmd: CMDS.GET_TX_LIST,
      }),
      callback,
    );
  }

  public getBasicInfo(
    callback?: CoinpaymentsReturnCallback<CoinpaymentsGetBasicInfoResponse>,
  ) {
    return request<CoinpaymentsGetBasicInfoResponse>(
      this.credentials,
      mapPayload<CoinpaymentsGetBasicInfoOpts>(
        {},
        {
          cmd: CMDS.GET_BASIC_INFO,
        },
      ),
      callback,
    );
  }

  public getDepositAddress(
    options: CoinpaymentsGetDepositAddressOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsGetDepositAddressResponse>,
  ) {
    return request<CoinpaymentsGetDepositAddressResponse>(
      this.credentials,
      mapPayload<CoinpaymentsGetDepositAddressOpts>(options, {
        cmd: CMDS.GET_DEPOSIT_ADDRESS,
      }),
      callback,
    );
  }

  public getCallbackAddress(
    options: CoinpaymentsGetCallbackAddressOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsGetCallbackAddressResponse>,
  ) {
    return request<CoinpaymentsGetCallbackAddressResponse>(
      this.credentials,
      mapPayload<CoinpaymentsGetCallbackAddressOpts>(options, {
        cmd: CMDS.GET_CALLBACK_ADDRESS,
      }),
      callback,
    );
  }

  public createTransfer(
    options: CoinpaymentsCreateTransferOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsCreateTransferResponse>,
  ) {
    return request<CoinpaymentsCreateTransferResponse>(
      this.credentials,
      mapPayload<CoinpaymentsCreateTransferOpts>(options, {
        cmd: CMDS.CREATE_TRANSFER,
        auto_confirm: true,
      }),
      callback,
    );
  }

  public convertCoins(
    options: CoinpaymentsConvertCoinsOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsConvertCoinsResponse>,
  ) {
    return request<CoinpaymentsConvertCoinsResponse>(
      this.credentials,
      mapPayload<CoinpaymentsConvertCoinsOpts>(options, {
        cmd: CMDS.CONVERT,
      }),
      callback,
    );
  }

  public convertLimits(
    options: CoinpaymentsConvertLimitsOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsConvertLimitsResponse>,
  ) {
    return request<CoinpaymentsConvertLimitsResponse>(
      this.credentials,
      mapPayload<CoinpaymentsConvertLimitsOpts>(options, {
        cmd: CMDS.CONVERT_LIMITS,
      }),
      callback,
    );
  }

  public getWithdrawalHistory(
    options?:
      | CoinpaymentsGetWithdrawalHistoryOpts
      | CoinpaymentsReturnCallback<CoinpaymentsGetWithdrawalHistoryResponse>,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsGetWithdrawalHistoryResponse>,
  ) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    return request<CoinpaymentsGetWithdrawalHistoryResponse>(
      this.credentials,
      mapPayload<CoinpaymentsGetWithdrawalHistoryOpts>(options, {
        cmd: CMDS.GET_WITHDRAWAL_HISTORY,
      }),
      callback,
    );
  }

  public getConversionInfo(
    options: CoinpaymentsGetConversionInfoOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsConversionInfoResponse>,
  ) {
    return request<CoinpaymentsConversionInfoResponse>(
      this.credentials,
      mapPayload<CoinpaymentsGetConversionInfoOpts>(options, {
        cmd: CMDS.GET_CONVERSATION_INFO,
      }),
      callback,
    );
  }

  public getProfile(
    options: CoinpaymentsGetProfileOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsGetProfileResponse>,
  ) {
    return request<CoinpaymentsGetProfileResponse>(
      this.credentials,
      mapPayload<CoinpaymentsGetProfileOpts>(options, {
        cmd: CMDS.GET_TAG_INFO,
      }),
      callback,
    );
  }

  public tagList(
    callback?: CoinpaymentsReturnCallback<CoinpaymentsTagListResponse>,
  ) {
    return request<CoinpaymentsTagListResponse>(
      this.credentials,
      mapPayload<CoinpaymentsTagListOpts>(
        {},
        {
          cmd: CMDS.GET_TAG_LIST,
        },
      ),
      callback,
    );
  }

  public updateTagProfile(
    options: CoinpaymentsUpdateTagProfileOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsUpdateTagProfileResponse>,
  ) {
    return request<CoinpaymentsUpdateTagProfileResponse>(
      this.credentials,
      mapPayload<CoinpaymentsUpdateTagProfileOpts>(options, {
        cmd: CMDS.UPDATE_TAG,
      }),
      callback,
    );
  }

  public claimTag(
    options: CoinpaymentsClaimTagOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsClaimTagResponse>,
  ) {
    return request<CoinpaymentsClaimTagResponse>(
      this.credentials,
      mapPayload<CoinpaymentsClaimTagOpts>(options, {
        cmd: CMDS.CLAIM_TAG,
      }),
      callback,
    );
  }

  public renewTag(
    options: CoinpaymentsRenewTagOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsRenameTagResponse>,
  ) {
    return request<CoinpaymentsRenameTagResponse>(
      this.credentials,
      mapPayload<CoinpaymentsRenewTagOpts>(options, {
        cmd: CMDS.RENEW_TAG,
      }),
      callback,
    );
  }

  public deleteTag(
    options: CoinpaymentsDeleteTagOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsDeleteTagResponse>,
  ) {
    return request<CoinpaymentsDeleteTagResponse>(
      this.credentials,
      mapPayload<CoinpaymentsDeleteTagOpts>(options, {
        cmd: CMDS.DELETE_TAG,
      }),
      callback,
    );
  }

  public claimCoupon(
    options: CoinpaymentsClaimCouponOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsClaimCouponResponse>,
  ) {
    return request<CoinpaymentsClaimCouponResponse>(
      this.credentials,
      mapPayload<CoinpaymentsClaimCouponOpts>(options, {
        cmd: CMDS.CLAIM_COUPON,
      }),
      callback,
    );
  }

  public buyTag(
    options: CoinpaymentsBuyTagOpts,
    callback?: CoinpaymentsReturnCallback<CoinpaymentsBuyTagResponse>,
  ) {
    return request<CoinpaymentsBuyTagResponse>(
      this.credentials,
      mapPayload<CoinpaymentsBuyTagOpts>(options, {
        cmd: CMDS.BUY_TAG,
      }),
      callback,
    );
  }
}

module.exports = Coinpayments;
module.exports.default = Coinpayments;
module.exports.Coinpayments = Coinpayments;

export { Coinpayments };
export default Coinpayments;

import { CoinpaymentsRequest } from './types/base';
import {
  CoinpaymentsCreateMassWithdrawalOpts,
  CoinpaymentsCreateWithdrawalOpts,
  CoinpaymentsGetTxMultiOpts,
} from './types/options';

export const mapPayload = <ExpectedOptions>(
  opts: ExpectedOptions,
  defaultRequestFields: CoinpaymentsRequest,
): CoinpaymentsRequest => {
  return {
    ...defaultRequestFields,
    ...opts,
  };
};

export const mapMassWithdrawalTarget = (
  w: CoinpaymentsCreateWithdrawalOpts,
) => {
  if ('address' in w) return ['address', w.address];
  if ('domain' in w) return ['domain', w.domain];
  return ['pbntag', w.pbntag];
};

export const mapMassWithdrawalPayload = (
  withdrawalArray: CoinpaymentsCreateMassWithdrawalOpts,
  defaultFields: CoinpaymentsRequest,
): CoinpaymentsRequest => {
  const payload = withdrawalArray.reduce((ops, w, index) => {
    ops[`wd[wd${index + 1}][amount]`] = w.amount;
    const [target, value] = mapMassWithdrawalTarget(w);
    ops[`wd[wd${index + 1}][${target}]`] = value;
    ops[`wd[wd${index + 1}][currency]`] = w.currency;
    if (w.dest_tag) {
      ops[`wd[wd${index + 1}][dest_tag]`] = w.dest_tag;
    }
    if (w.add_tx_fee) {
      ops[`wd[wd${index + 1}][add_tx_fee]`] = w.add_tx_fee;
    }
    if (w.hasOwnProperty('auto_confirm')) {
      ops[`wd[wd${index + 1}][auto_confirm]`] = w.auto_confirm;
    }
    if (w.currency2) {
      ops[`wd[wd${index + 1}][currency2]`] = w.currency2;
    }
    if (w.ipn_url) {
      ops[`wd[wd${index + 1}][ipn_url]`] = w.ipn_url;
    }
    if (w.note) {
      ops[`wd[wd${index + 1}][note]`] = w.note;
    }

    return ops;
  }, {});
  return {
    ...defaultFields,
    ...payload,
  };
};

export const mapGetTxMultiPayload = (
  txArray: CoinpaymentsGetTxMultiOpts,
  defaultFields: CoinpaymentsRequest,
): CoinpaymentsRequest => {
  const payload = { txid: txArray.join('|') };
  return {
    ...defaultFields,
    ...payload,
  };
};

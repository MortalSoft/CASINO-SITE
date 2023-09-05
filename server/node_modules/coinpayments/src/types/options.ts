export interface CoinpaymentsGetBasicInfoOpts {}

export interface CoinpaymentsRatesOpts {
  short?: number;
  accepted?: number;
}

export interface CoinpaymentsCreateTransactionOpts {
  currency1: string;
  currency2: string;
  amount: number;
  buyer_email: string;
  address?: string;
  buyer_name?: string;
  item_name?: string;
  item_number?: string;
  invoice?: string;
  custom?: string;
  ipn_url?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CoinpaymentsGetCallbackAddressOpts {
  currency: string;
  ipn_url?: string;
  label?: string;
  eip55?: number;
}

export interface CoinpaymentsGetTxOpts {
  txid: string;
  full?: number;
}

export type CoinpaymentsGetTxMultiOpts = string[];

export interface CoinpaymentsGetTxListOpts {
  limit?: string;
  start?: string;
  newer?: string;
  all?: string;
}

export interface CoinpaymentsBalancesOpts {
  all?: number;
}

export interface CoinpaymentsGetDepositAddressOpts {
  currency: string;
}

export interface CoinpaymentsCreateTransferBaseOpts {
  amount: number | string;
  currency: string;
  auto_confirm?: boolean;
  note?: string;
}

export interface CoinpaymentsCreateTransferMerchantOpts
  extends CoinpaymentsCreateTransferBaseOpts {
  merchant: string;
}

export interface CoinpaymentsCreateTransferTagOpts
  extends CoinpaymentsCreateTransferBaseOpts {
  pbntag: string;
}

export type CoinpaymentsCreateTransferOpts =
  | CoinpaymentsCreateTransferMerchantOpts
  | CoinpaymentsCreateTransferTagOpts;

export type CoinpaymentsCreateWithdrawalBaseOpts = {
  amount: number;
  add_tx_fee?: boolean;
  currency: string;
  currency2?: string;
  dest_tag?: string;
  ipn_url?: string;
  auto_confirm?: number;
  note?: string;
};

export type CoinpaymentsCreateWithdrawalMerchantOpts =
  CoinpaymentsCreateWithdrawalBaseOpts & {
    address: string;
  };

export type CoinpaymentsCreateWithdrawalTagOpts =
  CoinpaymentsCreateWithdrawalBaseOpts & {
    pbntag: string;
  };

export type CoinpaymentsCreateWithdrawalDomainOpts =
  CoinpaymentsCreateWithdrawalBaseOpts & {
    domain: string;
  };

export type CoinpaymentsCreateWithdrawalOpts =
  | CoinpaymentsCreateWithdrawalMerchantOpts
  | CoinpaymentsCreateWithdrawalTagOpts
  | CoinpaymentsCreateWithdrawalDomainOpts;

export type CoinpaymentsCreateMassWithdrawalOpts =
  Array<CoinpaymentsCreateWithdrawalOpts>;

export type CoinpaymentsCancelWithdrawalOpts = {
  id: number | string;
};

export interface CoinpaymentsConvertCoinsOpts {
  amount: number;
  from: string;
  to: string;
  address?: string;
  dest_tag?: string;
}

export interface CoinpaymentsConvertLimitsOpts {
  from: string;
  to: string;
}

export interface CoinpaymentsGetWithdrawalHistoryOpts {
  limit?: number;
  start?: number;
  newer?: Date;
}

export interface CoinpaymentsGetWithdrawalInfoOpts {
  id: string;
}

export interface CoinpaymentsGetConversionInfoOpts {
  id: string;
}

export interface CoinpaymentsGetProfileOpts {
  pbntag: string;
}

export interface CoinpaymentsTagListOpts {}

export interface CoinpaymentsBuyTagOpts {
  coin: string;
  num?: number;
}

export interface CoinpaymentsClaimTagOpts {
  tagid: string;
  name: string;
}

export interface CoinpaymentsUpdateTagProfileOpts {
  tagid: string;
  name?: string;
  email?: string;
  url?: string;
}

export interface CoinpaymentsRenewTagOpts {
  tagid: string;
  coin: string;
  years?: number;
}

export interface CoinpaymentsDeleteTagOpts {
  tagid: string;
}

export interface CoinpaymentsClaimCouponOpts {
  coupon: string;
}

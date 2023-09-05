export const API_VERSION = 1;
export const API_PROTOCOL = 'https:';
export const API_HOST = 'www.coinpayments.net';
export const API_PATH = '/api.php';
export const API_FORMAT = 'json';
export const API_VALID_RESPONSE = 'ok';

export const CMDS = Object.freeze({
  RATES: 'rates',
  GET_BASIC_INFO: 'get_basic_info',
  CREATE_TRANSACTION: 'create_transaction',
  GET_CALLBACK_ADDRESS: 'get_callback_address',
  GET_TX: 'get_tx_info',
  GET_TX_MULTI: 'get_tx_info_multi',
  GET_TX_LIST: 'get_tx_ids',
  BALANCES: 'balances',
  GET_DEPOSIT_ADDRESS: 'get_deposit_address',
  CREATE_TRANSFER: 'create_transfer',
  CREATE_WITHDRAWAL: 'create_withdrawal',
  CREATE_MASS_WITHDRAWAL: 'create_mass_withdrawal',
  CANCEL_WITHDRAWAL: 'cancel_withdrawal',
  CONVERT: 'convert',
  CONVERT_LIMITS: 'convert_limits',
  GET_WITHDRAWAL_HISTORY: 'get_withdrawal_history',
  GET_WITHDRAWAL_INFO: 'get_withdrawal_info',
  GET_CONVERSATION_INFO: 'get_conversion_info',
  GET_TAG_INFO: 'get_pbn_info',
  GET_TAG_LIST: 'get_pbn_list',
  BUY_TAG: 'buy_pbn_tags',
  CLAIM_TAG: 'claim_pbn_tag',
  UPDATE_TAG: 'update_pbn_tag',
  RENEW_TAG: 'renew_pbn_tag',
  DELETE_TAG: 'delete_pbn_tag',
  CLAIM_COUPON: 'claim_pbn_coupon',
});

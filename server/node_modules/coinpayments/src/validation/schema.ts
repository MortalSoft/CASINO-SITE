import { CMDS } from '../constants';

const Schema = {
  [CMDS.GET_BASIC_INFO]: [],
  [CMDS.GET_TX_LIST]: [],
  [CMDS.GET_DEPOSIT_ADDRESS]: ['currency'],
  [CMDS.GET_CALLBACK_ADDRESS]: ['currency'],
  [CMDS.CREATE_TRANSFER]: ['amount', 'currency', ['merchant', 'pbntag']],
  [CMDS.CONVERT]: ['amount', 'from', 'to'],
  [CMDS.CONVERT_LIMITS]: ['from', 'to'],
  [CMDS.GET_WITHDRAWAL_HISTORY]: [],
  [CMDS.GET_CONVERSATION_INFO]: ['id'],
  [CMDS.GET_TAG_INFO]: ['pbntag'],
  [CMDS.GET_TAG_LIST]: [],
  [CMDS.UPDATE_TAG]: ['tagid'],
  [CMDS.CLAIM_TAG]: ['tagid', 'name'],
  [CMDS.GET_WITHDRAWAL_INFO]: ['id'],
  [CMDS.GET_TX]: ['txid'],
  [CMDS.GET_TX_MULTI]: ['txid'],
  [CMDS.CREATE_WITHDRAWAL]: [
    'amount',
    'currency',
    ['address', 'pbntag', 'domain'],
  ],
  [CMDS.CREATE_MASS_WITHDRAWAL]: [],
  [CMDS.CANCEL_WITHDRAWAL]: ['id'],
  [CMDS.CREATE_TRANSACTION]: [
    'amount',
    'currency1',
    'currency2',
    'buyer_email',
  ],
  [CMDS.RATES]: [],
  [CMDS.BALANCES]: [],
  [CMDS.RENEW_TAG]: ['tagid', 'coin'],
  [CMDS.DELETE_TAG]: ['tagid'],
  [CMDS.CLAIM_COUPON]: ['coupon'],
  [CMDS.BUY_TAG]: ['coin'],
};

export default Schema;

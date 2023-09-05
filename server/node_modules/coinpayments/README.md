![alt text](https://www.coinpayments.net/images/logo.png 'CoinPayments')

<p>
  <a href="https://circleci.com/gh/OrahKokos/coinpayments" rel="nofollow">
    <img src="https://circleci.com/gh/OrahKokos/coinpayments.svg?style=shield" alt="CircleCI" />
  </a>
  <a href="https://codecov.io/github/OrahKokos/coinpayments" rel="nofollow">
    <img src="https://codecov.io/github/OrahKokos/coinpayments/coverage.svg?branch=master" alt="Codecov" />
  </a>
  <a href="https://snyk.io/test/github/OrahKokos/coinpayments?targetFile=package.json" rel="nofollow">
    <img src="https://snyk.io/test/github/OrahKokos/coinpayments/badge.svg?targetFile=package.json" alt="Snyk" />
  </a>
  <a href="https://npm-stat.com/charts.html?package=coinpayments" rel="nofollow">
    <img src="https://img.shields.io/npm/dm/coinpayments.svg" alt="Downloads/Month" />
  </a>
</p>

CoinPayments is a cloud wallet solution that offers an easy way to integrate a checkout system for numerous cryptocurrencies. Coinpayments now also offers coin conversion via Shapeshift.io.
For more information visit their website [here](https://www.coinpayments.net/index.php?ref=831b8d495071e5b0e1015486f5001150).

**Important note: This is a community module. Contributors are in no way connected with the company Coinpayments.**

<a name="table" />

# Table of contents

- Table of contents
  - [Installation](#installation)
  - [Setup](#setup)
  - [API Reference](#api-reference)
    - [Init](#init)
    - [Get Basic Account Information](#get-basic-account-information)
    - [Get Profile Info](#get-profile-info)
    - [Rates](#rates)
    - [Balances](#balances)
    - [Get Deposit Address](#get-deposit-address)
    - [Get Callback Address](#get-callback-address)
    - [Create Transaction](#create-transaction)
    - [Get Transaction Info](#get-transaction-info)
    - [Get Transaction Multi](#get-transaction-multi)
    - [Get Transaction List](#get-transaction-list)
    - [Get Conversion Limits](#get-conversion-limits)
    - [Convert Coins](#convert-coins)
    - [Create Transfer](#create-transfer)
    - [Create Withdrawal](#create-withdrawal)
    - [Create Mass Withdrawal](#create-mass-withdrawal)
    - [Get Withdrawal History](#get-withdrawal-history)
    - [Claim tag](#claim-tag)
    - [Get Tag list](#get-tag-list)
    - [Update Tag Profile](#update-tag-profile)
    - [Renew Tag](#renew-tag)
    - [Delete Tag](#delete-tag)
    - [Buy Tag](#buy-tag)
    - [Claim Coupon](#claim-coupon)
  - [Instant Paymnt Notifications](#ipn)
  - [License](#license)

<a name="installation" />

## Installation

```bash
yarn add coinpayments

npm install coinpayments
```

<a name="setup" />

## Setup

- Create an account on [www.coinpayments.net](https://www.coinpayments.net/index.php?ref=831b8d495071e5b0e1015486f5001150)
- Go to **My Account -> Coin Acceptance Settings**
- Check the coins you wish to accept.
  - You can setup your payment address, so you can use coinpayments as a pass thru service, rather then a cloud wallet (Payout mode ASAP/Nightly).
  - **Payout Made** (To Balance/ASAP/Nightly)
    - **To Balance:** Received payments are stored in your account for later withdrawal at your leisure.
    - **ASAP:** Received payments are sent to the address you specify as soon as they are received and confirmed.
    - **Nightly:** Received payments are grouped together and sent daily (at approx. midnight EST GMT -0500). The main benefit of this options is it will save you coin TX fees
  - **Discount (%)**
    - **Positive Numbers:** Gives buyers a discount for paying with a coin. Good promotional tool if you want to give extra support to a particular coin.
    - **Negative Numbers:** Adds a certain percentage for paying with a coin. This could be used to cover your crypto/fiat conversation costs, make adjustments to match your local exchange, etc.
- Go to **My Account -> API Keys** , generate API key pair
- **Edit permissions** on the generated **API KEY** and enable all options
- Get some Litecoin testnet coins [here](https://www.coinpayments.net/help-testnet)

[back to top](#table)

<a name="reference" />

## API Reference

- Typescript support
- Undocumented responses are empty `[]`.
- All methods support Promise and Callback
- All metods have bound context

[back to top](#table)

<a name="init" />

## Init

```typescript
import Coinpayments from 'coinpayments';
interface CoinpaymentsCredentials {
  key: string
  secret: string
}
const client = new Coinpayments(credentials: CoinpaymentsCredentials)
```

- `key` - Public API key
- `secret` - Private API key

[back to top](#table)

<a name="getbasicinfo" />

## Get Basic Account Information

Get your basic account information.

Official doc: https://www.coinpayments.net/apidoc-get-basic-info

```typescript
await client.getBasicInfo()
```

Example response from server

```json
{
  "uername": "OrahKokos",
  "username": "OrahKokos",
  "merchant_id": "831b8d495071e5b0e1015486f5001150",
  "email": "marko.paroski.ns@gmail.com",
  "public_name": "OrahKokos",
  "time_joined": 1417611250,
  "kyc_status": false,
  "swych_tos_accepted": false
}
```

- `uername` - Some sort of username
- `username` - Username
- `merchant_id` - Your merchant ID
- `email` - Your merchant email
- `public_name` - Your merchant public name
- `time_joined` - User joined timestamp
- `kyc_status` - Unknown
- `swych_tos_accepted` - Unknown

[back to top](#table)

<a name="getprofile" />

## Get Profile Info

Get \$PayByName Profile Information

Official doc: https://www.coinpayments.net/apidoc-get-pbn-info

```typescript
interface CoinpaymentsGetProfileOpts {
  pbntag: string
}
await client.getProfile(options: CoinpaymentsGetProfileOpts)
```

- `pbntag` - Coinpayments merchant pbntag

**Example response from server**

```json
{
  "pbntag": "$CoinPayments",
  "merchant": "be1891193e57d28ba5a05114f8d618d2",
  "profile_name": "$PayByName Demo Profile - Do NOT Send Coins To Me!",
  "profile_url": "https://www.coinpayments.net",
  "profile_email": "",
  "profile_image": "",
  "member_since": 1377891010,
  "feedback": {
    "pos": 219,
    "neg": 2,
    "neut": "4",
    "total": 225,
    "percent": "99%",
    "percent_str": "<span style=\"color: #5cb85c;\"><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i></span> <span style=\"color: #5cb85c;\">(99%)</span>"
  }
}
```

- `pbntag` - This is the \$PayByName tag in the same case as the owner entered it. It is recommended to display the tag this way versus how it was entered by a viewing user.
- `merchant` - This is the owner's merchant ID. It can be used to send transfers or payments to the owner.
- `profile_name` - This is the owner's name (may be a store name, nickname, real name, etc.)
- `profile_url` - This is the owner's website URL.
- `profile_email` - This is the owner's email.
- `profile_image` - The URL of the owner's profile picture.
- `member_since` - The time (Unix timestamp) of when the user signed up for CoinPayments.
- `feedback` - The owners current feedback. The 'percent' field with either be a percent as seen or 'No Rating' if the user has no feedback.

[back to top](#table)

<a name="rates" />

## Rates

Get Exchange Rates / Supported Coins

Official doc: https://www.coinpayments.net/apidoc-rates

```typescript
interface CoinpaymentsRatesOpts {
  short?: number
  accepted?: number
}
await client.rates(options?: CoinpaymentsRatesOpts)
```

- `short` - If set to `1`, the response won't include the full coin names and number of confirms needed to save bandwidth. (default `0`)
- `accepted` 
  If set to `1`, the response will include if you have the coin enabled for acceptance on your `Coin Acceptance Settings page`.
  If set to `2`, the response will include all fiat coins but only cryptocurrencies enabled for acceptance on your `Coin Acceptance Settings page`.

**Example Response from server**

```json
{
  "BTC": {
    "is_fiat": 0,
    "rate_btc": "1.000000000000000000000000",
    "last_update": "1375473661",
    "tx_fee": "0.00100000",
    "status": "online",
    "name": "Bitcoin",
    "confirms": "2",
    "can_convert": 0,
    "capabilities": ["payments", "wallet", "transfers", "convert"],
    "explorer": "https://etherscan.io/tx/%txid%"
  },
  "LTC": {
    "is_fiat": 0,
    "rate_btc": "0.018343387500000000000000",
    "last_update": "1518463609",
    "tx_fee": "0.00100000",
    "status": "online",
    "name": "Litecoin",
    "confirms": "3",
    "can_convert": 0,
    "capabilities": ["payments", "wallet", "transfers", "convert"],
    "explorer": "https://etherscan.io/tx/%txid%"
  },
  "USD": {
    "is_fiat": 1,
    "rate_btc": "0.000114884285404190000000",
    "last_update": "1518463609",
    "tx_fee": "0.00000000",
    "status": "online",
    "name": "United States Dollar",
    "confirms": "1",
    "can_convert": 0,
    "capabilities": [],
    "explorer": "https://etherscan.io/tx/%txid%"
  }
}
```

- `name` - The coin's full/display name.
- `rate_btc` - The exchange rate to Bitcoin.
- `is_fiat` - If the coin is a fiat currency. You can use fiat currencies in your buttons so you don't get to get conversion rates yourself.
- `confirms` - The number of confirms a coin has to have in our system before we send it to you.
- `accepted` - 1 if you have the coin enabled for acceptance, 0 otherwise.
- `tx_fee` - Transaction fee.
- `status` - Cloud wallet/network status `online` or `offline`.
- `can_convert` - Is convertable `0` or `1`.
- `capabilities` - Offered services for the given cryptocurrency. Can be: `"payments"`, `"wallet"`, `"transfers"`, `"dest_tag"`, `"convert"`
- `explorer` - Link to block explorer

[back to top](#table)

<a name="balances" />

## Balances

Coin Balances

Official doc: https://www.coinpayments.net/apidoc-balances

```typescript
interface CoinpaymentsBalancesOpts {
  all?: number
}
await client.balances(options?: CoinpaymentsBalancesOpts)
```

- `all` - If set to `1`, the response will include all coins, even those with 0 balance. (default `0`)

Example Response from server:

```json
{
  "BTC": {
    "balance": 10000000,
    "balancef": "0.10000000",
    "status": "available",
    "coin_status": "online"
  },
  "POT": {
    "balance": 499594333,
    "balancef": "4.99594333",
    "status": "available",
    "coin_status": "online"
  }
}
```

- `balance` - The coin balance as an integer (in Satoshis).
- `balancef` - The coin balance as a floating point number.
- `status` - `available` or `unavailable`
- `coin_status` - Cloud wallet/network status `online` or `offline`

[back to top](#table)

<a name="getdeposit" />

## Get Deposit Address

Get a deposit address. This action does not include a fee and will **not trigger IPN**

Official doc: https://www.coinpayments.net/apidoc-get-deposit-address

```typescript
interface CoinpaymentsGetDepositAddressOpts {
  currency: string;
}
await client.getDepositAddress(options: CoinpaymentsGetDepositAddressOpts)
```

- `currency` - Any enabled currency. e.g 'BTC'

**Example response from server**

```json
{
  "address": "1BitcoinAddress"
}
```

- `address` - Deposit address

[back to top](#table)

<a name="getcallback" />

## Get Callback Address

Get a callback address. This action does a fee and will trigger IPN.

Official doc: https://www.coinpayments.net/apidoc-get-deposit-address

```typescript
interface CoinpaymentsGetCallbackAddressOpts {
  currency: string
  ipn_url?: string
  label?: string
  eip55?: number
}
await client.getCallbackAddress(options: CoinpaymentsGetCallbackAddressOpts)
```

- `currency` - Any enabled currency. e.g 'BTC'
- `ipn_url` - Explicit URL for the IPN to send POST requests to.
- `label` - Optionally sets the address label.
- `eip55` - If set to 1 encodes the address in EIP-55 mixed case format for ETH/ERC20 + clones. This is safely ignored for other coin types.

Example response from server

```json
{
  "address": "1BitcoinAddress"
}
```

- `address` - Callback address

[back to top](#table)

<a name="createtransaction" />

## Create Transaction

Create Transaction

Official doc: https://www.coinpayments.net/apidoc-create-transaction

```typescript
interface CoinpaymentsCreateTransactionOpts {
  currency1: string
  currency2: string
  amount: number
  buyer_email: string
  address?: string
  buyer_name?: string
  item_name?: string
  item_number?: string
  invoice?: string
  custom?: string
  ipn_url?: string
  success_url?: string
  cancel_url?: string
}
await client.createTransaction(options: CoinpaymentsCreateTransactionOpts)
```

- `currency1` - The original currency (displayed currency) in which the price is presented
- `currency2` - The currency the buyer will be sending.
- `amount` - Expected amount to pay, where the price is expressed in `currency1`
- `buyer_email` - Set the buyer's email address. This will let us send them a notice if they underpay or need a refund. We will not add them to our mailing list or spam them or anything like that.

If `currency1` is not equal to `currency2` the expected payment amount in the response of the request will auto convert to the expected amount in `currency2`

- `address` - Address to send the funds to ( if not set, it will use the wallet address of your coinpayments cloud wallet ) **Must be payment address from** `currency2` **network**
- `buyer_name` - Set buyer name for your reference
- `item_name` - Set item name for your reference, included in IPN
- `item_number` - Set item number for your reference, included in IPN
- `invoice` - Custom field, included in IPN
- `custom` - Custom field, included in IPN
- `ipn_url` - explicit URL for the IPN to send POST requests to.
- `success_url` - Sets a URL to go to if the buyer does complete payment. (Only if you use the returned 'checkout_url', no effect/need if designing your own checkout page.)
- `cancel_url` - Sets a URL to go to if the buyer does not complete payment. (Only if you use the returned 'checkout_url', no effect/need if designing your own checkout page.)

**Example Response from server**

```json
{
  "amount": "1.21825881",
  "txn_id": "d17a8ee84b1de669bdd0f15b38f20a7e9781d569d20c096e49983ad9ad40ce4c",
  "address": "PVS1Xo3xCU2MyXHadU2EbhFZCbnyjZHBjx",
  "confirms_needed": "5",
  "timeout": 5400,
  "checkout_url": "https://www.coinpayments.net/index.php?cmd=checkout&id=CPED3H7GIFTDRZ4AICVZXGXZ
WH&key=4d7321119c0a533250de336138d4bb14",
  "status_url": "https://www.coinpayments.net/index.php?cmd=status&id=CPED3H7GIFTDRZ4AICVZXGXZWH
&key=4d7321119c0a533250de336138d4bb14",
  "qrcode_url": "https://www.coinpayments.net/qrgen.php?id=CPED3H7GIFTDRZ4AICVZXGXZWH&key=4d7321
119c0a533250de336138d4bb14"
}
```

- `amount` - The amount for the buyer to send in the destination currency (currency2).
- `address` - The address the buyer needs to send the coins to.
- `txn_id` - The CoinPayments.net transaction ID.
- `confirms_needed` - The number of confirms needed for the transaction to be complete.
- `timeout` - How long the buyer has to send the coins and have them be confirmed in seconds.
- `checkout_url` - While normally you would be designing the full checkout experience on your site you can use this URL to provide the final payment page to the buyer.
- `status_url` - A URL where the buyer can view the payment progress and leave feedback for you.
- `qrcode_url` - A URL to a generated QR code.

[back to top](#table)

<a name="gettx" />

## Get Transaction Info

Query the server for transaction and returns the status of the payment.

Official doc: https://www.coinpayments.net/apidoc-get-tx-info

```typescript
interface CoinpaymentsGetTxOpts {
  txid: string
  full?: number
}
await client.getTx(options: CoinpaymentsGetTxOpts)
```

- `txid` - Transaction hash value
- `full` - Set to `1` to also include the raw checkout and shipping data for the payment if available. (default: `0`)

Example Response from server:

```json
{
  "time_created": 1424436678,
  "time_expires": 1424442078,
  "status": 0,
  "status_text": "Waiting for buyer funds...",
  "type": "coins",
  "coin": "POT",
  "amount": 121700023,
  "amountf": "1.21700023",
  "received": 0,
  "receivedf": "0.00000000",
  "recv_confirms": 0,
  "payment_address": "PWP4gKLRLVQv9dsvcN4sZn5pZaKQGothXm"
}
```

- `time_created` - The time the transaction request was created.
- `time_expires` - The time the transaction request expires.
- `status` - Status of the payment (-1 = Cancelled, 0 = Pending, 1 == Success)
- `status_text` - Status expressed in human readable text.
- `type` - fiat or coins
- `amount` - Amount to send (in Satoshis).
- `amountf` - Amount to send (as a floating point number).
- `received` - Received amount (in Satoshis).
- `receivedf` - Received amount (as a floating point number).
- `recv_confirms` - Received confirms.
- `payment_address` - Address to send the fund to.

[back to top](#table)

<a name="gettxmulti" />

## Get Transaction Multi

Get multiple transaction status.

Official doc: https://www.coinpayments.net/apidoc-get-tx-info

```typescript
type CoinpaymentsGetTxMultiOpts = string[];

await client.getTxMulti(txn_id_array: CoinpaymentsGetTxMultiOpts)
```

- `txn_id_array` - Array of transaction ids.

Example response from server

```json
"CPBF23CBUSHKKOMV1OPMRBNEFV": {
  "error": "ok",
  "amount": "1.21825881",
  "txn_id": "d17a8ee84b1de669bdd0f15b38f20a7e9781d569d20c096e49983ad9ad40ce4c",
  "address": "PVS1Xo3xCU2MyXHadU2EbhFZCbnyjZHBjx",
  "confirms_needed": "5",
  "timeout": 5400,
  "checkout_url": "https://www.coinpayments.net/index.php?cmd=checkout&id=CPED3H7GIFTDRZ4AICVZXGXZ
WH&key=4d7321119c0a533250de336138d4bb14",
  "status_url": "https://www.coinpayments.net/index.php?cmd=status&id=CPED3H7GIFTDRZ4AICVZXGXZWH
&key=4d7321119c0a533250de336138d4bb14",
  "qrcode_url": "https://www.coinpayments.net/qrgen.php?id=CPED3H7GIFTDRZ4AICVZXGXZWH&key=4d7321
119c0a533250de336138d4bb14"
},
...
```

- `Object.keys(response) -> ids` - Transaction IDs
- `response[id]` - Object same as getTx with transaction information.

[back to top](#table)

<a name="gettxlist" />

## Get Transaction List

Get a list of transaction ids.

Official doc: https://www.coinpayments.net/apidoc-get-tx-ids

```typescript
interface CoinpaymentsGetTxListOpts {
  limit?: string
  start?: string
  newer?: string
  all?: string
}
await client.getTxList(options: CoinpaymentsGetTxListOpts)
```

- `limit` - The maximum number of transaction IDs to return from 1-100. (default: 25)
- `start` - What transaction # to start from (for iteration/pagination.) (default: 0, starts with your newest transactions.)
- `newer` - Return transactions started at the given Unix timestamp or later. (default: 0)
- `all` - By default we return an array of TX IDs where you are the seller for use with get_tx_info_multi or get_tx_info. If all is set to 1 returns an array with TX IDs and whether you are the seller or buyer for the transaction.

**Example response from server**

```json
[
  "CPBF23CBUSHKKOMV1OPMRBNEFV",
  "CPBF4COHLYGEZZYIGFDKFY9NDP",
  "CPBF6BFPJTSLC3Z49CT82NVYJ8",
  "CPBF2L8QSXIG2YGKLVO5N0WTXJ",
  ...
]
```

Each element in the array represents a `txn_id`

[back to top](#table)

<a name="get-conversion-limits" />

## Get Conversion Limits

Get conversion limits.

Official doc: https://www.coinpayments.net/apidoc-convert-limits

```typescript
interface CoinpaymentsConvertLimitsOpts {
  from: string
  to: string
}
await client.convertLimits(options: CoinpaymentsConvertLimitsOpts)
```

- `from` - From currency.
- `to` - To currency.

Example response from server

```json
{
  "min": "0.00301250",
  "max": "0.80637488",
  "shapeshift_linked": true
}
```

- `min` - Min conversion
- `max` - Max conversion
- `shapeshift_linked` - Unknown

_Note1_ that a 'max' value of 0.00000000 is valid and means there is no known upper limit available.

_Note2_: Due to provider fluctuation limits do vary often.

[back to top](#table)

<a name="convertcoins" />

## Convert Coins

Convert coins. Coinpayments utilizes [Shapeshift.io](https://shapeshift.io) services.

Official doc: https://www.coinpayments.net/apidoc-convert-limits

```typescript
await client.convertCoins(options)
```

- `amount` - The amount convert in the 'from' currency below.
- `from` - From currency.
- `to` - To currency.
- `address` - The address to send the funds to. If blank or not included the coins will go to your CoinPayments Wallet.
- `dest_tag` - The destination tag to use for the withdrawal (for Ripple.) If 'address' is not included this has no effect.

Example response from server

```json
{
  "id": "id"
}
```

- `id` - Conversion transaction ID

[back to top](#table)

<a name="createtransfer" />

## Create Transfer

Transfers are performed as internal coin transfers/accounting entries when possible. For coins not supporting that ability a withdrawal is created instead.

Official doc: https://www.coinpayments.net/apidoc-create-transfer

```typescript
interface CoinpaymentsCreateTransferBaseOpts {
  amount: number
  currency: string
  auto_confirm?: boolean
  note?: string
}

interface CoinpaymentsCreateTransferMerchantOpts
  extends CoinpaymentsCreateTransferBaseOpts {
  merchant: string
}

interface CoinpaymentsCreateTransferTagOpts
  extends CoinpaymentsCreateTransferBaseOpts {
  pbntag: string
}

type CoinpaymentsCreateTransferOpts =
  | CoinpaymentsCreateTransferMerchantOpts
  | CoinpaymentsCreateTransferTagOpts;

await client.createTransfer(options: CoinpaymentsCreateTransferOpts)
```

- `amount` - The amount of the transfer in the currency below.
- `currency` - The cryptocurrency to withdraw. (BTC, LTC, etc.)
- `merchant` - The merchant ID to send the funds to, either this OR pbntag must be specified. Remember: this is a merchant ID and not a username.
- `pbntag` - The \$PayByName tag to send the funds to, either this OR merchant must be specified.
- `auto_confirm` - If set to `0` the withdrawal will require an email confirmation in order for withdraw funds to go forth. (default `1`)
- `note` - This lets you set the note for the withdrawal.

Example response from server

```json
{
  "id": "string",
  "status": 0
}
```

- `id` - The CoinPayments transfer/withdrawal ID. (This is not a coin network TX ID.)
- `status` - status = `0` or `1`. `0` = Transfer created, waiting for email confirmation. `1` = Transfer created with no email confirmation needed.

[back to top](#table)

<a name="createwithdrawal" />

## Create Withdrawal

Makes a withdrawal of funds from server to a determined wallet address.

Official doc: https://www.coinpayments.net/apidoc-create-withdrawal

```typescript
export interface CoinpaymentsCreateWithdrawalBaseOpts {
  amount: number
  add_tx_fee?: number
  currency: string
  currency2?: string
  dest_tag?: string
  ipn_url?: string
  auto_confirm?: number
  note?: string
}

export interface CoinpaymentsCreateWithdrawalMerchantOpts
  extends CoinpaymentsCreateWithdrawalBaseOpts {
  address: string
}

export interface CoinpaymentsCreateWithdrawalTagOpts
  extends CoinpaymentsCreateWithdrawalBaseOpts {
  pbntag: string
}

export type CoinpaymentsCreateWithdrawalOpts =
  | CoinpaymentsCreateWithdrawalMerchantOpts
  | CoinpaymentsCreateWithdrawalTagOpts;

await client.createWithdrawal(options: CoinpaymentsCreateWithdrawalOpts)
```

- `amount` - The amount to withdraw
- `currency` - The currency to withdraw
- `add_tx_fee` - If set to `1`, add the coin TX fee to the withdrawal amount so the sender pays the TX fee instead of the receiver.
- `pbntag` - The \$PayByName tag to send the funds to, either this OR merchant must be specified.
- `address` - Wallet address to send the funds to. \*\*Must be wallet address from the same network as = `currency`
- `auto_confirm` - If set to `0` the withdrawal will require an email confirmation in order for withdraw funds to go forth. (default `1`)
- `ipn_url` - explicit URL for the IPN to send POST requests to.
- `note` - This lets you set the note for the withdrawal.

Example Response from server:

```json
{
  "id": "98a5ff631da2089985594789dc9fb85648596599816ac8ce1ce00fd082798967",
  "amount": "1.00000000",
  "status": 0
}
```

- `id` - The CoinPayments.net withdrawal ID.
- `amount` - Amount to be withdrawn
- `status` - `0` or `1`. `0` = Withdrawal created, waiting for email confirmation. `1` = Withdrawal created with no email confirmation needed

[back to top](#table)

<a name="createmasswithdrawal" />

## Create Mass Withdrawal

Create a mass withdrawal

Official doc: https://www.coinpayments.net/apidoc-create-withdrawal

```typescript
interface CoinpaymentsCreateMassWithdrawalElement {
  amount: number | string
  currency: string
  address: string
  dest_tag?: string
}
type CoinpaymentsCreateMassWithdrawalOpts = CoinpaymentsCreateMassWithdrawalElement[];

await client.createMassWithdrawal(withdrawalArray: CoinpaymentsCreateMassWithdrawalOpts);
```

- `amount` - Every withdrawal object needs to have amount of currency below.
- `address` - Every withdrawal object needs to have address to withdraw funds to.
- `currency` - Every withdrawal object needs to have currency.
- `dest_tag` - Some currencies need dest_tag in order to withdraw.

Example response from server

```json
{
  "wd1": {
    "error": "ok",
    "id": "CWBF3UECUQFCCNFIRUS73G5VON",
    "status": 1,
    "amount": "1.00000000"
  },
  "wd2": { "error": "That amount is larger than your balance!" }
```

- `wd[n]` - Represents mapped withdrawalArray
- `wd[n].error` - Error
- `wd[n].status` - status = `0` or `1`. `0` = Withdrawal created, waiting for email confirmation. `1` = Withdrawal created with no email confirmation needed.
- `wd[n].amount` - Withdrawal amount

[back to top](#table)

<a name="getwithdrawalinfo" />

## Get Withdrawal Info

Query the server for Withdraw ID status.

Official doc: https://www.coinpayments.net/apidoc-get-withdrawal-info

```typescript
interface CoinpaymentsGetWithdrawalInfoOpts {
  id: string
}
await client.getWithdrawalInfo(options: CoinpaymentsGetWithdrawalInfoOpts)
```

- `id` - Withdrawal id.

**Example Response from server**

```json
{
  "time_created": 1424436465,
  "status": 2,
  "status_text": "Complete",
  "coin": "POT",
  "amount": 10000000000,
  "amountf": "100.00000000",
  "send_address": "PVtAyX2HgVmYk8BCw9NGvtaDNdkX2phrVA",
  "send_txid": "b601e7839c4c237f0fac36e93f98d648cfec402b8f8dbce617c675dac247599e"
}
```

- `time_created` - The time the withdrawal request was submitted.
- `status` - The status of the withdrawal (`-1` = Cancelled, `0` = Waiting for email confirmation, `1` = Pending, `2` = Complete).
- `status_text` - The status of the withdrawal in text format.
- `coin` - The ticker symbol of the coin for the withdrawal.
- `amount` - The amount of the withdrawal (in Satoshis).
- `amountf` - The amount of the withdrawal (as a floating point number).
- `send_address` - The address the withdrawal was sent to. (only in response if status == `2`)
- `send_txid` - The coin TX ID of the send. (only in response if status == `2`)

[back to top](#table)

<a name="getwithdrawalhistory" />

## Get Withdrawal History

Get withdrawal histroy

Official doc: https://www.coinpayments.net/apidoc-get-withdrawal-history

```typescript
interface CoinpaymentsGetWithdrawalHistoryOpts {
  limit?: number
  start?: number
  newer?: Date
}
await client.getWithdrawalHistory(options?: CoinpaymentsGetWithdrawalHistoryOpts)
```

- `limit` - The maximum number of withdrawals to return from 1-100. (default: 25)
- `start` - What withdrawals # to start from (for iteration/pagination.) (default: 0, starts with your newest withdrawals.)
- `newer` - Return withdrawals submitted at the given Unix timestamp or later. (default: 0)

**Example response from server**

```json
[
  {
    "id": "CWBF3UECUQFCCNFIRUS73G5VON",
    "time_created": 1498437967,
    "status": 2,
    "status_text": "Complete",
    "coin": "POT",
    "amount": 100000000,
    "amountf": "1.00000000",
    "send_address": "PTVFPeSvccpdnT5PTyXrfU5XR6UShcRJYt",
    "send_txid": "1e5be68fdac7acafb68082099ba4d1ca2c881866ce8ee575202419ad1ff55bd8"
  },
  {
    "id": "CWBF0ZRSKG8R4ASD7JFXFIS5YH",
    "time_created": 1498429199,
    "status": 2,
    "status_text": "Complete",
    "coin": "POT",
    "amount": 10000000,
    "amountf": "0.10000000",
    "send_address": "PMmPaNBzQEmJSZ6XYSDeXYxAC8MVJx3nGM",
    "send_txid": "8d990f0a833c8c61177ed0b0a7e5ff2e3fa03cc28a9cf5d1dfb171c45b0712c3"
  }
]
```

[back to top](#table)

<a name="claimtag" />

## Claim tag

Claim \$PayByName Tag

Official doc: https://www.coinpayments.net/apidoc-claim-pbn-tag

```typescript
interface CoinpaymentsClaimTagOpts {
  tagid: string
  name: string
}
await client.claimTag(options: CoinpaymentsClaimTagOpts)
```

- `tagid` - Unique tag ID
- `name` - Name for the tag; for example a value of 'Apple' would be the PayByName tag \$Apple. Make sure to use the case you want the tag displayed with

[back to top](#table)

<a name="gettaglist" />

## Get Tag list

Get a list of owned tags.

Official doc: https://www.coinpayments.net/apidoc-get-pbn-list

```typescript
await client.tagList()
```

**Example response from server**

```json
[
  {
    "tagid": "e893b55c2216a20e6761b1a9f32409df",
    "pbntag": "Test1",
    "time_expires": 2147483647
  },
  {
    "tagid": "4293b55c2216a20e6761b1a9f32409de",
    "pbntag": "Test2",
    "time_expires": 2147483647
  },
  {
    "tagid": "35df17c48fc16cff8dcee35cedd42d2d",
    "pbntag": "",
    "time_expires": 1497037845
  }
]
```

- `tagid` - This is the unique identifier of the tag in the system. This is the identifier you will use with the 'update_pbn_tag' and 'claim_pbn_tag' API calls.
- `pbntag` - This is the $PayByName tag. An empty string means the tag is unclaimed. (Note that the tags do not have a $ at the front.)
- `time_expires` - The time (Unix timestamp) of when the tag expires.

[back to top](#table)

<a name="updatetagprofile" />

## Update Tag Profile

Update \$PayByName Profile

Official doc: https://www.coinpayments.net/apidoc-update-pbn-tag

```typescript
interface CoinpaymentsUpdateTagProfileOpts {
  tagid: string
  name?: string
  email?: string
  url?: string
}
await client.updateTagProfile(options: CoinpaymentsUpdateTagProfileOpts)
```

- `tagid` - Unique tag ID
- `name` - Name for the profile. If field is not supplied the current name will be unchanged.
- `email` - Email for the profile. If field is not supplied the current name will be unchanged.
- `url` - Website URL for the profile. If field is not supplied the current name will be unchanged.

[back to top](#table)

<a name="renewtag" />

## Renew Tag

Renew Tag

Official doc: https://www.coinpayments.net/apidoc-renew-pbn-tag

```typescript
interface CoinpaymentsRenewTagOpts {
  tagid: string
  coin: string
  years?: number
}
await client.renewTag(options: CoinpaymentsRenewTagOpts)
```

- `tagid` - Unique tag ID
- `coin` - The coin to purchase the renewal with
- `years` - The number of years to renew the tag for. (Default: `1`)

[back to top](#table)

<a name="deletetag" />

## Delete Tag

Delete Tag

Official doc: https://www.coinpayments.net/apidoc-delete-pbn-tag

```typescript
interface CoinpaymentsDeleteTagOpts {
  tagid: string
}
await client.deleteTag(options: CoinpaymentsDeleteTagOpts)
```

- `tagid` - Unique tag ID

[back to top](#table)

<a name="buytag" />

## Buy Tag

Buy Tag

Official doc: https://www.coinpayments.net/apidoc-buy-pbn-tags

```typescript
interface CoinpaymentsBuyTagOpts {
  coin: string
  num?: number
}
await client.buyTag(options: CoinpaymentsBuyTagOpts)
```

- `coin` - The coin to purchase the renewal with.
- `num` - The number of tags to buy: `1`, `5`, or `10`. (Default: `1`)

[back to top](#table)

<a name="claimcoupon" />

## Claim coupon

Claim coupon

Official doc: https://www.coinpayments.net/apidoc-claim-pbn-coupon

```typescript
interface CoinpaymentsClaimCouponOpts {
  coupon: string
}
await client.claimCoupon(options: CoinpaymentsClaimCouponOpts)
```

- `coupon` - The coupon code to redeem.

[back to top](#table)

<a name="ipn" />

## Instant payment notifications

This is a separate npm package.
[coinpayments-ipn](https://github.com/OrahKokos/coinpayments-ipn)

<a name="license" />

## License

The MIT License (MIT)

Copyright (c) 2015-present Marko Paroški

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[back to top](#table)

<?php
include 'sql.php';

$cp_merchant_id = '8d5f5959b02d7dc67c0a34d6b1a9fff7';
$cp_ipn_secret = 'nIkolas13n';

if (!isset($_POST['ipn_mode']) || $_POST['ipn_mode'] != 'hmac') die('IPN Error: IPN Mode is not HMAC.');

if (!isset($_SERVER['HTTP_HMAC']) || empty($_SERVER['HTTP_HMAC'])) die('IPN Error: No HMAC signature sent.');

$request = file_get_contents('php://input');
if ($request === FALSE || empty($request)) die('IPN Error: Error reading POST data.');

if (!isset($_POST['merchant']) || $_POST['merchant'] != trim($cp_merchant_id)) die('IPN Error: No or incorrect Merchant ID passed.');

$hmac = hash_hmac("sha512", $request, trim($cp_ipn_secret));
if ($hmac != $_SERVER['HTTP_HMAC']) die('IPN Error: HMAC signature does not match.');

error_log("\nIPN Received\n", 3, "/var/tmp/coinpayments_logs.log");
error_log($_POST['ipn_type'] . "\n", 3, "/var/tmp/coinpayments_logs.log");
error_log($_POST['txn_id'] . "\n", 3, "/var/tmp/coinpayments_logs.log");
error_log($_POST['address'] . "\n", 3, "/var/tmp/coinpayments_logs.log");
error_log($_POST['status'] . "\n", 3, "/var/tmp/coinpayments_logs.log");
error_log($_POST['status_text'] . "\n", 3, "/var/tmp/coinpayments_logs.log");
error_log($_POST['currency'] . "\n", 3, "/var/tmp/coinpayments_logs.log");
error_log($_POST['amount'] . "\n", 3, "/var/tmp/coinpayments_logs.log");
error_log($_POST['fee'] . "\n", 3, "/var/tmp/coinpayments_logs.log");

$type = $_POST['ipn_type'];
$txnid = $_POST['txn_id'];
$address = $_POST['address'];
$status = intval($_POST['status']);
$currency = $_POST['currency'];
$value = $_POST['amount'];
$fee = 0;
if(isset($_POST['fee'])) $fee = $_POST['fee'];

if($type == 'deposit'){
	$sql_transaction = $db->query('SELECT * FROM `crypto_transactions` WHERE `txnid` = '.$db->quote($txnid));
	
	if ($sql_transaction->rowCount() == 0) {
		$sql_address = $db->query('SELECT * FROM `users` INNER JOIN `crypto_addresses` ON users.userid = crypto_addresses.userid WHERE crypto_addresses.address = '.$db->quote($address));
		if ($sql_address->rowCount() > 0) {
			$row_address = $sql_address->fetch();
			
			$db->exec('INSERT INTO `crypto_transactions` SET `type` = '.$db->quote('deposit').', `userid` = '.$db->quote($row_address['userid']).', `name` = '.$db->quote($row_address['name']).', `avatar` = '.$db->quote($row_address['avatar']).', `xp` = '.$db->quote($row_address['xp']).', `txnid` = '.$db->quote($txnid).', `address` = '.$db->quote($address).', `status` = '.$db->quote($status).', `currency` = '.$db->quote($currency).', `value` = '.$db->quote($value).', `fee` = '.$db->quote($fee).', `time` = '.$db->quote(time()));
		}
	} else {
		$row_transaction = $sql_transaction->fetch();
		
		if($row_transaction['status'] == 0) $db->exec('UPDATE `crypto_transactions` SET `status` = '.$db->quote($status).', `currency` = '.$db->quote($currency).', `value` = '.$db->quote($value).', `fee` = '.$db->quote($fee).', `time` = '.$db->quote(time()).' WHERE `txnid` = '.$db->quote($txnid));
	}
} else if($type == 'withdrawal'){
	$sql_transaction = $db->query('SELECT * FROM `crypto_transactions` WHERE `address` = '.$db->quote($address).' AND `type` = '.$db->quote('withdraw').' AND `inspected` = 0 LIMIT 1');
	
	if ($sql_transaction->rowCount() > 0) {
		$row_transaction = $sql_transaction->fetch();
		
		if($row_transaction['status'] == 1) $db->exec('UPDATE `crypto_transactions` SET `txnid` = '.$db->quote($txnid).', `status` = '.$db->quote($status).', `currency` = '.$db->quote($currency).', `value` = '.$db->quote($value).', `fee` = '.$db->quote($fee).', `time` = '.$db->quote(time()).' WHERE `address` = '.$db->quote($address).' AND `type` = '.$db->quote('withdraw').' AND `inspected` = 0 LIMIT 1');
	}
}
?>

<?php
require_once $_SERVER["DOCUMENT_ROOT"].'/core/config.php';

$Config = new Config();
$DataBase = new DataBase();
$Metamask = new Metamask();

$DataBase->Query("SELECT * FROM `crypto_transactions` WHERE type = 'metamask' AND status = 0");
$DataBase->Execute();

foreach($DataBase->ResultSet() as $ms => $row) {
    $txid = $row['txnid'];
    $userid = $row["userid"];
    $value = $row["value"];
    $oneDayAgo = time() - (24 * 60 * 60);

    $DataBase->Query("SELECT txnid FROM `crypto_transactions` WHERE type = 'metamask' AND status = 0 AND time < :oneDayAgo");
    $DataBase->Bind(":oneDayAgo", $oneDayAgo);
    $DataBase->Execute();

    $transaction = $Metamask->checkTransactionStatus($txid);
    
    if($transaction == true) {
        $DataBase->Query("UPDATE `crypto_transactions` SET status = 1 WHERE txnid = :txnid");
        $DataBase->Bind(":txnid", $txid);
        $DataBase->Execute();

        $DataBase->Query("UPDATE users SET balance = balance + :amount WHERE userid = :userid");
        $DataBase->Bind(":userid", $userid);
        $DataBase->Bind(":amount", $value);
        $DataBase->Execute();
    }
}
?>
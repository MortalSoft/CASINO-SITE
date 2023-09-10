<?php
require_once $_SERVER["DOCUMENT_ROOT"].'/core/config.php';

$DataBase = new DataBase();
$Config = new Config();
$tokenwebhook = $Config->api("mortalsoft")["secret"];

$id = $_GET['identifier'] ?? null;
$newBalance = $_GET['new_balance'] ?? null;
$oldBalance = $_GET['old_balance'] ?? null;
$token = $_GET['token'] ?? null;

if ($token != $tokenwebhook) {
    http_response_code(401);
    exit('Invalid token');
}

if (!$id || !$newBalance) {
    http_response_code(402);
    exit('Invalid payload');
}


try {

    $DataBase->Query("UPDATE users SET balance = :newBalance WHERE userid = :idd");
    $DataBase->Bind(":newBalance", $newBalance);
    $DataBase->Bind(":idd", $id);
    $updateBal = $DataBase->Execute();

    if (floatval($newBalance) >= floatval($oldBalance)) {
        $amount = floatval($newBalance) - floatval($oldBalance);
    } else {
        $amount = floatval($oldBalance) - floatval($newBalance);
    }
        
    $xp = intval(round($amount,2) * 100);

    if (date('w') == 0 || date('w') == 6) {
        $xp *= 2;
    }

    $DataBase->Query("UPDATE users SET xp = xp + :newXP WHERE userid = :idd");
    $DataBase->Bind(":newXP", $xp);
    $DataBase->Bind(":idd", $id);
    $updatexp = $DataBase->Execute();

    $DataBase->Query("INSERT INTO `slots_bets` SET `userid` = :userid, `xp` = :xp, `amount` = :amount, `game` = :game, `time` = :time");
    $DataBase->Bind(':userid',  $id);
    $DataBase->Bind(':xp', $xp);
    $DataBase->Bind(':amount', $amount);
    $DataBase->Bind(':game', "Slots");
    $DataBase->Bind(':time', time());

    $trans = $DataBase->execute();

    if ($updateBal && $trans && $updatexp) {
        http_response_code(200);
        echo 'User balance updated successfully';
    } else {
        http_response_code(502);
        echo 'Something went wrong';
    }
} catch (PDOException $e) {
    http_response_code(501);
    exit('Database connection failed');
}
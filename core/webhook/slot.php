<?php
//error_log(E_ALL);
include $_SERVER["DOCUMENT_ROOT"].'/core/sql.php';

$tokenwebhook = '1231231414';

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
    $idd = $db->quote($id);
    $newBalance = $db->quote($newBalance);

    $updateQuery = "UPDATE users SET balance = $newBalance WHERE userid = $idd";

    $updateBal = $db->exec($updateQuery);

    if (floatval($newBalance) >= floatval($oldBalance)) {
        $amount = floatval($newBalance) - floatval($oldBalance);
    } else {
        $amount = floatval($oldBalance) - floatval($newBalance);
    }
        
    $xp = intval(round($amount,2) * 100);

    if (date('w') == 0 || date('w') == 6) {
        $xp *= 2;
    }

    $query = "INSERT INTO `slots_bets` SET `userid` = :userid, `xp` = :xp, `amount` = :amount, `game` = :game, `time` = :time";
    $updateTrans = $db->prepare($query);

    $updateTrans->bindParam(':userid',  $id);
    $updateTrans->bindParam(':xp', $xp, PDO::PARAM_INT);
    $updateTrans->bindParam(':amount', $amount);
    $updateTrans->bindValue(':game', "Slots", PDO::PARAM_STR);
    $updateTrans->bindParam(':time', time());

    $trans = $updateTrans->execute();

    if ($updateBal !== false && $trans !== false) {
        http_response_code(200);
        echo 'User balance updated successfully';
    } else {
        http_response_code(502);
        echo 'Error updating user balance: ' . $db->errorInfo()[2];
    }
} catch (PDOException $e) {
    http_response_code(501);
    exit('Database connection failed');
}
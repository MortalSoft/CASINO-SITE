<?php

    include_once($_SERVER['DOCUMENT_ROOT'].'/conf.php');

    $db = db();

    $error_msg = "Unknown error";
    $auth_ok = false;
    $request_data = null;

    if (isset($_SERVER['HTTP_X_NOWPAYMENTS_SIG']) && !empty($_SERVER['HTTP_X_NOWPAYMENTS_SIG'])) {
        $recived_hmac = $_SERVER['HTTP_X_NOWPAYMENTS_SIG'];
        $request_json = file_get_contents('php://input');
        $request_data = json_decode($request_json, true);
        ksort($request_data);
        $sorted_request_json = json_encode($request_data, JSON_UNESCAPED_SLASHES);
        if ($request_json !== false && !empty($request_json)) {
            $hmac = hash_hmac("sha512", $sorted_request_json, trim("nhbOa3nOxotZ/1Byvl5zdCIqZr+nKaUy"));
            if ($hmac == $recived_hmac) {
                if($request_data["payment_status"]=="finished") {

                    $pstatus = $db->prepare("SELECT * FROM w_payments WHERE txid = :txid AND status = 0");
                    $pstatus->execute(["txid" => $request_data["payment_id"]]);

                    if($pstatus->rowCount() > 0) {

                        $payment = $db->prepare("UPDATE w_payments SET status=:status WHERE txid=:invoice");
                        $payment->execute(['status' => 1, 'txid' => $request_data["payment_id"]]);

                        $payment = $db->prepare("UPDATE w_users SET balance=balance+:payam WHERE id=:uid");
                        $payment->execute(["uid"=>$pstatus["user_id"], "payam" => $request_data["price_amount"]]);

                        /*
                        $request_data["pay_amount"]
                        $request_data["pay_currency"]
                        */
                    }
                }
            } else {
                $error_msg = 'HMAC signature does not match';
            }
        } else {
            $error_msg = 'Error reading POST data';
        }
    } else {
        $error_msg = 'No HMAC signature sent.';
    }
/*{
    "id": "4522625843",
  "order_id": "RGDBP-21314",
  "order_description": "Apple Macbook Pro 2019 x 1",
  "price_amount": "1000",
  "price_currency": "usd",
  "pay_currency": null,
  "ipn_callback_url": "https://nowpayments.io",
  "invoice_url": "https://nowpayments.io/payment/?iid=4522625843",
  "success_url": "https://nowpayments.io",
  "cancel_url": "https://nowpayments.io",
  "created_at": "2020-12-22T15:05:58.290Z",
  "updated_at": "2020-12-22T15:05:58.290Z"
}
*/

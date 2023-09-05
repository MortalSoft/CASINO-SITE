<?php 
header('Content-Type: application/json');

require_once $_SERVER["DOCUMENT_ROOT"].'/core/config.php';

$api = $_GET["action"] ?? null;

switch($api) {
    case "currentPrice":
        $Metamask = new Metamask();
        $Other = new Other();
        $Config = new Config();
        $Settings = $Config->settings();


        if(isset($_GET["contractaddr"]) && isset($_GET["amount"])) {
            $contractaddr = $_GET["contractaddr"];
            $amount = $_GET["amount"];            
            $currency = $Settings["currency"];

            $rows = array();
            $rows["price"] = $Other->convertCurrency(floatval($Metamask->getPrice($contractaddr, $amount, "usd")), $currency);
            $rows["amount"] = $amount;
            $rows["vault"] = $currency;
            $rows["status"] = "ok";

            echo json_encode($rows, JSON_PRETTY_PRINT);
            die();
        } else {
            $rows = array();
            $rows["status"] = "error";
            $rows["messages"] = "Invalid parameters!";
            echo json_encode($rows, JSON_PRETTY_PRINT);
            die();
        }
    break;
    case "getTokenContract": 
        $Metamask = new Metamask();

        if(isset($_GET["short"])) {
            $short = $_GET["short"];           

            $rows = array();
            $rows["contract"] = $Metamask->getContract($short);

            echo json_encode($rows, JSON_PRETTY_PRINT);
            die();
        } else {
            $rows = array();
            $rows["status"] = "error";
            $rows["messages"] = "Invalid parameters!";
            echo json_encode($rows, JSON_PRETTY_PRINT);
            die();
        }
    break;
    case "NewNow":
       /* $db = new DataBase();
        $config = new Config();
        $api = new NowPaymentsAPI();

        if($_GET["process"]=="pay" && isset($_GET["currency"]) && isset($_GET["amount"]) && isset($_GET["token"]) && isset($_GET["uid"])) {

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL,"https://www.google.com/recaptcha/api/siteverify");
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(array('secret' => "6LdDf2kkAAAAAPFq4PWLOpp4GnA4eAcZjwkF2VkE", 'response' => $_GET["token"])));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            curl_close($ch);
            $arrResponse = json_decode($response, true);
        
            if($arrResponse["success"] == '1') {
                $payment = $api->createPayment(["price_amount"=>$_GET["amount"],"price_currency"=>"usd", "pay_currency"=>$_GET["currency"], "ipn_callback_url" => "https://".$_SERVER['HTTP_HOST']."/payment/nowpayments/callback"]);

                if($payment) {
                    $data = json_decode($payment, true);
        
                    $invoice = $db->prepare("INSERT INTO w_payments (user_id, sum, currency, system, credit_id, status, shop_id, txid, payamount, paycurrency) VALUES (:uid, :sum, :curr, :system, :creditid, :status, :shopid, :txid, :payamount, :paycurrency)");
                    $invoice->execute(["uid" => $_GET["uid"], "sum" => $_GET["amount"], "curr" => "USD", "system" => "CRYPTO", "creditid" => "0", "status" => 0, "shopid" => 1, "txid" =>  $data["payment_id"], "payamount" => $data["pay_amount"], "paycurrency" => strtoupper($_GET["currency"])]);
                }
                print_r($payment);
            }
        } */
    break;
    case "pix":
            $Other = new Other();
            $DataBase = new DataBase();
            $Config = new Config();
            $Settings = $Config->settings();
            $MainCurrency = $Settings["currency"];

            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            $payment = $data['payment'];

            if(isset($payment['status']) && $payment['status'] == "CONFIRMED") {
                if(isset($payment['correlationID'])) {
                    $DataBase->Query("UPDATE `transaction` SET status = :status WHERE id = :id");
                    $DataBase->Bind(":status", 1);
                    $DataBase->Bind(":id", $payment['correlationID']);

                    if($DataBase->Execute()) {
                        $DataBase->Query("SELECT * FROM `transaction` WHERE id = :id");
                        $DataBase->Bind(":id", $payment['correlationID']);
                        $DataBase->Execute();
                        $transaction = $DataBase->Single();
                        $userid = $transaction["userid"];

                        $amount = $Other->convertCurrency(floatval($transaction["amount"]), $transaction["amount"], true);

                        $DataBase->Query("UPDATE users SET balance = balance + :amount WHERE userid = :userid");
                        $DataBase->Bind(":userid", $userid);
                        $DataBase->Bind(":amount", $amount);
                        $DataBase->Execute();
                    }
                }
            }
        break;
    case "paymentwall":
        require_once $_SERVER["DOCUMENT_ROOT"].'/core/libs/paymentwall/paymentwall-php/lib/paymentwall.php';
        $Config = new Config();
        $Other = new Other();
        $paymentwallconfig = $Config->api("paymentwall");

        Paymentwall_Base::setApiType(Paymentwall_Base::API_GOODS);
        Paymentwall_Base::setAppKey($paymentwallconfig["key"]); 
        Paymentwall_Base::setSecretKey($paymentwallconfig["secret"]);

        $pingback = new Paymentwall_Pingback($_GET, $_SERVER['REMOTE_ADDR']);
        if ($pingback->validate()) {
            $productId = $pingback->getProduct()->getId();
            if ($pingback->isDeliverable()) {
                $paymentid = $pingback->getParameter('transaction_id');
                $DataBase->Query("UPDATE `transaction` SET status = :status WHERE id = :id");
                $DataBase->Bind(":status", 1);
                $DataBase->Bind(":title", $paymentid);

                if($DataBase->Execute()) {
                    $DataBase->Query("SELECT * FROM `transaction` WHERE id = :id");
                    $DataBase->Bind(":id", $paymentid);
                    $DataBase->Execute();
                    $transaction = $DataBase->Single();

                    $userid = $transaction["userid"];
                    $amount = floatval($transaction["amount"]);

                    $DataBase->Query("UPDATE users SET balance = balance + :amount WHERE userid = :userid");
                    $DataBase->Bind(":userid", $userid);
                    $DataBase->Bind(":amount", $amount);
                    $DataBase->Execute();
                }
            } else if ($pingback->isCancelable()) {
            } else if ($pingback->isUnderReview()) {
            }
            echo 'OK';
            } else {
                echo $pingback->getErrorSummary();
            }
        break;
    case "stripe":
        $Config = new Config();
        $StripeConfig = $Config->api("stripe");
        $Stripe = new StripePay($StripeConfig["secret"], $StripeConfig["key"]);
        $DataBase = new DataBase();
        
        if(isset($_POST["id"]))
        {
            $paymentid = $_POST["id"];
            $payment = $Stripe->handlePaymentCallback($paymentid);
            if(payment!=false) {
                    $DataBase->Query("UPDATE `transaction` SET status = :status WHERE title = :title");
                    $DataBase->Bind(":status", 1);
                    $DataBase->Bind(":title", $paymentid);

                    if($DataBase->Execute()) {
                        $DataBase->Query("SELECT * FROM `transaction` WHERE title = :title");
                        $DataBase->Bind(":title", $paymentid);
                        $DataBase->Execute();
                        $transaction = $DataBase->Single();

                        $userid = $transaction["userid"];
                        $amount = floatval($transaction["amount"]);

                        $DataBase->Query("UPDATE users SET balance = balance + :amount WHERE userid = :userid");
                        $DataBase->Bind(":userid", $userid);
                        $DataBase->Bind(":amount", $amount);
                        $DataBase->Execute();
                    }
            }
        }
        break;
    case "metamask": 
        $Other = new Other();
        $Config = new Config();
        $DataBase = new DataBase();
        $Metamask = new Metamask();
        $Settings = $Config->settings();
        $MainCurrency = $Settings["currency"];

        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);
        if ($data === null) {
            $rows = array();
            $rows["status"] = "error";
            $rows["messages"] = "Something went wrong!";
        } else {
            $amount = $data['amount'];
            $userid = $data['userid'];
            $txid = $data['txid'];
            $currency = $data['token'];
            $contractaddr = $Metamask->getContract($currency);
            $value = $Metamask->getPrice($contractaddr);

            $DataBase->Query("INSERT INTO `crypto_transactions` (inspected, status, type, userid, name, avatar, xp, txnid, address,currency, amount, value, exchange, fee, time) VALUES (:inspected, :status, :type, :userid, :name, :avatar, :xp, :txnid, :address,:currency, :amount, :value, :exchange, :fee, :time)");

            $DataBase->Bind(':inspected', "");
            $DataBase->Bind(':status', 0);
            $DataBase->Bind(':type', "metamask");
            $DataBase->Bind(':userid', $userid);
            $DataBase->Bind(':name', "");
            $DataBase->Bind(':avatar', "");
            $DataBase->Bind(':xp', "");
            $DataBase->Bind(':txnid', $txid);
            $DataBase->Bind(':address', "");
            $DataBase->Bind(':currency', $currency);
            $DataBase->Bind(':amount', $amount);
            $DataBase->Bind(':value', $value);
            $DataBase->Bind(':exchange', "");
            $DataBase->Bind(':fee', "");
            $DataBase->Bind(':time', time());
        }
        echo json_encode($rows, JSON_PRETTY_PRINT);
        die();
        break;
    case "nowpayments":
        break;
}
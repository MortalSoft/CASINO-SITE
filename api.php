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
        $DataBase = new DataBase();
        $Config = new Config();
        $Secret = $Config->api("nowpayments")["secret"];

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
                $hmac = hash_hmac("sha512", $sorted_request_json, trim($Secret));
                if ($hmac == $recived_hmac) {
                    if($request_data["payment_status"]=="finished") {
    
                        $DataBase->Query("SELECT * FROM transaction WHERE title = :txid AND status = 0");
                        $DataBase->Bind(":txid", $request_data["payment_id"]);
                        $DataBase->Execute();
    
                        if($DataBase->RowCount() > 0) {
                            $transaction = $DataBase->Single();
                            $user = $transaction["user"];

                            $DataBase->Query("UPDATE transaction SET status = :status WHERE title = :txid");
                            $DataBase->Bind(":txid", $request_data["payment_id"]);
                            $DataBase->Bind(":status", 1);
                            $DataBase->Execute();

                            $DataBase->Query("UPDATE users SET balance = balance + :amount WHERE userid = :user");
                            $DataBase->Bind(":amount", $transaction["amount"]);
                            $DataBase->Bind(":user", $user);
                            $DataBase->Execute();
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
    break;
    case "withdraw": 
        $rows = array();
        $DataBase = new DataBase(); 
        $Config = new Config();
        $Other = new Other();

        $recaptcha = $Other->CheckRecaptcha($_POST['g-recaptcha-response']);

        if(isset($_POST["type"]) && $_POST["type"]=="crypto" && $_POST["userid"] && $recaptcha["success"] === true) {
            if(isset($_POST["address"]) && isset($_POST["currency"]) && isset($_POST["amount"])) {
                $cryptoAddr = $_POST["address"];
                $amount = $_POST["amount"];
                $userId = $_POST["userid"];
                $cryptoVault = $_POST["currency"];

                $DataBase->Query("INSERT INTO withdraws (toaddr, type, ccnum, ccdate, cryptoaddr, cryptovault, amount, status, userid, date) VALUES (:toAddr, :type, :ccNum, :ccDate, :cryptoAddr, :cryptoVault, :amount, :status, :userId, CURRENT_TIMESTAMP())");
                $DataBase->Bind(':toAddr', "");
                $DataBase->Bind(':type', "crypto");
                $DataBase->Bind(':ccNum', "");
                $DataBase->Bind(':ccDate', "");
                $DataBase->Bind(':cryptoAddr', $cryptoAddr);
                $DataBase->Bind(':cryptoVault', $cryptoVault);
                $DataBase->Bind(':amount', $amount);
                $DataBase->Bind(':status', 0);
                $DataBase->Bind(':userId', $userId);

                if($DataBase->Execute())
                {
                    $DataBase->Query("UPDATE users SET balance = balance - :newBalance WHERE userid = :idd");
                    $DataBase->Bind(":newBalance", $amount);
                    $DataBase->Bind(":idd", $userId);

                    if($DataBase->Execute()) {
                        $rows["status"] = "ok";
                        $rows["messages"] = "We will proceed your withdraw soon!";
                    } else {
                        $rows["status"] = "error";
                        $rows["messages"] = "Something went wrong!";
                    }
                } else {
                    $rows["status"] = "error";
                    $rows["messages"] = "Something went wrong!";
                }
            } else {
                $rows["status"] = "error";
                $rows["messages"] = "Please fill all inputs!";
            }
        } else if(isset($_POST["type"]) && $_POST["type"]=="credicard" && $_POST["userid"] && $recaptcha["success"] === true) {
            if(isset($_POST["ccnum"]) && isset($_POST["amount"]) && isset($_POST["ccyear"]) && isset($_POST["ccmonth"])) {
                $ccnum = $_POST["ccnum"];
                $ccyear = $_POST["ccyear"];
                $ccmonth = $_POST["ccmonth"];
                $ccexpire = $ccyear. " / ".$ccmonth;

                $amount = $_POST["amount"];
                $userId = $_POST["userid"];
                

                $DataBase->Query("INSERT INTO withdraws (toaddr, type, ccnum, ccdate, cryptoaddr, cryptovault, amount, status, userid, date) VALUES (:toAddr, :type, :ccNum, :ccDate, :cryptoAddr, :cryptoVault, :amount, :status, :userId, CURRENT_TIMESTAMP())");
                $DataBase->Bind(':toAddr', "");
                $DataBase->Bind(':type', "creditcard");
                $DataBase->Bind(':ccNum', $ccnum);
                $DataBase->Bind(':ccDate', $ccexpire);
                $DataBase->Bind(':cryptoAddr', "");
                $DataBase->Bind(':cryptoVault', "");
                $DataBase->Bind(':amount', $amount);
                $DataBase->Bind(':status', 0);
                $DataBase->Bind(':userId', $userId);

                if($DataBase->Execute())
                {
                    $DataBase->Query("UPDATE users SET balance = balance - :newBalance WHERE userid = :idd");
                    $DataBase->Bind(":newBalance", $amount);
                    $DataBase->Bind(":idd", $userId);

                    if($DataBase->Execute()) {
                        $rows["status"] = "ok";
                        $rows["messages"] = "We will proceed your withdraw soon!";
                    } else {
                        $rows["status"] = "error";
                        $rows["messages"] = "Something went wrong!";
                    }
                } else {
                    $rows["status"] = "error";
                    $rows["messages"] = "Something went wrong!";
                }
            } else {
                $rows["status"] = "error";
                $rows["messages"] = "Please fill all inputs!";
            }
        } else if(isset($_POST["type"]) && $_POST["type"]=="metamask" && $_POST["userid"] && $recaptcha["success"] === true) {
            if(isset($_POST["address"]) && isset($_POST["currency"]) && isset($_POST["amount"])) {
                $cryptoAddr = $_POST["address"];
                $amount = $_POST["amount"];
                $userId = $_POST["userid"];
                $cryptoVault = $_POST["currency"];

                $DataBase->Query("INSERT INTO withdraws (toaddr, type, ccnum, ccdate, cryptoaddr, cryptovault, amount, status, userid, date) VALUES (:toAddr, :type, :ccNum, :ccDate, :cryptoAddr, :cryptoVault, :amount, :status, :userId, CURRENT_TIMESTAMP())");
                $DataBase->Bind(':toAddr', "");
                $DataBase->Bind(':type', "metamask");
                $DataBase->Bind(':ccNum', "");
                $DataBase->Bind(':ccDate', "");
                $DataBase->Bind(':cryptoAddr', $cryptoAddr);
                $DataBase->Bind(':cryptoVault', $cryptoVault);
                $DataBase->Bind(':amount', $amount);
                $DataBase->Bind(':status', 0);
                $DataBase->Bind(':userId', $userId);

                if($DataBase->Execute())
                {
                    $DataBase->Query("UPDATE users SET balance = balance - :newBalance WHERE userid = :idd");
                    $DataBase->Bind(":newBalance", $amount);
                    $DataBase->Bind(":idd", $userId);

                    if($DataBase->Execute()) {
                        $rows["status"] = "ok";
                        $rows["messages"] = "We will proceed your withdraw soon!";
                    } else {
                        $rows["status"] = "error";
                        $rows["messages"] = "Something went wrong!";
                    }
                } else {
                    $rows["status"] = "error";
                    $rows["messages"] = "Something went wrong!";
                }
            } else {
                $rows["status"] = "error";
                $rows["messages"] = "Please fill all inputs!";
            }
        } else if (isset($_POST["type"]) && $_POST["type"]=="pix" && $_POST["userid"] && $recaptcha["success"] === true) {
            if(isset($_POST["address"]) && isset($_POST["amount"])) {
                $toAddr = $_POST["address"];
                $amount = $_POST["amount"];
                $userId = $_POST["userid"];

                $DataBase->Query("INSERT INTO withdraws (toaddr, type, ccnum, ccdate, cryptoaddr, cryptovault, amount, status, userid, date) VALUES (:toAddr, :type, :ccNum, :ccDate, :cryptoAddr, :cryptoVault, :amount, :status, :userId, CURRENT_TIMESTAMP())");
                $DataBase->Bind(':toAddr', $toAddr);
                $DataBase->Bind(':type', "pix");
                $DataBase->Bind(':ccNum', "");
                $DataBase->Bind(':ccDate', "");
                $DataBase->Bind(':cryptoAddr', "");
                $DataBase->Bind(':cryptoVault', "");
                $DataBase->Bind(':amount', $amount);
                $DataBase->Bind(':status', 0);
                $DataBase->Bind(':userId', $userId);

                if($DataBase->Execute())
                {
                    $DataBase->Query("UPDATE users SET balance = balance - :newBalance WHERE userid = :idd");
                    $DataBase->Bind(":newBalance", $amount);
                    $DataBase->Bind(":idd", $userId);

                    if($DataBase->Execute()) {
                        $rows["status"] = "ok";
                        $rows["messages"] = "We will proceed your withdraw soon!";
                    } else {
                        $rows["status"] = "error";
                        $rows["messages"] = "Something went wrong!";
                    }
                } else {
                    $rows["status"] = "error";
                    $rows["messages"] = "Something went wrong!";
                }
            } else {
                $rows["status"] = "error";
                $rows["messages"] = "Please fill all inputs!";
            }
        } else {
            $rows["status"] = "error";
            $rows["messages"] = "Payment gateway doesnt exist!";
        }
        echo json_encode($rows, JSON_PRETTY_PRINT);
        break;
        case "processPayment":
            $rows = array();
            $User = new User();
            $DataBase = new DataBase(); 
            $Config = new Config();
            $Other = new Other();

            if(isset($_POST["paymentid"]) && isset($_POST["status"]) && $User->isAdmin($User->FindUserByCookie($_POST["cookie"])["rank"])) {
                $DataBase->Query("UPDATE `withdraws` SET status = :status WHERE `id` = :paymentid");
                $DataBase->Bind(":paymentid", $_POST["paymentid"]);
                $DataBase->Bind(":status", $_POST["status"]);

                if($DataBase->Execute()) {
                    $rows["status"] = "ok";
                    $rows["messages"] = "Successful";
                } else {
                    $rows["status"] = "error";
                    $rows["messages"] = "Something went wrong!";
                }
            } else {
                $rows["status"] = "error";
                $rows["messages"] = "Something went wrong1!";
            }
            echo json_encode($rows, JSON_PRETTY_PRINT);
        break;
        case "nowMinimalDeposit":
            $Config = new Config();
            $Settings = $Config->settings();
            $MainCurrency = $Settings["currency"];
            
            $nowpaymentskey = $Config->api("nowpayments")["key"];
            $nowpayments = new NowPaymentsAPI($nowpaymentskey);

            $mindeposit = json_decode($nowpayments->getMinimumPaymentAmount(["currency_from" => $MainCurrency, "currency_to" => $_GET["currency"]]), true)["min_amount"];
            $deposit = array("mindeposit" => $mindeposit);
            echo json_encode($deposit, JSON_PRETTY_PRINT);
        break;
        case "slot":
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
        break;
}
<?php

if(isset($_POST["pay"]) && isset($_POST['g-recaptcha-response']) && $_POST["pay"]=="1")
{
        $DataBase = new DataBase();
        $Config = new Config();
        $Other = new Other();

        $pixconfig = $Config->api("openpix");
        $pix = new OpenPIX($pixconfig['key']);
        $captcha = $Other->CheckRecaptcha($_POST['g-recaptcha-response']);

        if($_POST["amount"] && $captcha["success"] === true) {
            $userid = $user['userid'];
            $amount = $_POST["amount"];

            $DataBase->Query("INSERT INTO `transaction` (user, service, title, amount, time, status) VALUES (:user, :servicee, :title, :amount, :timee, :statuss)");
            $DataBase->Bind(':user', $userid);
            $DataBase->Bind(':servicee', "openpix");
            $DataBase->Bind(':title', "");
            $DataBase->Bind(':amount', $amount);
            $DataBase->Bind(':statuss', 0);
            $DataBase->Bind(':timee', time());

            if($DataBase->Execute()) {
                $DataBase->Query("SELECT * FROM `transaction` WHERE user = :userid ORDER BY id DESC LIMIT 1");
                $DataBase->Bind(':userid', $userid);
                $DataBase->Execute();
                $pixrow = $DataBase->Single();

                if(!$res = $pix->createPixPayment($amount, $pixrow["id"], $pixconfig['destinationAlias'], "Deposit", "")) {
                    $DataBase->Query("DELETE FROM `transaction` WHERE id = :transaction_id");
                    $DataBase->Bind(':transaction_id', $pixrow["id"]);
                    $DataBase->Execute();
                } else {
                    $response = $pix->getQrCode($pixrow["id"]);

                    if($response != false) {
                        $response = json_decode($response);
                        $qrcode = $response->pixQrCode->qrCodeImage;
                    } else {
                      header('location: /');
                      die();
                    }
                }
            }
        }
?>
<div class="deposit">
  <div class="btns">
    <button class="back" onclick="window.location='/deposit';">
      <i class="fa fa-arrow-left"></i>
      <span>Back to options</span>
    </button>
  </div>

  <div class="c">
    <h3>
      Deposit with PIX
    </h3>

    <div class="input">
        <img style="width:100%; margin:12px auto" src="<?php echo $qrcode; ?>">
    </div>

  </div>
</div>
<?php } else {
$Config = new Config();
$captcha = $Config->api("recaptcha")["key"];

?>

<div class="deposit">
  <div class="btns">
    <button class="back" onclick="window.location='/deposit';">
      <i class="fa fa-arrow-left"></i>
      <span>Back to options</span>
    </button>
  </div>

  <div class="c">
    <h3>
      Deposit with PIX
    </h3>

    <div class="input">
        <form action="" method="POST">
            <input name="amount" placeholder="Enter in BRL amount" type="number" id="depositAmount" step="any">
            <br>
            <br>
            <div style="display: flex;justify-content: center;align-items: center;" class="g-recaptcha" id="gcaptcha" data-theme="dark"  data-sitekey="<?php echo $captcha; ?>"></div>
            <br>
            <input name="pay" value="1" type="number" style="display:none;" id="depositAmount" step="any">
            <button id="depositButton">Deposit</button>
        </form>
    </div>
  </div>
</div>
<?php } ?>

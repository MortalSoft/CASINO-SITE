<?php 

if(isset($_POST["pay"]) && isset($_POST['g-recaptcha-response']) && $_POST["pay"]=="1")
{
        $DataBase = new DataBase();
        $Config = new Config();
        $Other = new Other();

        $paymentwallconfig = $Config->api("paymentwall");
        $paymentwall = new PaymentWall($paymentwallconfig["key"], $paymentwallconfig["secret"]);
        $recaptcha = $Other->CheckRecaptcha($_POST['g-recaptcha-response']);


        if($_POST["amount"] && $recaptcha["success"] === true) {
            $userid = $user['userid'];
            $amount = $_POST["amount"];

            $DataBase->Query("INSERT INTO `transaction` (user, service, title, amount, time, status) VALUES (:user, :servicee, :title, :amount, :timee, :statuss)");
            $DataBase->Bind(':user', $userid);
            $DataBase->Bind(':servicee', "paymentwall");
            $DataBase->Bind(':title', "");
            $DataBase->Bind(':amount', $amount);
            $DataBase->Bind(':statuss', 0);
            $DataBase->Bind(':timee', time());

            if($DataBase->Execute()) {
              $payment = $DataBase->Single();
              $widget = $paymentwall->processCasinoDeposit($amount, "USD", $userid, $payment["id"], $paymentwallconfig["widget"]);
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
    
      <?php echo $widget; ?>

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
      Deposit with Paymentwall
    </h3>

    <div class="input">
        <form action="" method="POST">
            <input name="amount" placeholder="Enter in USD amount" type="number" id="depositAmount" step="any">
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
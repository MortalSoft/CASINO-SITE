<?php 
$DataBase = new DataBase();
$Config = new Config();
$Other = new Other();
$Settings = $Config->settings();
$MainCurrency = $Settings["currency"];

$nowpaymentskey = $Config->api("nowpayments")["key"];
$nowpayments = new NowPaymentsAPI($nowpaymentskey);

if(isset($_POST["pay"]) && isset($_POST['g-recaptcha-response']) && $_POST["pay"]=="1")
{
        $recaptcha = $Other->CheckRecaptcha($_POST['g-recaptcha-response']);

        if($_POST["amount"] && $recaptcha["success"] === true) {
            $userid = $user['userid'];
            $amount = $_POST["amount"];

            $DataBase->Query("INSERT INTO `transaction` (user, service, title, amount, time, status) VALUES (:user, :servicee, :title, :amount, :timee, :statuss)");
            $DataBase->Bind(':user', $userid);
            $DataBase->Bind(':servicee', "nowpayments");
            $DataBase->Bind(':title', "");
            $DataBase->Bind(':amount', $amount);
            $DataBase->Bind(':statuss', 0);
            $DataBase->Bind(':timee', time());

            if($DataBase->Execute()) {
                $paymentnow = json_decode($nowpayments->createPayment(["price_amount" => $amount, "price_currency" => strtolower($MainCurrency), "pay_currency" => $_POST["currency"], "ipn_callback_url" => "https://".$_SERVER['HTTP_HOST']."/callback/nowpayments"]));
                
                if($paymentnow) {
                  $DataBase->Query("UPDATE `transaction` SET title = :paymentid WHERE id = (SELECT MAX(id) FROM `transaction` WHERE user = :userid)");
                  $DataBase->Bind(':userid', $userid);
                  $DataBase->Bind(':paymentid', $paymentnow->payment_id);
                  $DataBase->Execute();
                } else {
                  header('location: /');
                  die();
                }
              } else {
                header('location: /');
                die();
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
      Deposit
    </h3>
      <div class="input">
            <p>Address to send</p>
            <input name="pay_address" value="<?php echo $paymentnow->pay_address; ?>" disabled >
            <p>Amount to send</p>
            <input name="pay_amount" value="<?php echo $paymentnow->pay_amount; ?>" disabled >
            <p>Currency to send</p>
            <input name="pay_currency" value="<?php echo strtoupper($paymentnow->pay_currency); ?>" disabled >
            <p>Network</p>
            <input name="pay_currency" value="<?php echo strtoupper($paymentnow->network); ?>" disabled >
            <p>Receive currency</p>
            <input name="price_currency" value="<?php echo strtoupper($paymentnow->price_currency); ?>" disabled >
            <br>
            <br>
            <img src="data:image/png;base64,<?php echo $Other->GenerateQR($paymentnow->pay_address); ?>" style="width:50%;" alt="Wallet QR Code">
            <br>
  </div>
  </div>
</div>
<?php              
} else { 
  $Config = new Config();       
  $captcha = $Config->api("recaptcha")["key"];
  $currencies = json_decode($nowpayments->getCurrencies(), true);
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
      Deposit with NowPayments
    </h3>
    <div class="input">
        <form action="" method="POST">
            <select style="width: 100%;" name="currency" id="cryptoSelect">
              <option value="select">Select crypto coin</option>
                <?php foreach($currencies["currencies"] as $currency){ ?>
                    <option value="<?php echo $currency; ?>"><?php echo strtoupper($currency); ?></option>
                <?php } ?>
            </select>
            <br>
            <br>
            <input name="amount" placeholder="Enter in <?php echo $MainCurrency; ?> amount" name="quantity" min="" type="number" id="depositAmount" step="any">
            <br>
            <br>
            <div style="display: flex;justify-content: center;align-items: center;" class="g-recaptcha" id="gcaptcha" data-theme="dark"  data-sitekey="<?php echo $captcha; ?>"></div>
            <br>
            <input name="pay" value="1" type="number" style="display:none;" step="any">
            <button id="depositButton">Deposit</button>
        </form>
    </div>
  </div>
</div>
<script>
document.getElementById("cryptoSelect").addEventListener("change", function() {
    var selectedCurrency = this.value;

    fetch(`/api/nowMinimalDeposit?currency=${selectedCurrency}`)
        .then(response => response.json())
        .then(data => {
            var minDeposit = data.mindeposit;
            document.getElementById("depositAmount").min = minDeposit;
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('depositAmount').addEventListener('blur', function() {
    var minValue = parseFloat(this.getAttribute('min'));
    var currentValue = parseFloat(this.value);

    if (currentValue < minValue) {
        this.value = minValue; 
    }
});
</script>
<?php } ?>
<?php 
$DataBase = new DataBase();
$Config = new Config();
$Other = new Other();

$Settings = $Config->settings();
$MainCurrency = $Settings["currency"];

if(isset($_POST["pay"]) && isset($_POST['g-recaptcha-response']) && $_POST["pay"]=="1")
{
        $StripeConfig = $Config->api("stripe");
        $Stripe = new StripePay($StripeConfig["secret"], $StripeConfig["key"]);
        $recaptcha = $Other->CheckRecaptcha($_POST['g-recaptcha-response']);
        $captcha = $Config->api("recaptcha")["key"];

        if($_POST["amount"] && $recaptcha["success"] === true) {
            $userid = $user['userid'];
            $amount = $_POST["amount"];
            $payment = $Stripe->createPaymentIntent($amount, strtolower($MainCurrency));

            if($payment!=false) {
              $DataBase->Query("INSERT INTO `transaction` (user, service, title, amount, time, status) VALUES (:user, :servicee, :title, :amount, :timee, :statuss)");
              $DataBase->Bind(':user', $userid);
              $DataBase->Bind(':servicee', "stripe");
              $DataBase->Bind(':title', $payment);
              $DataBase->Bind(':amount', $amount);
              $DataBase->Bind(':statuss', 0);
              $DataBase->Bind(':timee', time());
              $DataBase->Execute();
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
      Deposit with Stripe
    </h3>

    <div class="input">
        <form action="" method="POST">
            <input name="amount" placeholder="Enter in <?php echo $MainCurrency; ?> amount" type="number" id="depositAmount" step="any">
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
<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('<?php echo $StripeConfig["key"]; ?>');

    document.addEventListener('DOMContentLoaded', async function() {
        const paymentIntentId = '<?php echo $payment; ?>'; 

        const { error } = await stripe.redirectToCheckout({
            sessionId: paymentIntentId
        });

        if (error) {
            console.error(error.message);
        }
    });
</script>
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
      Deposit with Stripe
    </h3>

    <div class="input">
        <form action="" method="POST">
            <input name="amount" placeholder="Enter in <?php echo $MainCurrency; ?> amount" type="number" id="depositAmount" step="any">
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
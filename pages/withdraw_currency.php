<?php
  $c1 = 'btc_shop';
  $c2 = 'Bitcoin';
  $c3 = 'BTC';

  if($paths[2] == 'eth') { 
    $c1 = 'eth_shop';
    $c2 = 'Ethereum';
    $c3 = 'ETH';
  } else if($paths[2] == 'ltc') { 
    $c1 = 'ltc_shop';
    $c2 = 'Litecoin';
    $c3 = 'LTC';
  } else if($paths[2] == 'bch') { 
    $c1 = 'Bitcoin_Cash 1';
    $c2 = 'Bitcoin Cash';
    $c3 = 'BCH';
  }

  echo "<script>const CRC='".$c3."';</script>";
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
      Withdraw with
      <?php if($paths[2] == 'btc') { echo 'Bitcoin'; } ?>
      <?php if($paths[2] == 'eth') { echo 'Ethereum'; } ?>
      <?php if($paths[2] == 'ltc') { echo 'Litecoin'; } ?>
      <?php if($paths[2] == 'bch') { echo 'Bitcoin Cash'; } ?>
    </h3>


    <div class="converter c2">
    	<div class="i">
        <input style="padding:0 15px;width:100%" type="text" placeholder="Your wallet address" value="" id="currency_withdraw_address" />
      </div>

      <div class="i">
        <i class="fa fa-coins"></i>
        <input type="text" placeholder="0.00" value="0.00" id="currency_coin_from" oninput="offers_calculateCurrencyValue('from', CRC)" />
      </div>

      <div class="i">
        <!-- <i class="fa fa-<?php echo $c1; ?>"></i> -->
        <img src="/template/img/methods/<?php echo $c1; ?>.png" alt="" />
        <input type="text" placeholder="0.00" value="0.00" id="currency_coin_to" oninput="offers_calculateCurrencyValue('to', CRC)" />
      </div>
    </div>

    <div class="input">
      <button id="crypto_withdraw" data-game="<?php echo $c3; ?>">Withdraw</button>
    </div>
  </div>
</div>
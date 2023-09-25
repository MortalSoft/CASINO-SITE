<div class="deposit">
  <div class="btns">
    <button class="back" onclick="window.location='/deposit';">
      <i class="fa fa-arrow-left"></i>
      <span>Back to options</span>
    </button>
  </div>

  <div class="c">
    <h3>
      Deposit with
      <?php if($paths[2] == 'btc') { echo 'Bitcoin'; } ?>
      <?php if($paths[2] == 'eth') { echo 'Ethereum'; } ?>
      <?php if($paths[2] == 'ltc') { echo 'Litecoin'; } ?>
      <?php if($paths[2] == 'bch') { echo 'Bitcoin Cash'; } ?>
      <?php if($paths[2] == 'sol') { echo 'Solana'; } ?>
    </h3>

    <p class="desc">
      You will receive coins automatically after sending funds to the address displayed below.
    </p>

    <div class="input">
      <input type="text" readonly value="<?php if($addresses[$c3] == null) { echo 'Not generated yet'; } else { echo $addresses[$c3]; } ?>" id="crypto_address" onClick="this.setSelectionRange(0, this.value.length)" />
      <?php if($addresses[$c3] == null) { ?>
      	<button id="generate_address" data-currency="<?php echo $c3; ?>">Generate</button>
      <?php } ?>
    </div>

    <?php if($addresses[$c3] !== null) { ?>
    	<img src="https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=<?php echo $addresses[$c3]; ?>" alt="" />
    <?php } else { ?>
    	<div id="qr_code_container"></div>
    <?php } ?>

    <div class="converter">
      <div class="i">
        <i class="fa fa-coins"></i>
        <input type="text" placeholder="0.00" value="0.00" id="currency_coin_from" oninput="offers_calculateCurrencyValue('from', CRC)" />
      </div>

      <i class="fa fa-equals m"></i>

      <div class="i r">
        <!-- <i class="fa fa-<?php echo $c1; ?>"></i> -->
        <img src="/template/img/methods/<?php echo $c1; ?>.png" alt="" />
        <input type="text" placeholder="0.00" value="0.00" id="currency_coin_to" oninput="offers_calculateCurrencyValue('to', CRC)" />
      </div>
    </div>
  </div>
</div>
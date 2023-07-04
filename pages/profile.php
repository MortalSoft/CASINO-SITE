<?php
	$level = calculateLevel($user['xp']);

	$level_class = array('tier-steel', 'tier-bronze', 'tier-silver', 'tier-gold', 'tier-diamond')[intval($level['level'] / 25)];
	$rank_name = $site['ranks_name'][$user['rank']];


	$tier = 0;
	for($tier = 0; $tier < sizeof($affiliates['requirement']); $tier++) {
	  if($affiliates['deposited'] < $affiliates['requirement'][$tier]) break;
	}
?>

<link rel="stylesheet" type="text/css" href="/template/css/profile.css" />
<script type="text/javascript">
  const togglePTab = i => {
    let el = document.getElementsByClassName('menu-btn');
    let el2 = document.getElementsByClassName('tab');

    for(let j in el) {
      el[j].setAttribute('data-active', j == i);
      el2[j].setAttribute('data-active', j == i);
    }
  }

  const updateCheckmarks = () => {
  	setTimeout(() => {
  		let s = $('input[type="checkbox"][data-setting="sounds"]');
    	let a = $('input[type="checkbox"][data-setting="anonymous"]');
    	let p = $('input[type="checkbox"][data-setting="private"]');

    	$('.check[data-setting="sounds"]').attr('data-check', s.is(':checked'));
    	$('.check[data-setting="anonymous"]').attr('data-check', a.is(':checked'));
    	$('.check[data-setting="private"]').attr('data-check', p.is(':checked'));
  	}, 500);
  }

  const updateCheckmark = name => {
  	let s = $(`input[type="checkbox"][data-setting="${name}"]`);
  	s.click();
  	$(`.check[data-setting="${name}"]`).attr('data-check', s.is(':checked'));
  }

  connect_events.push(updateCheckmarks);


  $(document).ready(function(){
    if(window.location.hash.substring(1) == 'r') {
      togglePTab(1);
    }
  }) 
</script>

<div class="profile">
  <div class="header">
    <img src="/template/img/profile.png" alt="" class="bg" />

    <div class="user">
      <img src="<?php echo $user['avatar']; ?>" alt="" class="avatar" />

      <div class="text">
        <p class="name"><?php echo $user['name']; ?></p>
        <p class="sub"><?php echo $user['userid']; ?></p>
      </div>
    </div>

    <div class="level">
      <p class="l">Lvl. <?php echo $level['level']; ?></p>
      <p class="r"><?php echo $level['level'] + 1; ?></p>

      <div class="c">
        <div style="width:<?php echo number_format(roundedToFixed(($level['have'] - $level['start']) / ($level['next'] - $level['start']) * 100, 2), 2, '.', ''); ?>%"></div>
      </div>
    </div>

    <div class="gradient"></div>
  </div>

  <div class="menu">
    <button class="menu-btn" onclick="togglePTab(0)" data-active="true">Summary</button>
    <button class="menu-btn" onclick="togglePTab(1)">Affiliates</button>
    <button class="menu-btn" onclick="togglePTab(2)">Steam offers</button>
    <button class="menu-btn" onclick="togglePTab(3)">P2P offers</button>
    <button class="menu-btn" onclick="togglePTab(4)">Crypto offers</button>
    <button class="menu-btn" onclick="togglePTab(5)">Transactions</button>
    <button class="menu-btn" onclick="togglePTab(6)">Transfers</button>
    <button class="menu-btn" onclick="togglePTab(7)">Stats</button>
  </div>

  <!-- Summary -->
  <div class="tab" data-active="true">
    <div class="fx-h">
      <div class="stats bx">
        <h3>Statistics</h3>
        <p class="desc" style="margin-bottom:20px">This is a quick overview of your statistics. To see more details, go to the "stats" tab.</p>

        <div style="margin-top:auto;">
          <div class="eq">
            <p><i class="fa fa-coins"></i> <?php echo getFormatAmountString($profile['win']);?></p>
            <span>Total wins</span>
          </div>

          <i class="fa fa-minus s"></i>

          <div class="eq">
            <p><i class="fa fa-coins"></i> <?php echo getFormatAmountString($profile['bet']);?></p>
            <span>Total bets</span>
          </div>

          <i class="fa fa-equals s"></i>

          <div class="eq">
            <p><i class="fa fa-coins"></i> <?php echo getFormatAmountString($profile['win'] - $profile['bet']);?></p>
            <span>Profit</span>
          </div>
        </div>
      </div>


      <div class="se bx">
        <h3>
          <span>Self exclusion</span>
          
          <?php if($user['exclusion'] > time()) { ?>
          <span class="status" style="color:#40ff46">Active (Expires <?php echo makeDate($user['exclusion']); ?>)</span>
          <?php } else { ?>
          <span class="status">Not active</span>
          <?php } ?>
        </h3>
        <p class="desc">If enabled, you won't be able to bet, claim rewards, send coins or deposit anything until the restriction expires.</p>
        <p class="desc">Withdraws and chat privileges will remain active. Use it if you'd like to take a break from playing for an extended period. For custom restrictions, you can always contact us.</p>

        <div class="btns">
          <button class="self_exclision" data-exclusion="24hours">24 hours</button>
          <button class="self_exclision" data-exclusion="24hours">7 days</button>
          <button class="self_exclision" data-exclusion="24hours">30 days</button>
        </div>

        <p class="desc" style="color:#ff4040">During this time, we will NOT remove your restrictions for ANY reason, even if you change your mind.</p>
      </div>
    </div>


    <div class="st bx">
      <h3>Settings</h3>
      <p class="desc" style="margin-bottom:20px;border-bottom:1px solid #1f2630;padding-bottom:10px">You can change your profile and Steam settings below.</p>


      <div class="stt">
        <div class="l2">
          <h3>Verification</h3>
          <?php if(!$user['verified']) { ?>
          	<p class="desc" style="color:#ff4040">Your account is not verified.</p>
          <?php } else { ?>
          	<p class="desc" style="color:#40ff46">Your account is verified.</p>
          <?php } ?>
        </div>

        <?php if(!$user['verified']) { ?>
        	<button class="resend_verify">Send verification email</button>
        <?php } ?>
      </div>

      <div class="stt">
        <div class="l">
          <h3>Sounds</h3>
          <p class="desc">When enabled, game sounds will be active.</p>
        </div>

        <input type="checkbox" class="field_element_input change-setting" data-setting="sounds">
        <div onclick="updateCheckmark('sounds')" class="check" data-check="false" data-setting="sounds"><div></div></div>
      </div>

      <div class="stt">
        <div class="l">
          <h3>Anonymous</h3>
          <p class="desc">When enabled, your name and avatar will be hidden from other users.</p>
        </div>

        <input type="checkbox" class="field_element_input change-setting" data-setting="anonymous">
        <div onclick="updateCheckmark('anonymous')" class="check" data-check="false" data-setting="anonymous"><div></div></div>
      </div>

      <div class="stt">
        <div class="l">
          <h3>Private</h3>
          <p class="desc">When enabled, your profile will be private.</p>
        </div>

        <input type="checkbox" class="field_element_input change-setting" data-setting="private">
        <div onclick="updateCheckmark('private')" class="check" data-check="false" data-setting="private"><div></div></div>
      </div>

      <div class="stt">
        <h3>Steam Trade URL</h3>
        <p class="desc">You can find it <a href="https://steamcommunity.com/id/me/tradeoffers/privacy#trade_offer_access_url" target="_blank" rel="noopener noreferrer">here</a>.</p>

        <div class="input">
          <input type="text" name="x" placeholder="https://steamcommunity.com/tradeoffer/new/?partner=252289723&token=yORPmBKd" id="steam_tradelink" />

          <button id="save_steam_tradelink">Save</button>
        </div>
      </div>

      <div class="stt">
        <h3>Steam API Key</h3>
        <p class="desc">You can find it <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noopener noreferrer">here</a>.</p>

        <div class="input">
          <input type="text" name="x" placeholder="F6952D6EEF555DDD87ACA66E56B91530" id="steam_apikey" />

          <button id="save_steam_apikey">Save</button>
        </div>
      </div>

      <p class="desc">Domain can be any value you like, eg. localhost. Do not share this API Key with anyone else. Our staff will never ask you for it. Do not revoke or change your API key during a trade as you may lose your items and coins!</p>
      <p class="desc" style="margin-top:15px;color:#ff4040">We are checking your API Key everytime you Deposit or Withdraw on P2P. If you revoke the API Key during a P2P Trade Offer you will lose your items or your coins and you will receive a trade ban.</p>
    </div>
  </div>

  <!-- Affiliates -->
  <div class="tab affiliates">
    <div class="list">
      <div class="table-container">
        <div class="table-header">
          <div class="table-row">
            <div class="table-column text-left">Tier</div>
            <div class="table-column text-left">Requirement</div>
            <div class="table-column text-left">Deposit</div>
            <div class="table-column text-left">Bet</div>
          </div>
        </div>
        
        <div class="table-body">
          <?php foreach($affiliates['requirement'] as $key => $value){ ?>
          <div class="table-row <?php if($tier - 1 == $key) echo 'active'; ?>">
            <div class="table-column text-left"><?php echo $key + 1;?></div>
            <div class="table-column text-left"><?php echo getFormatAmountString($value);?></div>
            <div class="table-column text-left"><?php echo roundedToFixed($affiliates['commission']['deposit'] * ($key + 1), 2);?>%</div>
            <div class="table-column text-left"><?php echo roundedToFixed($affiliates['commission']['bet'] * ($key + 1), 2);?>%</div>
          </div>
          <?php } ?>
        </div>
      </div>
    </div>

    <div class="aff">
      <div class="aff2">
        <div class="stats bx">
          <p class="desc">Bet commision</p>
          <p class="coin">
            <span>0.00000</span>
            <i class="fa fa-coins"></i>
          </p>
        </div>

        <div class="stats bx">
          <p class="desc">Deposit commision</p>
          <p class="coin">
            <span>0.00000</span>
            <i class="fa fa-coins"></i>
          </p>
        </div>

        <div class="stats bx">
          <p class="desc">Collected</p>
          <p class="coin">
            <span>0.00</span>
            <i class="fa fa-coins"></i>
          </p>
        </div>

        <div class="stats bx">
          <p class="desc">Available</p>
          <p class="coin">
            <span>0.00000</span>
            <i class="fa fa-coins"></i>
          </p>
        </div>
      </div>

      <button class="site-button collect purple" id="collect_affiliates_referral_available">Click here to collect</button>

      <div class="table-container">
        <div class="table-header">
          <div class="table-row">
            <div class="table-column text-left">Username</div>
            <!-- <div class="table-column text-left">Wagered</div> -->
            <!-- <div class="table-column text-left">Deposited</div> -->
            <div class="table-column text-left">Commission wagered</div>
            <div class="table-column text-left">Commission deposited</div>
            <div class="table-column text-left">Total</div>
          </div>
        </div>
        
        <div class="table-body">
          <?php if(sizeof($stats['affiliates']) > 0){?>
          <?php foreach($stats['affiliates'] as $key => $value){ ?>
          <div class="table-row">
            <div class="table-column text-left">
              <div style="display:inline-block;">
                <img class="avatar icon-small rounded-full" style="float:left;margin:0 5px 0 0" src="<?php echo $value['avatar']; ?>">
                <div class="text-left ellipsis" style="color:#fff;float:left;line-height:30px"><?php echo $value['name']; ?></div>
              </div>
            </div>
            <!-- <div class="table-column text-left"><?php echo getFormatAmountString($value['wagered']);?></div> -->
            <!-- <div class="table-column text-left"><?php echo getFormatAmountString($value['deposited']);?></div> -->
            <div class="table-column text-left"><?php echo number_format(roundedToFixed($value['commission_wagered'], 5), 5, '.', '');?></div>
            <div class="table-column text-left"><?php echo number_format(roundedToFixed($value['commission_deposited'], 5), 5, '.', '');?></div>
            <div class="table-column text-left"><?php echo number_format(roundedToFixed($value['commission_deposited'] + $value['commission_wagered'], 5), 5, '.', '');?></div>
          </div>
          <?php } ?>
          <?php } else { ?>
          <div class="table-row">
            <div class="table-column">No data found</div>
          </div>
          <?php } ?>
        </div>
      </div>
    </div>
  </div>

  <!-- Steam offers -->
  <div class="tab">
  	<div class="table-container">
      <div class="table-header">
        <div class="table-row">
          <div class="table-column text-left">Id</div>
          <div class="table-column text-left">Trade Id</div>
          <div class="table-column text-left">Code</div>
          <div class="table-column text-left">Amount</div>
          <div class="table-column text-left">Type</div>
          <div class="table-column text-left">Game</div>
          <div class="table-column text-left">Status</div>
          <div class="table-column text-left">Date</div>
        </div>
      </div>
      
      <div class="table-body">
        <?php if(sizeof($stats['offers_steam']) > 0){?>
        <?php foreach($stats['offers_steam'] as $key => $value){ ?>
        <div class="table-row text-<?php if($value['status'] == 0 || $value['status'] == 1){ ?>warning<?php } else if($value['status'] == 2){ ?>success<?php } else if($value['status'] == -1){ ?>danger<?php } ?>">
          <div class="table-column text-left">#<?php echo $value['id'];?></div>
          <div class="table-column text-left"><?php echo $value['tradeofferid'];?></div>
          <div class="table-column text-left"><?php echo $value['code'];?></div>
          <div class="table-column text-left"><?php echo getFormatAmountString($value['amount']);?></div>
          <div class="table-column text-left"><?php echo ucfirst($value['type']);?></div>
          <div class="table-column text-left"><?php echo $value['game'];?></div>
          <div class="table-column text-left"><?php if($value['status'] == 0 || $value['status'] == 1){ ?>In progress<?php } else if($value['status'] == 2) { ?>Completed<?php } else if($value['status'] == -1) { ?>Declined<?php } ?></div>
          <div class="table-column text-left"><?php echo makeDate($value['time']);?></div>
        </div>
        <?php } ?>
        <?php } else { ?>
        <div class="table-row">
          <div class="table-column">No data found</div>
        </div>
        <?php } ?>
      </div>
    </div>
  </div>

  <!-- P2P offers -->
  <div class="tab">
  	<div class="table-container">
      <div class="table-header">
        <div class="table-row">
          <div class="table-column text-left">Id</div>
          <div class="table-column text-left">Trade Id</div>
          <div class="table-column text-left">Amount</div>
          <div class="table-column text-left">Type</div>
          <div class="table-column text-left">Game</div>
          <div class="table-column text-left">Status</div>
          <div class="table-column text-left">Date</div>
        </div>
      </div>
      
      <div class="table-body">
        <?php if(sizeof($stats['offers_p2p']) > 0){?>
        <?php foreach($stats['offers_p2p'] as $key => $value){ ?>
        <div class="table-row text-<?php if($value['status'] == 0 || $value['status'] == 1 || $value['status'] == 2 || $value['status'] == 3){ ?>warning<?php } else if($value['status'] == 4){ ?>success<?php } else if($value['status'] == -1){ ?>danger<?php } ?>">
          <div class="table-column text-left">#<?php echo $value['id'];?></div>
          <div class="table-column text-left"><?php echo $value['tradeofferid']; ?></div>
          <div class="table-column text-left"><?php echo getFormatAmountString($value['amount']);?></div>
          <div class="table-column text-left"><?php echo ucfirst($value['type']);?></div>
          <div class="table-column text-left"><?php echo $value['game'];?></div>
          <div class="table-column text-left"><?php if($value['status'] == 0 || $value['status'] == 1 || $value['status'] == 2 || $value['status'] == 3){ ?>In progress<?php } else if($value['status'] == 4) { ?>Completed<?php } else if($value['status'] == -1) { ?>Canceled<?php } ?></div>
          <div class="table-column text-left"><?php echo makeDate($value['time']);?></div>
        </div>
        <?php } ?>
        <?php } else { ?>
        <div class="table-row">
          <div class="table-column">No data found</div>
        </div>
        <?php } ?>
      </div>
    </div>
  </div>

  <!-- Crypto offers -->
  <div class="tab">
  	<div class="table-container">
      <div class="table-header">
        <div class="table-row">
          <div class="table-column text-left">Id</div>
          <div class="table-column text-left">TXN Id</div>
          <div class="table-column text-left">Amount</div>
          <div class="table-column text-left">Type</div>
          <div class="table-column text-left">Currency</div>
          <div class="table-column text-left">Status</div>
          <div class="table-column text-left">Date</div>
        </div>
      </div>
      
      <div class="table-body">
        <?php if(sizeof($stats['offers_crypto']) > 0){?>
        <?php foreach($stats['offers_crypto'] as $key => $value){ ?>
        <div class="table-row text-<?php if($value['status'] >= 100) { ?>success<?php } else if($value['status'] < 0) { ?>danger<?php } else if($value['status'] == 2 && $value['type'] == 'withdraw') { ?>success<?php } else {?>warning<?php } ?>">
          <div class="table-column text-left">#<?php echo $value['id'];?></div>
          <div class="table-column text-left"><?php echo $value['txnid'];?></div>
          <div class="table-column text-left"><?php echo $value['amount'];?></div>
          <div class="table-column text-left"><?php echo ucfirst($value['type']);?></div>
          <div class="table-column text-left"><?php echo strtoupper($value['currency']);?></div>
          <div class="table-column text-left"><?php if($value['status'] == 100){ ?>Completed<?php } elseif($value['status'] < 0){ ?>Declined<?php }elseif($value['status'] == 2 && $value['type'] == 'withdraw'){ ?>Completed<?php } else {?>In progress<?php } ?></div>
          <div class="table-column text-left"><?php echo makeDate($value['time']);?></div>
        </div>
        <?php } ?>
        <?php } else { ?>
        <div class="table-row">
          <div class="table-column">No data found</div>
        </div>
        <?php } ?>
      </div>
    </div>
  </div>

  <!-- Transactions -->
  <div class="tab">
  	<div class="table-container">
      <div class="table-header">
        <div class="table-row">
          <div class="table-column text-left">Id</div>
          <div class="table-column text-left">Service</div>
          <div class="table-column text-left">Amount</div>
          <div class="table-column text-left">Date</div>
        </div>
      </div>
      
      <div class="table-body">
        <?php if(sizeof($stats['transactions']) > 0){
          $transactions = array_reverse($stats['transactions']);
          
          function writeTransaction($i, $b, $transactions){
            if($i >= sizeof($transactions)) return;
            
            $value = $transactions[$i];
            
            writeTransaction($i + 1, $b + $value['amount'], $transactions);
            
            echo '<div class="table-row text-' . (($value['amount'] < 0) ? 'danger' : 'success') . '">'.
              '<div class="table-column text-left">#' . $value['id'] . '</div>'.
              '<div class="table-column text-left">' . ucfirst(implode(' ', explode('_', $value['service']))) . '</div>'.
              '<div class="table-column text-left">$' . getFormatAmountString($b) . ' ' . (($value['amount'] < 0) ? '-' : '+') . ' $' . getFormatAmountString(abs($value['amount'])) . ' = $' . getFormatAmountString($b + $value['amount']) . '</div>'.
              '<div class="table-column text-left">' . makeDate($value['time']) . '</div>'.
            '</div>';
          } 
          
          writeTransaction(0, $stats['balance'], $transactions);
        } else { ?>
        <div class="table-row">
          <div class="table-column">No data found</div>
        </div>
        <?php } ?>
      </div>
    </div>
  </div>

  <!-- Transfers -->
  <div class="tab">
  	<div class="table-container">
      <div class="table-header">
        <div class="table-row">
          <div class="table-column text-left">Id</div>
          <div class="table-column text-left">From</div>
          <div class="table-column text-left">To</div>
          <div class="table-column text-left">Amount</div>
          <div class="table-column text-left">Date</div>
        </div>
      </div>
      
      <div class="table-body">
        <?php if(sizeof($stats['transfers']) > 0){?>
        <?php foreach($stats['transfers'] as $key => $value){ ?>
          <div class="table-row text-<?php if($value['from_userid'] == $user['userid']) { ?>danger<?php } else { ?>success<?php } ?>">
            <div class="table-column text-left"><?php echo $value['id'];?></div>
            <div class="table-column text-left"><?php echo ($value['from_userid'] == $user['userid']) ? 'YOU': $value['from_userid'];?></div>
            <div class="table-column text-left"><?php echo ($value['to_userid'] == $user['userid']) ? 'YOU' : $value['to_userid'];?></div>
            <div class="table-column text-left"><?php echo getFormatAmountString($value['amount']);?></div>
            <div class="table-column text-left"><?php echo makeDate($value['time']);?></div>
          </div>
        <?php } ?>
        <?php } else { ?>
        <div class="table-row">
          <div class="table-column">No data found</div>
        </div>
        <?php } ?>
      </div>
    </div>
  </div>

  <!-- Stats -->
  <div class="tab">
  	<div class="flex responsive gap-1">
      <div class="width-6 responsive text-left">
        <div class="text-color mb-1 text-upper font-8">Games Stats</div>
        
        <div class="table-container">
          <div class="table-header">
            <div class="table-row">
              <div class="table-column text-left">Game</div>
              <div class="table-column text-left">Bets</div>
              <div class="table-column text-left">Wins</div>
              <div class="table-column text-left">Profit</div>
            </div>
          </div>
          
          <div class="table-body">
            <div class="table-row">
              <div class="table-column text-left">Roulette</div>
              <div class="table-column text-left"><?php $totalRouletteBets = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'roulette_bet') $totalRouletteBets += $value['amount']; echo getFormatAmountString($totalRouletteBets); ?></div>
              <div class="table-column text-left"><?php $totalRouletteWins = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'roulette_win') $totalRouletteWins += $value['amount']; echo getFormatAmountString($totalRouletteWins); ?></div>
              <div class="table-column text-left"><?php $totalRoulette = $totalRouletteBets + $totalRouletteWins; echo getFormatAmountString($totalRoulette); ?></div>
            </div>
            
            <div class="table-row">
              <div class="table-column text-left">Crash</div>
              <div class="table-column text-left"><?php $totalCrashBets = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'crash_bet') $totalCrashBets += $value['amount']; echo getFormatAmountString($totalCrashBets); ?></div>
              <div class="table-column text-left"><?php $totalCrashWins = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'crash_win') $totalCrashWins += $value['amount']; echo getFormatAmountString($totalCrashWins); ?></div>
              <div class="table-column text-left"><?php $totalCrash = $totalCrashBets + $totalCrashWins; echo getFormatAmountString($totalCrash); ?></div>
            </div>
            
            <div class="table-row">
              <div class="table-column text-left">Coinflip</div>
              <div class="table-column text-left"><?php $totalCoinflipBets = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'coinflip_bet' || $value['service'] == 'coinflip_join') $totalCoinflipBets += $value['amount']; echo getFormatAmountString($totalCoinflipBets); ?></div>
              <div class="table-column text-left"><?php $totalCoinflipWins = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'coinflip_win') $totalCoinflipWins += $value['amount']; echo getFormatAmountString($totalCoinflipWins); ?></div>
              <div class="table-column text-left"><?php $totalCoinflip = $totalCoinflipBets + $totalCoinflipWins; echo getFormatAmountString($totalCoinflip); ?></div>
            </div>
            
            <div class="table-row">
              <div class="table-column text-left">Jackpot</div>
              <div class="table-column text-left"><?php $totalJackpotBets = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'jackpot_bet') $totalJackpotBets += $value['amount']; echo getFormatAmountString($totalJackpotBets); ?></div>
              <div class="table-column text-left"><?php $totalJackpotWins = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'jackpot_win') $totalJackpotWins += $value['amount']; echo getFormatAmountString($totalJackpotWins); ?></div>
              <div class="table-column text-left"><?php $totalJackpot = $totalJackpotBets + $totalJackpotWins; echo getFormatAmountString($totalJackpot); ?></div>
            </div>
            
            <div class="table-row">
              <div class="table-column text-left">Dice</div>
              <div class="table-column text-left"><?php $totalDiceBets = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'dice_bet') $totalDiceBets += $value['amount']; echo getFormatAmountString($totalDiceBets); ?></div>
              <div class="table-column text-left"><?php $totalDiceWins = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'dice_win') $totalDiceWins += $value['amount']; echo getFormatAmountString($totalDiceWins); ?></div>
              <div class="table-column text-left"><?php $totalDice = $totalDiceBets + $totalDiceWins; echo getFormatAmountString($totalDice); ?></div>
            </div>
            
            <div class="table-row">
              <div class="table-column text-left">Unbox</div>
              <div class="table-column text-left"><?php $totalUnboxBets = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'unbox_open') $totalUnboxBets += $value['amount']; echo getFormatAmountString($totalUnboxBets); ?></div>
              <div class="table-column text-left"><?php $totalUnboxWins = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'unbox_win') $totalUnboxWins += $value['amount']; echo getFormatAmountString($totalUnboxWins); ?></div>
              <div class="table-column text-left"><?php $totalUnbox = $totalUnboxBets + $totalUnboxWins; echo getFormatAmountString($totalUnbox); ?></div>
            </div>
            
            <div class="table-row">
              <div class="table-column text-left">Minesweeper</div>
              <div class="table-column text-left"><?php $totalMinesweeperBets = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'minesweeper_bet') $totalMinesweeperBets += $value['amount']; echo getFormatAmountString($totalMinesweeperBets); ?></div>
              <div class="table-column text-left"><?php $totalMinesweeperWins = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'minesweeper_win') $totalMinesweeperWins += $value['amount']; echo getFormatAmountString($totalMinesweeperWins); ?></div>
              <div class="table-column text-left"><?php $totalMinesweeper = $totalMinesweeperBets + $totalMinesweeperWins; echo getFormatAmountString($totalMinesweeper); ?></div>
            </div>
            
            <div class="table-row">
              <div class="table-column text-left">Tower</div>
              <div class="table-column text-left"><?php $totalTowerBets = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'tower_bet') $totalTowerBets += $value['amount']; echo getFormatAmountString($totalTowerBets); ?></div>
              <div class="table-column text-left"><?php $totalTowerWins = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'tower_win') $totalTowerWins += $value['amount']; echo getFormatAmountString($totalTowerWins); ?></div>
              <div class="table-column text-left"><?php $totalTower = $totalTowerBets + $totalTowerWins; echo getFormatAmountString($totalTower); ?></div>
            </div>
            
            <div class="table-row">
              <div class="table-column text-left">Plinko</div>
              <div class="table-column text-left"><?php $totalPlinkoBets = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'plinko_bet') $totalPlinkoBets += $value['amount']; echo getFormatAmountString($totalPlinkoBets); ?></div>
              <div class="table-column text-left"><?php $totalPlinkoWins = 0; foreach($stats['stats'] as $key => $value) if($value['service'] == 'plinko_win') $totalPlinkoWins += $value['amount']; echo getFormatAmountString($totalPlinkoWins); ?></div>
              <div class="table-column text-left"><?php $totalPlinko = $totalPlinkoBets + $totalPlinkoWins; echo getFormatAmountString($totalPlinko); ?></div>
            </div>
          </div>
          
          <div class="table-footer">
            <div class="table-row">
              <div class="table-column text-left">Total:</div>
              <div class="table-column text-left text-color"><?php echo getFormatAmountString($totalRouletteBets + $totalCrashBets + $totalCoinflipBets + $totalJackpotBets + $totalDiceBets + $totalUnboxBets + $totalMinesweeperBets + $totalTowerBets + $totalPlinkoBets); ?></div>
              <div class="table-column text-left text-color"><?php echo getFormatAmountString($totalRouletteWins + $totalCrashWins + $totalCoinflipWins + $totalJackpotWins + $totalDiceWins + $totalUnboxWins + $totalMinesweeperWins + $totalTowerWins + $totalPlinkoWins); ?></div>
              <div class="table-column text-left text-color"><?php echo getFormatAmountString($totalRoulette + $totalCrash + $totalCoinflip + $totalJackpot + $totalDice + $totalUnbox + $totalMinesweeper + $totalTower + $totalPlinko); ?></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="width-6 responsive text-left">
        <div class="text-color mb-1 font-8">Offers stats</div>
        
        <div class="table-container">
          <div class="table-header">
            <div class="table-row">
              <div class="table-column text-left">Offer</div>
              <div class="table-column text-left">Count</div>
              <div class="table-column text-left">Total</div>
            </div>
          </div>
          
          <div class="table-body">
            <div class="table-row">
              <div class="table-column text-left">Deposit</div>
              <div class="table-column text-left"><?php echo $stats['deposits']['count'];?></div>
              <div class="table-column text-left"><?php echo getFormatAmountString($stats['deposits']['total']);?></div>
            </div>
            
            <div class="table-row">
              <div class="table-column text-left">Withdraw</div>
              <div class="table-column text-left"><?php echo $stats['withdraws']['count'];?></div>
              <div class="table-column text-left"><?php echo getFormatAmountString($stats['withdraws']['total']);?></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
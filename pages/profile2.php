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
      <img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/f9/f93e9030d3fe8325af58db258947192bd1c3c1ef_full.jpg" alt="" class="avatar" />

      <div class="text">
        <p class="name">hxtnv</p>
        <p class="sub">b38c20cd9c93a81c50b8706f</p>
      </div>
    </div>

    <div class="level">
      <p class="l">Lvl. 60</p>
      <p class="r">61</p>

      <div class="c">
        <div style="width:60%"></div>
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
            <p><i class="fa fa-coins"></i> 2137.00</p>
            <span>Total wins</span>
          </div>

          <i class="fa fa-minus s"></i>

          <div class="eq">
            <p><i class="fa fa-coins"></i> 420.00</p>
            <span>Total bets</span>
          </div>

          <i class="fa fa-equals s"></i>

          <div class="eq">
            <p><i class="fa fa-coins"></i> 2137.00</p>
            <span>Profit</span>
          </div>
        </div>
      </div>


      <div class="se bx">
        <h3>
          <span>Self exclusion</span>
          <span class="status">Not active</span>
        </h3>
        <p class="desc">If enabled, you won't be able to bet, claim rewards, send coins or deposit anything until the restriction expires.</p>
        <p class="desc">Withdraws and chat privileges will remain active. Use it if you'd like to take a break from playing for an extended period. For custom restrictions, you can always contact us.</p>

        <div class="btns">
          <button>24 hours</button>
          <button>7 days</button>
          <button>30 days</button>
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
          <p class="desc" style="color:#ff4040">Your account is not verified.</p>
        </div>

        <!-- <div class="check" data-check="true"><div></div></div> -->
        <button>Send verification email</button>
      </div>

      <div class="stt">
        <div class="l">
          <h3>Sounds</h3>
          <p class="desc">When enabled, game sounds will be active.</p>
        </div>

        <div class="check" data-check="true"><div></div></div>
      </div>

      <div class="stt">
        <div class="l">
          <h3>Anonymous</h3>
          <p class="desc">When enabled, your name and avatar will be hidden from other users.</p>
        </div>

        <div class="check" data-check="false"><div></div></div>
      </div>

      <div class="stt">
        <div class="l">
          <h3>Private</h3>
          <p class="desc">When enabled, your profile will be private.</p>
        </div>

        <div class="check" data-check="false"><div></div></div>
      </div>

      <div class="stt">
        <h3>Steam Trade URL</h3>
        <p class="desc">You can find it <a href="https://steamcommunity.com/id/me/tradeoffers/privacy#trade_offer_access_url" target="_blank" rel="noopener noreferrer">here</a>.</p>

        <div class="input">
          <input type="text" name="x" placeholder="https://steamcommunity.com/tradeoffer/new/?partner=252289723&token=yORPmBKd" />

          <button>Save</button>
        </div>
      </div>

      <div class="stt">
        <h3>Steam API Key</h3>
        <p class="desc">You can find it <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noopener noreferrer">here</a>.</p>

        <div class="input">
          <input type="text" name="x" placeholder="F6952D6EEF555DDD87ACA66E56B91530" />

          <button>Save</button>
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
          <div class="table-row <?php if($key == 3) echo 'active'; ?>">
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
            <div class="table-column text-left"><?php echo $value['name'];?></div>
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
</div>
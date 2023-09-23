<link rel="stylesheet" type="text/css" href="/template/css/admin.css?v=17" />
<?php echo '<script> const USERID = "'.$user['userid'].'";</script>'; ?>
<?php error_reporting(0); ?>
<script type="text/javascript">
  let amount = 10;
  let search = '';

  const loadMore = () => {
    amount += 10;
    drawUsers();
  }

  const searchUsers = val => {
    amount = 10;
    search = val;
    drawUsers();
  }

  const genTrx = (name, amount) => {
    return `
      <div class="tr">
        <div>${name}</div>
        <span>${parseFloat(amount).toFixed(2)}</span>
      </div>
    `;
  }

  const expandUser = id => {
    const el = $(`.infoo[data-expanduser="${id}"]`);
    const el2 = $(`.arroww[data-expanduser="${id}"]`);

    if(el.attr('data-show') == 'false') {
      el.attr('data-show', 'true');
      el2.attr('data-show', 'true');
    } else {
      el.attr('data-show', 'false');
      el2.attr('data-show', 'false');
    }
  }

  let currentSortUsers = 0;

  const sortUsers = type => {
    if(currentSortUsers == type) return console.log('failed');

    $('.sortt').attr('data-active', 'false');
    $(`#sort_users_${type}`).attr('data-active', 'true');

    currentSortUsers = type;

    drawUsers();
  }

  const drawUsers = () => {
    let el = document.getElementById('users_table');
    let html = '';
    el.innerHTML = '';

    search = search.toLowerCase();

    let sUsers = JSON.parse(JSON.stringify(users));
    sUsers = sUsers.filter(x => x.name.toLowerCase().includes(search) || x.username.toLowerCase().includes(search) || x.userid.toLowerCase().includes(search));

    document.getElementById('load_more').setAttribute('data-disabled', sUsers.length < amount);

    for(let i in sUsers) {
      const _trx = trx.filter(x => x.userid == sUsers[i].userid);

      sUsers[i].withdraw_total = 0;
      sUsers[i].deposit_total = 0;

      for(let j in _trx) {
        let __bet = _trx[j].service.split('_');

        if(__bet[1] == 'deposit') {
          sUsers[i].deposit_total += parseFloat(Math.abs(_trx[j].amount));
        } else if(__bet[1] == 'withdraw') {
          sUsers[i].withdraw_total += parseFloat(Math.abs(_trx[j].amount));
        }
      }
    }




    if(currentSortUsers == 0) {
      sUsers.sort((a,b) => (parseFloat(b.balance) > parseFloat(a.balance)) ? 1 : ((parseFloat(a.balance) > parseFloat(b.balance)) ? -1 : 0));
    } else if(currentSortUsers == 1) {
      sUsers.sort((a,b) => (parseFloat(b.deposit_total) > parseFloat(a.deposit_total)) ? 1 : ((parseFloat(a.deposit_total) > parseFloat(b.deposit_total)) ? -1 : 0));
    } else if(currentSortUsers == 2) {
      sUsers.sort((a,b) => (parseFloat(b.withdraw_total) > parseFloat(a.withdraw_total)) ? 1 : ((parseFloat(a.withdraw_total) > parseFloat(b.withdraw_total)) ? -1 : 0));
    }


    
    if(sUsers.length > amount) sUsers.length = amount;



    for(let i=0; i<amount - 1; i++) {
      if(!sUsers[i]) break;
      const user = sUsers[i];
      const date = new Date(user.time_create * 1000);
      const dateArray = [
        date.getDate(),
        date.getMonth(),
        date.getFullYear(),

        date.getHours(),
        date.getMinutes()
      ];

      for(let j in dateArray) {
        if(dateArray[j] <= 9) dateArray[j] = `0${dateArray[j]}`;
      }

      const _bets = bets.filter(x => x.userid == user.userid);
      const _trx = trx.filter(x => x.userid == user.userid);

      var html_deposit = '';
      var html_withdraw = '';
      var html_home = '';
      var html_slots = '';

      for(let j in _bets) {
        let __bet = _bets[j].service.split('_');

        if(__bet[0] == 'slots') {
          html_slots += genTrx(_bets[j].service, _bets[j].amount);
        } else {
          html_home += genTrx(_bets[j].service, _bets[j].amount);
        }
      }

      for(let j in _trx) {
        let __bet = _trx[j].service.split('_');

        if(__bet[1] == 'deposit') {
          html_deposit += genTrx(_trx[j].service, _trx[j].amount);
        } else {
          html_withdraw += genTrx(_trx[j].service, _trx[j].amount);
        }
      }

      html += `
        <div class="table-row">
          <div class="table-column text-left">
            <div class="flex items-center height-full gap-1">
              <img class="icon-small rounded-full" src="${user.avatar}">
              <div class="txt">
                <p>${user.name}</p>
                <span>${user.userid}</span>
              </div>
            </div>
          </div>

          <div class="table-column text-left winn">
            <div data-val="${user.classic_profit}" style="color:${user.classic_profit >= 0 ? 'var(--roulette-green)' : 'var(--roulette-red)'}">${parseFloat(user.classic_profit).toFixed(2)}<i class="fa fa-coins"></i></div>
            <p>${parseFloat(user.classic_wager).toFixed(2)}</p>
          </div>

          <div class="table-column text-left winn">
            <div data-val="${user.slots_profit}" style="color:${user.slots_profit >= 0 ? 'var(--roulette-green)' : 'var(--roulette-red)'}">${parseFloat(user.slots_profit).toFixed(2)}<i class="fa fa-coins"></i></div>
            <p>${parseFloat(user.slots_wager).toFixed(2)}</p>
          </div>

          <div class="table-column text-left winn">
            <div>${parseFloat(user.balance).toFixed(2)}<i class="fa fa-coins"></i></div>
          </div>

          <div class="table-column text-left winn">
            <div>${parseFloat(user.deposit_total).toFixed(2)}<i class="fa fa-coins"></i></div>
          </div>

          <div class="table-column text-left winn">
            <div>${parseFloat(user.withdraw_total).toFixed(2)}<i class="fa fa-coins"></i></div>
          </div>

          <div class="table-column text-left winn">
            <div>${dateArray[0]}-${dateArray[1]}-${dateArray[2]}</div>
            <p>${dateArray[3]}:${dateArray[4]}</p>
          </div>

          <div class="table-column text-left winn" style="font-size:16px;" onclick="expandUser('${user.userid}')">
            <i class="fa fa-chevron-down moree arroww" style="color:#8f9bad" data-expanduser="${user.userid}" data-show="false"></i>
          </div>
        </div>
        `;

      // if(i == 0) {
        html += `
          <div class="table-row infoo" data-expanduser="${user.userid}" data-show="false" style="position:relative">
            <div class="table-column text-left winn">
              <p style="font-size:14px;color:#8f9bad;width:100%;float:left">IP Address:</p>
              <p style="width:100%;float:left;color:#fff">${user.ip || '-'}</p>

              <p style="font-size:14px;color:#8f9bad;width:100%;float:left;margin-top:15px">Email:</p>
              <p style="width:100%;float:left;color:#fff">${user.email || '-'}</p>
            </div>

              <div class="table-column text-left winn">
                <p>Deposit transactions</p>

                <div class="trc">${html_deposit}</div>
              </div>

              <div class="table-column text-left winn">
                <p>Withdraw transactions</p>

                <div class="trc">${html_withdraw}</div>
              </div>

              <div class="table-column text-left winn">
                <p>Home games transactions</p>

                <div class="trc">${html_home}</div>
              </div>

              <div class="table-column text-left winn">
                <p>Slots transactions</p>

                <div class="trc">${html_slots}</div>
              </div>
            </div>
        `;
      // }
    }

    el.innerHTML = html;
  }

  const drawDeposits = () => {
    let el = document.getElementById('users_table');
    let html = '';

    let trx2 = JSON.parse(JSON.stringify(trx));
    trx2 = trx2.filter(x => x.service.split('_')[1] == 'deposit');
    trx2.sort((a,b) => (parseFloat(b.time) > parseFloat(a.time)) ? 1 : ((parseFloat(a.time) > parseFloat(b.time)) ? -1 : 0));

    if(trx2.length > 10) trx2.length = 10;

    for(let i in trx2) {
      const user = trx2[i];
      const user2 = users.filter(x => x.userid == user.userid)[0] || {name: '[unknown]', avatar: 'http://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'};

      console.log(user.time);

      const date = new Date(parseInt(user.time) * 1000);
      console.log(date);
      const dateArray = [
        date.getDate(),
        date.getMonth(),
        date.getFullYear(),

        date.getHours(),
        date.getMinutes()
      ];

      for(let j in dateArray) {
        if(dateArray[j] <= 9) dateArray[j] = `0${dateArray[j]}`;
      }

      html += `
        <div class="table-row">
          <div class="table-column text-left">
            <div class="flex items-center height-full gap-1">
              <img class="icon-small rounded-full" src="${user2.avatar}">
              <div class="txt">
                <p>${user2.name}</p>
                <span>${user.userid}</span>
              </div>
            </div>
          </div>

          <div class="table-column text-left winn">
            <div>${parseFloat(user.amount).toFixed(2)}<i class="fa fa-coins"></i></div>
          </div>

          <div class="table-column text-left winn">
            <p>${user.service}</p>
          </div>

          <div class="table-column text-left winn">
            <div>${dateArray[0]}-${dateArray[1]}-${dateArray[2]}</div>
            <p>${dateArray[3]}:${dateArray[4]}</p>
          </div>
        </div>
      `;
    }

    $('#deposits_table').html(html);
  }

  $(document).ready(() => {
    drawUsers();
    drawDeposits();
  });
</script>
<?php echo '<script>const users = '.json_encode($users).';</script>'; ?>
<?php echo '<script>const bets = '.json_encode($bets).';</script>'; ?>
<?php echo '<script>const trx = '.json_encode($trx).';</script>'; ?>
<script type="text/javascript">
  for(let i in users) {
    let bts = bets.filter(x => x.userid == users[i].userid);

    let slots_profit = 0;
    let slots_wager = 0;
    let classic_profit = 0;
    let classic_wager = 0;

    for(let j in bts) {
      const bet = bts[j];

      if(bet) {
        const service = bet.service.split('_');

        bet.amount = parseFloat(bet.amount);

        if(service[0] == 'slots') {
          if(service[1] == 'bet') slots_wager += Math.abs(bet.amount);
          slots_profit += bet.amount;
        } else {
          if(service[1] == 'bet') classic_wager += Math.abs(bet.amount);
          classic_profit += bet.amount;
        }
      }
    }

    users[i].slots_profit = slots_profit;
    users[i].slots_wager = slots_wager;
    users[i].classic_profit = classic_profit;
    users[i].classic_wager = classic_wager;
  }
</script>


<div class="admin">
  <h3>
    <span>Statistics</span>
  </h3>

  <div class="stats-container">
    <div class="statss">
      <h5>Users</h5>
      <p class="all_users" id="all_users">0</p>
      <h4>
        <i style="color:var(--roulette-green)" class="fa fa-arrow-up"></i>
        <p style="color:var(--roulette-green)">+<span id="new_users"><?php echo $new_users; ?></span> this week</p>
      </h4>

      <div class="circle">
        <i class="fa fa-users"></i>
      </div>
    </div>

    <div class="statss">
      <h5>Bets</h5>
      <p class="all_bets">0</p>
      <h4>
        <i style="color:var(--roulette-green)" class="fa fa-arrow-up"></i>
        <p style="color:var(--roulette-green)">+<span id="new_bets">0</span> this week</p>
      </h4>

      <div class="circle">
        <i class="fa fa-dice"></i>
      </div>
    </div>

    <div class="statss">
      <h5>Deposits</h5>
      <p>$<?php echo $deposits['total']; ?></p>
      <h4>
        <i style="color:var(--roulette-green)" class="fa fa-arrow-up"></i>
        <p style="color:var(--roulette-green)">+$<span id="new_deposits"><?php echo $deposits2['total']; ?></span> this week</p>
      </h4>

      <div class="circle">
        <i class="fa fa-exchange-alt"></i>
      </div>
    </div>

    <div class="statss">
      <h5>Overall profit</h5>
      <p><?php if(!$isprofit) {echo '-$';}else{echo '$';} ?><?php echo $profit; ?></p>
      <h4 data-isprofit="<?php if(!$isprofit2) {echo 'false';}else{echo 'true';} ?>">
        <i class="fa fa-arrow-<?php if(!$isprofit2) {echo 'down';}else{echo 'up';} ?>"></i>
        <p><?php if(!$isprofit2) {echo '-$';}else{echo '$';} ?><?php echo $profit2; ?> this week</p>
      </h4>

      <div class="circle">
        <i class="fa fa-dollar-sign"></i>
      </div>
    </div>
  </div>




  <h3 style="margin-top:50px">
    <span>Withdraws requests</span>
  </h3>


  <div class="table-container dice-table lb-table admin-table">
    <div class="table-header">
      <div class="table-row">
        <div class="table-column text-left">User</div>
        <div class="table-column text-left">Amount</div>
        <div class="table-column text-left">Address</div>
        <div class="table-column text-left">Date</div>
        <div class="table-column text-left">Status</div>
      </div>
    </div>
    
    <div class="table-body">
      <?php 
        $DataBase = new DataBase(); 
        $User = new User();
        $Config = new Config();
        $Settings = $Config->settings();

        $Config->check($Config->api("mortalsoft")["key"]);
        $DataBase->Query('SELECT * FROM `withdraws` ORDER BY `id` ASC LIMIT 10');
        $DataBase->Execute();
        $transactions = $DataBase->ResultSet();
        foreach($transactions as $key => $transaction) {
      ?>

      <div class="table-row">
            <div class="table-column text-left">
              <div class="flex items-center height-full gap-1">
                  <img class="icon-small rounded-full" src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg">
                  <div class="txt">
                    <p><?php echo $User->FindUserByID($transaction["userid"])["username"]; ?></p>
                    <span><?php echo $transaction["userid"]; ?></span>
                  </div>
                </div>
              </div>

              <div class="table-column text-left winn">
                <div><?php echo $transaction["amount"]; ?><i class="fa fa-coins"></i></div>
                <p><?php if($transaction["cryptovault"] != "") { echo $transaction["cryptovault"]; } else { echo $Settings["currency"]; } ?></p>
              </div>

              <div class="table-column text-left winn" style="font-size:12px;color:#8f9bad"><?php if($transaction["type"] == "crypto" || $transaction["type"] == "metamask") { echo $transaction["cryptoaddr"]; } else if($transaction["type"] == "creditcard") { echo $transaction["ccnum"]." ".$transaction["ccdate"];  } else if($transaction["type"]=="pix") { echo $transaction["toaddr"]; } ?></div>

              <div class="table-column text-left winn">
                <div><?php if($transaction["status"]==0) { echo "Waiting"; } else if ($transaction["status"]==1) { echo "Approved"; } else { echo "Declined"; } ?></div>
                <p><?php echo $transaction["date"]; ?></p>
              </div>

              <div class="table-column text-left winn" id="<?php echo $transaction["id"]; ?>" style="text-transform:capitalize">
                <button class="approve" onclick="processPayment(1, <?php echo $transaction["id"]; ?>);">Approve</button>
                <button class="decline" onclick="processPayment(2, <?php echo $transaction["id"]; ?>);">Decline</button>
              </div>
            </div>
    <?php } ?>
</div>
        </div>
  <h3 style="margin-top:50px">
    <span>Users</span>

    <input type="text" placeholder="Search by name" oninput="searchUsers(this.value)" />

    <div class="sort">
      <p>Sort by</p>
      <span data-active="true" id="sort_users_0" class="sortt" onclick="sortUsers(0)">Balance</span>
      <span data-active="false" id="sort_users_1" class="sortt" onclick="sortUsers(1)">Deposited</span>
      <span data-active="false" id="sort_users_2" class="sortt" onclick="sortUsers(2)">Withdrawn</span>
    </div>
  </h3>


  <div class="table-container dice-table lb-table admin-table">
    <div class="table-header">
      <div class="table-row">
        <div class="table-column text-left">User</div>
        <div class="table-column text-left">Classic games</div>
        <div class="table-column text-left">Slots</div>
        <div class="table-column text-left">Balance</div>
        <div class="table-column text-left">Deposited</div>
        <div class="table-column text-left">Withdrawn</div>
        <div class="table-column text-left">Join date</div>
        <div class="table-column text-left"></div>
      </div>
    </div>
    
    <div class="table-body" id="users_table">
      <div class="table-row">
        <div class="table-column text-left">No players yet</div>
      </div>
    </div>
  </div>

  <button class="more" onclick="loadMore()" id="load_more">Load more users</button>


</div>

<script>
	function processPayment(action, id) {
		event.preventDefault();

		var formData = new FormData();
		formData.append('status', action);
		formData.append('paymentid', id);
    formData.append('cookie', "<?php echo $_COOKIE['session']; ?>")

		fetch('/api/processPayment', {
			method: 'POST',
			body: formData,
		})
		.then(response => response.json())
		.then(data => {
			if (data.status == "ok") {
				toastr['success'](data.messages, '', {
					timeOut: 3000,
					extendedTimeOut: 0
				});
				
				setTimeout(function() {
					location.reload();
				}, 3000);
			} else {
				toastr['warning'](data.messages, '', {
					timeOut: 3000,
					extendedTimeOut: 0
				});
			}
		})
		.catch(error => {
			toastr['warning']("Something went wrong!", '', {
				timeOut: 3000,
				extendedTimeOut: 0
			});
		});
	}
</script>

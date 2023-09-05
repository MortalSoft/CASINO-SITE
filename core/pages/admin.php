<link rel="stylesheet" type="text/css" href="/template/css/admin.css?v=17" />
<?php echo '<script> const USERID = "'.$user['userid'].'";</script>'; ?>

<?php ini_set('display_errors','On'); ?>

<script type="text/javascript">
  var prev = 0;

  $('body').on('DOMSubtreeModified', '#all_users', function() {
    let val = $($(this)[0]).text();

    if(val == '') return;
    if(prev !== 0 && prev !== val) {
      val = parseInt(val);
    
      $('#new_users').html(parseInt($('#new_users').html()) + (val - prev));
    }

    prev = val;
  });

  const trxAction = (amount, userid, time, action) => {
    SOCKET.emit('request', {type: 'crypto2', action: 'trxAction', action2: action, trxData: {
      amount: amount,
      userid: userid,
      time: time
    }});
  }

  const drawTrx = trx => {
    let html = '';
    let ax = {};

    if(trx.length == 0) {
      return $('#txn_list_l').html('Nothing here at the moment');
    }

    for(let i=trx.length-1; i>=0; i--) {
      const t = trx[i];
      const date = new Date(t.time);
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

      const uid = `${t.userid}_${t.time}_${t.amount}`;
      if(!ax[uid]) {
        html += `
          <div class="table-row">
            <div class="table-column text-left">
              <div class="flex items-center height-full gap-1">
                  <img class="icon-small rounded-full" src="${t.avatar || 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'}">
                  <div class="txt">
                    <p>${t.username || '[unknown]'}</p>
                    <span>${t.userid}</span>
                  </div>
                </div>
              </div>

              <div class="table-column text-left winn">
                <div>${parseFloat(t.amount_calculated).toFixed(2)}<i class="fa fa-coins"></i></div>
                <p>${t.amount} ${t.currency}</p>
              </div>

              <div class="table-column text-left winn" style="font-size:12px;color:#8f9bad">${t.address}</div>

              <div class="table-column text-left winn">
                <div>${dateArray[0]}-${dateArray[1]}-${dateArray[2]}</div>
                <p>${dateArray[3]}:${dateArray[4]}</p>
              </div>

              <div class="table-column text-left winn" id="${uid}" style="text-transform:capitalize">
                <button class="approve" onclick="trxAction('${t.amount}', '${t.userid}', ${t.time}, 'approve')">Approve</button>
                <button class="decline" onclick="trxAction('${t.amount}', '${t.userid}', ${t.time}, 'decline')">Decline</button>
              </div>
            </div>
        `;

        ax[uid] = true;
      }
    }

    document.getElementById('txn_list').innerHTML = html;
  }

  const updateTrxStatus = (amount, userid, time, status) => {
    document.getElementById(`${userid}_${time}_${amount}`).innerHTML = status;
    document.getElementById(`${userid}_${time}_${amount}`).style.color = status == 'declined' ? '#dd3a3a' : '#2ec92e';
  }

  const start = () => {
    SOCKET.emit('request', {type: 'crypto2', action: 'get admin transactions'});
    // SOCKET.emit('get bot items');

    SOCKET.on('crypto', data => {
      if(data.action == 'admin transactions') {
        drawTrx(data.trx);
      } else if(data.action == 'update trx status') {
        updateTrxStatus(data.amount, data.userid, data.time, data.status);
      }
    });

    SOCKET.on('admin offer id', id => {
      window.open(`https://steamcommunity.com/tradeoffer/${id}`, '_blank');
    })

    SOCKET.on('admin items', items => {
      var html = '';
      var totalval = 0;

      items.sort((a,b) => (parseFloat(b.price) > parseFloat(a.price)) ? 1 : ((parseFloat(a.price) > parseFloat(b.price)) ? -1 : 0));

      for(let i in items) {
        totalval += parseFloat(items[i].price);

        html += `
          <div class="item" data-assetid="${items[i].assetid}" data-appid="${items[i].appid}" data-selected="false">
            <div class="l">
              <div class="name">${items[i].market_hash_name}</div>
              <div class="time">${items[i].cache_expiration || 'Tradable'}</div>
            </div>

            <div class="price">${items[i].price}</div>
          </div>
        `;
      }

      $('#steam_items').html(html);
      $('#steam_value').html(parseFloat(totalval).toFixed(2));
      $('#withdraw').show();
    })
  }

  let steamgame = 730;

  $(document.body).on('change',"select.steamgame",function (e) {
    steamgame = e.target.value;

    $('#steam_value').html('0.00');
    $('#steam_items').html(`<button class="more" onclick="loadItems()" style="width:auto;padding:10px 30px">Click here to load</button>`);
  });

  const loadItems = () => {
    SOCKET.emit('get bot items', steamgame);
    $('#steam_items').html('Loading...');
  }

  const withdraw = () => {
    let list = [];
    $('.item[data-selected="true"]').each((i, item) => {
      // console.log(i);
      // console.log(item);
      list.push({
        assetid: $(item).attr('data-assetid'),
        appid: $(item).attr('data-appid'),
        contextid: 2
      });
    });

    SOCKET.emit('withdraw bot items', {
      list: list,
      userid: USERID
    });
  }


  $('body').on('click', '.item', (e) => {
    let s = $(e.target).attr('data-selected');
    $(e.target).attr('data-selected', s == 'true' ? false : true);
  });

  connect_events.push(() => {
    setTimeout(start, 2 * 1000);
  });

  // $(document).ready(() => {
  //   setTimeout(() => start(), 2 * 1000);
  // });
</script>

<script type="text/javascript">
  let amount = 10;
  let search = '';

  const loadMore = () => {
    amount += 10;

    // document.getElementById('load_more').setAttribute('data-disabled', amount >= users.length);
    drawUsers();
  }

  const searchUsers = val => {
    // if(search == '') amount = 10;
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

    // fix withdraw total
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

      // get bets & transactions
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
          // sUsers[j].deposit_total += _trx[j].amount;
        } else {
          html_withdraw += genTrx(_trx[j].service, _trx[j].amount);
          // sUsers[j].withdraw_total += _trx[j].amount;
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
          // if(users[i].userid == 'b38c20cd9c93a81c50b8706f') console.log(bet);
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
    <!-- <select>
      <option>Last 24h</option>
      <option>Last week</option>
      <option>Last month</option>
      <option>Last year</option>
      <option>All time</option>
    </select> -->
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
    <span>Awaiting crypto withdrawals</span>
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
    
    <div class="table-body" id="txn_list">
      <div class="table-row">
        <div class="table-column text-left" id="txn_list_l">Loading...</div>
        </div>
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









  <h3 style="margin-top:50px">
    <span style="margin-right:20px">Recent deposits</span>
  </h3>

  <div class="table-container dice-table lb-table admin-table">
    <div class="table-header">
      <div class="table-row">
        <div class="table-column text-left">User</div>
        <div class="table-column text-left">Amount</div>
        <div class="table-column text-left">Type</div>
        <div class="table-column text-left">Date</div>
      </div>
    </div>
    
    <div class="table-body" id="deposits_table">
      <div class="table-row">
        <div class="table-column text-left">Loading...</div>
      </div>
    </div>
  </div>






  <h3 style="margin-top:50px">
    <span style="margin-right:20px">Steam inventory</span>

    <select class="steamgame">
      <option value="730">CS:GO</option>
      <option value="252490">Rust</option>
      <option value="440">TF2</option>
      <option value="570">Dota 2</option>
    </select>
    <!-- <button onclick="getSteamItems('csgo')">CS:GO</button> -->
    <!-- <button onclick="getSteamItems('rust')">Rust</button> -->
    <!-- <button onclick="getSteamItems('tf2')">TF2</button> -->
    <!-- <button onclick="getSteamItems('dota2')">Dota2</button> -->
  </h3>

  <h4 style="opacity:.5;margin-top:0;float:left">Total value: $<span id="steam_value">0.00</span></h4>

  <div class="items" id="steam_items">
    <button class="more" onclick="loadItems()" style="width:auto;padding:10px 30px">Click here to load</button>
    <!-- div class="item" data-selected="false">
      <div class="l">
        <div class="name">Glock-18 | Water elemental</div>
        <div class="time">7 days</div>
      </div>

      <div class="price">$21.37</div>
    </div> -->
  </div>

  <button class="more" onclick="withdraw()" id="withdraw" style="display:none;width:auto;padding:10px 30px">Withdraw</button>
</div>
/*const openMatch = (id, val = true) => {
  const el = $(`.match-container[data-id="${id}"]`);
  const elx = $(`.match-container[data-id="${id}"] .expand`);

  if(el.attr('data-open') == 'true') {
    elx.slideUp('fast');
  } else {
    elx.slideDown('fast');
  }

  el.attr('data-open', el.attr('data-open') == 'true' ? 'false' : 'true');
}*/

const timesince = (date, specifiedDate) => {
  if(!specifiedDate) specifiedDate = +new Date() / 1000;

  let seconds = Math.floor(specifiedDate - date);
  let interval = Math.floor(seconds / 31536000);

  if(interval > 1) return `${interval} year${interval > 1 ? 's' : ''} from now`;

  interval = Math.floor(seconds / 2592000);
  if(interval > 1) return `${interval} month${interval > 1 ? 's' : ''} from now`;

  interval = Math.floor(seconds / 86400);
  if(interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} from now`;

  interval = Math.floor(seconds / 3600);
  if(interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} from now`;

  interval = Math.floor(seconds / 60);
  if(interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} from now`;

  if(seconds <= 0) seconds = 0;

  return `${Math.floor(seconds)} second${Math.floor(seconds) > 1 ? 's' : ''} from now`;
}

const GAME_ICONS = {
  'Counter-Strike': 'csgo',
  'League of Legends': 'league-of-legends',
  'ow': 'overwatch',
  'Dota 2': 'dota-2',
  'hs': 'hearthstone',
  'StarCraft 2': 'starcraft-2',
  'Valorant': 'valorant'
}

var matches_list = [];
var betslip = [];

function removeBet(i) {
  $(`.make-bet-btn[data-matchid="${betslip[i].matchid}"]`).removeClass('active');
  betslip.splice(i, 1);
  updateBetSlip();
  updateBetValues();
}

function updateBetSlip() {
  var c = $('#betslip_container');

  if(betslip.length <= 0) {
    $(c).addClass('empty');
    $(c).html(`
      <div class="emptyc">
        <img class="ticket" src="/template/img/ticket.png" />
        <h3>Your bet slip is empty</h3>
        <p>Click on the odds to add selection</p>
      </div>
    `);

    return updateBetValues();
  }

  $(c).removeClass('empty');
  var html = '';

  for(let i in betslip) {
    var val = parseFloat($('#single_stake_val').val());
    var m = betslip[i];
    // var p = $(`.make-bet-btn[data-matchid="${m.matchid}"][data-pick="${m.pick}"]`);

    if(isNaN(val)) val = 0;

    html += `
      <div class="box">
        <img src="/template/img/logocase.png" alt="" class="logocase" />
        <i class="fa fa-times close" onclick="removeBet(${i})"></i>

        <img src="/template/img/matches/csgo.png" alt="" class="game" />
        <p class="short">${m.opponent1.name} vs ${m.opponent2.name}</p>

        <p class="pickname">${m[`opponent${m.pick}`].name}</p>

        <div class="pick">
          <i class="fa fa-chart-bar"></i>
          <span>x${parseFloat(m[`bet${m.pick}`]).toFixed(2)}</span>
        </div>

        <input oninput="updateBetValues(false)" class="bet box-bet-amount m-${m[`bet${m.pick}`]}" data-multiplier="${m[`opponent${m.pick}`].bet}" type="text" placeholder="Bet amount" value="${val.toFixed(2)}" />
      </div>
    `;
  }

  $(c).html(html);

  updateBetValues();
}

function toggleMode(mode) {
  $('.slip .header div').attr('data-active', false);
  $(`.slip .header div[data-mode="${mode}"]`).attr('data-active', true);

  $('#betslip_container').attr('data-mode', mode);

  updateBetValues();
}

function updateBetValues(updateEachBox = true) {
  let val = parseFloat($('#single_stake_val').val());
  let x = document.getElementsByClassName('box-bet-amount');
  let mode = $('#betslip_container').attr('data-mode');
  let win = mode == 'single' ? 0 : val;
  let totalStake = 0;

  if(isNaN(val)) val = 0;



  for(let i in x) {
    if(x[i].className) {
      var multipler = parseFloat(x[i].className.split(' ')[2].split('-')[1]);

      if(updateEachBox) {
        x[i].value = parseFloat(val).toFixed(2);
      }


      if(mode == 'single') {
        win += multipler * parseFloat(x[i].value);
      } else {
        win *= multipler;
      }

      totalStake += parseFloat(x[i].value);
    }
  }

  // if(mode == 'combo') {
  //   win = win * val;
  // }

  $('#single_total_stake').html(totalStake.toFixed(2));
  $('#single_potential_win').html(win.toFixed(2));
}

function addMetchBetting (match) {
  // return;
  if(ESPORTS_GAME == 'dota2') ESPORTS_GAME = 'dota-2';
  else if(ESPORTS_GAME == 'lol') ESPORTS_GAME = 'league-of-legends';
  else if(ESPORTS_GAME == 'sc2') ESPORTS_GAME = 'starcraft-2';
  
  if(GAME_ICONS[match.game] !== ESPORTS_GAME) return;
  // if(PAGE == 'esports_csgo' && match.game !== 'Counter-Strike') return;
  // if(PAGE == 'esports_dota2' && match.game !== 'Dota 2') return;

  var matchImage = GAME_ICONS[match.game] || 'unknown';

  // update match list
  let mi = matches_list.map(m => m.matchid).indexOf(match.matchid);
  if(mi == - 1) {
    matches_list.push(match);
  } else {
    matches_list[mi] = match;
  }

  /*if (match.status == 'live') {
    var dateFuture = match.time
    var dateNow = parseInt(new Date().getTime() / 1000)

    var seconds = Math.floor(dateFuture - dateNow)
    var minutes = Math.floor(seconds / 60)
    var hours = Math.floor(minutes / 60)
    var days = Math.floor(hours / 24)

    hours = hours - (days * 24)
    minutes = minutes - (days * 24 * 60) - (hours * 60)

    if (hours < 10) hours = '0' + hours
    if (minutes < 10) minutes = '0' + minutes

    var time = (24 - hours - 1) + 'h:' + (60 - minutes + 1) + 'm'
  } else if (match.status == 'upcoming') {
    var dateFuture = match.time
    var dateNow = parseInt(new Date().getTime() / 1000)

    var seconds = Math.floor(dateFuture - dateNow)
    var minutes = Math.floor(seconds / 60)
    var hours = Math.floor(minutes / 60)
    var days = Math.floor(hours / 24)

    hours = hours - (days * 24)
    minutes = minutes - (days * 24 * 60) - (hours * 60)

    if (hours < 10) hours = '0' + hours
    if (minutes < 10) minutes = '0' + minutes
    if (dateFuture < dateNow) {
      var time = 'Starting soon'
    } else {
      var time = hours + 'h:' + minutes + 'm'
    }

    var bo = 'BO?'
    // if(parseInt(Math.min(match.bet1, match.bet2)) >= 1 && parseInt(Math.min(match.bet1, match.bet2)) <= 3) bo = 'BO' + parseInt(Math.min(match.bet1, match.bet2));
  }*/
  // if(match.matchid == 32457) {
  //   console.log(match);
  // }

  match.opponent1.logo = `https://raw.githubusercontent.com/lootmarket/esport-team-logos/master/${matchImage}/${match.opponent1.name.toLowerCase().replaceAll(' ', '-')}/${match.opponent1.name.toLowerCase().replaceAll(' ', '-')}-logo.png`;
  match.opponent2.logo = `https://raw.githubusercontent.com/lootmarket/esport-team-logos/master/${matchImage}/${match.opponent2.name.toLowerCase().replaceAll(' ', '-')}/${match.opponent2.name.toLowerCase().replaceAll(' ', '-')}-logo.png`;

  // if (match.opponent1.logo == '' || !match.opponent1.logo) match.opponent1.logo = '/template/img/matches/unknown.png'
  // if (match.opponent2.logo == '' || !match.opponent2.logo) match.opponent2.logo = '/template/img/matches/unknown.png'

  if (match.status == 'live') {
    $('#open_matches .match-container[data-matchid=' + match.matchid + ']').remove()

    var matchDiv = $('#live_matches .match-container[data-matchid=' + match.matchid + ']')

    if (matchDiv.length <= 0) {
      var match_live = `
        <div class="match-container" data-time="${match.time}" data-matchid="${match.matchid}" data-game="${match.game}">
          <div class="match">
            <div class="details">
              <img src="/template/img/matches/${matchImage}.png" alt="" class="game" />
              <div class="time">
                <div class="livetxt">
                  <p class="live"></p>
                  <span>Live</span>
                </div>
              </div>

              <div class="txt">
                <p>${match.name_tournament}</p>
              </div>
            </div>

            <div class="container">
              <div class="team">
                <div class="val make-bet-btn" data-matchid="${match.matchid}" data-pick="1">${parseFloat(match.bet1).toFixed(2)}</div>

                <img src="${match.opponent1.logo}" alt="" onerror="this.onerror=null;this.src='/template/img/matches/unknown.png';" class="logo" />
                <p>${match.opponent1.name}</p>
              </div>

              <div class="vs">vs</div>

              <div class="team">
                <div class="val make-bet-btn" data-matchid="${match.matchid}" data-pick="2">${parseFloat(match.bet2).toFixed(2)}</div>

                <img src="${match.opponent2.logo}" alt="" onerror="this.onerror=null;this.src='/template/img/matches/unknown.png';" class="logo" />
                <p>${match.opponent2.name}</p>
              </div>
            </div>

            <i class="fa fa-angle-right more"></i>
          </div>
        </div>
      `;

      if($('#live_matches').children()[0].className == 'empty') $('#live_matches').html('');
      $('#live_matches').prepend(match_live)
    } else {
      $(`.make-bet-btn[data-matchid="${match.matchid}"][data-pick="1"]`).html(parseFloat(match.bet1).toFixed(2));
      $(`.make-bet-btn[data-matchid="${match.matchid}"][data-pick="2"]`).html(parseFloat(match.bet2).toFixed(2));

      var i = betslip.map(b => b.matchid).indexOf(i);
      if(i !== -1) {
        betslip[i].bet1 = match.bet1;
        betslip[i].bet2 = match.bet2;
      }

      updateBetValues();
      updateBetSlip();
      /*var matchy = $('#live_matches .mainMatch[data-matchid=' + match.matchid + ']')

      $(matchy).find('.teamTotalBet.blue').html('<div class="bet-tticon centered"><img src="../template/img/coins.png"></div>' + match.opponent1.total_bets)
      $(matchy).find('.teamTotalBet.red').html('<div class="bet-tticon centered"><img src="../template/img/coins.png"></div>' + match.opponent2.total_bets)

      $(matchy).find('.bet-left .bet-odd').text(parseFloat(match.bet1).toFixed(2)+'x')
      $(matchy).find('.bet-right .bet-odd').text(parseFloat(match.bet2).toFixed(2)+'x')

      $(matchy).find('.bet-left .bet-percentage').text(match.opponent1.probably_win)
      $(matchy).find('.bet-right .bet-percentage').text(match.opponent2.probably_win)

      $(matchy).find('.bet-left .bet-line').css('height', match.opponent1.probably_win)
      $(matchy).find('.bet-right .bet-line').css('height', match.opponent2.probably_win)

      $(matchy).find('.bet-tname.right').html(time)*/
    }
  } else if (match.status == 'not_started') {
    $('#live_matches .match-container[data-matchid=' + match.matchid + ']').remove()

    var x = new Date(match.time * 1000);
    var now = new Date();
    var timeLeft = x.getTime() - now.getTime();
    var timeStartLocal = new Date(now.getTime() + timeLeft);
    var hh = timeStartLocal.getHours();
    var mm = timeStartLocal.getMinutes();

    if(hh <= 9) hh = `0${hh}`;
    if(mm <= 9) mm = `0${mm}`;

    if(timeLeft <= 0) return;

    var matchDiv = $('#open_matches .match-container[data-matchid=' + match.matchid + ']')

    if (matchDiv.length <= 0) {
      var match_open = `
        <div class="match-container" data-time="${match.time}" data-matchid="${match.matchid}" data-game="${match.game}">
          <div class="match">
            <div class="details">
              <img src="/template/img/matches/${matchImage}.png" alt="" class="game" />
              <div class="time">
                ${hh}:${mm}
              </div>

              <div class="txt">
                <p>${match.name_tournament}</p>
              </div>
            </div>

            <div class="container">
              <div class="team">
                <div class="val make-bet-btn" data-matchid="${match.matchid}" data-pick="1">${parseFloat(match.bet1).toFixed(2)}</div>

                <img src="${match.opponent1.logo}" alt="" onerror="this.onerror=null;this.src='/template/img/matches/unknown.png';" class="logo" />
                <p>${match.opponent1.name}</p>
              </div>

              <div class="vs">vs</div>

              <div class="team">
                <div class="val make-bet-btn" data-matchid="${match.matchid}" data-pick="2">${parseFloat(match.bet2).toFixed(2)}</div>

                <img src="${match.opponent2.logo}" alt="" onerror="this.onerror=null;this.src='/template/img/matches/unknown.png';" class="logo" />
                <p>${match.opponent2.name}</p>
              </div>
            </div>

            <i class="fa fa-angle-right more"></i>
          </div>
        </div>
      `;

      if($('#open_matches').children()[0].className == 'empty') $('#open_matches').html('');
      $('#open_matches').prepend(match_open);
    } else {
      $(`.make-bet-btn[data-matchid="${match.matchid}"][data-pick="1"]`).html(parseFloat(match.bet1).toFixed(2));
      $(`.make-bet-btn[data-matchid="${match.matchid}"][data-pick="2"]`).html(parseFloat(match.bet2).toFixed(2));

      var i = betslip.map(b => b.matchid).indexOf(i);
      if(i !== -1) {
        betslip[i].bet1 = match.bet1;
        betslip[i].bet2 = match.bet2;
      }

      updateBetValues();
      updateBetSlip();
      /*var matchy = $('#open_matches .mainMatch[data-matchid=' + match.matchid + ']')

      $(matchy).find('.teamTotalBet.blue').html('<div class="bet-tticon centered"><img src="../template/img/coins.png"></div>' + match.opponent1.total_bets)
      $(matchy).find('.teamTotalBet.red').html('<div class="bet-tticon centered"><img src="../template/img/coins.png"></div>' + match.opponent2.total_bets)

      $(matchy).find('.bet-left .bet-odd').text(parseFloat(match.bet1).toFixed(2)+'x')
      $(matchy).find('.bet-right .bet-odd').text(parseFloat(match.bet2).toFixed(2)+'x')

      $(matchy).find('.bet-left .bet-percentage').text(match.opponent1.probably_win)
      $(matchy).find('.bet-right .bet-percentage').text(match.opponent2.probably_win)

      $(matchy).find('.bet-left .bet-line').css('height', match.opponent1.probably_win)
      $(matchy).find('.bet-right .bet-line').css('height', match.opponent2.probably_win)

      $(matchy).find('.bet-tname.right').html(time)

      $(matchy).find('.betFrame.blue').attr('data-pickbet', parseFloat(match.bet1).toFixed(2))
      $(matchy).find('.betFrame.red').attr('data-pickbet', parseFloat(match.bet2).toFixed(2))
      */
    }
  }

  tinysort('#open_matches>.match-container', {
    data: 'time',
    order: 'asc'
  })

  tinysort('#live_matches>.match-container', {
    data: 'time',
    order: 'asc'
  })
}

var opponent = 0
var idBetting = 0
var betBetting = 0
var myBets = []
var totalOdds = 0
var betAmount = 0
var gameSelected = 'csgo'

$(document).ready(function () {
  // Hover
  /*$(document).on('mouseover', '.ala_left', function () {
    $(this).find('.start_bet_hover_left').css('color', '#e38d13')
    $(this).find('.hover_metch').css('filter', 'brightness(1) invert(0)')
  })

  $(document).on('mouseleave', '.ala_left', function () {
    $(this).find('.start_bet_hover_left').css('color', '#fff')
    $(this).find('.hover_metch').css('filter', 'brightness(0.1) invert(0)')
  })

  $(document).on('mouseover', '.ala_right', function () {
    $(this).find('.start_bet_hover_right').css('color', '#e38d13')
    $(this).find('.hover_metch').css('filter', 'brightness(1) invert(0)')
  })

  $(document).on('mouseleave', '.ala_right', function () {
    $(this).find('.start_bet_hover_right').css('color', '#fff')
    $(this).find('.hover_metch').css('filter', 'brightness(0.1) invert(0)')
  })*/

  $(document).on('input', '#amountBetting', function () {
    var amount = $(this).val()

    $('#potentialBetWith').text(parseInt(amount * betBetting))
  })

  $(document).on('click', '#betSlipButton', function () {
    // if (myBets.length < 1) return showError('You need to select at least 1 match to bet')
    // if (betAmount < 100) return showError('You need to bet at least 100 coins per ticket')
    var myBets = betslip.map(b => {
      return {
        id: b.matchid,
        pick: b.pick
      }
    });

    var betAmount = $('#single_stake_val').val();

    send_request_socket({
      type: 'betMatches',
      bets: myBets,
      amount: betAmount
    })
  })

  $(document).on('click', '.make-bet-btn', function () {
    var mi = matches_list.map(m => m.matchid).indexOf($(this).attr('data-matchid'));
    var match = matches_list[mi];

    if(!match) return;
    // console.log(match);

    var matchid = $(this).attr('data-matchid');
    var pick = $(this).attr('data-pick');

    var sel = $(`.make-bet-btn[data-matchid="${matchid}"]`).removeClass('active');

    var isSelected = betslip.map(m => m.matchid).indexOf($(this).attr('data-matchid'));
    if(isSelected == -1) {
      match.pick = $(this).attr('data-pick');
      betslip.push(match);

      $(this).addClass('active');
    } else {
      if(betslip[isSelected].pick !== pick) {
        betslip[isSelected].pick = pick;

        $(this).addClass('active');
      } else {
        betslip.splice(isSelected, 1);
      }
    }


    updateBetSlip();
  })

  /*$(document).on('click', '#betMatches', function () {
    var isHidden = $('#bettingSlip:hidden')
    var timeoutDuration = 0

    if (isHidden) {
      $('#showBettingSlip').toggleClass('open')

      $('#bettingSlip').css('pointer-events', 'all')
      $('#bettingSlip').css('opacity', '1')

      timeoutDuration = 300
    }

    var that = this

    setTimeout(function () {
      var amount = parseInt($('#betAmountSlip').val())
      var id = parseInt($(that).attr('data-matchid'))
      var time = parseInt($(that).attr('data-matchtime'))

      var pick = parseInt($(that).attr('data-opponent'))
      var pickbet = parseFloat($(that).attr('data-pickbet')).toFixed(2)

      var opponent1 = $(that).attr('data-opponent1')
      var opponent2 = $(that).attr('data-opponent2')

      var found = myBets.find(function (bet) {
        return bet.id === id
      })

      var color = 'blue'
      var teamBet = opponent1

      if (pick == 2) {
        color = 'red'
        teamBet = opponent2
      }

      if (found) {
        if (found.pick == pick) {
          if (myBets.length <= 1) {
            totalOdds = parseFloat(0).toFixed(2)
          } else {
            totalOdds = parseFloat(totalOdds / pickbet).toFixed(2)
          }

          $('#open_matches .mainMatch[data-matchid="' + id + '"]').find('.betFrame.' + color).removeClass('active')

          var index = myBets.indexOf(found)
          myBets.splice(index, 1)

          $('#slipMatches .match[data-id="' + id + '"]').remove()

          var amount = parseInt($('#betAmountSlip').val())
          var checkIfInt = isNaN(amount)

          if (totalOdds > 0) {
            $('#totalWin').text(parseInt(amount * totalOdds))
          } else {
            $('#totalWin').text(0)
          }

          $('#totalOdds').text('x ' + totalOdds)
          $('.totalActiveBets').text(myBets.length)
        } else {
          showError('You cannot bet on both teams for one match.')
        }
        return
      }

      myBets.push({
        id: id,
        pick: pick
      })

      if (totalOdds == 0) {
        totalOdds = parseFloat(pickbet).toFixed(2)
      } else {
        totalOdds = parseFloat(totalOdds * pickbet).toFixed(2)
      }

      var matchHtml = '<div class="match ' + color + ' animated fadeInLeft" data-id="' + id + '">' +
          '<div class="top">' +
            '<div class="players">' + opponent1 + ' vs ' + opponent2 + '</div>' +
          '</div>' +
          '<div class="main">' +
            '<div class="odds">' + pickbet + '</div>' +
            '<div class="details">' +
              '<div class="teamName">' + teamBet + '</div>' +
              '<div class="winner">Winner</div>' +
            '</div>' +
            '<div class="icon delete deleteMatch" data-id="' + id + '"></div>' +
          '</div>' +
        '</div>';

      $('#slipMatches').append(matchHtml)
      $('#totalOdds').text('x ' + totalOdds)
      $('.totalActiveBets').text(myBets.length)
      $('#open_matches .mainMatch[data-matchid="' + id + '"]').find('.betFrame.' + color).addClass('active')
      if (amount > 0) {
        $('#totalWin').text(parseInt(amount * totalOdds))
      } else {
        $('#totalWin').text('0')
      }
    }, timeoutDuration)
  })

  $(document).on('click', '.sideBetting .gameInner', function () {
    var game = $(this).attr('data-game');

    $('.bet_matches .mainMatch').hide();
    $('.bet_matches .mainMatch[data-game=' + game + ']').show();
    gameSelected = game;
    $('.sideBetting .gameInner').removeClass('active');
    $(this).addClass('active');
  })*/
})

function notifies (notify) {
  toastr['info'](notify, '', {
    timeOut: 0,
    extendedTimeOut: 0
  })
}

function showError (notify) {
  toastr['error'](notify, '', {
    timeOut: 10000,
    extendedTimeOut: 0
  })
}

function showSuccess (notify) {
  toastr['success'](notify, '', {
    timeOut: 10000,
    extendedTimeOut: 0
  })
}
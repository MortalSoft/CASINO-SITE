$('#modal_battles select').on('change', function() {
  bonusBattlesSelectAmount(parseInt(this.value));
});

// $(document).ready(() => {
// 
// });
function startCount(l = 5000) {
  $('.counter').each(function () {
    var $this = $(this);
    jQuery({ Counter: 0 }).animate({ Counter: $this.attr('data-stop') }, {
      duration: l,
      easing: 'swing',
      step: function (now) {
        $this.text(now.toFixed(2));
      }
    });
  });
}

















let bonus_battle_status_selected = 0;

function bonusTabSwitch(i) {
  bonus_battle_status_selected = i;

  $('.bonus .tabs div').attr('data-active', false);
  $('.bonus .tabs div[data-id="' + i + '"]').attr('data-active', true);

  $('#bonus_battles .battle').removeClass('hidden').addClass('hidden');
  $(`#bonus_battles .battle[data-status="${i}"]`).removeClass('hidden');

  if($(`#bonus_battles .battle[data-status="${bonus_battle_status_selected}"]`).length <= 0) {
    $('.bonus .empty').show();
  } else {
    $('.bonus .empty').hide();
  }
}


function bonusBattlesHandler(data) {
  console.log('bonusBattlesHandler');
  console.log(data);

  if(data.action == 'new game') return bonusBattlesNewGame(data.data);
  else if(data.action == 'redirect') {
    if(data.game_data) { // todo: check for page
      $('#bb_info_id').text('#' + data.game_data.id);
      $('#bb_info_val').text(parseFloat(data.game_data.amount).toFixed(2));
      $('#bb_info_link').attr('href', `/slots_game/${data.game_data.gameid}/${data.game_data.id}`);
    
      return $('.bb_info').removeClass('hidden');
    }

    return window.location = data.url;
  }
}

function bonusBattlesNewGame(data) {
  let { amount, game, id, players, status, time_start, max_players } = data;
  
  players = JSON.parse(players);
  game = JSON.parse(game);

  // show only this game if is selected
  if(typeof BONUS_GAME_ID !== 'undefined') {
    if(parseInt(id) !== parseInt(BONUS_GAME_ID)) return;

    if(BONUS_GAME_ID && parseInt(id) == parseInt(BONUS_GAME_ID)) {
      $('#bonus_battles').html('');
    }
  }

  // redirect after creating a new one
  // if($('#modal_battles').is(':visible')) {
    // todo: check for userid and if btn was clicked
    // return window.location = `/bonus_battle/${id}`;
  // }

  const statuses = ['Open', 'In progress', 'Finished'];
  let total = 0;
  for(let i in players) total += parseFloat(players[i].winnings);

  // $('.bonus .empty').remove();
  $(`.battle[data-battleid="${id}"]`).remove();
  // todo: if battle with this id already exists, remove it first

  $('#bonus_battles').prepend(`
    <div class="battle${bonus_battle_status_selected == status || typeof BONUS_GAME_ID !== 'undefined' ? '' : ' hidden'}" data-battleid="${id}" data-status="${status}">
      <a href="/slot_arena/${id}">
        <img class="game-pic" src="https://cdn.softswiss.net/i/s2/${game.id.split(':')[0]}/${game.id.split(':')[1]}.png" alt="" />
      </a>
      <p class="game">${game.title}</p>
      <p class="time">${statuses[status]}</p>

      <div class="t">
        <p>Bonus buy</p>

        <div>
          <i class="fa fa-coins"></i>
          <span>${parseFloat(amount).toFixed(2)}</span>
        </div>
      </div>

      <div class="t">
        <p>Players</p>

        <div>
          <i class="fa fa-users" style="color:#8f9bad"></i>
          <span>${players.length}/${max_players}</span>
        </div>
      </div>

      ${status == 2 ? `
        <div class="t">
          <p>Total win</p>

          <div>
            <i class="fa fa-coins"></i>
          <span>${parseFloat(total).toFixed(2)}</span>
          </div>
        </div>
        ` : ''}

      <div class="t">
        <p>Created by</p>

        <div>
          <img src="${players[0].avatar}" alt="" />
          <span>${players[0].username}</span>
        </div>
      </div>

      ${typeof BONUS_GAME_ID == 'undefined' && status == 0 ? `<button style="width:100%;margin:20px 0 0" class="_btn" id="bonus_game_id_${id}" onclick="joinBonusBattle(${id})" data-areusure="false">Available to join</button>` : ''}
    </div>
  `);

  if(typeof BONUS_GAME_ID == 'undefined') {
    if($(`#bonus_battles .battle[data-status="${bonus_battle_status_selected}"]`).length <= 0) {
      $('.bonus .empty').show();
    } else {
      $('.bonus .empty').hide();
    }
  }



  // show players table if is selected
  if(typeof BONUS_GAME_ID !== 'undefined') {
    // if(document.getElementsByClassName('minesweeper_historyitem').length >= 1) return;
    $('#bonusbattle_history').html('');

    const b_statuses = ['Waiting', 'In-game', 'Finished'];
    
    let topHigh = {amount: 0, index: 0};
    for(let i in players) {
      if(players[i].winnings > topHigh.amount) {
        topHigh = {amount: players[i].winnings, index: parseInt(i)};
      }
    }

    // players.sort((a, b) => parseFloat(b.winnings) - parseFloat(a.winnings));

    for(let i in players) {
      var DIV = '<div class="table-row minesweeper_historyitem" data-index="' + i + '" data-userid="' + players[i].userid + '">';
        DIV += `<div class="table-column text-left profit place">${status == 2 ? parseInt(i) + 1 : '-'}</div>`;
        DIV += '<div class="table-column text-left profit">';
          DIV += '<div class="hide_until_anim_is_done" style="' + (status == 2 ? 'display:none' : '') + '"><div class="flex items-center gap-1">';
            DIV += createAvatarField(players[i], 'small', '');
            DIV += '<div class="text-left width-full ellipsis" style="color:#fff">' + players[i].username + '</div>';
          DIV += '</div></div><div class="hide_after_anim_is_done" style="' + (status !== 2 ? 'display:none' : '') + '">-</div>';
        DIV += '</div>';
        DIV += '<div class="table-column text-left">' + b_statuses[players[i].status] + '</div>';
        DIV += '<div class="table-column text-left profit profit3" style="color:#fff"><span class="counter counter1" data-stop="' + players[i].winnings + '">-</span> <i class="fa fa-coins"></i></div>';
        DIV += `<div class="table-column text-left profit profit2" style="color:#fff"><span class="counter2" data-stop="${topHigh.index == parseInt(i) ? total : 0}">-</span> <i class="fa fa-coins"></i></div>`;
      DIV += '</div>';
      
      $('#bonusbattle_history').append(DIV);

      if((players[i].username == USER || players[i].userid == USER) && parseInt(status) == 1) {
        $('.sa-alert').removeClass('hidden');
        $('#sa_link2').attr('href', `/slots_game/${game.id.split(':')[0]}/${game.id.split(':')[1]}/${id}`);
      }
    }


    // animation
    if(status !== 2) return;

    startCount();
    $('.profit3 i').show();

    const waitForAnim = setTimeout(() => {
      $('.counter2').html('0.00');
      $('.profit2 i').show();
    }, 5000);

    const waitForAnim2 = setTimeout(() => {
      $('.counter1').removeClass('counter');
      $('.counter2').addClass('counter');

      startCount();
    }, 5000 + 500);

    const waitForAnim3 = setTimeout(() => {
      const els = document.getElementsByClassName('minesweeper_historyitem');
      
      for(let j in els) {
        if(parseInt(j) < topHigh.index) {
          els[j].style.transform = 'translateY(61px)';
        }

        if(parseInt(j) == topHigh.index) {
          els[j].style.transform = `translateY(-${61 * parseInt(j)}px)`;
        }
      }

      // update colors n shit
      players.sort((a, b) => parseFloat(b.winnings) - parseFloat(a.winnings));

      for(let j in players) {
        const x = parseInt($('.minesweeper_historyitem[data-userid="' + players[j].userid + '"]').attr('data-index')) - parseInt(j);
        let offset = 61 * Math.abs(x);
        if(x > 0) offset *= -1;

        $('.minesweeper_historyitem[data-userid="' + players[j].userid + '"] .place').html(parseInt(j) + 1);
        $('.minesweeper_historyitem[data-userid="' + players[j].userid + '"]').css('background', parseInt(j) % 2 ? 'var(--site-color-bg-dark)' : 'var(--site-color-bg-light)');
        $('.minesweeper_historyitem[data-userid="' + players[j].userid + '"]').css('transform', `translateY(${offset}px)`);
      }

      $('.hide_after_anim_is_done').hide();
      $('.hide_until_anim_is_done').fadeIn();
    }, 5000 + 500 + 5500); // 5000 + 500 + 5500
  }
}


// creating new game
function bonusBattlesSelectAmount(i) {
  $('#bonus_amount').attr('data-selected', i);
  // $('#bonus_amount div').attr('data-selected', false);
  // $('#bonus_amount div[data-id="' + i + '"]').attr('data-selected', true);
}

function bonusBattlesSelectGame(id) {
  $('#bonus_game').attr('data-selected', id);
  $('#bonus_game img').attr('data-selected', false);
  $('#bonus_game img[data-id="' + id + '"]').attr('data-selected', true);
}

function createBonusBattle() {
  $('#create_bonus_battle').addClass('disabled');

  send_request_socket({
    'type': 'bonus',
    'action': 'create',
    'data': {
      amount: $('#bonus_amount').attr('data-selected'),
      players: $('#bonusbattle_players').val(),
      game: $('#bonus_game').attr('data-selected')
    },
  });
}


function joinBonusBattle(id) {
  if($(`#bonus_game_id_${id}`).attr('data-areusure') == 'false') {
    $(`#bonus_game_id_${id}`).attr('data-areusure', true);
    $(`#bonus_game_id_${id}`).html('Are you sure?');
  } else {
    send_request_socket({
      'type': 'bonus',
      'action': 'join',
      'data': {
        battle_id: id
      },
    });
  }
}
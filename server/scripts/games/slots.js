const fs = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');
const yaml = require('js-yaml');








const games22 = JSON.parse(fs.readFileSync('./b_games_all.json', 'utf8'));



/*


  BONUS BATTLES CODE


*/


const VALID_AMOUNTS = [20,40,60,80,100,120,140,160,180,200,240,280,300,360,400,420,480,500,540,600,700,800,900,1000,1200,1400,1600,1800,2000,2400,2800,3000,3200,3600,4000,5000,6000,7000,8000,9000,10000];
const VALID_GAMES = [
  {title: "Fruit Party", id: "pragmaticexternal:FruitParty1"},
  {title: "Sweet Bonanza", id: "pragmaticexternal:SweetBonanza"},
  {title: "Gates of Olympus", id: "pragmaticexternal:GatesOfOlympus1"},
  {title: "Fruit Party 2", id: "pragmaticexternal:FruitParty2"},
  {title: "Gems Bonanza", id: "pragmaticexternal:GemsBonanza1"},
  {title: "The Dog House Megaways", id: "pragmaticexternal:TheDogHouseMegaways1"},
  {title: "Buffalo King Megaways", id: "pragmaticexternal:BuffaloKingMegaways1"},
  {title: "Release The Kraken", id: "pragmaticexternal:ReleasetheKraken"},
  {title: "Madame Destiny Megaways", id: "pragmaticexternal:MadameDestinyMegaways1"},
  {title: "Wild West Gold", id: "pragmaticexternal:WildWestGold"},
  {title: "Power of Thor Megaways", id: "pragmaticexternal:PowerofThorMegaways"},
  {title: "Sweet Bonanza Xmas", id: "pragmaticexternal:SweetBonanzaXmas"},
  {title: "The Hand of Midas", id: "pragmaticexternal:TheHandOfMidas"},
];

let active_bonusbattles = [{
  battle_id: 10,
  players: [{
    "userid": "b38c20cd9c93a81c50b8706f",
    "username": "user_5e49c1ed",
    "avatar": "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/bf/bf7fb685481a503f5cdea4f16092553c7c0f2fce_full.jpg",
    "winnings": 0,
    "game_id": undefined,
    "status": 0,
    "game_id": undefined
  }],
  amount: 20,
  time_start: 0,
  game: {"title":"Santa's Wonderland","id":"pragmaticexternal:SantasWonderland"},
}];
let bonus_actions = {};
let bonus_game_ids = {}; // association table
/* example
[
  {userid: 'xxxxx', amount: 20, game: 'pragmaticexternal:SantasWonderland'}
]
*/

/*
  workflow:
  0. before game, all regular slots game should have their game_id saved somewhere to not be confused
     balance: 100     balance_battles: 0
  1. user creates a battle, the amount goes into separate balance and stays there until game starts
     balance: 80     balance_battles: 20
  2. when the battle starts, we send a new /sessions to softswiss and remove the amount from balance_battles.
     from this point we are looking for new bets from the specific game, if we get one with a game_id
     that's unknown to us, this is our bonus battle session. we should not accept any bets besides the
     bonus buy, which is going to come as a regular bet with amount * 100. so if the battle is for $20,
     we only accept a "bet" action that has amount of "2000"
     balance: 80     balance_battles: 0
  3. the next action from the bonus battle game_id is going to be a "win" and the amount is going to be
     the amount that the player has won * 100. so if they won $7.91, it's going to be "791".
     at this point, we mark this player as complete and show him the waiting table
     balance: 80     balance_battles: 7.91

  when a battle starts, we add the userid and game code to a variable "active_battles", and on a new
  GCP_play request we check if the userid and game code matches anything from active_battles. if it
  does, we check if we already know the id - if so, let it proceed as usual, if not, we will only allow
  a "bet" action with a "amount" thats the supposed bonus amount buy

  known limitations:
  - opening a new slots game while a bonus battle is active will only let you buy the bonus
*/

function bonusBattlesHandler(user, socket, request) {
  if(request.action == 'create') return bonusBattlesCreate(user, socket, request);
  else if(request.action == 'join') return bonusBattlesJoin(user, socket, request);
  else if(request.action == 'get info') return bonusBattlesGetInfo(user, socket, request);
}

function bonusBattlesFirstJoin(socket, BONUS_GAME_ID) {
  // const extra_sql = BONUS_GAME_ID ? ` OR id = ${BONUS_GAME_ID}` : '';
  pool.query('SELECT * FROM `bonusbattles_games` ORDER BY id DESC', function(err1, row1) {
    if(err1) {
      logger.error(err1);
      writeError(err1);
      return;
    }

    if(row1.length <= 0) return;

    let battles = [];

    for(let i in row1) {
      const r = row1[i];

      if(r.status == 0 || r.status == 1) {
        battles.push(r);
      } else if(r.status == 2) {
        let battles2_total = battles.filter(x => x.status == 2).length;

        if(battles2_total < 16) {
          battles.push(r);
        } 
      }
    }

    for(let i in battles) {
      socket.emit('bonus', {action: 'new game', data: battles[i]});
    }
  });
}

function bonusBattlesGetInfo(user, socket, request) {
  pool.query('SELECT * FROM `bonusbattles_games` WHERE id = ' + pool.escape(request.id), function(err1, row1) {
    if(err1) {
      logger.error(err1);
      writeError(err1);
      return;
    }

    if(row1.length <= 0) return;

    for(let i in row1) {
      socket.emit('bonus', {action: 'new game', data: row1[i]});
    }
  });
}





function updateBonusBattle({ id, player, player_status, player_winnings }) {
  // fs.writeFileSync('./bonus_game_ids.json', JSON.stringify(bonus_game_ids, null, 2));

  const battle = active_bonusbattles.filter(x => x.battle_id == id)[0];
  if(!battle) return saveLog(`battle with id ${id} was not found`);

  const player__index = battle.players.map(x => x.userid).indexOf(player.userid);
  if(player__index == -1) return saveLog(`player ${player.userid} in battle with id ${id} was not found, something went horribly wrong`);

  battle.players[player__index] = player;
  battle.players[player__index].status = player_status;
  battle.players[player__index].winnings = player_winnings;

  saveLog(`[updateBonusBattle] player ${player.userid} in battle with id ${id} was updated`);
  saveLog(`[updateBonusBattle] new status: ${player_status}, new winnings: ${player_winnings} (${player__index})`);

  for(let i in battle.players) {
    saveLog(`${battle.players[i].userid} (status ${battle.players[i].status}, winnings: ${battle.players[i].winnings}, game_id: ${battle.players[i].game_id})`)
  }
  // let status = battle.status;
  // const players_0 = battle.players.filter(x => x.status == 0);
  // const players_1 = battle.players.filter(x => x.status == 1);
  const players_2 = battle.players.filter(x => x.status == 2);

  // if(players_0.length == battle.players) status = 0;
  // if(players_1.length == battle.players) status = 1;
  if(battle.status == 0) {
    if(battle.players.length >= battle.max_players) {
      battle.status = 1;
    }
  }

  

  if(players_2.length == battle.players.length) {
    battle.status = 2;
    const gm = battle.game.id.split(':');

    for(let i in battle.players) {
      io.sockets.in(battle.players[i].userid).emit('bonus', {
        action: 'redirect',
        game_data: {id: id, amount: battle.amount, gameid: `${gm[0]}/${gm[1]}`},
        // url: `/bonus_battle/${row1[0].id}`
        url: `/slots_game/${gm[0]}/${gm[1]}/${id}`
      });
    }
  }

  // updates
  if(player_status == 1 || player_status == 2) {
    io.sockets.in(player.userid).emit('bonus', {
      action: 'redirect',
      url: `/slot_arena/${id}`
    });
  }

  saveLog(`[updateBonusBattle] battle id ${id} has ${players_2.length} ready players and status of ${battle.status}`);

  pool.query('UPDATE `bonusbattles_games` SET `status` = ' + battle.status + ', `time_start` = ' + battle.time_start + ', `players` = ' + pool.escape(JSON.stringify(battle.players)) + ' WHERE `id` = ' + pool.escape(id), async function(err55){
    if(err55) {
      saveLog(`[updateBonusBattle] failed to update #${id} !!!`);
      saveLog(err55);
    }

    io.emit('bonus', {action: 'update game', data: battle});


    // for(let i in battle.players) {
    //   if(battle.players[i].status == 1) {
    //     io.sockets.in(battle.players[i].userid).emit('bonus', {
    //       action: 'redirect',
    //       url: `/slot_arena/${id}`
    //     });
    //   }
    // }



    if(battle.status == 2) {
      let total = 0;
      for(let i in battle.players) total += parseFloat(battle.players[i].winnings);

      battle.players.sort((a, b) => parseFloat(b.winnings) - parseFloat(a.winnings));

      saveLog(`[Bonus] Player ${battle.players[0].userid} has won battle #${id} and got a total of $${parseFloat(total).toFixed(2)}`);
      await updateBalance2(battle.players[0].userid, total * 0.965); // 3.50% house edge

      for(let j in battle.players) {
        await updateBalance2(battle.players[0].userid, -battle.players[j].winnings, false, true);
        
        saveLog(`[Bonus] Removed $${battle.players[j].winnings} from ${battle.players[j].userid} in game #${id}`);
        // todo: remove the bonuses from balance_battles
        io.sockets.in(battle.players[j].userid).emit('bonus', {
          action: 'redirect',
          url: `/slot_arena/${id}`
        });

        const bi = active_bonusbattles.map(x => x.battle_id).indexOf(id);
        if(bi !== -1) {
          active_bonusbattles.splice(bi, 1);
        }
      }
    }
  });

  // console.log(JSON.stringify(battle));
}







function bonusBattlesJoin(user, socket, request) {
  if(bonus_actions[user.userid]) return socket.emit('message', {type: 'error', error: 'Waiting for your previous action to finish.'});
  const { battle_id } = request.data;

  bonus_actions[user.userid] = true;

  pool.query('SELECT * FROM `bonusbattles_games` WHERE id = ' + pool.escape(battle_id), function(err1, row1) {
    if(err1) {
      logger.error(err1);
      writeError(err1);
      bonus_actions[user.userid] = false;
      return;
    }

    row1[0].players = JSON.parse(row1[0].players);
    row1[0].game = JSON.parse(row1[0].game);

    let _err;

    if(row1.length <= 0) _err = 'Invalid game.';
    if(row1[0].amount > user.balance) _err = 'Not enough balance.';
    if(row1[0].status !== 0) _err = 'This game has already started.';
    if(row1[0].players.length >= row1[0].max_players) _err = 'This game is full.';
    if(row1[0].players.map(x => x.userid).indexOf(user.userid) !== -1) _err = 'You are already in this game.';

    if(_err) {
      bonus_actions[user.userid] = false;
      return socket.emit('message', {type: 'error', error: _err});
    }

    // all good
    pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(row1[0].amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
    pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('bonusbattle_join') + ', `amount` = ' + (-row1[0].amount) + ', `time` = ' + pool.escape(time()));
    
    pool.query('UPDATE `users` SET `balance` = `balance` - ' + row1[0].amount + ', `balance_battles` = `balance_battles` + ' + row1[0].amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3){
      if(err3) {
        logger.error(err3);
        writeError(err3);
        bonus_actions[user.userid] = false;
        return socket.emit('message', {type: 'error', error: err3});
      }

      row1[0].players.push({
        userid: user.userid,
        username: user.name,
        avatar: user.avatar,
        winnings: 0,
        game_id: undefined,
        status: 0
      });

      if(row1[0].players.length >= row1[0].max_players) row1[0].status = 1;

      pool.query('UPDATE `bonusbattles_games` SET `status` = ' + row1[0].status + ', `players` = ' + pool.escape(JSON.stringify(row1[0].players)) + ' WHERE `id` = ' + pool.escape(battle_id), function(err4){
        if(err4) {
          logger.error(err4);
          writeError(err4);
          bonus_actions[user.userid] = false;
          return socket.emit('message', {type: 'error', error: err4});
        }

        bonus_actions[user.userid] = false;

        if(row1[0].status == 1) {
          active_bonusbattles.push({
            battle_id: row1[0].id,
            players: row1[0].players,
            amount: row1[0].amount,
            time_start: row1[0].time_start,
            game: row1[0].game,
            status: row1[0].status
          });

          const gm = row1[0].game.id.split(':');

          for(let j in row1[0].players) {
            saveLog(`redirecting ${row1[0].players[j].userid} to ${`/slots_game/${gm[0]}/${gm[1]}`}`);
            io.sockets.in(row1[0].players[j].userid).emit('bonus', {
              action: 'redirect',
              game_data: row1[0].players[j].userid == user.userid ? undefined : {id: row1[0].id, amount: row1[0].amount, gameid: `${gm[0]}/${gm[1]}`},
              // url: `/bonus_battle/${row1[0].id}`
              url: `/slots_game/${gm[0]}/${gm[1]}/${row1[0].id}`
            });
          }
        }
      });
    });
  });
}


function bonusBattlesCreate(user, socket, request) {
  if(bonus_actions[user.userid]) return socket.emit('message', {type: 'error', error: 'Waiting for your previous action to finish.'});
  bonus_actions[user.userid] = true;

  let { amount, game, players } = request.data;

  // validation
  let _err;

  amount = parseInt(amount);
  if(isNaN(amount) || !VALID_AMOUNTS[amount]) _err ='Invalid amount.';
  if(VALID_GAMES.map(x => x.id).indexOf(game) == -1) _err ='Invalid game.';
  if(isNaN(players) || players < 2 || players > 10) _err ='Invalid players number.';

  amount = VALID_AMOUNTS[amount];

  if(amount > user.balance) _err ='Not enough balance.';

  if(_err) {
    bonus_actions[user.userid] = false;
    return socket.emit('message', {type: 'error', error: _err});
  }

  // all good
  pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
  pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('bonusbattle_create') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
  
  pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ', `balance_battles` = `balance_battles` + ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3){
    if(err3) {
      logger.error(err3);
      writeError(err3);
      bonus_actions[user.userid] = false;
      return;
    }

    const _players = [{userid: user.userid, username: user.name, avatar: user.avatar, winnings: 0, game_id: undefined, status: 0}];

    const insert_data = {
      time_start: Math.round(+new Date() / 1000),
      status: 0, // 0 = waiting, 1 = in progress, 2 = over
      players: JSON.stringify(_players),
      game: JSON.stringify(VALID_GAMES.filter(x => x.id == game)[0]),
      amount: amount,
      max_players: players
    }

    // players status: 0 = didnt buy the bonus yet, 1 = bought bonus, 2 = game over

    pool.query('INSERT INTO `bonusbattles_games` SET `time_start` = ' + pool.escape(insert_data.time_start) + ', `status` = ' + pool.escape(insert_data.status) + ', `players` = ' + pool.escape(insert_data.players) + ', `game` = ' + pool.escape(insert_data.game) + ', `amount` = ' + insert_data.amount + ', `max_players` = ' + insert_data.max_players, function(err6, rs){
      if(err6) {
        logger.error(err6);
        writeError(err6);
        bonus_actions[user.userid] = false;
        return;
      }

      // game created
      insert_data.id = rs.insertId;
      io.emit('bonus', {action: 'new game', data: insert_data});

      bonus_actions[user.userid] = false;

      socket.emit('bonus', {action: 'redirect', url: `/slot_arena/${rs.insertId}`});

      // below code is for testing and will mark the game as started, should rly happen after all players join
      // active_bonusbattles.push({
      //   battle_id: insert_data.id,
      //   players: _players,
      //   amount: amount,
      //   time_start: insert_data.insert_data,
      //   game: VALID_GAMES.filter(x => x.id == game)[0]
      // })
    });
  });
}























/*


  REGULAR SLOTS CODE


*/

const STAGE = 'prod'; // DEV/PROD
const SSVALUES = {
  prod: {
    url: 'https://games-api.cryptospin.win',
    base_url: 'https://demo-bet.cryptospin.win',
    auth_token: 'bdad1a9e7c1b8a20539177a23ae2407f'
  },

  dev: {
    url: 'https://games-api.cryptospin.win',
    base_url: 'https://demo-bet.cryptospin.win',
    auth_token: 'bdad1a9e7c1b8a20539177a23ae2407f'
  }
}



let processed_actions = {};
let processed_actions_rb = {};
// let processed_actions = JSON.parse(fs.readFileSync(`processed_actions.json`));
// let processed_actions_rb = JSON.parse(fs.readFileSync(`processed_actions_rb.json`));
let rolled_back = {};

let currentGame = {};
let lastBet = {};
let activeGames = {};

/**
 * Paths exposed to regular users
*/
app.get('/backend/games', (req, res) => {
  const games = JSON.parse(fs.readFileSync('./b_games_all.json', 'utf8'));
  let games2 = [];
  let games3 = [];
  let games4 = [];

  for(let i in games) {
    if(games[i].provider == 'pushgaming') {
      games3.push(games[i]);
    } else {
      games2.push(games[i]);
    }
  }

  games4 = [...games3, ...games2];

  res.send(games4);
});

app.post('/backend/getDemoGame/:game', async (req, res) => {
  const data = await requestToAPI(`/createSession?game=${req.params.game}&player=demo&currency=USD&operator_key=${SSVALUES[STAGE].auth_token}&mode=real`);

  let session = data.message.session_url;
  let entry = session.split("=")[2].split("&")[0];
  let token =  data.message.data.token_internal;
  let user = data.message.data.player_id;

  let iframe = `https://games-api.cryptospin.win/g?token=${token}&entry=${entry}&player_id=${user}`;
  
  let launch = { launch_options: { strategy : "iframe", game_url : iframe } };
  res.send(launch);
});

app.get('/crypto/withdraws/bf7e4739eb63364c2ddc2f94090d3bbfc4a1cc791def73c0cd6dc07adf7810ec', (req, res) => {
  res.send(JSON.parse(fs.readFileSync('./crypto_withdraw.json', 'utf8')));
});

/**
 * Paths for requests from GCP
*/
// app.post('/play', (req, res) => handleGCPRquest(req, res, 'play'));
app.post('/backend_dev/:action', (req, res) => handleGCPRquest(req, res, req.params.action));
app.post('/backend/:action', (req, res) => handleGCPRquest(req, res, req.params.action));








/**
 * Handle all the requests from GCP to our server
*/
const handleGCPRquest = (req, res, path) => {
  const key = createHmacSHA256(JSON.stringify(req.body), SSVALUES[STAGE].auth_token);

  if(req.headers['x-request-sign'] !== key) {
    // logger.info('GCP REQUEST FAILED TO VERIFY');
    // logger.info(req.headers['x-request-sign'] + ' / ' + key);

    saveLog(`Failed to verify GCP Request (${req.headers['x-request-sign']} / ${key})`);
    saveLog(JSON.stringify(req.body, null, 2));

    return res.status(403).send({code: 403, msg: 'Forbidden'});
  }

  // verification success
  let r = JSON.parse(fs.readFileSync(`${path}.json`));
  let b = req.body;
  b.sign = req.headers['x-request-sign'];

  r.push(b);

  fs.writeFileSync(`${path}.json`, JSON.stringify(r, null, 2));

  // res.send('ok');
  if(!fn[path]) {
    // saveLog(`Received a GCP Request to a non-existing endpoint (${path})`);
    // saveLog(JSON.stringify(req.body, null, 2));

    return res.status(403).send({code: 403, msg: 'Forbidden'});
  } else {
    fn[path](req.body, res);
  }

  // return res.send('ok');
}

const GCP_play = async (data, res) => {
  // if(data.user_id == 'b38c20cd9c93a81c50b8706f') {
    saveLog('GCP_play (' + active_bonusbattles.length + ' active bonus battles)');
    saveLog(JSON.stringify(data, null, 2));
  // }
  saveLog(JSON.stringify(active_bonusbattles));

  try {
    /* start bonus battles case */
    // let bonusBattle = undefined;
    // let bonus_game_ids[data.game_id].player = undefined;

    if(data.user_id == 'b38c20cd9c93a81c50b8706f') saveLog(`(1) Checking: ${data.game_id} / ${activeGames[data.game_id]} / ${bonus_game_ids[data.game_id]} / ${active_bonusbattles.length}`);
    // if(data.game_id && !activeGames[data.game_id] && !bonus_game_ids[data.game_id]) { // check if its not a regular slots game
    if(!activeGames[data.game_id] && !bonus_game_ids[data.game_id]) {
      for(let i in active_bonusbattles) {
        const battle = active_bonusbattles[i];
        const player_index = battle.players.map(x => x.userid).indexOf(data.user_id);

        if(data.user_id == 'b38c20cd9c93a81c50b8706f') saveLog(`(2) Checking: ${data.game} / ${battle.game.id}`);

        if(data.game == battle.game.id) {
          if(data.user_id == 'b38c20cd9c93a81c50b8706f') saveLog(`(3) Checking: ${player_index} / ${bonus_game_ids[data.game_id]}`);

          if(!data.game_id) data.game_id = data.sign;

          if(player_index !== -1 && !bonus_game_ids[data.game_id]) {
            if(data.user_id == 'b38c20cd9c93a81c50b8706f') saveLog(`(4) All passed!`);
            battle.players[player_index].game_id = data.game_id;

            bonus_game_ids[data.game_id] = {
              battle: battle,
              player: battle.players[player_index]
            }
          }
        }
      }
    }

    /* end bonus battles case */
    getBalance2(data.user_id, !!bonus_game_ids[data.game_id]).then(async bal => {
      saveLog(`getBalance2 ${data.user_id}: ${!!bonus_game_ids[data.game_id]} (balance: ${bal})`);

      bal = parseInt(bal * 100);

      let response = {balance: bal};
      let totalWin = 0;
      let totalBet = 0;

      if(!bonus_game_ids[data.game_id]) {
        if(!data.actions) return res.send(response);
        if(data.actions.length <= 0) return res.send(response);
        if(typeof data.finished == 'boolean' && !data.finished) return res.send(response);
      }


      /* start bonus battles code */
      if(!!bonus_game_ids[data.game_id]) {
        if(typeof data.actions == 'undefined') {
          if(bonus_game_ids[data.game_id].player.status == 1) {
            bonus_game_ids[data.game_id].player.status = 2;

            saveLog(`[Bonus] Game over! ${bonus_game_ids[data.game_id].player.userid} has won a total of ${bonus_game_ids[data.game_id].player.winnings}`);
            
            updateBonusBattle({
              id: bonus_game_ids[data.game_id].battle.battle_id,
              player: bonus_game_ids[data.game_id].player,
              player_status: bonus_game_ids[data.game_id].player.status,
              player_winnings: bonus_game_ids[data.game_id].player.winnings
            });
          }

          return res.send(response);
        }


        for(let i in data.actions) {
          if(data.actions[i].action == 'bet') {
            if(bonus_game_ids[data.game_id].player.status !== 0) return res.status(412).send({code: 106, msg: 'Bet exceeded max bet limit', balance: bal});
            if(data.actions[i].amount !== Math.round(bonus_game_ids[data.game_id].battle.amount * 100)) return res.status(412).send({code: 106, msg: 'Bet exceeded max bet limit', balance: bal});
            
            saveLog('[Bonus] Registered bonus buy from ' + bonus_game_ids[data.game_id].player.userid + ' valued at ' + data.actions[0].amount);
            // saveLog(JSON.stringify(data, null, 2));

            bonus_game_ids[data.game_id].player.status = 1;
            bonus_game_ids[data.game_id].player.winnings = 0;

            // updateBonusBattle(bonus_game_ids[data.game_id].battle.battle_id);
            updateBonusBattle({
              id: bonus_game_ids[data.game_id].battle.battle_id,
              player: bonus_game_ids[data.game_id].player,
              player_status: bonus_game_ids[data.game_id].player.status,
              player_winnings: bonus_game_ids[data.game_id].player.winnings
            });
          } else if(data.actions[i].action == 'win') {
            bonus_game_ids[data.game_id].player.winnings += data.actions[0].amount / 100;
  
            saveLog('[Bonus] Adding ' + data.actions[0].amount + ' to ' + bonus_game_ids[data.game_id].player.userid + ' (total: ' + parseFloat(bonus_game_ids[data.game_id].player.winnings).toFixed(2) + ')');
            // saveLog(JSON.stringify(data, null, 2));
  
            // updateBonusBattle(bonus_game_ids[data.game_id].battle.battle_id);
            updateBonusBattle({
              id: bonus_game_ids[data.game_id].battle.battle_id,
              player: bonus_game_ids[data.game_id].player,
              player_status: bonus_game_ids[data.game_id].player.status,
              player_winnings: bonus_game_ids[data.game_id].player.winnings
            });
          }
        }
      }
      /* end bonus battles code */



      response.game_id = data.game_id;
      response.transactions = [];

      // check for no funds
      for(let i in data.actions) {
        if(data.actions[i].action == 'bet') totalBet += data.actions[i].amount;
        else totalWin += data.actions[i].amount;
      }

      if(totalBet > bal) {
        return res.status(412).send({code: 100, msg: 'Precondition failed', balance: bal});
      }
      
      // loop transactions
      for(let i in data.actions) {
        let a = data.actions[i];
        let tx_id = createHmacSHA256(a.action_id + '-' + a.amount, data.user_id);

        // check if this bet wasnt rolled back
        for(let j in processed_actions_rb) {
          if(processed_actions_rb[j].original_action_id == a.action_id || rolled_back[a.action_id]) {
            processed_actions[a.action_id] = {
              action_id: a.action_id,
              tx_id: tx_id,
              action: a.action
            };
          }
        }

        // all good
        if(!processed_actions[a.action_id]) {
          let action_data = {
            action_id: a.action_id,
            tx_id: tx_id,
            processed_at: new Date().toISOString(),
            action: a.action,
            bonus_amount: a.bonus_amount ? a.bonus_amount : 0
          };

          addRakeback((a.amount / 100), 'slots', data.user_id);
          await updateBalance2(data.user_id, (a.amount / 100) * (a.action == 'bet' ? -1 : 1), false, !!bonus_game_ids[data.game_id]);

          action_data.balance_now = response.balance; // backup incase of rollback

          response.balance += a.amount * (a.action == 'bet' ? -1 : 1);
          response.transactions.push(action_data);

          processed_actions[a.action_id] = action_data;

          if(a.action == 'bet') {
            lastBet[data.user_id] = a.amount / 100;
          }
        } else {
          response.transactions.push(processed_actions[a.action_id]);
        }

        // add to db
        inputATdata(data.user_id, a.amount / 100, a.action);
      }

      if(!bonus_game_ids[data.game_id]) {
        activeGames[data.game_id] = {userid: data.user_id, game: data.game};
      }

      fs.writeFileSync(`processed_actions.json`, JSON.stringify(processed_actions));

      return res.send(response);
    });
  } catch(e) {
    saveLog('GCP_play FAILED!');
    saveLog(e);

    return res.status(500).send({code: 500, message: 'Interval server error'});
  }
}

const GCP_rollback = async (data, res) => {
  getBalance2(data.user_id).then(async bal => {
    bal = parseInt(bal * 100);

    let response = {balance: bal, game_id: data.game_id, transactions: []};

    // loop transactions
    for(let i in data.actions) {
      let a = data.actions[i];
      if(!processed_actions_rb[a.action_id]) {
        let og_action = processed_actions[a.original_action_id];

        rolled_back[a.original_action_id] = true;

        // RollbackBeforeBet
        if(!og_action) {
          processed_actions_rb[a.action_id] = {
            action_id: a.action_id,
            original_action_id: a.original_action_id
          }

          fs.writeFileSync(`processed_actions_rb.json`, JSON.stringify(processed_actions_rb));
        } else {
          // all fine, process the rollback as usual
          let action_data = {
            action_id: a.action_id,
            original_action_id: a.original_action_id,
            tx_id: og_action.tx_id,
            processed_at: new Date().toISOString()
          }

          await updateBalance2(data.user_id, og_action.balance_now / 100, true);

          response.balance = og_action.balance_now;
          response.transactions.push(action_data);

          processed_actions_rb[a.action_id] = action_data;
        }
      } else {
        response.transactions.push(processed_actions_rb[a.action_id]);
      }
    }

    fs.writeFileSync(`processed_actions_rb.json`, JSON.stringify(processed_actions_rb));

    return res.send(response);
  });
}

const fn = {
  play: GCP_play,
  rollback: GCP_rollback
}





/**
 * This will send a request to backend server
 * Includes all the necessary data already in the body
*/
const requestToAPI = async (url, body = {}, ip) => {
  saveLog('Sending request to backend ' + url + ' from ' + ip);
  saveLog(JSON.stringify(body, null, 2));
  console.log("------------------------------------------------------");
  console.log(SSVALUES[STAGE].url+"/api"+url);
  let cres = await fetch(`${SSVALUES[STAGE].url}/api${url}`, {method: 'GET', headers: {'Content-Type': 'application/json'}});
  let data = await cres.text();

  try {
    data = JSON.parse(data);
  } catch(e) {
    logger.error(e.message);
    logger.info(data);
  }

  saveLog('Received data from backend');
  saveLog(JSON.stringify(data, null, 2));

  return data;
}

const createHmacSHA256 = (body, key) => {
  return crypto.createHmac('sha256', key).update(body).digest('hex');
}

const saveLog = data => {
  let r = fs.readFileSync(`slots_log.log`);
  r += "\n" + data;

  fs.writeFileSync(`slots_log.log`, r);
}












/**
 * Handles requests from the user
*/ 
async function slotsHandler(r, user, socket) {
  console.log(`slotsHandler ${r.command}`);
  // todo: add a switch and move to different functions or create a class/object

  if(r.command == 'get game') {
    // const balance_battles = await getUserBalanceBattles(user.userid);
    getUser(user.userid, async userData222 => {
      const data = await requestToAPI('/sessions', {
        "game": r.game,
        "currency": "EUR",
        "balance": r.isBonusBattle ? userData222.balance_battles : user.balance,
        // "balance": user.balance,
        "urls": {
          "deposit_url": `${SSVALUES[STAGE].base_url}/deposit`,
          "return_url": `${SSVALUES[STAGE].base_url}/slots`
        },
        "user": { // todo: get the complete data
          "id": user.userid,
          "firstname": "Test",
          "lastname": "Name",
          "nickname": user.name,
          "city": "",
          "country": "DE",
          "date_of_birth": "1980-12-26",
          "gender": "m",
          "registered_at": "2018-10-11"
        }
      }, socket.handshake.address);

      currentGame[user.userid] = r.game;

      socket.emit('slots', {
        command: 'launch game',
        launch_options: data.launch_options,
        message: data.message
      });
    });
  }
}


/**
 * Helper function to add transaction / affiliates data to database
*/
function inputATdata(userid, amount = 0, type = 'bet') {
  return new Promise(async (resolve, reject) => {
    if(amount == 0) return resolve('ok');

    addToFooterStats();
    
    const game = currentGame[userid] || '?';

    if(type == 'bet') {
      pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(amount) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(userid));
      pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(userid), function(){ getLevel(userid); });
      pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(userid) + ', `service` = ' + pool.escape('slots_bet') + ', `amount` = '+ (-amount) + ', `time` = ' + pool.escape(time()));


      //AFFILIATES
      pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(userid) + ' GROUP BY referral_uses.referral', async function(err3, row3) {
        if(err3) {
          logger.error(err3);
          writeError(err3);

          return resolve('ok');
        }
        
        if(row3.length > 0) {
          var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row3[0].amount), 'bet'));
          
          pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(userid) + ', `referral` = ' + pool.escape(row3[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
          pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row3[0].referral));
        }
        
        pool.query('INSERT INTO `slots_bets` SET `userid` = ' + pool.escape(userid) + ', `xp` = ' + parseInt(getXpByAmount(amount)) + ', `amount` = ' + amount + ', `game` = ' + pool.escape(game) + ', `time` = ' + pool.escape(time()), function(err4, row4) {
          if(err4) {
            logger.error(err4);
            writeError(err4);

            return resolve('ok');
          }

          return resolve('ok');
        });
      });
    } else {
      pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(userid) + ', `service` = ' + pool.escape('slots_win') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));

      if(amount > 0) {
        getUser(userid, userdata => {
          const game2 = games22.filter(x => x.identifier2 == game)[0];

          addLiveBet('slots_' + (game2 || game), userdata, lastBet[userid] || 1, amount, amount / (lastBet[userid] || 1));
        });
      }

      return resolve('ok');
    }
  });
}




function getUser(userid, cb) {
  pool.query('SELECT `username`, `avatar`, `userid`, `balance_battles` FROM `users` WHERE `userid` = ' + pool.escape(userid), function(err1, row1) {
    if(err1) return cb({balance_battles: 0, username: '', avatar: '', userid: userid});
    if(row1.length == 0) return cb({balance_battles: 0, username: '', avatar: '', userid: userid});

    if(cb) return cb(row1[0]);
  });
}

async function getUserBalanceBattles(userid) {
  return new Promise((resolve, reject) => {
    pool.query('SELECT `userid`, `balance_battles` FROM `users` WHERE `userid` = ' + pool.escape(userid), function(err1, row1) {
      if(err1) {
        saveLog(err1);
        return resolve(0);
      }
      if(row1.length == 0) return resolve(0);

      return resolve(parseFloat(row1[0].balance_battles));
    });
  })
}
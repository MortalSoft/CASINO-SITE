const VALID_AMOUNTS = [10,20,30,50,80,100,150,200,300,500,800,1000,1250,1500,2000];
const VALID_GAMES = [
  {title: "Santa's Wonderland", id: "pragmaticexternal:SantasWonderland"}
];

let active_bonusbattles = [];
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
}

function bonusBattlesFirstJoin(socket) {
  pool.query('SELECT * FROM `bonusbattles_games` WHERE status = 0', function(err1, row1) {
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

function updateBonusBattle(id) {
  // console.log()
  const battle = active_bonusbattles.filter(x => x.battle_id == id)[0];

  if(!battle) return console.log(`battle with id ${id} was not found`);

  console.log(`battle with id ${id} was updated`);

  for(let i in battle.players) {
    console.log(`${battle.players[i].userid} (status ${battle.players[i].status}, winnings: ${battle.players[i].winnings}, game_id: ${battle.players[i].game_id})`)
  }

  console.log(JSON.stringify(battle));
}

function bonusBattlesCreate(user, socket, request) {
  let { amount, game, players } = request.data;

  // validation
  amount = parseInt(amount);
  if(isNaN(amount) || !VALID_AMOUNTS[amount]) return socket.emit('message', {type: 'error', error: 'Invalid amount.'});
  if(VALID_GAMES.map(x => x.id).indexOf(game) == -1) return socket.emit('message', {type: 'error', error: 'Invalid game.'});
  if(isNaN(players) || players < 2 || players > 10) return socket.emit('message', {type: 'error', error: 'Invalid players number.'});

  amount = VALID_AMOUNTS[amount];

  if(amount > user.balance) return socket.emit('message', {type: 'error', error: 'Not enough balance.'});

  // all good
  pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
  pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('bonusbattle_create') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
  
  pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ', `balance_battles` = `balance_battles` + ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3){
    if(err3) {
      logger.error(err3);
      writeError(err3);
      return;
    }

    const insert_data = {
      time_start: Math.round(+new Date() / 1000),
      status: 0, // 0 = waiting, 1 = in progress, 2 = over
      players: JSON.stringify([{userid: user.userid, username: user.username, avatar: user.avatar, winnings: 0, game_id: undefined, status: 0}]),
      game: JSON.stringify(VALID_GAMES.filter(x => x.id == game)[0]),
      amount: amount,
      max_players: players
    }

    // players status: 0 = didnt buy the bonus yet, 1 = bought bonus, 2 = game over

    pool.query('INSERT INTO `bonusbattles_games` SET `time_start` = ' + pool.escape(insert_data.time_start) + ', `status` = ' + pool.escape(insert_data.status) + ', `players` = ' + pool.escape(insert_data.players) + ', `game` = ' + pool.escape(insert_data.game) + ', `amount` = ' + insert_data.amount + ', `max_players` = ' + insert_data.max_players, function(err6, rs){
      if(err6) {
        logger.error(err6);
        writeError(err6);
        return;
      }

      // game created
      insert_data.id = rs.insertId;
      io.emit('bonus', {action: 'new game', data: insert_data});

      // below code is for testing and will mark the game as started
      active_bonusbattles.push({
        battle_id: insert_data.id,
        players: players,
        amount: amount,
        time_start: insert_data.insert_data,
        game: VALID_GAMES.filter(x => x.id == game)[0]
      })
    });
  });
}
/* JACKPOT */

var jackpotGame_lastGames = [];

jackpotGame_loadHistory();
function jackpotGame_loadHistory(){
	pool.query('SELECT * FROM `jackpot_history` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 20', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		row1.reverse();
		
		row1.forEach(function(history){
			pool.query('SELECT * FROM `jackpot_bets` WHERE `id` = ' + parseInt(history.betid) + ' AND `gameid` = ' + parseInt(history.id), function(err2, row2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				if(row2.length > 0){
					jackpotGame_lastGames.push({
						id: history.id,
						user: {
							userid: row2[0].userid,
							name: row2[0].name,
							avatar: row2[0].avatar,
							level: calculateLevel(row2[0].xp).level
						},
						players: history.players || [],
						chance: roundedToFixed(history.chance, 2),
						amount: getFormatAmount(history.amount)
					});
				}
			});
		});
	});
};

var jackpotGame_settings = {
	last_ticket: 0,
	start_time: 0,
	avatars_rolling: []
}

var jackpotGame_totalBets = [];
var jackpotGame_countBets = {};
var jackpotGame_amountBets = {};

var jackpotGame_totalAmounts = 0;

var jackpotGame_lastWinner = {};

var jackpotGame = {
	status: 'wait',
	hash: null,
	secret: null,
	percentage: null,
	id: null
}

jackpotGame_checkGames();

function jackpotGame_checkGames(){
	pool.query('SELECT * FROM `jackpot_history` WHERE `ended` = 0 ORDER BY `id` DESC LIMIT 1', function(err1, row1){
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length > 0){
			jackpotGame = {
				status: 'wait',
				hash: row1[0].hash,
				secret: row1[0].secret,
				percentage: row1[0].percentage,
				id: row1[0].id
			}
			
			io.sockets.emit('message', {
				type: 'jackpot',
				command: 'hash',
				hash: jackpotGame.hash
			});
			
			pool.query('SELECT * FROM `jackpot_bets` WHERE `gameid` = ' + parseInt(jackpotGame.id), function(err2, row2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				row2.forEach(function(bet){
					var amount = getFormatAmount(bet.amount);
					
					var min_ticket = parseInt(jackpotGame_settings.last_ticket + 1);
					var max_ticket = parseInt(parseInt(amount * 100) + jackpotGame_settings.last_ticket);
					
					if(jackpotGame_countBets[bet.userid] === undefined){
						jackpotGame_countBets[bet.userid] = 1;
						jackpotGame_amountBets[bet.userid] = amount;
					}else{
						jackpotGame_countBets[bet.userid]++;
						jackpotGame_amountBets[bet.userid] += amount;
					}
					
					jackpotGame_totalAmounts += amount;
					
					jackpotGame_totalBets.push({
						id: bet.id,
						user: {
							userid: bet.userid,
							name: bet.name,
							avatar: bet.avatar,
							level: calculateLevel(bet.xp).level
						},
						amount: amount,
						tickets: {
							min: min_ticket,
							max: max_ticket
						}
					});
					
					if(jackpotGame_totalBets.length > 0){
						jackpotGame_totalBets.forEach(function(item){
							var chance = roundedToFixed(parseFloat(jackpotGame_amountBets[item.user.userid] / jackpotGame_totalAmounts * 100), 2);
							
							io.sockets.in(item.user.userid).emit('message', {
								type: 'jackpot',
								command: 'chance',
								chance: chance
							});
						});
					}
					
					jackpotGame_settings.last_ticket += parseInt(amount * 100);
					jackpotGame_checkRound();
					
					logger.debug('[JACKPOT] Bet registed. ' + bet.name + ' did bet $' + getFormatAmountString(amount));
				});
			});
		} else jackpotGame_generateGame();
	});
}

function jackpotGame_generateGame(){
	jackpotGame.secret = makeCode(16);
	jackpotGame.percentage = Math.random() * 100;
	jackpotGame.hash = sha256(jackpotGame.secret+'-'+jackpotGame.percentage);

	pool.query('INSERT INTO `jackpot_history` SET `hash` = '+pool.escape(jackpotGame.hash)+', `secret` = '+pool.escape(jackpotGame.secret)+', `percentage` = '+parseFloat(jackpotGame.percentage)+', `time` = '+pool.escape(time()), function(err, row){
		if(err) {
			logger.error(err);
			writeError(err);
			return;
		}
		
		jackpotGame.id = row.insertId;
		
		jackpotGame.status = 'wait';
		
		io.sockets.emit('message', {
			type: 'jackpot',
			command: 'hash',
			hash: jackpotGame.hash
		});
	});
}

function jackpotGame_bet(user, socket, amount){
	setUserRequest(user.userid, 'jackpot', true, true);
	
	if(jackpotGame.status != 'started' && jackpotGame.status != 'wait') {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Wait for preparing a new round!'
		});
		setUserRequest(user.userid, 'jackpot', false, true);
		return;
	}
	
	if(jackpotGame_countBets[user.userid] !== undefined && jackpotGame_countBets[user.userid] >= config.config_games.games.jackpot.total_bets) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You have entered too many times in jackpot'
		});
		setUserRequest(user.userid, 'jackpot', false, true);
		return;
	}
	
	verifyFormatAmount(amount, function(err1, amount){
		if(err1){
			socket.emit('message', {
				type: 'error',
				error: err1.message
			});
			setUserRequest(user.userid, 'jackpot', false, true);
			return;
		}
		
		if(amount < config.config_site.interval_amount.jackpot.min || amount > config.config_site.interval_amount.jackpot.max) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bet amount [' + getFormatAmountString(config.config_site.interval_amount.jackpot.min) + '-' + getFormatAmountString(config.config_site.interval_amount.jackpot.max)  + ']!'
			});
			setUserRequest(user.userid, 'jackpot', false, true);
			return;
		}
	
		if(getFormatAmount(user.balance) < amount) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have enough money!'
			});
			setUserRequest(user.userid, 'jackpot', false, true);
			return;
		}
		
		pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(amount) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(user.userid));
		pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
		pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('jackpot_bet') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
	
		pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'jackpot', false, true);
				return;
			}
			
			//AFFILIATES
			pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err3, row3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'jackpot', false, true);
					return;
				}
				
				if(row3.length > 0 && should_refferals_count_wager) {
					var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row3[0].amount), 'bet'));
					
					pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row3[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row3[0].referral));
				}
			
			
				var min_ticket = parseInt(jackpotGame_settings.last_ticket + 1);
				var max_ticket = parseInt(parseInt(amount * 100) + jackpotGame_settings.last_ticket);
				
				pool.query('INSERT INTO `jackpot_bets` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + parseInt(user.xp) + ', `amount` = ' + amount + ', `ticket_min` = ' + pool.escape(min_ticket) + ', `ticket_max` = ' + pool.escape(max_ticket) + ', `gameid` = ' + parseInt(jackpotGame.id) + ', `time` = ' + pool.escape(time()), function(err4, row4) {
					if(err4) {
						logger.error(err4);
						writeError(err4);
						setUserRequest(user.userid, 'jackpot', false, true);
						return;
					}
				
					if(jackpotGame_countBets[user.userid] === undefined){
						jackpotGame_countBets[user.userid] = 1;
						jackpotGame_amountBets[user.userid] = amount;
					} else {
						jackpotGame_countBets[user.userid]++;
						jackpotGame_amountBets[user.userid] += amount;
					}
					
					jackpotGame_totalAmounts += amount;
					
					jackpotGame_totalBets.push({
						id: row4.insertId,
						user: {
							userid: user.userid,
							name: user.name,
							avatar: user.avatar,
							level: calculateLevel(user.xp).level
						},
						amount: amount,
						tickets: {
							min: min_ticket,
							max: max_ticket
						}
					});
					
					if(jackpotGame_totalBets.length > 0){
						jackpotGame_totalBets.forEach(function(item){
							var chance = roundedToFixed(parseFloat(jackpotGame_amountBets[item.user.userid] / jackpotGame_totalAmounts * 100), 2);
							
							io.sockets.in(item.user.userid).emit('message', {
								type: 'jackpot',
								command: 'chance',
								chance: chance
							});
						});
					}
					
					socket.emit('message', {
						type: 'jackpot',
						command: 'bet_confirmed',
					});

					addRakeback(amount, 'jackpot', user.userid);
					
					io.sockets.emit('message', {
						type: 'jackpot',
						command: 'bet',
						bet: {
							id: row4.insertId,
							user: {
								user: user.userid,
								name: user.name,
								avatar: user.avatar,
								level: calculateLevel(user.xp).level
							},
							amount: amount,
							tickets: {
								min: min_ticket,
								max: max_ticket
							}
						},
						total: jackpotGame_totalAmounts
					});
					
					jackpotGame_settings.last_ticket += parseInt(amount * 100);
					jackpotGame_checkRound();
					
					getBalance(user.userid);
					addToFooterStats();
					
					logger.debug('[JACKPOT] Bet registed. ' + user.name + ' did bet $' + getFormatAmountString(amount));
					
					setUserRequest(user.userid, 'jackpot', false, false);
				});
			});
		});
	});
}

async function jackpotGame_checkRound(){
	if(jackpotGame_totalBets.length >= 2 && Object.keys(jackpotGame_countBets).length >= 2){
		if(jackpotGame.status == 'wait'){	
			jackpotGame.status = 'started';
		
			var timer = config.config_games.games.jackpot.timer;
			
			var timerID = setInterval(async function(){
				if(timer >= 0){
					io.sockets.emit('message', {
						type: 'jackpot',
						command: 'timer',
						time: timer,
						total: config.config_games.games.jackpot.timer
					});
					
					timer--;
				} else {
					clearInterval(timerID);
					
					jackpotGame.status = 'picking';
					
					// EOS_CODE
					const lastBlock = await getLastBlockNum();
					const targetBlock = lastBlock + 8;

					io.sockets.emit('message', {
						type: 'jackpot',
						command: 'picking',
						targetBlock: targetBlock
					});

					// console.log('Target block number:', targetBlock)
					// console.log('Current time:', new Date())
					let publicSeed;
					await sleep(3000);

					while(!publicSeed) {
					  try {
					    const blockInfo = await getBlockInfo(targetBlock);
					    if (blockInfo) {
					      // console.log('Block found! \n -> Mining time:', blockInfo.timestamp)
					      publicSeed = blockInfo.id;
					    }
					  } catch (error) {
					    // console.log('Not mined yet')
					  }
					  await sleep(1000);
					}
					// console.log('Public seed:', publicSeed)

					setTimeout(function(){
						jackpotGame_pickingWinner(publicSeed);
					}, 5000);
				}
			}, 1000);
		}
	}
}

function jackpotGame_pickingWinner(pseed){
	jackpotGame.status = 'rolling';
	
	var winner_jackpot = {};
	var winner_id = null;
	
	// EOS_CODE
	var finalHash = `${jackpotGame.hash}-${pseed}`;
	// var winnerTick = Math.floor(jackpotGame.percentage * jackpotGame_settings.last_ticket / 100);
	var winnerTick = parseInt(finalHash.substr(0, 8), 16) % jackpotGame_settings.last_ticket;
	
	// parseInt(hash.substr(0, 8), 16) % 100000 + 1;

	if(winnerTick < 1) winnerTick = 1;
	
	for(let bet of jackpotGame_totalBets) {
		if(winnerTick >= bet.tickets.min && winnerTick <= bet.tickets.max) {
			winner_jackpot = bet.user;
			winner_id = bet.id;
			break;
		}
	}
	
	/*var avatars = [];
	var totalAvatars = 150;
	
	for(var i = 0; i < totalAvatars; i++){
		var ticket = getRandomInt(1, jackpotGame_settings.last_ticket);
		
		for(let bet of jackpotGame_totalBets) {
			if(ticket >= bet.tickets.min && ticket <= bet.tickets.max){
				avatars.push(bet.user.avatar);
				break;
			}
		}
	}
	
	avatars[99] = winner_jackpot.avatar;
	
	jackpotGame_settings.avatars_rolling = avatars;*/
	
	jackpotGame_settings.start_time = new Date().getTime();
	
	io.sockets.emit('message', {
		type: 'jackpot',
		command: 'roll',
		// avatars: jackpotGame_settings.avatars_rolling,
		winner: winner_jackpot,
		cooldown: 0
	});
	
	setTimeout(function(){
		var chance_winner = roundedToFixed(parseFloat(jackpotGame_amountBets[winner_jackpot.userid] / jackpotGame_totalAmounts * 100), 2);

		var winning = getFormatAmount(jackpotGame_totalAmounts - getFeeFromCommission(jackpotGame_totalAmounts, config.config_games.games.jackpot.commission));
		
		io.sockets.emit('message', {
			type: 'jackpot',
			command: 'percentage',
			percentage: jackpotGame.percentage
		});
		
		io.sockets.emit('message', {
			type: 'jackpot',
			command: 'secret',
			secret: pseed // jackpotGame.secret
		});
		
		jackpotGame_lastWinner = {
			name: winner_jackpot.name,
			chance: chance_winner,
			amount: winning
		};
		
		io.sockets.emit('message', {
			type: 'jackpot',
			command: 'winner',
			winner: jackpotGame_lastWinner
		});
		
		pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(winner_jackpot.userid) + ', `service` = ' + pool.escape('jackpot_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
		pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(winner_jackpot.userid), function(err1){
			if(err1) {
				logger.error(err1);
				writeError(err1);
				return;
			}
			
			getBalance(winner_jackpot.userid);
			
			if(winning >= config.config_games.winning_to_chat){
				var send_message = winner_jackpot.name + ' won ' + getFormatAmountString(winning) + ' to jackpot with chance ' + chance_winner.toFixed(2) + '%!';
				otherMessages(send_message, io.sockets, true);
			}

			addLiveBet('jackpot', winner_jackpot, winning * (chance_winner / 100), winning, winning / (winning * (chance_winner / 100)));
			
			logger.debug('[JACKPOT] Win registed. ' + winner_jackpot.name + ' did win $' + getFormatAmountString(winning) + ' with chance ' + chance_winner.toFixed(2) + '%');
			
			var history = {
				user: winner_jackpot,
				chance: chance_winner, 
				amount: winning,
				players: jackpotGame_totalBets
			};
			
			jackpotGame_lastGames.push(history);
			while(jackpotGame_lastGames.length > 10) jackpotGame_lastGames.shift();
			
			pool.query('UPDATE `jackpot_history` SET `ended` = 1, `betid` = ' + pool.escape(winner_id) + ', `chance` = ' + chance_winner + ', `ticket` = ' + parseInt(winnerTick) + ', `amount` = ' + winning + ', `tickets` = ' + parseInt(jackpotGame_settings.last_ticket) + ', `players` = "' + pool.escape(JSON.stringify(jackpotGame_totalBets)) + '" WHERE `id` = ' + parseInt(jackpotGame.id), function(err2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				setTimeout(function(){
					jackpotGame_generateGame();
					
					jackpotGame_countBets = {};
					jackpotGame_amountBets = {};
					jackpotGame_totalBets = [];
					
					jackpotGame_totalAmounts = 0;
					jackpotGame_lastWinner = {};
					
					jackpotGame_settings.last_ticket = 0;
					
					io.sockets.emit('message', {
						type: 'jackpot',
						command: 'reset'
					});
					
					io.sockets.emit('message', {
						type: 'jackpot',
						command: 'history',
						history: history
					});
				}, 5000);
			});
		});
	}, 7000);
}

/* END JACKPOT */

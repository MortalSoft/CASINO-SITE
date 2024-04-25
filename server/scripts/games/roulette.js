/* ROULETTE */

var rouletteGame_lastGames = []; 
var rouletteGame_last100Games = [];

var rouletteGame_lastRoll = {
	roll: null,
	progress: null,
	color: null,
	id: null
};

rouletteGame_loadHistory();
function rouletteGame_loadHistory(){
	pool.query('SELECT * FROM `roulette_rolls` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 10', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		rouletteGame_lastRoll = {
			roll: row1[0].roll,
			progress: row1[0].progress,
			color: row1[0].color,
			id: row1[0].id
		};
		
		row1.reverse();
		
		row1.forEach(function(roll){
			rouletteGame_lastGames.push({roll: roll.roll, color: roll.color});
		});
	});

	pool.query('SELECT * FROM `roulette_rolls` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 100', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		row1.reverse();
		
		row1.forEach(function(roll){
			rouletteGame_last100Games.push({roll: roll.roll, color: roll.color});
		});
	});
}

var rouletteGame_settings = {
	timer: 0
}

var rouletteGame_totalBets = [];
var rouletteGame_countBets = {};
var rouletteGame_amountBets = {};

var rouletteGame = {
	status: 'ended',
	hash: null,
	secret: null,
	roll: null,
	progress: null,
	color: null,
	id: null
}

function rouletteGame_bet(user, socket, amount, color) {
	setUserRequest(user.userid, 'roulette', true, true);
	
	if((rouletteGame_countBets[user.userid] !== undefined) && (rouletteGame_countBets[user.userid] >= config.config_games.games.roulette.total_bets)) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You have entered too many times in roulette!'
		});
		setUserRequest(user.userid, 'roulette', false, true);
		return;
	}
	
	if(rouletteGame.status != 'started') {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Betting for this round is closed!'
		});
		setUserRequest(user.userid, 'roulette', false, true);
		return;
	}
	
	verifyFormatAmount(amount, function(err1, amount){
		if(err1){
			socket.emit('message', {
				type: 'error',
				error: err1.message
			});
			setUserRequest(user.userid, 'roulette', false, true);
			return;
		}
		
		if(amount < config.config_site.interval_amount.roulette.min || amount > config.config_site.interval_amount.roulette.max) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bet amount [' + getFormatAmountString(config.config_site.interval_amount.roulette.min) + '-' + getFormatAmountString(config.config_site.interval_amount.roulette.max)  + ']!'
			});
			setUserRequest(user.userid, 'roulette', false, true);
			return;
		}
		
		if(getFormatAmount(user.balance) < amount) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have enough money!'
			});
			setUserRequest(user.userid, 'roulette', false, true);
			return;
		}
	
		if(color != 'red' && color != 'black' && color != 'purple'){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid color [red or purple or black]!'
			});
			setUserRequest(user.userid, 'roulette', false, true);
			return;
		}
		
		pool.query('UPDATE `users` SET `available` = `available` + ? WHERE `deposit_count` > 0 AND `userid` = ?', [getAvailableAmount(amount), user.userid]);

		pool.query('UPDATE `users` SET `xp` = `xp` + ? WHERE `userid` = ?', [getXpByAmount(amount), user.userid], function(error) {
    		if (!error) {
        		getLevel(user.userid);
    		}
		});

		pool.query('INSERT INTO `users_transactions` SET ?', {
    		userid: user.userid,
    		service: 'roulette_bet',
    		amount: -amount,
    		time: new Date()
		}, function(error) {
    		if (error) {
			}
		});
		pool.query('UPDATE `users` SET `balance` = `balance` - ? WHERE `userid` = ?', [amount, user.userid], function(err2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'roulette', false, true);
				return;
			}
			
			//AFFILIATES
			pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ? GROUP BY referral_uses.referral', [user.userid], function(err3, row3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'roulette', false, true);
					return;
				}
				
				if(row3.length > 0 && should_refferals_count_wager) {
					var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row3[0].amount), 'bet'));
					
					pool.query('INSERT INTO `referral_wagered` SET `userid` = ?, `referral` = ?, `amount` = ?, `commission` = ?, `time` = ?', [user.userid, row3[0].referral, amount, commission_deposit, time()], function(err) {
   					 if (err) {
       					 console.error(err);
    				 }
					});

					pool.query('UPDATE `referral_codes` SET `available` = `available` + ? WHERE `userid` = ?', [commission_deposit, row3[0].referral], function(err) {
    					if (err) {
       				 		console.error(err);
    					}
					});

				}
			
				pool.query('INSERT INTO `roulette_bets` SET `userid` = ?, `name` = ?, `avatar` = ?, `xp` = ?, `amount` = ?, `color` = ?, `game_id` = ?, `time` = ?', [user.userid, user.name, user.avatar, parseInt(user.xp), amount, color, parseInt(rouletteGame.id), time()], function(err4, row4) {
					if(err4) {
						logger.error(err4);
						writeError(err4);
						setUserRequest(user.userid, 'roulette', false, true);
						return;
					}
					
					if(rouletteGame_countBets[user.userid] === undefined) {
						rouletteGame_countBets[user.userid] = 1;
					} else {
						rouletteGame_countBets[user.userid]++;
					}
					
					if(rouletteGame_amountBets[user.userid] === undefined) {
						rouletteGame_amountBets[user.userid] = {
							'red': 0,
							'black': 0,
							'purple': 0
						};
					}
					
					rouletteGame_amountBets[user.userid][color] += amount;
					
					rouletteGame_totalBets.push({
						id: row4.insertId,
						user: {
							userid: user.userid,
							name: user.name,
							avatar: user.avatar,
							level: calculateLevel(user.xp).level
						},
						amount: amount,
						color: color
					});
					
					socket.emit('message', {
						type: 'roulette',
						command: 'bet_confirmed'
					});
					
					io.sockets.emit('message', {
						type: 'roulette',
						command: 'bet',
						bet: {
							id: row4.insertId,
							user: {
								userid: user.userid,
								name: user.name,
								avatar: user.avatar,
								level: calculateLevel(user.xp).level
							},
							amount: amount,
							color: color
						}
					});

					addRakeback(amount, 'coinflip', user.userid);
					
					getBalance(user.userid);
					addToFooterStats();
					
					logger.debug('[ROULETTE] Bet registed. ' + user.name + ' did bet $' + getFormatAmountString(amount));
					
					setUserRequest(user.userid, 'roulette', false, false);
				});
			});
		});
	});
}

rouletteGame_checkRound();
function rouletteGame_checkRound(){
	pool.query('SELECT * FROM `roulette_rolls` WHERE `ended` = 0 ORDER BY `id` DESC LIMIT 1', function(err1, row1){
		if(err1){
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length > 0){
			rouletteGame = {
				status: 'ended',
				hash: row1[0].hash,
				secret: row1[0].secret,
				roll: parseInt(row1[0].roll),
				progress: parseFloat(row1[0].progress),
				color: row1[0].color,
				id: parseInt(row1[0].id),
			}
			
			pool.query('SELECT * FROM `roulette_bets` WHERE `game_id` = ?', [parseInt(rouletteGame.id)], function(err2, row2) {
				if(err2){
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				row2.forEach(function(bet){
					var amount = getFormatAmount(bet.amount);
					
					if(rouletteGame_countBets[bet.userid] === undefined) {
						rouletteGame_countBets[bet.userid] = 1;
					} else {
						rouletteGame_countBets[bet.userid]++;
					}
					
					if(rouletteGame_amountBets[bet.userid] === undefined) {
						rouletteGame_amountBets[bet.userid] = {
							'red': 0,
							'black': 0,
							'purple': 0
						};
					}
					
					rouletteGame_amountBets[bet.userid][bet.color] += amount;
					
					rouletteGame_totalBets.push({
						id: bet.id,
						user: {
							userid: bet.userid,
							name: bet.name,
							avatar: bet.avatar,
							level: calculateLevel(bet.xp).level
						},
						amount: amount,
						color: bet.color
					});
					
					logger.debug('[ROULETTE] Bet registed. ' + bet.name + ' did bet $' + getFormatAmountString(amount));
				});
			});
			
			rouletteGame_checkTimer();
		} else rouletteGame_generateRound();
	});
}

function rouletteGame_generateRound(){	
	rouletteGame.roll = getRandomInt(0, 14);
	rouletteGame.progress = roundedToFixed(Math.random(), 2);
	rouletteGame.secret = makeCode(16);
	rouletteGame.hash = sha256(rouletteGame.secret + '-' + rouletteGame.roll);

	if(rouletteGame.progress > 0.89) rouletteGame.progress = 0.89;
	if(rouletteGame.progress < 0.08) rouletteGame.progress = 0.08;
	
	if(rouletteGame.roll == 0){
		rouletteGame.color = 'purple';
	} else if(rouletteGame.roll >= 1 && rouletteGame.roll <= 7) { 
		rouletteGame.color = 'red';
	} else if(rouletteGame.roll >= 8 && rouletteGame.roll <= 14) { 
		rouletteGame.color = 'black';
	}
	
	rouletteGame_checkTimer();
	
	pool.query('INSERT INTO `roulette_rolls` SET `roll` = ?, `color` = ?, `progress` = ?, `hash` = ?, `secret` = ?, `time` = ?', [parseInt(rouletteGame.roll), rouletteGame.color, rouletteGame.progress, rouletteGame.hash, rouletteGame.secret, time()], function(err1, row1) {
		if(err1){
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		rouletteGame.id = row1.insertId;
	});
}

function rouletteGame_checkTimer() {
	logger.debug('[ROULETTE] New Game. Hash: ' + rouletteGame.hash + ', Secret: ' + rouletteGame.secret + ', Roll: ' + rouletteGame.roll);
	
	rouletteGame.status = 'started';
	
	if(rouletteGame_settings.timer == 0) {
		logger.debug('[ROULETTE] Starting');
		
		rouletteGame_settings.timer = config.config_games.games.roulette.timer + config.config_games.games.roulette.cooldown_rolling;
		
		io.sockets.emit('message', {
			type: 'roulette',
			command: 'hash',
			hash: rouletteGame.hash
		});	
		
		io.sockets.emit('message', {
			type: 'roulette',
			command: 'timer',
			time: rouletteGame_settings.timer - config.config_games.games.roulette.cooldown_rolling
		});
		
		var timerID = setInterval(function() {
			if(rouletteGame_settings.timer == config.config_games.games.roulette.cooldown_rolling) {
				logger.debug('[ROULETTE] Rolling');
				
				io.sockets.emit('message', {
					type: 'roulette',
					command: 'secret',
					secret: rouletteGame.secret
				});	
				
				rouletteGame.status = 'rolling';
			}
			
			if(rouletteGame_settings.timer == config.config_games.games.roulette.cooldown_rolling - 2) {
				rouletteGame_finish();
			
				rouletteGame.status = 'rolled';
			}
			
			if(rouletteGame_settings.timer == 0) {
				clearInterval(timerID);
				
				logger.debug('[ROULETTE] Ended');
				rouletteGame.status = 'ended';
				
				pool.query('UPDATE `roulette_rolls` SET `ended` = 1 WHERE `id` = ?', [parseInt(rouletteGame.id)], function(err) {
					if(err){
						logger.error(err);
						writeError(err);
						return;
					}
					
					rouletteGame_lastGames.push({roll: rouletteGame.roll, color: rouletteGame.color});
					while(rouletteGame_lastGames.length > 10) rouletteGame_lastGames.shift();
					
					rouletteGame_last100Games.push({roll: rouletteGame.roll, color: rouletteGame.color});
					while(rouletteGame_last100Games.length > 100) rouletteGame_last100Games.shift();
					
					rouletteGame_lastRoll = {
						roll: rouletteGame.roll,
						progress: rouletteGame.progress,
						color: rouletteGame.color,
						id: rouletteGame.id
					};
					
					rouletteGame_totalBets = [];
					rouletteGame_countBets = {};
					rouletteGame_amountBets = {};
					
					rouletteGame_generateRound();
				});
			}
			
			if(rouletteGame_settings.timer > 0) rouletteGame_settings.timer--;
		}, 1000);
	}
}

function rouletteGame_finish() {
	var multiplier = 0;
	
	if(rouletteGame.roll == 0) multiplier = config.config_games.games.roulette.color_multiplier; 
	else if(rouletteGame.roll >= 1 && rouletteGame.roll <= 14) multiplier = config.config_games.games.roulette.normal_multiplier;
		
	io.sockets.emit('message', {
		type: 'roulette',
		command: 'roll',
		roll: {
			roll: rouletteGame.roll,
			progress: rouletteGame.progress,
			color: rouletteGame.color,
			id: rouletteGame.id
		},
		cooldown: 0
	});
	
	var total_winnings = [];
	
	rouletteGame_totalBets.forEach(function(item) {
		setTimeout(function(){
			getBalance(item.user.userid);
		}, (rouletteGame_settings.timer + 1) * 1000);
		
		if(rouletteGame.color == item.color) {
			var winning = getFormatAmount(item.amount * multiplier);
			
			pool.query('UPDATE `users` SET `balance` = `balance` + ? WHERE `userid` = ?', [winning, item.user.userid], function(err1) {
    			if (err1) {
       			 	console.error('Error occurred while updating users:', err1);
    			}
			});

			pool.query('INSERT INTO `users_transactions` SET `userid` = ?, `service` = ?, `amount` = ?, `time` = ?', [item.user.userid, 'roulette_win', winning, time()], function(err2) {
   				if (err2) {
       			 	console.error('Error occurred while inserting into users_transactions:', err2);
    			} 
			});

			logger.debug('[ROULETTE] Win registed. ' + item.user.userid + ' did win $' + getFormatAmountString(winning) + ' with multiplier x' + multiplier);
			
			if(total_winnings[item.user.userid] === undefined) total_winnings[item.user.userid] = {
				winning: 0,
				user: item.user
			};

			addLiveBet('roulette', item.user, item.amount, winning, winning / item.amount);
			
			total_winnings[item.user.userid]['winning'] += winning;
		}
	});
	
	setTimeout(function(){
		var props = Object.keys(total_winnings);
		for (var i = 0; i < props.length; i++) {
			var winner = total_winnings[props[i]];
			
			if(winner.winning >= config.config_games.winning_to_chat){
				var send_message = winner.user.name + ' won ' + getFormatAmountString(winner.winning) + ' to roulette on '  + rouletteGame.color + '!';
				otherMessages(send_message, io.sockets, true);
			}
		}
	}, 8000);
}

/* END ROULETTE */

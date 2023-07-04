/* TOWER */

var towerGame_lastGames = [];

towerGame_loadHistory();
function towerGame_loadHistory(){
	pool.query('SELECT * FROM `tower_bets` ORDER BY `id` DESC LIMIT 10', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		row1.reverse();
		
		row1.forEach(function(tower){
			towerGame_lastGames.push({
				id: tower.id,
				user: {
					userid: tower.userid,
					name: tower.name,
					avatar: tower.avatar,
					level: calculateLevel(tower.xp).level,
				},
				amount: getFormatAmount(tower.amount),
				win: getFormatAmount(tower.win),
				stage: tower.route.split('/').length
			});
		});
	});
}

var towerGame_countBets = {};
var towerGame_userBets = {};

pool.query('SELECT * FROM `tower_bets` WHERE `ended` = 0', function(err1, row1) {
	if(err1) {
		logger.error(err1);
		writeError(err1);
		return;
	}
	
	if(row1.length == 0) return;
	
	row1.forEach(function(tower){
		var amount = getFormatAmount(tower.amount)
		
		if(towerGame_countBets[tower.user] === undefined){
			towerGame_countBets[tower.user] = 1;
			
			towerGame_userBets[tower.user] = {
				id: tower.id,
				amount: tower.amount,
				route: (tower.route.length > 0) ? tower.route.split('/') : [],
				buttons: (tower.value.length > 0) ? tower.value.split('') : [],
				hash: tower.hash,
				secret: tower.secret,
				cashout: false,
				ended: false
			};
		}
	});
});

function towerGame_bet(user, socket, amount){
	setUserRequest(user.userid, 'tower', true, true);
	
	if((towerGame_countBets[user.userid] !== undefined) && (towerGame_countBets[user.userid] == 1)) {
		socket.emit('message', {
			type: 'error',
			error: 'You\'ve already started a game.'
		});
		setUserRequest(user.userid, 'tower', false, true);
		return;
	}
	
	verifyFormatAmount(amount, function(err1, amount){
		if(err1){
			socket.emit('message', {
				type: 'error',
				error: err1.message
			});
			setUserRequest(user.userid, 'tower', false, true);
			return;
		}
		
		if(amount < config.config_site.interval_amount.tower.min || amount > config.config_site.interval_amount.tower.max) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bet amount [' + getFormatAmountString(config.config_site.interval_amount.tower.min) + '-' + getFormatAmountString(config.config_site.interval_amount.tower.max)  + ']!'
			});
			setUserRequest(user.userid, 'tower', false, true);
			return;
		}

		if(getFormatAmount(user.balance) < amount) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have enough money!'
			});
			setUserRequest(user.userid, 'tower', false, true);
			return;
		}
		
		pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
		pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('tower_bet') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
		
		pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2, row2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'tower', false, true);
				return;
			}
			
			//AFFILIATES
			pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err3, row3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'tower', false, true);
					return;
				}
				
				if(row3.length > 0 && should_refferals_count_wager) {
					var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row3[0].amount), 'bet'));
					
					pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row3[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row3[0].referral));
				}
			
				var toweGame = towerGame_generateGame();
				
				var secret = makeCode(16);
				var hash = sha256(secret + '-' + toweGame.join(''));
				
				pool.query('INSERT INTO `tower_bets` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + parseInt(user.xp) + ', `secret` = ' + pool.escape(secret) + ', `hash` = ' + pool.escape(hash) + ', `value` = ' + pool.escape(toweGame.join('')) + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()), function(err4, row4) {
					if(err4) {
						logger.error(err4);
						writeError(err4);
						setUserRequest(user.userid, 'tower', false, true);
						return;
					}
					
					towerGame_countBets[user.userid] = 1;
				
					towerGame_userBets[user.userid] = {
						id: row4.insertId,
						amount: amount,
						route: [],
						buttons: toweGame,
						hash: hash,
						secret: secret,
						cashout: false,
						ended: false
					};
					
					socket.emit('message', {
						type: 'tower',
						command: 'bet_confirmed',
						stage: towerGame_userBets[user.userid]['route'].length,
						total: amount,
						hash: hash
					});

					addRakeback(amount, 'tower', user.userid);
					
					getBalance(user.userid);
					addToFooterStats();
					
					logger.debug('[ROULETTE] Bet registed. ' + user.name + ' did bet $' + getFormatAmountString(amount));
					
					setUserRequest(user.userid, 'tower', false, false);
				});
			});
		});
	});
}

function towerGame_cashout(user, socket){
	setUserRequest(user.userid, 'tower', true);
	
	if(towerGame_userBets[user.userid]['cashout']){
		socket.emit('message', {
			type: 'error',
			error: 'Error: The already cashout!'
		});
		setUserRequest(user.userid, 'tower', false);
		return;
	}
	
	if(towerGame_userBets[user.userid]['ended']){
		socket.emit('message', {
			type: 'error',
			error: 'Error: The game is already ended!'
		});
		setUserRequest(user.userid, 'tower', false);
		return;
	}
	
	if(towerGame_userBets[user.userid]['route'].length == 0){
		socket.emit('message', {
			type: 'error',
			error: 'Error: You need to play one time to withdraw your winnings!'
		});
		setUserRequest(user.userid, 'tower', false);
		return;
	}
	
	var winning = getFormatAmount(towerGame_generateAmounts(towerGame_userBets[user.userid]['amount'])[towerGame_userBets[user.userid]['route'].length - 1]);
	
	pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - towerGame_userBets[user.userid]['amount'])) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(user.userid));
	pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('tower_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
	
	pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(user.userid), function(err1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			setUserRequest(user.userid, 'tower', false);
			return;
		}
		
		socket.emit('message', {
			type: 'tower',
			command: 'result_stage',
			result: 'lose',
			buttons: towerGame_userBets[user.userid]['buttons']
		});
		
		socket.emit('message', {
			type: 'tower',
			command: 'secret',
			secret: towerGame_userBets[user.userid]['secret']
		});
		
		pool.query('UPDATE `tower_bets` SET `route` = ' + pool.escape(towerGame_userBets[user.userid]['route'].join('/')) + ', `win` = ' + winning + ', `cashout` = 1, `ended` = 1 WHERE `id` = ' + pool.escape(towerGame_userBets[user.userid]['id']));
		
		var history = {
			id: towerGame_userBets[user.userid]['id'], 
			user: {
				userid: user.userid,
				name: user.name,
				avatar: user.avatar,
				level: calculateLevel(user.xp).level,
			},
			amount: towerGame_userBets[user.userid]['amount'],
			win: winning,
			stage: towerGame_userBets[user.userid]['route'].length
		};

		addLiveBet('tower', user, towerGame_userBets[user.userid]['amount'], winning, winning / towerGame_userBets[user.userid]['amount']);
		
		towerGame_lastGames.push(history);
		if(towerGame_lastGames.length > 10) towerGame_lastGames.shift();
		
		io.sockets.emit('message', {
			type: 'tower',
			command: 'history',
			history: history
		});
		
		towerGame_userBets[user.userid]['cashout'] = true;
		towerGame_countBets[user.userid] = 0;
		
		getBalance(user.userid);
		
		if(winning >= config.config_games.winning_to_chat){
			var send_message = user.name + ' won ' + getFormatAmountString(winning) + ' to tower!';
			otherMessages(send_message, io.sockets, true);
		}
		
		logger.debug('[TOWER] Win registed. ' + user.name + ' did win $' + getFormatAmountString(winning));
		
		setUserRequest(user.userid, 'tower', false, false);
	});
}

function towerGame_stage(user, socket, stage, button){
	setUserRequest(user.userid, 'tower', true, true);
	
	if((towerGame_countBets[user.userid] == undefined) || (towerGame_countBets[user.userid] == 0)) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: The game is not started!'
		});
		setUserRequest(user.userid, 'tower', false, true);
		return;
	}
	
	if(towerGame_userBets[user.userid]['lose']){
		socket.emit('message', {
			type: 'error',
			error: 'Error: The game is ended!'
		});
		setUserRequest(user.userid, 'tower', false, true);
		return;
	}
	
	if(isNaN(Number(stage))){
		socket.emit('message', {
			type: 'error',
			error: 'Invalid stage.'
		});
		setUserRequest(user.userid, 'tower', false, true);
		return;
	}
	
	stage = parseInt(stage);
	
	if(stage < 0 || stage > 9) {
		socket.emit('message', {
			type: 'error',
			error: 'Invalid stage.'
		});
		setUserRequest(user.userid, 'tower', false, true);
		return;
	}
	
	if(isNaN(Number(button))){
		socket.emit('message', {
			type: 'error',
			error: 'Invalid code button.'
		});
		setUserRequest(user.userid, 'tower', false, true);
		return;
	}
	
	button = parseInt(button);
	
	if(button < 1 || button > 3) {
		socket.emit('message', {
			type: 'error',
			error: 'Invalid code button.'
		});
		setUserRequest(user.userid, 'tower', false, true);
		return;
	}
	
	if(towerGame_userBets[user.userid]['route'].length != stage){
		socket.emit('message', {
			type: 'error',
			error: 'Error: You pressed an invalid stage!'
		});
		setUserRequest(user.userid, 'tower', false, true);
		return;
	}
	
	if(towerGame_userBets[user.userid]['buttons'][towerGame_userBets[user.userid]['route'].length] == button){
		towerGame_userBets[user.userid]['route'].push(button);
		
		pool.query('UPDATE `tower_bets` SET `route` = ' + pool.escape(towerGame_userBets[user.userid]['route'].join('/')) + ', `ended` = 1 WHERE `id` = ' + pool.escape(towerGame_userBets[user.userid]['id']));
		
		socket.emit('message', {
			type: 'tower',
			command: 'result_stage',
			result: 'lose',
			buttons: towerGame_userBets[user.userid]['buttons']
		});
		
		socket.emit('message', {
			type: 'tower',
			command: 'secret',
			secret: towerGame_userBets[user.userid]['secret']
		});
		
		towerGame_userBets[user.userid]['ended'] = true;
		towerGame_countBets[user.userid] = 0;
		
		var history = {
			id: towerGame_userBets[user.userid]['id'],
			user: {
				userid: user.userid,
				name: user.name,
				avatar: user.avatar,
				level: calculateLevel(user.xp).level,
			},
			amount: towerGame_userBets[user.userid]['amount'],
			win: 0,
			stage: towerGame_userBets[user.userid]['route'].length
		};
		
		towerGame_lastGames.push(history);
		if(towerGame_lastGames.length > 10) towerGame_lastGames.shift();
		
		io.sockets.emit('message', {
			type: 'tower',
			command: 'history',
			history: history
		});
		
		setUserRequest(user.userid, 'tower', false, false);
	} else {
		towerGame_userBets[user.userid]['route'].push(button);
		
		pool.query('UPDATE `tower_bets` SET `route` = ' + pool.escape(towerGame_userBets[user.userid]['route'].join('/')) + ' WHERE `id` = '+pool.escape(towerGame_userBets[user.userid]['id']));

		socket.emit('message', {
			type: 'tower',
			command: 'result_stage',
			result: 'win',
			stage: stage,
			button: button,
			total: towerGame_generateAmounts(towerGame_userBets[user.userid]['amount'])[towerGame_userBets[user.userid]['route'].length - 1]
		});
		
		if(towerGame_userBets[user.userid]['route'].length >= 10){
			var winning = getFormatAmount(towerGame_generateAmounts(towerGame_userBets[user.userid]['amount'])[towerGame_userBets[user.userid]['route'].length - 1]);
			
			pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - towerGame_userBets[user.userid]['amount'])) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(user.userid));
			pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('tower_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
			
			pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(user.userid), function(err1) {
				if(err1) {
					logger.error(err1);
					writeError(err1);
					setUserRequest(user.userid, 'tower', false, true);
					return;
				}
				
				socket.emit('message', {
					type: 'tower',
					command: 'result_stage',
					result: 'lose',
					buttons: towerGame_userBets[user.userid]['buttons']
				});
				
				socket.emit('message', {
					type: 'tower',
					command: 'secret',
					secret: towerGame_userBets[user.userid]['secret']
				});
				
				pool.query('UPDATE `tower_bets` SET `route` = ' + pool.escape(towerGame_userBets[user.userid]['route'].join('/')) + ', `win` = ' + winning + ', `cashout` = 1, `ended` = 1 WHERE `id` = ' + pool.escape(towerGame_userBets[user.userid]['id']));
				
				var history = {
					id: towerGame_userBets[user.userid]['id'],
					user: {
						userid: user.userid,
						name: user.name,
						avatar: user.avatar,
						level: calculateLevel(user.xp).level,
					},
					amount: towerGame_userBets[user.userid]['amount'],
					win: winning,
					stage: towerGame_userBets[user.userid]['route'].length
				}
				
				towerGame_lastGames.push(history);
				if(towerGame_lastGames.length > 10) towerGame_lastGames.shift();
				
				io.sockets.emit('message', {
					type: 'tower',
					command: 'history',
					history: history
				});
				
				towerGame_userBets[user.userid]['cashout'] = true;
				towerGame_countBets[user.userid] = 0;
				
				getBalance(user.userid);
				
				if(winning >= config.config_games.winning_to_chat){
					var send_message = user.name + ' won ' + getFormatAmountString(winning) + ' to tower!';
					otherMessages(send_message, io.sockets, true);
				}
				
				logger.debug('[TOWER] Win registed. ' + user.name + ' did win $' + getFormatAmountString(winning));
				
				setUserRequest(user.userid, 'tower', false, false);
			});
		} else setUserRequest(user.userid, 'tower', false, false);
	}
}

function towerGame_generateGame(){
	var array = [];
	
	for(var i = 0; i < 10; i++){
		array.push(getRandomInt(1, 3));
	}
	
	return array;
}

function towerGame_generateAmounts(amount){
	var amounts = [];
	var multiplier = [1.45, 2.1025, 3.048625, 4.42050625, 6.4097340625, 9.294114390625, 13.47646586640625, 19.54087550628906, 28.33426948411914, 41.08469075197275];
	
	for(var i = 0; i <= multiplier.length; i++) amounts.push(roundedToFixed(parseFloat(amount * multiplier[i]), 5));
	
	return amounts;
}

/* END TOWER */

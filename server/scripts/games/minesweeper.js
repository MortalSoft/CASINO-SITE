/* MINESWEEPER */

var minesweeperGame_lastGames = [];

minesweeperGame_loadHistory();
function minesweeperGame_loadHistory(){
	pool.query('SELECT * FROM `minesweeper_bets` ORDER BY `id` DESC LIMIT 10', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		row1.reverse();
		
		row1.forEach(function(minesweeper){
			minesweeperGame_lastGames.push({
				id: minesweeper.id,
				user: {
					userid: minesweeper.userid,
					name: minesweeper.name,
					avatar: minesweeper.avatar,
					level: calculateLevel(minesweeper.xp).level,
				},
				amount: getFormatAmount(minesweeper.amount),
				amount_bombs: parseInt(minesweeper.amount_bombs),
				win: getFormatAmount(minesweeper.win)
			});
		});
	});
}

var minesweeperGame_countBets = {};
var minesweeperGame_userBets = {};

pool.query('SELECT * FROM `minesweeper_bets` WHERE `ended` = 0', function(err1, row1) {
	if(err1) {
		logger.error(err1);
		writeError(err1);
		return;
	}
	
	if(row1.length == 0) return;
	
	row1.forEach(function(minesweeper){
		if(minesweeperGame_countBets[minesweeper.user] === undefined){
			minesweeperGame_countBets[minesweeper.user] = 1;
			
			var total = getFormatAmount(minesweeper.amount);
			
			var amount = getFormatAmount(minesweeper.amount);
			var bombs = parseInt(minesweeper.amount_bombs);
			
			if(minesweeper.route.length > 0){
				if(minesweeper.route.split('/').length > 0){
					for(var i = 0; i < minesweeper.route.split('/').length; i++){
						total += minesweeperGame_generateAmount(roundedToFixed(parseFloat(amount * bombs / (25 - bombs)), 5), (25 - bombs))[i];
					}
				}
			}
			
			minesweeperGame_userBets[minesweeper.user] = {
				id: minesweeper.id,
				amount: amount,
				amount_bombs: bombs,
				total: getFormatAmount(total),
				route: (minesweeper.route.length > 0) ? minesweeper.route.split('/') : [],
				bombs: (minesweeper.bombs.length > 0) ? minesweeper.bombs.split('/') : [],
				hash: minesweeper.hash,
				cashout: false,
				ended: false
			};
		}
	});
});

function minesweeperGame_bet(user, socket, amount, bombs){
	setUserRequest(user.userid, 'minesweeper', true, true);
	
	if((minesweeperGame_countBets[user.userid] !== undefined) && (minesweeperGame_countBets[user.userid] == 1)) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You\'ve already started a game!'
		});
		setUserRequest(user.userid, 'minesweeper', false, true);
		return;
	}
	
	verifyFormatAmount(amount, function(err1, amount){
		if(err1){
			socket.emit('message', {
				type: 'error',
				error: err1.message
			});
			setUserRequest(user.userid, 'minesweeper', false, true);
			return;
		}
		
		if(amount < config.config_site.interval_amount.minesweeper.min || amount > config.config_site.interval_amount.minesweeper.max) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bet amount [' + getFormatAmountString(config.config_site.interval_amount.minesweeper.min) + '-' + getFormatAmountString(config.config_site.interval_amount.minesweeper.max)  + ']!'
			});
			setUserRequest(user.userid, 'minesweeper', false, true);
			return;
		}
		
		if(getFormatAmount(user.balance) < amount) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have any money!'
			});
			setUserRequest(user.userid, 'minesweeper', false, true);
			return;
		}
		
		if(isNaN(Number(bombs))){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bombs amount!'
			});
			setUserRequest(user.userid, 'minesweeper', false, true);
			return;
		}
	
		bombs = parseInt(bombs);
	
		if(bombs < 1 || bombs > 24) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bombs amount [1 - 24]!'
			});
			setUserRequest(user.userid, 'minesweeper', false, true);
			return;
		}
		
		pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
		pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('minesweeper_bet') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));

		pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2, row2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'minesweeper', false, true);
				return;
			}
			
			//AFFILIATES
			pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err3, row3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'minesweeper', false, true);
					return;
				}
				
				if(row3.length > 0 && should_refferals_count_wager) {
					var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row3[0].amount), 'bet'));
					
					pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row3[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row3[0].referral));
				}
			
				var minesweeperGame = minesweeperGame_generateBombs(bombs);

				var secret = makeCode(16);
				var hash = sha256(secret + '-' + minesweeperGame.join(''));
				
				pool.query('INSERT INTO `minesweeper_bets` SET `userid` = ' + pool.escape(user.userid) + ', `name` = '+pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + parseInt(user.xp) + ', `amount` = ' + amount + ', `amount_bombs` = ' + bombs + ', `bombs` = ' + pool.escape(minesweeperGame.join('/')) + ', `value` = ' + pool.escape(minesweeperGame.join('')) + ', `secret` = ' + pool.escape(secret) + ', `hash` = ' + pool.escape(hash) + ', `time` = '+ pool.escape(time()), function(err4, row4) {
					if(err4) {
						logger.error(err4);
						writeError(err4);
						setUserRequest(user.userid, 'minesweeper', false, true);
						return;
					}
					
					minesweeperGame_countBets[user.userid] = 1;
				
					minesweeperGame_userBets[user.userid] = {
						id: row4.insertId,
						amount: amount,
						amount_bombs: bombs,
						total: amount,
						route: [],
						bombs: minesweeperGame,
						hash: hash,
						cashout: false,
						ended: false
					};
					
					socket.emit('message', {
						type: 'minesweeper',
						command: 'bet_confirmed',
						hash: hash,
						total: minesweeperGame_userBets[user.userid]['total'],
						next: minesweeperGame_generateAmount(roundedToFixed(parseFloat(minesweeperGame_userBets[user.userid]['amount'] * minesweeperGame_userBets[user.userid]['amount_bombs'] / (25 - minesweeperGame_userBets[user.userid]['amount_bombs'])), 5), (25 - minesweeperGame_userBets[user.userid]['amount_bombs']))[0],
					});

					addRakeback(amount, 'coinflip', user.userid);
					
					getBalance(user.userid);
					addToFooterStats();
					
					logger.debug('[MINESWEEPER] Bet registed. ' + user.name + ' did bet $' + getFormatAmountString(amount));
					
					setUserRequest(user.userid, 'minesweeper', false, false);
				});
			});
		});
	});
}

function minesweeperGame_cashout(user, socket){
	setUserRequest(user.userid, 'minesweeper', true, true);
	
	if(minesweeperGame_userBets[user.userid]['cashout']){
		socket.emit('message', {
			type: 'error',
			error: 'Error: The already cashout!'
		});
		setUserRequest(user.userid, 'minesweeper', false, true);
		return;
	}
	
	if(minesweeperGame_userBets[user.userid]['ended']){
		socket.emit('message', {
			type: 'error',
			error: 'Error: The game is already ended!'
		});
		setUserRequest(user.userid, 'minesweeper', false, true);
		return;
	}
	
	if(minesweeperGame_userBets[user.userid]['route'].length == 0){
		socket.emit('message', {
			type: 'error',
			error: 'Error: You need to play one time to withdraw your winnings!'
		});
		setUserRequest(user.userid, 'minesweeper', false, true);
		return;
	}
	
	var winning = getFormatAmount(minesweeperGame_userBets[user.userid]['total']);
	
	pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - minesweeperGame_userBets[user.userid]['amount'])) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(user.userid));
	pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('minesweeper_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
	
	pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(user.userid), function(err1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			setUserRequest(user.userid, 'minesweeper', false, true);
			return;
		}
		
		socket.emit('message', {
			type: 'minesweeper',
			command: 'result_bomb',
			result: 'lose',
			bombs: minesweeperGame_userBets[user.userid]['bombs']
		});
		
		pool.query('UPDATE `minesweeper_bets` SET `route` = ' + pool.escape(minesweeperGame_userBets[user.userid]['route'].join('/')) + ', `win` = ' + winning + ', `ended` = 1, `cashout` = 1 WHERE `id` = ' + pool.escape(minesweeperGame_userBets[user.userid]['id']));
	
		var history = {
			id: minesweeperGame_userBets[user.userid]['id'], 
			user: {
				userid: user.userid,
				name: user.name,
				avatar: user.avatar,
				level: calculateLevel(user.xp).level
			},
			amount: minesweeperGame_userBets[user.userid]['amount'], 
			amount_bombs: minesweeperGame_userBets[user.userid]['amount_bombs'], 
			win: winning
		}

		addLiveBet('minesweeper', user, minesweeperGame_userBets[user.userid]['amount'], winning, winning / minesweeperGame_userBets[user.userid]['amount']);
	
		minesweeperGame_lastGames.push(history);
		if(minesweeperGame_lastGames.length > 10) minesweeperGame_lastGames.shift();
	
		io.sockets.emit('message', {
			type: 'minesweeper',
			command: 'history',
			history: history
		});
	
		minesweeperGame_userBets[user.userid]['cashout'] = true;
		minesweeperGame_countBets[user.userid] = 0;
		
		getBalance(user.userid);
		
		if(winning >= config.config_games.winning_to_chat){
			var send_message = user.name + ' won ' + getFormatAmountString(winning) + ' to minesweeper!';
			otherMessages(send_message, io.sockets, true);
		}
		
		logger.debug('[MINESWEEPER] Win registed. ' + user.name + ' did win $' + getFormatAmountString(winning));
		
		setUserRequest(user.userid, 'minesweeper', false, false);
	});
}

function minesweeperGame_bomb(user, socket, bomb){
	setUserRequest(user.userid, 'minesweeper', true, true);
	
	if((minesweeperGame_countBets[user.userid] == undefined) || (minesweeperGame_countBets[user.userid] == 0)) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: The game is not started!'
		});
		setUserRequest(user.userid, 'minesweeper', false, true);
		return;
	}
	
	if(minesweeperGame_userBets[user.userid]['ended']){
		socket.emit('message', {
			type: 'error',
			error: 'Error: The game is ended!'
		});
		setUserRequest(user.userid, 'minesweeper', false, true);
		return;
	}
	
	if(isNaN(Number(bomb))){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid bomb!'
		});
		setUserRequest(user.userid, 'minesweeper', false, true);
		return;
	}

	bomb = parseInt(bomb);

	if(bomb < 1 || bomb > 25) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid bomb!'
		});
		setUserRequest(user.userid, 'minesweeper', false, true);
		return;
	}
	
	for(var x = 0; x <= minesweeperGame_userBets[user.userid]['route'].length; x++){
		if(minesweeperGame_userBets[user.userid]['route'][x] == bomb){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You already pressed this button!'
			});
			setUserRequest(user.userid, 'minesweeper', false, true);
			return;
		}
	}	
	
	var bombWin = false;
	for(var i = 0; i <= minesweeperGame_userBets[user.userid]['bombs'].length; i++) if(minesweeperGame_userBets[user.userid]['bombs'][i] == bomb) bombWin = true;

	var sumWin = minesweeperGame_generateAmount(roundedToFixed(parseFloat(minesweeperGame_userBets[user.userid]['amount'] * minesweeperGame_userBets[user.userid]['amount_bombs'] / (25 - minesweeperGame_userBets[user.userid]['amount_bombs'])), 5), (25 - minesweeperGame_userBets[user.userid]['amount_bombs']))[minesweeperGame_userBets[user.userid]['route'].length];
	
	if(bombWin){
		minesweeperGame_userBets[user.userid]['route'].push(bomb);
		
		socket.emit('message', {
			type: 'minesweeper',
			command: 'result_bomb',
			result: 'lose',
			bombs: minesweeperGame_userBets[user.userid]['bombs']
		});
		
		pool.query('UPDATE `minesweeper_bets` SET `route` = ' + pool.escape(minesweeperGame_userBets[user.userid]['route'].join('/')) + ', `ended` = 1 WHERE `id` = ' + pool.escape(minesweeperGame_userBets[user.userid]['id']));
	
		minesweeperGame_userBets[user.userid]['ended'] = true;
		minesweeperGame_countBets[user.userid] = 0;
		
		var history = {
			id: minesweeperGame_userBets[user.userid]['id'],
			user: {
				userid: user.userid,
				name: user.name,
				avatar: user.avatar,
				level: calculateLevel(user.xp).level
			},
			amount: minesweeperGame_userBets[user.userid]['amount'],
			amount_bombs: minesweeperGame_userBets[user.userid]['amount_bombs'],
			win: 0
		}
		
		minesweeperGame_lastGames.push(history);
		if(minesweeperGame_lastGames.length > 10) minesweeperGame_lastGames.shift();
	
		io.sockets.emit('message', {
			type: 'minesweeper',
			command: 'history',
			history: history
		});
		
		setUserRequest(user.userid, 'minesweeper', false, true);
	} else {
		minesweeperGame_userBets[user.userid]['route'].push(bomb);
		minesweeperGame_userBets[user.userid]['total'] += sumWin
		
		socket.emit('message', {
			type: 'minesweeper',
			command: 'result_bomb',
			result: 'win',
			bomb: bomb,
			total: minesweeperGame_userBets[user.userid]['total'],
			next: minesweeperGame_generateAmount(roundedToFixed(parseFloat(minesweeperGame_userBets[user.userid]['amount'] * minesweeperGame_userBets[user.userid]['amount_bombs'] / (25 - minesweeperGame_userBets[user.userid]['amount_bombs'])), 5), (25 - minesweeperGame_userBets[user.userid]['amount_bombs']))[minesweeperGame_userBets[user.userid]['route'].length],
			amount: sumWin
		});
		
		pool.query('UPDATE `minesweeper_bets` SET `route` = ' + pool.escape(minesweeperGame_userBets[user.userid]['route'].join('/')) + ' WHERE `id` = ' + pool.escape(minesweeperGame_userBets[user.userid]['id']));
		
		if(minesweeperGame_userBets[user.userid]['amount_bombs'] + minesweeperGame_userBets[user.userid]['route'].length >= 25){
			var winning = getFormatAmount(minesweeperGame_userBets[user.userid]['total']);
			
			pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - minesweeperGame_userBets[user.userid]['amount'])) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(user.userid));
			pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('minesweeper_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
			
			pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(user.userid), function(err, row) {
				if(err) {
					logger.error(err);
					writeError(err);
					setUserRequest(user.userid, 'minesweeper', false, true);
					return;
				}
				
				socket.emit('message', {
					type: 'minesweeper',
					command: 'result_bomb',
					result: 'lose',
					bombs: minesweeperGame_userBets[user.userid]['bombs']
				});
				
				pool.query('UPDATE `minesweeper_bets` SET `route` = ' + pool.escape(minesweeperGame_userBets[user.userid]['route'].join('/')) + ', `win` = ' + winning + ', `ended` = 1, `cashout` = 1 WHERE `id` = ' + pool.escape(minesweeperGame_userBets[user.userid]['id']));
			
				var history = {
					id: minesweeperGame_userBets[user.userid]['id'],
					user: {
						userid: user.userid,
						name: user.name,
						avatar: user.avatar,
						level: calculateLevel(user.xp).level
					},
					amount: minesweeperGame_userBets[user.userid]['amount'],
					amount_bombs: minesweeperGame_userBets[user.userid]['amount_bombs'],
					win: winning
				}
			
				minesweeperGame_lastGames.push(history);
				if(minesweeperGame_lastGames.length > 10) minesweeperGame_lastGames.shift();
			
				io.sockets.emit('message', {
					type: 'minesweeper',
					command: 'history',
					history: history
				});
			
				minesweeperGame_userBets[user.userid]['cashout'] = true;
				minesweeperGame_countBets[user.userid] = 0;
				
				getBalance(user.userid);
				
				if(winning >= config.config_games.winning_to_chat){
					var send_message = user.name + ' won ' + getFormatAmountString(winning) + ' to minesweeper!';
					otherMessages(send_message, io.sockets, true);
				}
				
				logger.debug('[MINESWEEPER] Win registed. ' + user.name + ' did win $' + getFormatAmountString(winning));
				
				setUserRequest(user.userid, 'minesweeper', false, false);
			});
		} else setUserRequest(user.userid, 'minesweeper', false, false);
	}
}

function minesweeperGame_generateAmount(sum, bombs){
	var array = [];
	
	var xSum = parseFloat(sum / bombs);
	
	for(var i = -Math.ceil(bombs / 2) + 1; i <= Math.floor(bombs / 2); i++){
		array.push(roundedToFixed(parseFloat(sum + xSum * i), 5));
	}

	return array;
}

function minesweeperGame_generateBombs(bombs){
	var bombs_list = {};
	var array = [];
	
	while(array.length < bombs){
		var bomb = getRandomInt(1, 25);
		
		if(bombs_list[bomb] === undefined){
			bombs_list[bomb] = true;
			array.push(bomb);
		}
	}
	
	return array;
}

/* END MINESWEEPER */

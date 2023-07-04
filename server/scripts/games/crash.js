/* CRASH */

var crashGame_lastGames = [];

crashGame_loadHistory();
function crashGame_loadHistory(){
	pool.query('SELECT `point` FROM `crash_rolls` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 10', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		row1.reverse();
		
		row1.forEach(function(crash){
			crashGame_lastGames.push(crash.point);
		});
	});
}

var crashGame_settings = {
	point: 0,
	timeout: null,
	start_time: 0,
	progress_time: 0,
	end_time: 0,
};

var crashGame_totalBets = [];
var crashGame_userBets = {};

var crashGame = {
	status: 'ended',
	hash: null,
	secret: null,
	roll: null,
	id: null,
}

function crashGame_bet(user, socket, amount, auto) {
	setUserRequest(user.userid, 'crash', true, true);
	
	if(crashGame_userBets[user.userid] !== undefined) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You have already joined the crash!'
		});
		setUserRequest(user.userid, 'crash', false, true);
		return;
	}
	
	if(crashGame.status != 'started') {
		socket.emit('message', {
			type: 'error',
			error: 'Error: The game have been already started!'
		});
		setUserRequest(user.userid, 'crash', false, true);
		return;
	}
	
	verifyFormatAmount(amount, function(err1, amount){
		if(err1){
			socket.emit('message', {
				type: 'error',
				error: err1.message
			});
			setUserRequest(user.userid, 'crash', false, true);
			return;
		}
		
		if(amount < config.config_site.interval_amount.crash.min || amount > config.config_site.interval_amount.crash.max) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bet amount [' + getFormatAmountString(config.config_site.interval_amount.crash.min) + '-' + getFormatAmountString(config.config_site.interval_amount.crash.max)  + ']!'
			});
			setUserRequest(user.userid, 'crash', false, true);
			return;
		}
		
		if(getFormatAmount(user.balance) < amount) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have enough money!'
			});
			setUserRequest(user.userid, 'crash', false, true);
			return;
		}
		
		if(isNaN(Number(auto))){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid auto cashout!'
			});
			setUserRequest(user.userid, 'crash', false, true);
			return;
		}
	
		auto = parseInt(auto);
	
		if(auto <= 100 && auto != 0) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Auto cashout needs to be more than 1.00x!'
			});
			setUserRequest(user.userid, 'crash', false, true);
			return;
		}
		
		pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
		pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('crash_bet') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
		
		pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'crash', false, true);
				return;
			}
			
			//AFFILIATES
			pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err3, row3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'crash', false, true);
					return;
				}
				
				if(row3.length > 0 && should_refferals_count_wager) {
					var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row3[0].amount), 'bet'));
					
					pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row3[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row3[0].referral));
				}
			
				pool.query('INSERT INTO `crash_bets` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + parseInt(user.xp) + ', `amount` = ' + amount + ', `game_id` = ' + parseInt(crashGame.id) + ', `auto_cashout` = ' + roundedToFixed(parseFloat(auto / 100), 2) + ', `time` = ' + pool.escape(time()), function(err4, row4) {
					if(err4) {
						logger.error(err4);
						writeError(err4);
						setUserRequest(user.userid, 'crash', false, true);
						return;
					}
					
					if(crashGame_userBets[user.userid] === undefined) {
						crashGame_userBets[user.userid] = {
							id: row4.insertId,
							amount: amount,
							infinity_cashout: (auto == 0) ? true : false,
							auto_cashout: auto,
							cashedout: false,
							point_cashedout: 0
						};
					}
					
					socket.emit('message', {
						type: 'crash',
						command: 'bet_confirmed'
					});

					addRakeback(amount, 'crash', user.userid);
					
					io.sockets.emit('message', {
						type: 'crash',
						command: 'bet',
						bet: {
							id: row4.insertId,
							user: {
								userid: user.userid,
								name: user.name,
								avatar: user.avatar,
								level: calculateLevel(user.xp).level
							},
							amount: amount
						}
					});
					
					crashGame_totalBets.push({
						id: row4.insertId,
						user: {
							userid: user.userid,
							name: user.name,
							avatar: user.avatar,
							level: calculateLevel(user.xp).level
						},
						amount: amount,
						auto_cashout: auto
					});
				
					getBalance(user.userid);
					addToFooterStats();
					
					logger.debug('[CRASH] Bet registed. ' + user.name + ' did bet $' + getFormatAmountString(amount));
					
					setUserRequest(user.userid, 'crash', false, false);
				});
			});
		});
	});
}

function crashGame_cashout(user, socket) {
	setUserRequest(user.userid, 'crash', true, true);
	
	if(crashGame.status != 'counting') {
		socket.emit('message', {
			type: 'error',
			error: 'Error: The game is ended!'
		});
		setUserRequest(user.userid, 'crash', false, true);
		return;
	}
	
	if(crashGame_settings.point <= 1.00) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You can\'t cashout at least 1.00x!'
		});
		setUserRequest(user.userid, 'crash', false, true);
		return;
	}
	
	if(crashGame_userBets[user.userid] === undefined) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You are not in this game!'
		});
		setUserRequest(user.userid, 'crash', false, true);
		return;
	}
	
	if(crashGame_userBets[user.userid]['cashedout'] == true) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You have already cashed out!'
		});
		setUserRequest(user.userid, 'crash', false, true);
		return;
	}
		
	var winning = getFormatAmount(crashGame_userBets[user.userid]['amount'] * crashGame_settings.point);
	
	io.sockets.emit('message', {
		type: 'crash',
		command: 'bet_win',
		bet: {
			id: crashGame_userBets[user.userid]['id'],
			cashout: roundedToFixed(crashGame_settings.point, 2),
			profit: getFormatAmount(winning - crashGame_userBets[user.userid]['amount'])
		}
	});

	addLiveBet('crash', user, crashGame_userBets[user.userid]['amount'], winning, crashGame_settings.point);
	
	crashGame_userBets[user.userid]['cashedout'] = true;
	crashGame_userBets[user.userid]['point_cashedout'] = parseInt(crashGame_settings.point * 100);
	
	socket.emit('message', {
		type: 'crash',
		command: 'cashed_out',
		amount: winning
	});
	
	pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - crashGame_userBets[user.userid]['amount'])) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(user.userid));
	pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('crash_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
	
	pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(user.userid), function(err1){
		if(err1){
			logger.error(err1);
			writeError(err1);
			setUserRequest(user.userid, 'crash', false, true);
			return;
		}
		
		pool.query('UPDATE `crash_bets` SET `cashedout` = 1, `point_cashedout` = ' + roundedToFixed(crashGame_settings.point, 2).toFixed(2) + ' WHERE `id` = ' + pool.escape(crashGame_userBets[user.userid]['id']));
		
		getBalance(user.userid);
		
		if(winning >= config.config_games.winning_to_chat){
			var send_message = user.name + ' won ' + getFormatAmountString(winning) + ' to crash on x' + roundedToFixed(crashGame_settings.point, 2).toFixed(2) + '!';
			otherMessages(send_message, io.sockets, true);
		}
		
		logger.debug('[CRASH] Win registed. ' + user.name + ' did win $' + getFormatAmountString(winning) + ' with multiplier x' + roundedToFixed(crashGame_settings.point, 2).toFixed(2));
		
		setUserRequest(user.userid, 'crash', false, false);
	});
}

crashGame_checkGame();
function crashGame_checkGame(){
	pool.query('SELECT * FROM `crash_rolls` WHERE `ended` = 0 ORDER BY `id` DESC LIMIT 1', function(err1, row1){
		if(err1){
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length > 0){
			crashGame = {
				status: 'ended',
				hash: row1[0].hash,
				secret: row1[0].secret,
				roll: parseInt(row1[0].point * 100),
				id: row1[0].id,
			}
			
			pool.query('SELECT * FROM `crash_bets` WHERE `game_id` = ' + parseInt(crashGame.id), function(err2, row2){
				if(err2){
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				row2.forEach(function(bet){
					var amount = getFormatAmount(bet.amount);
					
					if(crashGame_userBets[bet.userid] === undefined) {
						crashGame_userBets[bet.userid] = {
							id: bet.id,
							amount: amount,
							infinity_cashout: (parseFloat(bet.auto_cashout) * 100 == 0) ? true : false,
							auto_cashout: parseInt(parseFloat(bet.auto_cashout) * 100),
							cashedout: (parseInt(bet.cashedout) == 1) ? true : false,
							point_cashedout: parseFloat(bet.point_cashedout)
						};
					}
					
					crashGame_totalBets.push({
						id: bet.id,
						user: {
							userid: bet.userid,
							name: bet.name,
							avatar: bet.avatar,
							level: calculateLevel(bet.xp).level
						},
						amount: amount,
						auto_cashout: parseInt(parseFloat(bet.auto_cashout) * 100)
					});
					
					logger.debug('[CRASH] Bet registed. ' + bet.name + ' did bet $' + getFormatAmountString(amount));
				});
			});
			
			crashGame.status = 'started';
			
			setTimeout(function() {
				crashGame_start();
			}, config.config_games.games.crash.timer * 1000 + 1000);
		} else crashGame_generateGame();
	});
}

function crashGame_generateGame(){
	logger.debug('[CRASH] Starting');
	
	io.sockets.emit('message', {
		type: 'crash',
		command: 'reset'
	});
	
	io.sockets.emit('message', {
		type: 'crash',
		command: 'starting',
		time: parseInt(config.config_games.games.crash.timer * 1000)
	});
	
	crashGame_settings.start_time = new Date().getTime();
	
	var crashPointFromHash = function(serverSeed) {
		serverSeed = sha256(serverSeed);
		
		var divisible = function divisible(serverSeed, mod) {
			var val = 0;
			var o = serverSeed.length % 4;
			for (var i = o > 0 ? o - 4 : 0; i < serverSeed.length; i += 4) {
				val = ((val << 16) + parseInt(serverSeed.substring(i, i + 4), 16)) % mod;
			}
			return val === 0;
		};
		
		if (divisible(serverSeed, 100 / parseInt(config.config_games.games.crash.instant_chance, 10))) return 100;
		
		var h = parseInt(serverSeed.slice(0,52 / 4),16);
		var e = Math.pow(2,52);
		
		return Math.floor((100 * e - h) / (e - h));
	};
	
	var seedCodeCrash = makeCode(32);
	
	crashGame.roll = crashPointFromHash(seedCodeCrash);
	crashGame.secret = makeCode(16);
	crashGame.hash = sha256(crashGame.secret + '-' + parseFloat(crashGame.roll / 100).toFixed(2));
	
	pool.query('INSERT INTO `crash_rolls` SET `point` = ' + parseFloat(crashGame.roll / 100).toFixed(2) + ', `hash` = ' + pool.escape(crashGame.hash) + ', `secret` = ' + pool.escape(crashGame.secret) + ', `time` = ' + pool.escape(time()), function(err1, row1){
		if(err1){
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		crashGame.id = row1.insertId;
		
		crashGame.status = 'started';
		
		setTimeout(function() {
			crashGame_start();
		}, config.config_games.games.crash.timer * 1000 + 1000);
	});
}

function crashGame_start(){
	logger.debug('[CRASH] New Game. Point: ' + roundedToFixed(parseFloat(crashGame.roll / 100), 2).toFixed(2) + 'x');
	
	crashGame_settings.progress_time = new Date().getTime();
	
	io.sockets.emit('message', {
		type: 'crash',
		command: 'hash',
		hash: crashGame.hash
	});
	
	io.sockets.emit('message', {
		type: 'crash',
		command: 'started',
		difference: new Date().getTime() - crashGame_settings.progress_time
	});

	function calcCrash1(ms) {
		var gamePayout = Math.floor(100 * calcCrash2(ms)) / 100;
		return gamePayout;
	}

	function calcCrash2(ms) {
		var r = 0.00006;
		return Math.pow(Math.E, r * ms);
	}
	
	crashGame_settings.point = calcCrash1(new Date().getTime() - crashGame_settings.progress_time);

	crashGame.status = 'counting';

	crashGame_settings.timeout = setInterval(function(){
		crashGame_settings.point = calcCrash1(new Date().getTime() - crashGame_settings.progress_time);
		crashGame_checkPoint();
	}, 10);
}

function crashGame_checkPoint(){
	if(crashGame.status != 'counting') return;
	
	var point = parseInt(crashGame_settings.point * 100);
	
	if(crashGame_totalBets.length > 0){
		crashGame_totalBets.forEach(function(bet){
			if(crashGame_userBets[bet.user.userid]['cashedout'] == false) {
				var winning = getFormatAmount(crashGame_userBets[bet.user.userid]['amount'] * point / 100);
				
				io.sockets.in(bet.user.userid).emit('message', {
					type: 'crash',
					command: 'cashout',
					amount: winning
				});
			}
		});
	}
	
	if(!crashGame_checking_bets) crashGame_checkBets(point);
	
	if(point >= crashGame.roll){
		crashGame_settings.end_time = new Date().getTime() - crashGame_settings.progress_time;
		
		crashGame.status = 'ended';
		
		pool.query('UPDATE `crash_rolls` SET `ended` = 1 WHERE `id` = ' + parseInt(crashGame.id), function(err1){
			if(err1){
				logger.error(err1);
				writeError(err1);
				return;
			}
			
			io.sockets.emit('message', {
				type: 'crash',
				command: 'crashed',
				number: crashGame.roll,
				time: crashGame_settings.end_time,
				history: true
			});
			
			var id_bets = [];
			
			if(crashGame_totalBets.length > 0){
				crashGame_totalBets.forEach(function(bet){
					if(crashGame_userBets[bet.user.userid]['cashedout'] == false) id_bets.push(bet.id);
				});
			}
			
			io.sockets.emit('message', {
				type: 'crash',
				command: 'bets_lose',
				ids: id_bets
			});
			
			crashGame_lastGames.push(roundedToFixed(crashGame.roll / 100, 2));
			while(crashGame_lastGames.length > 20) crashGame_lastGames.shift();
			
			setTimeout(function() {
				crashGame_generateGame()
				
				crashGame_userBets = {};
				crashGame_totalBets = [];
			}, 5000);
			
			clearInterval(crashGame_settings.timeout);
			
			io.sockets.emit('message', {
				type: 'crash',
				command: 'secret',
				secret: crashGame.secret
			});
			
			logger.debug('[CRASH] Creshed at ' + roundedToFixed(crashGame.roll / 100, 2).toFixed(2) + 'x');
		});
	}
}

var crashGame_checking_bets = false;

async function crashGame_checkBets(point){
	crashGame_checking_bets = true;
	
	for(var i = 0; i < crashGame_totalBets.length; i++) await crashGame_checkBet(crashGame_totalBets[i], point);

	crashGame_checking_bets = false;
}

function crashGame_checkBet(bet, point){
	return new Promise(function(resolve, reject) {
		if(crashGame_userBets[bet.user.userid]['cashedout'] == false) {
			var profit = getFormatAmount(crashGame_userBets[bet.user.userid]['amount'] * crashGame_settings.point - crashGame_userBets[bet.user.userid]['amount']);
			
			if(crashGame_userBets[bet.user.userid]['infinity_cashout'] == false){
				if(crashGame_userBets[bet.user.userid]['auto_cashout'] <= point && crashGame_userBets[bet.user.userid]['auto_cashout'] <= crashGame.roll){
					var winning = getFormatAmount(crashGame_userBets[bet.user.userid]['amount'] * crashGame_userBets[bet.user.userid]['auto_cashout'] / 100);
				
					io.sockets.emit('message', {
						type: 'crash',
						command: 'bet_win',
						bet: {
							id: bet.id,
							cashout: roundedToFixed(parseFloat(crashGame_userBets[bet.user.userid]['auto_cashout'] / 100), 2),
							profit: getFormatAmount(winning - crashGame_userBets[bet.user.userid]['amount'])
						}
					});
					
					io.sockets.in(bet.user.userid).emit('message', {
						type: 'crash',
						command: 'cashed_out',
						amount: winning
					});
					
					crashGame_userBets[bet.user.userid]['cashedout'] = true;
					crashGame_userBets[bet.user.userid]['point_cashedout'] = parseInt(crashGame_userBets[bet.user.userid]['auto_cashout']);
						
					pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - crashGame_userBets[bet.user.userid]['amount'])) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(bet.user.userid));
					pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(bet.user.userid) + ', `service` = ' + pool.escape('crash_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
					
					pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(bet.user.userid), function(err1){
						if(err1) {
							logger.error(err1);
							writeError(err1);
							
							resolve();
							return;
						}
						
						pool.query('UPDATE `crash_bets` SET `cashedout` = 1, `point_cashedout` = ' + roundedToFixed(parseFloat(crashGame_userBets[bet.user.userid]['auto_cashout'] / 100), 2) + ' WHERE `id` = ' + pool.escape(crashGame_userBets[bet.user.userid]['id']));
						
						getBalance(bet.user.userid);
						
						if(winning >= config.config_games.winning_to_chat){
							var send_message = bet.user.name + ' won ' + getFormatAmountString(winning) + ' to crash on x' + roundedToFixed(parseFloat(crashGame_userBets[bet.user.userid]['auto_cashout'] / 100), 2).toFixed(2) + '!';
							otherMessages(send_message, io.sockets, true);
						}
						
						logger.debug('[CRASH] Win registed. ' + bet.user.name + ' did win $' + getFormatAmountString(winning) + ' with multiplier x' + roundedToFixed(parseFloat(crashGame_userBets[bet.user.userid]['auto_cashout'] / 100), 2).toFixed(2));
						
						resolve();
					});
				} else resolve();
			} else if(profit >= config.config_games.games.crash.max_profit){
				var winning = getFormatAmount(crashGame_userBets[bet.user.userid]['amount'] + config.config_games.games.crash.max_profit);
				
				io.sockets.emit('message', {
					type: 'crash',
					command: 'bet_win',
					bet: {
						id: bet.id,
						cashout: roundedToFixed(parseFloat(winning / crashGame_userBets[bet.user.userid]['amount']), 2),
						profit: config.config_games.games.crash.max_profit
					}
				});
				
				io.sockets.in(bet.user.userid).emit('message', {
					type: 'crash',
					command: 'cashed_out',
					amount: winning
				});
				
				crashGame_userBets[bet.user.userid]['cashedout'] = true;
				crashGame_userBets[bet.user.userid]['point_cashedout'] = parseInt(winning / crashGame_userBets[bet.user.userid]['amount'] * 100);
					
				pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - crashGame_userBets[bet.user.userid]['amount'])) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(bet.user.userid));
				pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(bet.user.userid) + ', `service` = ' + pool.escape('crash_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
				
				pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(bet.user.userid), function(err2){
					if(err2) {
						logger.error(err2);
						writeError(err2);
						
						resolve();
						return;
					}
					
					pool.query('UPDATE `crash_bets` SET `cashedout` = 1, `point_cashedout` = ' + roundedToFixed(parseFloat(winning / crashGame_userBets[bet.user.userid]['amount']), 2) + ' WHERE `id` = ' + pool.escape(crashGame_userBets[bet.user.userid]['id']));
					
					getBalance(bet.user.userid);
					
					if(winning >= config.config_games.winning_to_chat){
						var send_message = bet.user.name + ' won ' + getFormatAmountString(winning) + ' to crash on x' + roundedToFixed(parseFloat(winning / crashGame_userBets[bet.user.userid]['amount']), 2).toFixed(2) + '!';
						otherMessages(send_message, io.sockets, true);
					}
					
					logger.debug('[CRASH] Win registed. ' + bet.user.name + ' did win $' + getFormatAmountString(winning) + ' with multiplier x' + roundedToFixed(parseFloat(winning / crashGame_userBets[bet.user.userid]['amount']), 2).toFixed(2));
					
					resolve();
				});
			} else resolve();
		} else resolve();
	});
}

/* END CRASH */

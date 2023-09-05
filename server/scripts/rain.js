var rain_game = {
	status: 'wait',
	amount: 0,
	last_ticket: 0,
	id: 0,
	timeout: null
}

var rain_userBets = {};
var rain_userWinnings = {};

rain_checkGame();
function rain_checkGame(){
	pool.query('SELECT * FROM `rain_history` WHERE `ended` = 0', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) {
			rain_createGame();
		} else {
			rain_game = {
				status: 'wait',
				amount: getFormatAmount(row1[0].amount),
				last_ticket: 0,
				id: row1[0].id,
				timeout: null
			}
			
			pool.query('SELECT * FROM `rain_bets` WHERE `id_rain` = ' + parseInt(row1[0].id), function(err2, row2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				row2.forEach(function(bet){
					if(rain_userBets[bet.userid] === undefined){
						var level = parseInt(bet.level);
						
						var min_ticket = parseInt(rain_game.last_ticket + 1);
						var max_ticket = parseInt(level + rain_game.last_ticket);
						
						rain_userBets[bet.userid] = {
							id: bet.id,
							tickets: {
								min: min_ticket,
								max: max_ticket
							}
						}
						
						rain_game.last_ticket += level;
					}
				});
				
				if(row1[0].time_roll <= time()) rain_rollGame();
				else {
					logger.debug('[RAIN] Loaded the last rain. Rolling after ' + parseInt(row1[0].time_roll - time()) + ' seconds');
					
					rain_game.timeout = setTimeout(function(){
						rain_rollGame();
					}, parseInt(row1[0].time_roll - time()) * 1000);
				}
			});
		}
	});
}

function rain_createGame(){
	var amount = getFormatAmount(config.config_site.rain.start);
	
	var time_roll = getRandomInt(config.config_site.rain.timeout_interval.min, config.config_site.rain.timeout_interval.max);
	
	pool.query('INSERT INTO `rain_history` SET `amount` = ' + amount + ', `time_roll` = ' + pool.escape(time() + time_roll) + ', `time_create` = ' + pool.escape(time()), function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		logger.debug('[RAIN] Creating a new one. Rolling after ' + time_roll + ' seconds');
		
		rain_game = {
			status: 'wait',
			amount: amount,
			last_ticket: 0,
			id: row1.insertId,
			timeout: null
		}
		
		rain_game.timeout = setTimeout(function(){
			rain_rollGame();
		}, time_roll * 1000);
	})
}

function rain_rollGame(){
	logger.debug('[RAIN] Rolling');
	
	clearTimeout(rain_game.timeout);
	
	pool.query('UPDATE `rain_history` SET `time_roll` = ' + pool.escape(time()) + ' WHERE `id` = ' + parseInt(rain_game.id), function(err1, row1){
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		rain_game.status = 'started';
	
		io.sockets.emit('message', {
			type: 'rain',
			command: 'started'
		});
		
		setTimeout(function(){
			rain_game.status = 'picking';
			
			for(var i = 0; i < parseInt(rain_game.amount * 100); i++){
				var ticket_winner = getRandomInt(1, rain_game.last_ticket);
				
				for(var bet in rain_userBets){
					if(ticket_winner >= rain_userBets[bet].tickets.min && ticket_winner <= rain_userBets[bet].tickets.max){
						if(rain_userWinnings[bet] === undefined) rain_userWinnings[bet] = 1;
						else rain_userWinnings[bet]++;
					}
				}
			}
			
			io.sockets.emit('message', {
				type: 'rain',
				command: 'waiting'
			});
			
			for(var bet in rain_userBets){
				io.sockets.in(bet).emit('message', {
					type: 'rain',
					command: 'joined'
				});
			}
			
			setTimeout(function(){
				rain_game.status = 'ended';
				
				pool.query('UPDATE `rain_history` SET `ended` = 1 WHERE `id` = ' + parseInt(rain_game.id), function(err2){
					if(err2) {
						logger.error(err2);
						writeError(err2);
						return;
					}
					
					io.sockets.emit('message', {
						type: 'rain',
						command: 'ended'
					});
					
					logger.debug('[RAIN] ' + Object.keys(rain_userBets).length + ' users have sent a total of ' + getFormatAmountString(rain_game.amount) + ' coins');
					
					if(Object.keys(rain_userBets).length > 0){
						var text_message = Object.keys(rain_userBets).length + ' users have sent a total of ' + getFormatAmountString(rain_game.amount) + ' coins.';
						otherMessages(text_message, io.sockets.in(bet), false);
					}
					
					for(var bet in rain_userWinnings){
						var amount = getFormatAmount(rain_userWinnings[bet] * 0.01);
						
						pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(bet) + ', `service` = ' + pool.escape('rain_win') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
						pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ' WHERE `userid` = ' + pool.escape(bet), function(err3){
							if(err3) {
								logger.error(err3);
								writeError(err3);
								return;
							}
							
							pool.query('UPDATE `rain_bets` SET `winning` = ' + amount + ' WHERE `id` = ' + pool.escape(rain_userBets[bet].id));
							
							var text_message = 'Congratulations! You have receive ' + getFormatAmountString(amount) + ' coins from rain.';
							otherMessages(text_message, io.sockets.in(bet), false);
							
							getBalance(bet);
						});
					}
					
					setTimeout(function(){
						rain_userBets = {};
						rain_userWinnings = {};
						
						rain_createGame();
					}, 10 * 1000);
				});
			}, 10 * 1000);
		}, config.config_site.rain.cooldown_start * 1000);
	});
}

function rain_joinGame(user, socket, recaptcha){
	setUserRequest(user.userid, 'rain', true, true);
	
	if(user.exclusion > time()) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Your exclusion expires ' + makeDate(new Date(user.exclusion * 1000)) + '.'
		});
		setUserRequest(user.userid, 'rain', false, true);
		return;
	}
	
	if(!user.verified) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Your account is not verified. Please verify your account and try again.'
		});
		setUserRequest(user.userid, 'rain', false, true);
		return;
	}
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'rain', false, true);
			return;
		}
		
		if(calculateLevel(user.xp).level < 1) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You must to have minimun 1 level!'
			});
			setUserRequest(user.userid, 'rain', false, true);
			return;
		}
	
		if(rain_game.status == 'picking' || rain_game.status == 'ended') {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Wait for starting the rain!'
			});
			setUserRequest(user.userid, 'rain', false, true);
			return;
		}
		
		if(rain_userBets[user.userid] !== undefined ) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You have already entered in rain!'
			});
			setUserRequest(user.userid, 'rain', false, true);
			return;
		}
			
		var level = parseInt(calculateLevel(user.xp).level);
		
		var min_ticket = parseInt(rain_game.last_ticket + 1);
		var max_ticket = parseInt(level + rain_game.last_ticket);
		
		pool.query('INSERT INTO `rain_bets` SET `userid` = ' + pool.escape(user.userid) + ', `level` = ' + parseInt(level) + ', `tickets` = ' + pool.escape(min_ticket + '-' + max_ticket) + ', `id_rain` = ' + parseInt(rain_game.id) + ', `time` = ' + pool.escape(time()), function(err1, row1){
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'rain', false, true);
				return;
			}
			
			pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('rain_join') + ', `amount` = 0, `time` = ' + pool.escape(time()));
			
			rain_userBets[user.userid] = {
				id: row1.insertId,
				tickets: {
					min: min_ticket,
					max: max_ticket
				}
			}
			
			rain_game.last_ticket += level;
			
			socket.emit('message', {
				type: 'rain',
				command: 'joined'
			});
			
			getBalance(user.userid);
			
			logger.debug('[RAIN] Join registed');
			
			setUserRequest(user.userid, 'rain', false, false);
		});
	});
}

function rain_tipGame(user, socket, amount){
	if(rain_game.status != 'wait') {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You can only tip coins to rain until starts!'
		});
		setUserRequest(user.userid, 'rain', false, true);
		return;
	}
	
	verifyFormatAmount(amount, function(err1, amount){
		if(err1){
			socket.emit('message', {
				type: 'error',
				error: err1.message
			});
			setUserRequest(user.userid, 'rain', false, true);
			return;
		}
		
		if(amount < config.config_site.interval_amount.tip_rain.min || amount > config.config_site.interval_amount.tip_rain.max) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid tip rain amount [' + getFormatAmountString(config.config_site.interval_amount.tip_rain.min) + '-' + getFormatAmountString(config.config_site.interval_amount.tip_rain.max)  + ']!'
			});
			setUserRequest(user.userid, 'rain', false, true);
			return;
		}
	
		if(getFormatAmount(user.balance) < amount) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have enough money!'
			});
			setUserRequest(user.userid, 'rain', false, true);
			return;
		}
	
		pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'rain', false, true);
				return;
			}
			
			pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('rain_tip') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
		
			pool.query('UPDATE `rain_history` SET `amount` = `amount` + ' + amount + ' WHERE `id` = ' + pool.escape(rain_game.id), function(err3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'rain', false, true);
					return;
				}
				
				rain_game.amount += amount;
		
				pool.query('INSERT INTO `rain_tips` SET `userid` = ' + pool.escape(user.userid) + ', `amount` = ' + amount + ', `id_rain` = ' + parseInt(rain_game.id) + ', `time` = ' + pool.escape(time()), function(err4) {
					if(err4) {
						logger.error(err4);
						writeError(err4);
						setUserRequest(user.userid, 'rain', false, true);
						return;
					}
					
					getBalance(user.userid);
					
					var text_message = user.name + ' successfully tip ' + getFormatAmountString(amount) + ' coins to rain.';
					otherMessages(text_message, io.sockets, false);
					
					socket.emit('message', {
						type: 'success',
						success: 'You successfully tip ' + getFormatAmountString(amount) + ' coins to rain.'
					});
					
					logger.debug('[RAIN] Tip registed . ' + user.name + ' tip ' + getFormatAmountString(amount) + ' coins');
					
					setUserRequest(user.userid, 'rain', false, false);
				});
			});
		});
	});
}
/* PLINKO */

var plinkoGame_lastGames = [];

plinkoGame_loadHistory();
function plinkoGame_loadHistory(){
	pool.query('SELECT * FROM `plinko_bets` ORDER BY `id` DESC LIMIT 10', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		row1.reverse();
		
		row1.forEach(function(dice){
			plinkoGame_lastGames.push({
				id: dice.id,
				user: {
					userid: dice.userid,
					name: dice.name,
					avatar: dice.avatar,
					level: calculateLevel(dice.xp).level,
				},
				amount: getFormatAmount(dice.amount),
				color: dice.color,
				pick: roundedToFixed(dice.pick, 2)
			});
		});
	});
}

var plinkoGame_cooldown = {};

function plinkoGame_bet(user, socket, amount, color){
	if(plinkoGame_cooldown[user.userid]){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Wait for ending last plinko game!'
		});
		return;
	}
	
	setUserRequest(user.userid, 'plinko', true, true);
	
	if(color != 'red' && color != 'orange' && color != 'green' ) {
		socket.emit('message', {
			type: 'error',
			error: 'Invalid color!'
		});
		setUserRequest(user.userid, 'plinko', false, true);
		return;
	}
	
	verifyFormatAmount(amount, function(err1, amount){
		if(err1){
			socket.emit('message', {
				type: 'error',
				error: err1.message
			});
			setUserRequest(user.userid, 'plinko', false, true);
			return;
		}
		
		if(amount < config.config_site.interval_amount.plinko.min || amount > config.config_site.interval_amount.plinko.max) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bet amount [' + getFormatAmountString(config.config_site.interval_amount.plinko.min) + '-' + getFormatAmountString(config.config_site.interval_amount.plinko.max)  + ']!'
			});
			setUserRequest(user.userid, 'plinko', false, true);
			return;
		}
		
		if(getFormatAmount(user.balance) < amount) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have enough money!'
			});
			setUserRequest(user.userid, 'plinko', false, true);
			return;
		}
		
		pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(amount) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(user.userid));
		pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
		pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('plinko_bet') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
		
		pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'plinko', false, true);
				return;
			}
			
			//AFFILIATES
			pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err3, row3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'plinko', false, true);
					return;
				}
				
				if(row3.length > 0 && should_refferals_count_wager) {
					var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row3[0].amount), 'bet'));
					
					pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row3[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row3[0].referral));
				}
				
				
				getBalance(user.userid);
				addToFooterStats();
				
				logger.debug('[PLINKO] Bet registed. ' + user.name + ' did bet $' + getFormatAmountString(amount));
				
				//GENERATE HASH
				var hashPlinko = 0;
				var result = 0;
				
				for(var i = 0; i < 14; i++) {
					var newRandom = getRandomInt(1, 2);
					
					hashPlinko = (hashPlinko * 10) + newRandom;
					if(newRandom == 2) result++;
				}
				
				var results = {
					green: [50, 25, 3, 1.5, 1.2, 0, 1.1, 0.5, 1.1, 0, 1.2, 1.5, 3, 25 ,50],
					orange: [100, 50, 10, 5, 2, 1, 0.2, 0, 0.2, 1, 2, 5, 10, 25, 50],
					red: [250, 50, 20, 10, 5, 0.2, 0, 0.1, 0, 0.2, 5, 10, 20, 50, 250],
				}
				
				var secret = makeCode(16);
				var hash = sha256(secret + '-' + hashPlinko);
				
				socket.emit('message', {
					type: 'plinko',
					command: 'hash',
					hash: hash
				});
				
				var winning = getFormatAmount(parseFloat(results[color][result] * amount));
				
				pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('plinko_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
				pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(user.userid), function(err4){
					if(err4) {
						logger.error(err4);
						writeError(err4);
						setUserRequest(user.userid, 'plinko', false, true);
						return;
					}
					
					pool.query('INSERT INTO `plinko_bets` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + parseInt(user.xp) + ', `amount` = ' + amount + ', `color` = ' + pool.escape(color) + ', `hash` = ' + pool.escape(hash) + ', `secret` = ' + pool.escape(secret) + ', `value` = '+pool.escape(hashPlinko)+', `pick` = ' + roundedToFixed(results[color][result], 2) + ', `time` = ' + pool.escape(time()), function(err5, row5) {
						if(err5) {
							logger.error(err5);
							writeError(err5);
							setUserRequest(user.userid, 'plinko', false, true);
							return;
						}
						
						socket.emit('message', {
							type: 'plinko',
							command: 'bet',
							id: row5.insertId,
							value: hashPlinko,
							result: results[color][result],
							color: color
						});

						addRakeback(amount, 'plinko', user.userid);
						
						setTimeout(function(){
							var history = {
								id: row5.insertId,
								user: {
									userid: user.userid,
									avatar: user.avatar,
									name: user.name,
									level: calculateLevel(user.xp).level
								},
								amount: getFormatAmount(amount),
								color: color,
								pick: roundedToFixed(results[color][result], 2)
							}
							
							plinkoGame_lastGames.push(history);
							if(plinkoGame_lastGames.length > 10) plinkoGame_lastGames.shift();
							
							socket.emit('message', {
								type: 'plinko',
								command: 'secret',
								secret: secret
							});
							
							io.sockets.emit('message', {
								type: 'plinko',
								command: 'history',
								history: history
							});
							
							getBalance(user.userid);

							addLiveBet('plinko', user, amount, winning, winning / amount);
							
							if(winning >= config.config_games.winning_to_chat){
								var send_message = user.name + ' won ' + getFormatAmountString(winning) + ' to plinko with multiplier x'  + roundedToFixed(results[color][result], 2).toFixed(2) + '!';
								otherMessages(send_message, io.sockets, true);
							}
							
							logger.debug('[PLINKO] Win registed. ' + user.name + ' did win $' + getFormatAmountString(winning) + ' with multiplier x' + roundedToFixed(results[color][result], 2).toFixed(2));
						}, 8000);
						
						setUserRequest(user.userid, 'plinko', false, false);
						
						setTimeout(function(){
							plinkoGame_cooldown[user.userid] = false;
						}, 500);
					});
				});
			});
		});
	});
}

/* END PLINKO */

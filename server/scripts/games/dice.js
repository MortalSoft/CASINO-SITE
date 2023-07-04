/* DICE */

var diceGame_lastGames = [];

var diceGame_cooldown = {};

diceGame_loadHistory();
function diceGame_loadHistory(){
	pool.query('SELECT * FROM `dice_bets` ORDER BY `id` DESC LIMIT 10', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		row1.reverse();
		
		row1.forEach(function(dice){
			diceGame_lastGames.push({
				id: dice.id,
				user: {
					userid: dice.userid, 
					avatar: dice.avatar, 
					name: dice.name, 
					level: calculateLevel(dice.xp).level, 
				},
				amount: parseFloat(dice.amount),
				roll: parseFloat(dice.roll),
				multiplier: parseFloat(dice.multiplier),
				type: dice.type,
				win: parseFloat(dice.win),
				number: parseFloat(dice.number)
			});
		});
	});
}

function diceGame_bet(user, socket, amount, chance, mode, slow){
	if(diceGame_cooldown[user.userid]){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Wait for ending last dice game!'
		});
		return;
	}
	
	setUserRequest(user.userid, 'dice', true, true);
	
	if(mode != 'under' && mode != 'over') {
		socket.emit('message', {
			type: 'error',
			error: 'Invalid type game [over or under]!'
		});
		setUserRequest(user.userid, 'dice', false, true);
		return;
	}
	
	verifyFormatAmount(amount, function(err1, amount){
		if(err1){
			socket.emit('message', {
				type: 'error',
				error: err1.message
			});
			setUserRequest(user.userid, 'dice', false, true);
			return;
		}
		
		if(amount < config.config_site.interval_amount.dice.min || amount > config.config_site.interval_amount.dice.max) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bet amount [' + getFormatAmountString(config.config_site.interval_amount.dice.min) + '-' + getFormatAmountString(config.config_site.interval_amount.dice.max)  + ']!'
			});
			setUserRequest(user.userid, 'dice', false, true);
			return;
		}
		
		if(getFormatAmount(user.balance) < amount) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have enough money!'
			});
			setUserRequest(user.userid, 'dice', false, true);
			return;
		}
	
		if(isNaN(Number(chance))){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid chance!'
			});
			setUserRequest(user.userid, 'dice', false, true);
			return;
		}
		
		chance = roundedToFixed(chance, 2);
		
		if(chance < 0.01 || chance > 94) {
			socket.emit('message', {
				type: 'error',
				error: 'Invalid chance [0.01 - 94]!'
			});
			setUserRequest(user.userid, 'dice', false, true);
			return;
		}
		
		pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
		pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('dice_bet') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
	
		pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'dice', false, true);
				return;
			}
			
			//AFFILIATES
			pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err3, row3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'dice', false, true);
					return;
				}
				
				if(row3.length > 0 && should_refferals_count_wager) {
					var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row3[0].amount), 'bet'));
					
					pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row3[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row3[0].referral));
				}
		
				var nrRoll_1 = getRandomInt(0, 9);
				var nrRoll_2 = getRandomInt(0, 9);
				var nrRoll_3 = getRandomInt(0, 9);
				var nrRoll_4 = getRandomInt(0, 9);
				
				var rollDice = roundedToFixed(parseFloat((nrRoll_1 * 1000 + nrRoll_2 * 100 + nrRoll_3 * 10 + nrRoll_4) / 100), 2);
				var winBet = false;
				
				var multipler = roundedToFixed(parseFloat(95 / chance), 2);
				var winning = 0;
				
				var gameNumber = 0;
				
				if(mode == 'under'){
					if(rollDice <= chance) winBet = true;
					gameNumber = chance;
				} else if(mode == 'over') {
					if(parseFloat(100 - chance) <= rollDice) winBet = true;
					gameNumber = roundedToFixed(parseFloat(100 - chance), 2);
				}
				
				var secret = makeCode(16);
				var hash = sha256(secret + '-' + rollDice.toFixed(2));
				
				socket.emit('message', {
					type: 'dice',
					command: 'bet',
					win: winBet,
					number: rollDice,
					numbers: [nrRoll_1, nrRoll_2, nrRoll_3, nrRoll_4],
					hash: hash,
					secret: secret
				});
				
				if(winBet){
					winning = getFormatAmount(multipler * amount);
					
					pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - amount)) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(user.userid));
					
					pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('dice_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(user.userid));
				}
				
				pool.query('INSERT INTO `dice_bets` SET `userid` = ' + pool.escape(user.userid) + ', `avatar` = ' + pool.escape(user.avatar) + ', `name` = ' + pool.escape(user.name) + ', `xp` = ' + parseInt(user.xp) + ', `multiplier` = ' + multipler + ', `number` = ' + gameNumber + ', `amount` = ' + amount + ', `type` = ' + pool.escape(mode) + ', `win` = ' + winning + ', `roll` = ' + rollDice + ', `chance` = ' + chance + ', `secret` = ' + pool.escape(secret) + ', `hash` = ' + pool.escape(hash) + ', `time` = ' + pool.escape(time()), function(err4, row4) {
					if(err4) {
						logger.debug(err4);
						writeError(err4);
						setUserRequest(user.userid, 'dice', false, true);
						return;
					}
					
					setUserRequest(user.userid, 'dice', false, false);
					
					var timeCooldown = 0;
					if(slow) timeCooldown = 6500;
					
					setTimeout(function(){
						var history = {
							id: row4.insertId,
							user: {
								userid: user.userid,
								avatar: user.avatar,
								name: user.name,
								level: calculateLevel(user.xp).level,
							},
							amount: amount,
							roll: rollDice,
							multiplier: multipler,
							type: mode,
							win: winning,
							number: gameNumber
						}
						
						diceGame_lastGames.push(history);
						if(diceGame_lastGames.length > 10) diceGame_lastGames.shift();
						
						io.sockets.emit('message', {
							type: 'dice',
							command: 'history',
							history: history
						});

						addLiveBet('dice', user, amount, winning, multipler);
						
						getBalance(user.userid);
						addToFooterStats();

						addRakeback(amount, 'coinflip', user.userid);
						
						logger.debug('[DICE] Bet registed. ' + user.name + ' did bet $' + getFormatAmountString(amount));
						
						if(winBet) {
							if(winning >= config.config_games.winning_to_chat){
								var send_message = user.name + ' won ' + getFormatAmountString(winning) + ' to dice with chance '  + chance.toFixed(2) + '!';
								otherMessages(send_message, io.sockets, true);
							}
							
							logger.debug('[DICE] Win registed. ' + user.name + ' did win $' + getFormatAmountString(winning) + ' with chance ' + chance.toFixed(2));
						}
						
						diceGame_cooldown[user.userid] = false;
					}, timeCooldown);
				});
			});
		});
	});
}

/* END DICE */

/* CASES */

var casesGame_lastWinnings = [];

var casesGame_cases = config.config_games.games.unbox.cases;

var unboxGame_cooldown = {};

unboxGame_loadHistory();
function unboxGame_loadHistory(){
	pool.query('SELECT * FROM `unbox_opens` ORDER BY `id` DESC LIMIT 20', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		row1.reverse();
		
		casesGame_lastWinnings = [];
		
		row1.forEach(function(history){
			if(casesGame_cases[history.case_id] !== undefined){
				if(casesGame_cases[history.case_id].items[history.winning_id] !== undefined){
					casesGame_lastWinnings.push({
						user:{
							userid: history.userid,
							name: history.name,
							avatar: history.avatar,
							level: calculateLevel(history.xp).level,
						},
						case_unbox: {
							id: history.case_id,
							name: casesGame_cases[history.case_id].name,
							price: casesGame_cases[history.case_id].price
						},
						winning: {
							name: casesGame_cases[history.case_id].items[history.winning_id].name,
							image: casesGame_cases[history.case_id].items[history.winning_id].image,
							price: parseInt(casesGame_cases[history.case_id].items[history.winning_id].price),
							chance: parseFloat(casesGame_cases[history.case_id].items[history.winning_id].chance),
							color: getColorByQuality(casesGame_cases[history.case_id].items[history.winning_id].quality)
						}
					});
				}
			}
		});
	});
}

function casesGame_getCases(){
	var list_cases = [];
	
	Object.keys(casesGame_cases).forEach(function(id){
		list_cases.push({
			id: id,
			name: casesGame_cases[id].name,
			main_item: casesGame_cases[id].items[casesGame_cases[id].main_item].image,
			price: getFormatAmount(casesGame_cases[id].price)
		});
	});
	
	return list_cases;
}

function casesGame_show(user, socket, id){
	if(casesGame_cases[id] === undefined) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid case id!'
		});
		return;
	}
	
	var items = [];
	casesGame_cases[id].items.forEach(function(item){
		items.push({
			name: item.name,
			image: item.image,
			price: getFormatAmount(item.price),
			chance: roundedToFixed(item.chance, 2),
			color: getColorByQuality(item.quality)
		});
	})
	
	socket.emit('message', {
		type: 'unbox',
		command: 'show',
		items: items,
		case_unbox: {
			id: id,
			name: casesGame_cases[id].name,
			main_item: casesGame_cases[id].main_item,
			price: getFormatAmount(casesGame_cases[id].price)
		},
		spinner: casesGame_generateSpinner(casesGame_cases[id].items)
	});
}

function casesGame_test(user, socket, id){
	if(unboxGame_cooldown[user.userid]){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Wait for ending last unboxing game!'
		});
		return;
	}
	
	setUserRequest(user.userid, 'unbox', true, true);
	
	if(casesGame_cases[id] === undefined) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid case id!'
		});
		setUserRequest(user.userid, 'unbox', false, true);
		return;
	}
	
	var items = casesGame_cases[id].items;
	
	var tickets = casesGame_generateTickets(items);
	var totalTickets = tickets[tickets.length - 1].max;
	
	var items_roll = casesGame_generateSpinner(items);
	
	var caseSecret = makeCode(16);
	var casePercentage = Math.random() * 100;
	var caseHash = sha256(caseSecret+'-'+casePercentage);
	
	var ticketWinner = parseInt(totalTickets * casePercentage / 100);
	var itemWinner = null;
		
	for(var j = 0; j < tickets.length; j++){
		if(ticketWinner >= tickets[j].min && ticketWinner <= tickets[j].max) {
			itemWinner = {
				name: items[j].name,
				image: items[j].image,
				price: getFormatAmount(items[j].price),
				chance: roundedToFixed(items[j].chance, 2),
				color: getColorByQuality(items[j].quality)
			};
			break;
		}
	}
	
	items_roll[99] = itemWinner;
	
	socket.emit('message', {
		type: 'unbox',
		command: 'roll',
		items: items_roll,
		hash: caseHash
	});
	
	socket.emit('message', {
		type: 'unbox',
		command: 'secret',
		secret: caseSecret,
	});
	
	setUserRequest(user.userid, 'unbox', false, false);
	
	setTimeout(function(){
		unboxGame_cooldown[user.userid] = false;
		
		socket.emit('message', {
			type: 'unbox',
			command: 'percentage',
			percentage: casePercentage,
		});
	}, 5000);
}

function casesGame_open(user, socket, id){
	if(unboxGame_cooldown[user.userid]){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Wait for ending last unboxing game!'
		});
		return;
	}
	
	setUserRequest(user.userid, 'unbox', true, true);
	
	if(casesGame_cases[id] === undefined) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid case id!'
		});
		setUserRequest(user.userid, 'unbox', false, true);
		return;
	}
	
	
	var amount = getFormatAmount(casesGame_cases[id].price)
	
	if(getFormatAmount(user.balance) < amount) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You don\'t have enough money!'
		});
		setUserRequest(user.userid, 'unbox', false, true);
		return;
	}
	
	pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(amount) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(user.userid));
	pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
	pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('unbox_open') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
	
	pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err1){
		if(err1) {
			logger.error(err1);
			writeError(err1);
			setUserRequest(user.userid, 'unbox', false, true);
			return;
		}
		
		//AFFILIATES
		pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err2, row2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'unbox', false, true);
				return;
			}
			
			if(row2.length > 0 && should_refferals_count_wager) {
				var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row2[0].amount), 'bet'));
				
				pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row2[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
				pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row2[0].referral));
			}
		
			getBalance(user.userid);
			addToFooterStats();
			
			logger.debug('[UNBOX] Bet registed. ' + user.name + ' did open a case for $' + getFormatAmountString(amount));
		
			var items = casesGame_cases[id].items;
			
			var tickets = casesGame_generateTickets(items);
			var totalTickets = tickets[tickets.length - 1].max;
			
			var items_roll = casesGame_generateSpinner(items);
			
			var caseSecret = makeCode(16);
			var casePercentage = Math.random() * 100;
			var caseHash = sha256(caseSecret + '-' + casePercentage);
			
			var ticketWinner = parseInt(totalTickets * casePercentage / 100);
			var itemWinner = null;
			
			var j = 0;
			for(j = 0; j < tickets.length; j++){
				if(ticketWinner >= tickets[j].min && ticketWinner <= tickets[j].max) {
					itemWinner = itemWinner = {
						name: items[j].name,
						image: items[j].image,
						price: getFormatAmount(items[j].price),
						chance: roundedToFixed(items[j].chance, 2),
						color: getColorByQuality(items[j].quality)
					};
					break;
				}
			}
			
			items_roll[99] = itemWinner;
			
			pool.query('INSERT INTO `unbox_opens` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + parseInt(user.xp) + ', `case_id` = ' + pool.escape(id) + ', `winning_id` = ' + j + ', `percentage` = ' + pool.escape(casePercentage) + ', `secret` = ' + pool.escape(caseSecret) + ', `hash` = ' + pool.escape(caseHash) + ', `time` = ' + pool.escape(time()), function(err3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'unbox', false, true);
					return;
				}
			
				socket.emit('message', {
					type: 'unbox',
					command: 'roll',
					items: items_roll,
					hash: caseHash
				});
				
				socket.emit('message', {
					type: 'unbox',
					command: 'secret',
					secret: caseSecret,
				});

				addRakeback(amount, 'unbox', user.userid);
				
				var winning = getFormatAmount(itemWinner.price);
				
				pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('unbox_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
				pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(user.userid), function(err4){
					if(err4) {
						logger.error(err4);
						writeError(err4);
						setUserRequest(user.userid, 'unbox', false, true);
						return;
					}
					
					setUserRequest(user.userid, 'unbox', false, false);
					
					setTimeout(function(){
						unboxGame_cooldown[user.userid] = false;
						
						socket.emit('message', {
							type: 'unbox',
							command: 'winning',
							case_unbox: {
								name: casesGame_cases[id].name,
								hash: caseHash,
								secret: caseSecret,
								percentage: casePercentage,
								ticket: ticketWinner
							},
							item: itemWinner
						});
						
						var history = {
							user:{
								userid: user.userid,
								name: user.name,
								avatar: user.avatar,
								level: calculateLevel(user.xp).level
							},
							case_unbox: {
								id: id,
								name: casesGame_cases[id].name,
								price: casesGame_cases[id].price
							},
							winning: itemWinner
						};
						
						casesGame_lastWinnings.push(history);
						if(casesGame_lastWinnings.length > 20) casesGame_lastWinnings.shift();
						
						io.sockets.emit('message', {
							type: 'unbox',
							command: 'history',
							history: history
						});
						
						socket.emit('message', {
							type: 'unbox',
							command: 'percentage',
							percentage: casePercentage,
						});
						
						if(winning >= config.config_games.winning_to_chat){
							var send_message = user.name + ' won ' + getFormatAmountString(winning) + ' to unbox with chance '  + roundedToFixed(itemWinner.chance, 2).toFixed(2) + '%!';
							otherMessages(send_message, io.sockets, true);
						}
						
						getBalance(user.userid);
						
						logger.debug('[UNBOX] Win registed. ' + user.name + ' did win $' + getFormatAmountString(winning) + ' with chance ' + roundedToFixed(itemWinner.chance, 2).toFixed(2) + '%');
					}, 5000);
				});
			});
		});
	});
}

function casesGame_generateTickets(items){
	var decimals = 0; 
	
	items.forEach(function(item){
		if(countDecimals(item.chance) > decimals) decimals = countDecimals(item.chance);
	});

	var tickets = [];
	var totalTickets = 0;

	items.forEach(function(item){
		tickets.push({
			min: totalTickets + 1,
			max: totalTickets + item.chance * Math.pow(10, decimals)
		})
		
		totalTickets += item.chance * Math.pow(10, decimals);
	});
	
	return tickets;
}

function casesGame_generateSpinner(items){
	var tickets = casesGame_generateTickets(items);
	var totalTickets = tickets[tickets.length - 1].max;
	
	var items_roll = [];
	
	for(var i = 0; i < 150; i++){
		var ticket = getRandomInt(1, totalTickets);
		
		for(var j = 0; j < tickets.length; j++){
			if(ticket >= tickets[j].min && ticket <= tickets[j].max) {
				items_roll.push({
					name: items[j].name,
					image: items[j].image,
					price: getFormatAmount(items[j].price),
					chance: roundedToFixed(items[j].chance, 2),
					color: getColorByQuality(items[j].quality)
				});
			}
		}
	}
	
	return items_roll;
}

/* END CASES */

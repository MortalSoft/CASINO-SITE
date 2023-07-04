/* COINFLIP */

var coinflipGame_games = {};

coinflipGame_loadHistory();
function coinflipGame_loadHistory(){
	pool.query('SELECT * FROM `coinflip_games` WHERE `ended` = 0 AND `canceled` = 0', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		row1.reverse();
		
		row1.forEach(function(coinflip){
			var amount = getFormatAmount(coinflip.amount);
			
			coinflipGame_games[coinflip.id] = {
				status: 0,
				player1: {},
				player2: {},
				creator: parseInt(coinflip.creator),
				amount: amount,
				hash: coinflip.hash,
				secret: coinflip.secret,
				percentage: parseFloat(coinflip.percentage),
				time: null,
				timeout: null,
			}
			
			pool.query('SELECT * FROM `coinflip_bets` WHERE `gameid` = ' + pool.escape(coinflip.id), function(err2, row2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				if(row2.length > 1) {
					coinflipGame_games[coinflip.id].status = 1;
					coinflipGame_games[coinflip.id].time = time();
				}
				
				row2.forEach(function(bet){
					coinflipGame_games[coinflip.id]['player' + bet.coin] = {
						userid: bet.userid,
						name: bet.name,
						avatar: bet.avatar,
						level: calculateLevel(bet.xp).level
					};
				});
				
				if(row2.length > 1) {
					coinflipGame_continue(coinflip.id);
				} else {
					if(config.config_games.games.coinflip.cancel){
						var creator = coinflipGame_games[coinflip.id]['player' + coinflipGame_games[coinflip.id]['creator']]['userid'];
						
						if(coinflip.time + config.config_games.games.coinflip.timer_cancel > time()){
							coinflipGame_games[coinflip.id].timeout = setTimeout(function(){
								pool.query('UPDATE `coinflip_games` SET `canceled` = 1 WHERE `id` = ' + coinflip.id, function(err3){
									if(err3) {
										logger.error(err3);
										writeError(err3);
										return;
									}
									
									pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(creator) + ', `service` = ' + pool.escape('coinflip_refund') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
									
									pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ' WHERE `userid` = ' + pool.escape(creator), function(err4){
										if(err4) {
											logger.error(err4);
											writeError(err4);
											return;
										}
										
										getBalance(creator);
										
										delete coinflipGame_games[coinflip.id];
									
										logger.debug('[COINFLIP] Bet #' + coinflip.id + ' was canceled');
										
										io.sockets.emit('message', {
											type: 'coinflip',
											command: 'remove',
											coinflip: {
												id: coinflip.id
											}
										});
									});
								});
							}, (time() - coinflip.time + config.config_games.games.coinflip.timer_cancel) * 1000);
						} else {
							pool.query('UPDATE `coinflip_games` SET `canceled` = 1 WHERE `id` = ' + coinflip.id, function(err3){
								if(err3) {
									logger.error(err3);
									writeError(err3);
									return;
								}
								
								pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(creator) + ', `service` = ' + pool.escape('coinflip_refund') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
								
								pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ' WHERE `userid` = ' + pool.escape(creator), function(err4){
									if(err4) {
										logger.error(err4);
										writeError(err4);
										return;
									}
									
									getBalance(creator);
									
									delete coinflipGame_games[coinflip.id];
								
									logger.debug('[COINFLIP] Bet #' + coinflip.id + ' was canceled');
									
									io.sockets.emit('message', {
										type: 'coinflip',
										command: 'remove',
										coinflip: {
											id: coinflip.id
										}
									});
								});
							});
						}
					}
				}
			});
		});
	});
}

function coinflipGame_create(user, socket, amount, coin) {
	setUserRequest(user.userid, 'coinflip', true, true);
	
	verifyFormatAmount(amount, function(err2, amount){
		if(err2){
			socket.emit('message', {
				type: 'error',
				error: err2.message
			});
			setUserRequest(user.userid, 'coinflip', false, true);
			return;
		}
		
		if(amount < config.config_site.interval_amount.coinflip.min || amount > config.config_site.interval_amount.coinflip.max) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bet amount [' + getFormatAmountString(config.config_site.interval_amount.coinflip.min) + '-' + getFormatAmountString(config.config_site.interval_amount.coinflip.max)  + ']!'
			});
			setUserRequest(user.userid, 'coinflip', false, true);
			return;
		}
	
		if(getFormatAmount(user.balance) < amount) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have enough money!'
			});
			setUserRequest(user.userid, 'coinflip', false, true);
			return;
		}
	
		if(isNaN(Number(coin))){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid coin!'
			});
			setUserRequest(user.userid, 'coinflip', false, true);
			return;
		}
		
		coin = parseInt(coin);
	
		if(coin != 1 && coin != 2){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid coin [coin 1 or coin 2]!'
			});
			setUserRequest(user.userid, 'coinflip', false, true);
			return;
		}
		
		pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
		pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('coinflip_bet') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
		
		pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3){
			if(err3) {
				logger.error(err3);
				writeError(err3);
				setUserRequest(user.userid, 'coinflip', false, true);
				return;
			}
			
			//AFFILIATES
			pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err4, row4) {
				if(err4) {
					logger.error(err4);
					writeError(err4);
					setUserRequest(user.userid, 'coinflip', false, true);
					return;
				}
				
				if(row4.length > 0 && should_refferals_count_wager) {
					var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row4[0].amount), 'bet'));
					
					pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row4[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row4[0].referral));
				}
			
				var secretCF = makeCode(16);
				var percentageCF = Math.random() * 100;
				
				var hashCF = sha256(secretCF + '-' + percentageCF);
				
				pool.query('INSERT INTO `coinflip_games` SET `creator` = ' + coin + ', `amount` = ' + amount + ', `hash` = ' + pool.escape(hashCF) + ', `secret` = ' + pool.escape(secretCF) + ', `percentage` = ' + pool.escape(percentageCF) + ', `time` = ' + pool.escape(time()), function(err5, row5){
					if(err5) {
						logger.error(err5);
						writeError(err5);
						setUserRequest(user.userid, 'coinflip', false, true);
						return;
					}
					
					pool.query('INSERT INTO `coinflip_bets` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + parseInt(user.xp) + ', `coin` = ' + coin + ', `gameid` = ' + pool.escape(row5.insertId) + ', `time` = ' + pool.escape(time()), function(err6){
						if(err6) {
							logger.error(err6);
							writeError(err6);
							setUserRequest(user.userid, 'coinflip', false, true);
							return;
						}
					
						coinflipGame_games[row5.insertId] = {
							status: 0,
							player1: {},
							player2: {},
							creator: coin,
							amount: amount,
							hash: hashCF,
							secret: secretCF,
							percentage: percentageCF,
							time: null,
							timeout: null
						}
						
						coinflipGame_games[row5.insertId]['player' + coin] = {
							userid: user.userid,
							name: user.name,
							avatar: user.avatar,
							level: calculateLevel(user.xp).level
						}
						
						socket.emit('message', {
							type: 'coinflip',
							command: 'bet_confirmed'
						});
						
						io.sockets.emit('message', {
							type: 'coinflip',
							command: 'add',
							coinflip: {
								id: row5.insertId,
								player1: coinflipGame_games[row5.insertId]['player1'],
								player2: coinflipGame_games[row5.insertId]['player2'],
								creator: coin,
								amount: amount,
								hash: hashCF,
								data: {}
							}
						});

						addRakeback(amount, 'coinflip', user.userid);
						
						if(config.config_games.games.coinflip.cancel){
							coinflipGame_games[row5.insertId].timeout = setTimeout(function(){
								pool.query('UPDATE `coinflip_games` SET `canceled` = 1 WHERE `id` = ' + row5.insertId, function(err7){
									if(err7) {
										logger.error(err7);
										writeError(err7);
										return;
									}
									
									pool.query('INSERT INTO `users_transactions` SET `user` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('coinflip_refund') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
									
									pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err8){
										if(err8) {
											logger.error(err8);
											writeError(err8);
											return;
										}
										
										getBalance(user.userid);
										
										delete coinflipGame_games[row5.insertId];
									
										logger.debug('[COINFLIP] Bet #' + row5.insertId + ' was canceled');
										
										io.sockets.emit('message', {
											type: 'coinflip',
											command: 'remove',
											coinflip: {
												id: row5.insertId
											}
										});
									});
								});
							}, config.config_games.games.coinflip.timer_cancel * 1000);
						}
						
						getBalance(user.userid);
						addToFooterStats();
						
						logger.debug('[COINFLIP] Bet registed. ' + user.name + ' did bet $' + getFormatAmountString(amount));
						
						setUserRequest(user.userid, 'coinflip', false, false);
					});
				});
			});
		});
	});
}

function coinflipGame_join(user, socket, id) {
	setUserRequest(user.userid, 'coinflip', true, true);
	
	if(isNaN(Number(id))){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid game. Please join in a valid game!'
		});
		setUserRequest(user.userid, 'coinflip', false, true);
		return;
	}
	
	id = parseInt(id);
	
	if(coinflipGame_games[id] === undefined) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid game. Please join in a valid game!'
		});
		setUserRequest(user.userid, 'coinflip', false, true);
		return;
	}
	
	if(coinflipGame_games[id]['status'] != 0) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: This game are already ended!'
		});
		setUserRequest(user.userid, 'coinflip', false, true);
		return;
	}
	
	if(coinflipGame_games[id]['player' + coinflipGame_games[id]['creator']]['userid'] == user.userid) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You cannot join your game!'
		});
		setUserRequest(user.userid, 'coinflip', false, true);
		return;
	}
	
	var amount = getFormatAmount(coinflipGame_games[id]['amount']);
	
	if(getFormatAmount(user.balance) < amount) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You don\'t have enough money!'
		});
		setUserRequest(user.userid, 'coinflip', false, true);
		return;
	}
	
	pool.query('UPDATE `users` SET `xp` = `xp` + ' + getXpByAmount(amount) + ' WHERE `userid` = ' + pool.escape(user.userid), function(){ getLevel(user.userid); });
	pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('coinflip_join') + ', `amount` = ' + (-amount)+', `time` = ' + pool.escape(time()));
		
	pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = '+pool.escape(user.userid), function(err1){
		if(err1) {
			logger.error(err1);
			writeError(err1);
			setUserRequest(user.userid, 'coinflip', false, true);
			return;
		}
		
		//AFFILIATES
		pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err2, row2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'coinflip', false, true);
				return;
			}
			
			if(row2.length > 0 && should_refferals_count_wager) {
				var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row2[0].amount), 'bet'));
				
				pool.query('INSERT INTO `referral_wagered` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row2[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
				pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row2[0].referral));
			}
		
			var playerToJoin = parseInt([2, 1][coinflipGame_games[id]['creator'] - 1]);
			
			pool.query('INSERT INTO `coinflip_bets` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + parseInt(user.xp) + ', `coin` = ' + playerToJoin + ', `gameid` = ' + pool.escape(id) + ', `time` = ' + pool.escape(time()), async function(err3){
				if(err3) {
					logger.error(err3);
					writeError(err3);
					setUserRequest(user.userid, 'coinflip', false, true);
					return;
				}
				
				if(coinflipGame_games[id].timeout != null) clearTimeout(coinflipGame_games[id].timeout);
				
				coinflipGame_games[id].time = time();
				coinflipGame_games[id].status = 1;
				
				coinflipGame_games[id]['player' + playerToJoin] = {
					name: user.name,
					userid: user.userid,
					avatar: user.avatar,
					level: calculateLevel(user.xp).level
				}
				
				socket.emit('message', {
					type: 'coinflip',
					command: 'bet_confirmed',
				});
				
				

				// EOS_CODE
				const lastBlock = await getLastBlockNum();
				const targetBlock = lastBlock + 8;

				coinflipGame_games[id].secret = targetBlock;

				io.sockets.emit('message', {
					type: 'coinflip',
					command: 'edit',
					status: 1,
					coinflip: {
						id: id,
						player1: coinflipGame_games[id]['player1'],
						player2: coinflipGame_games[id]['player2'],
						creator: coinflipGame_games[id]['creator'],
						amount: coinflipGame_games[id]['amount'],
						data: {
							time: config.config_games.games.coinflip.timer_wait_start - time() + coinflipGame_games[id].time
						},
						secret: targetBlock,
						hash: coinflipGame_games[id]['hash']
					}
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

				      coinflipGame_continue(id, publicSeed);
				    }
				  } catch (error) {
				    // console.log('Not mined yet')
				  }
				  await sleep(1000);
				}
				
				// coinflipGame_continue(id, pseed);
				
				getBalance(user.userid);
				addRakeback(amount, 'coinflip', user.userid);
				
				logger.debug('[COINFLIP] Join registed. ' + user.name + ' did bet $' + getFormatAmountString(amount));
						
				setUserRequest(user.userid, 'coinflip', false, false);
			});
		});
	});
}

function coinflipGame_continue(id, pseed){
	setTimeout(async function(){
		coinflipGame_games[id].status = 2;

		const _winner = await coinflipGame_getWinner(id, coinflipGame_games[id]['hash'], pseed);
		
		io.sockets.emit('message', {
			type: 'coinflip',
			command: 'edit',
			status: 2,
			coinflip: {
				id: id,
				player1: coinflipGame_games[id]['player1'],
				player2: coinflipGame_games[id]['player2'],
				creator: coinflipGame_games[id]['creator'],
				amount: coinflipGame_games[id]['amount'],
				data: {
					winner: _winner,
					winner_userid: coinflipGame_games[id]['player' + _winner]['userid']
				},
				secret: coinflipGame_games[id]['secret'],
				hash: coinflipGame_games[id]['hash']
			}
		});
		
		setTimeout(function(){
			var winner = coinflipGame_games[id]['player' + _winner]['userid'];
			var opponent = coinflipGame_games[id]['player' + [2, 1][_winner - 1]]['userid'];
				
			pool.query('UPDATE `coinflip_games` SET `ended` = 1 WHERE `id` = ' + id, function(err1){
				if(err1) {
					logger.error(err1);
					writeError(err1);
					return;
				}
				
				var amount = getFormatAmount(coinflipGame_games[id]['amount']);
				var winning = getFormatAmount(parseFloat(amount * 2 - getFeeFromCommission(parseFloat(amount * 2), config.config_games.games.coinflip.commission)));
				
				pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - amount)) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(winner));	
				pool.query('UPDATE `users` SET `available` = `available` + ' + getAvailableAmount(getFormatAmount(winning - amount)) + ' WHERE `deposit_count` > 0 AND `userid` = ' + pool.escape(opponent));	
				pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(winner) + ', `service` = ' + pool.escape('coinflip_win') + ', `amount` = ' + winning + ', `time` = ' + pool.escape(time()));
				
				pool.query('UPDATE `users` SET `balance` = `balance` + ' + winning + ' WHERE `userid` = ' + pool.escape(winner), function(err2){
					if(err2) {
						logger.error(err2);
						writeError(err2);
						return;
					}
				
					coinflipGame_games[id]['status'] = 3;
				
					io.sockets.emit('message', {
						type: 'coinflip',
						command: 'edit',
						status: 3,
						coinflip: {
							id: id,
							player1: coinflipGame_games[id]['player1'],
							player2: coinflipGame_games[id]['player2'],
							creator: coinflipGame_games[id]['creator'],
							amount: coinflipGame_games[id]['amount'],
							data: {
								winner: _winner,
								winner_userid: coinflipGame_games[id]['player' + _winner]['userid']
							},
							secret: coinflipGame_games[id]['secret'],
							hash: coinflipGame_games[id]['hash']
						}
					});
					
					if(winning >= config.config_games.winning_to_chat){
						var send_message = coinflipGame_games[id]['player' + _winner]['name'] + ' won ' + getFormatAmountString(winning) + ' to coinflip!';
						otherMessages(send_message, io.sockets, true);
					}
					
					io.sockets.in(winner).emit('message', {
						type: 'success',
						success: 'The game of ' + getFormatAmountString(winning) + ' on coinflip ended as win!'
					});
					
					io.sockets.in(opponent).emit('message', {
						type: 'error',
						error: 'The game of ' + getFormatAmountString(winning) + ' on coinflip ended as lose!'
					});
					
					getBalance(winner);
					
					logger.debug('[COINFLIP] Win registed. ' + coinflipGame_games[id]['player' + _winner]['name'] + ' did win $' + getFormatAmountString(winning));
					
					setTimeout(function(){
						delete coinflipGame_games[id];
						
						io.sockets.emit('message', {
							type: 'coinflip',
							command: 'remove',
							coinflip: {
								id: id
							}
						});
					}, config.config_games.games.coinflip.timer_delete * 1000);
				});
			});
		}, 4000);
	}, config.config_games.games.coinflip.timer_wait_start * 1000 + 1000);
}

function coinflipGame_getWinner(id, hash, pseed){
	var chanceSeparator = 50;

	var finalHash = `${hash}-${pseed}`;
	var winnerTick = parseInt(finalHash.substr(0, 8), 16) % 100;
	
	// if(coinflipGame_games[id]['percentage'] <= chanceSeparator) return 1;
	// else return 2;
	if(winnerTick <= chanceSeparator) return 1;
	else return 2;
}

/* END COINFLIP */

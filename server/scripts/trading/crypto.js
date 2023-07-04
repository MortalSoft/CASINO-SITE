var coinpayments = require('coinpayments');

const IS_MANUAL_WITHDRAWAL = true;

var client = new coinpayments({
	key: config.config_offers.coinpayments.apikey.public_key,
	secret: config.config_offers.coinpayments.apikey.private_key
});

var currency_amount = {};

var transactions_checking = false;

function cryptoHandler(user, socket, request) {
	if(user.rank !== 1 && user.rank !== 100) return;

	if(request.action == 'get admin transactions') {
		let trx = JSON.parse(fs.readFileSync('./crypto_withdraw.json', 'utf8'));

		socket.emit('crypto', {action: 'admin transactions', trx: trx, user: user});
	}


	if(request.action == 'trxAction') {
		let d = request.trxData;
		let t;
		let iii = -1;

		let trx = JSON.parse(fs.readFileSync('./crypto_withdraw.json', 'utf8'));
		for(let i in trx) {
			if(trx[i].userid == d.userid && trx[i].amount == d.amount && trx[i].time == d.time) {
				t = trx[i];
				iii = i;
			}
		}

		if(!t) return;

		if(request.action2 == 'decline') {
			// todo: remove from list
			trx.splice(iii, 1);
			fs.writeFileSync('./crypto_withdraw.json', JSON.stringify(trx));

			pool.query('UPDATE `users` SET `balance` = `balance` + ' + parseFloat(t.amount_calculated) + ', `available` = `available` + ' + t.amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err5) {
				if(err5) {
					logger.error(err5);
					writeError(err5);
					// setUserRequest(user.userid, 'crypto_withdraw', false, true);
					// return;
				}

				getBalance(user.userid);
			});

			return socket.emit('crypto', {
				action: 'update trx status',
				amount: t.amount,
				userid: t.userid,
				time: t.time,
				status: 'declined'
			});
		}


		client.createWithdrawal({
			amount: t.amount,
			currency: t.currency,
			address: t.address,
			// userid: t.userid
		}, function(err4, result4){
		  if(err4) {
		    logger.error(err4);
		    writeError(err4);
		    
		    socket.emit('message', {
		      type: 'error',
		      error: err4.message
		    });
		    // setUserRequest(user.userid, 'crypto_withdraw', false, true);
		    return;
		  }
		  
		  // pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(t.userid) + ', `service` = ' + pool.escape(t.currency.toLowerCase() + '_withdraw') + ', `amount` = ' + (-t.amount) + ', `time` = ' + pool.escape(time()));
		  // pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ', `available` = `available` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err5) {
		    // if(err5) {
		      // logger.error(err5);
		      // writeError(err5);
		      // setUserRequest(user.userid, 'crypto_withdraw', false, true);
		      // return;
		    // }
		    
		    // socket.emit('message', {
		    //   type: 'info',
		    //   info: 'Withdrawal has been sent!'
		    // });

		    // todo: remove from the list
		    
		    
		    getBalance(t.userid);

		    var exchange = currency_amount[t.currency];
				var amount_calculated = getFormatAmount(exchange * t.value);
		  
		    client.getWithdrawalInfo({id: result4.id}, function(err6, result6){
		      if(err6) {
		        logger.error(err6);
		        writeError(err6);
		        // setUserRequest(t.userid, 'crypto_withdraw', false, true);
		        return;
		      }
		      
		      pool.query('INSERT INTO `crypto_transactions` SET `type` = ' + pool.escape('withdraw') + ', `userid` = ' + pool.escape(t.userid) + ', `address` = ' + pool.escape(t.address) + ', `status` = ' + pool.escape(result6.status) + ', `currency` = ' + pool.escape(result6.coin) + ', `amount` = ' + t.amount + ', `value` = ' + parseFloat(result6.amountf) + ', `exchange` = ' + exchange + ', `time` = ' + pool.escape(result6.time_created), function(err7) {
		        if(err7) {
		          logger.error(err7);
		          writeError(err7);
		          // setUserRequest(t.userid, 'crypto_withdraw', false, true);
		          return;
		        }

		        socket.emit('message', {
				      type: 'info',
				      info: 'Withdrawal has been sent!'
				    });
		        
		        logger.debug('[COINPAYMENTS] Withdraw order is prepared');

		        trx.splice(iii, 1);
		        fs.writeFileSync('./crypto_withdraw.json', JSON.stringify(trx));

		        return socket.emit('crypto', {
							action: 'update trx status',
							amount: t.amount,
							userid: t.userid,
							time: t.time,
							status: 'accepted'
						});
		        
		        // setUserRequest(t.userid, 'crypto_withdraw', false, false);
		      });
		    });
		  // });
		});
	}
}

updateCurrencies(0, function(){
	startCheckingTransactions();
	
	logger.debug('[COINPAYMENTS] Prices Loaded');
});

function startCheckingTransactions(){
	checkCoinpaymentsTransactions();
	
	setInterval(function(){
		if(!transactions_checking) {
			checkCoinpaymentsTransactions();
		} else logger.error('[COINPAYMENTS] Transactions are still checking');
	}, config.config_offers.coinpayments.cooldown_check * 1000);
}

setInterval(function(){
	updateCurrencies(0, function(){
		logger.debug('[COINPAYMENTS] Prices Loaded');
	});
}, config.config_offers.coinpayments.prices.cooldown_load * 1000);

function updateCurrencies(item, callback){
	if(config.config_offers.coinpayments.games[item] === undefined) return callback();
	
	request('https://min-api.cryptocompare.com/data/price?fsym=' + config.config_offers.coinpayments.games[item] + '&tsyms=USD', function(err1, response1, body1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(response1 && response1.statusCode == 200){
			var body1 = JSON.parse(body1);
			var data1 = body1['USD'];
			
			currency_amount[config.config_offers.coinpayments.games[item]] = parseFloat(data1);
			
			updateCurrencies(item + 1, callback);
		}
	});
}

function checkCoinpaymentsTransactions() {
	logger.debug('[COINPAYMENTS] Checking transactions');
	
	transactions_checking = true;
	
  	pool.query('SELECT * FROM `crypto_transactions` WHERE `inspected` = 0', async function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			
			transactions_checking = false;
			return;
		}
		
		for(var i = 0; i < row1.length; i++) await checkCoinpaymentsTransactionsByOne(row1[i]);
		
		transactions_checking = false;
	});
}

function checkCoinpaymentsTransactionsByOne(transaction){
  	return new Promise(function(resolve, reject) {
		var type = transaction.type;
		var status = parseInt(transaction.status);
		
		var txnid = transaction.txnid;
		var currency = transaction.currency;
		var value = parseFloat(transaction.value);
		
		var user = {
			userid: transaction.userid,
			name: transaction.name,
			avatar: transaction.avatar,
			level: calculateLevel(transaction.xp).level
		}
		
		var amount = getFormatAmount(transaction.amount);
		
		if(type == 'deposit'){
			if(status == 100){
				if(config.config_offers.coinpayments.games.includes(currency)){
					if(currency_amount[currency] > 0){
						var exchange = currency_amount[currency];
						var amount_calculated = getFormatAmount(exchange * value);
						
						pool.query('UPDATE `crypto_transactions` SET `inspected` = 1, `amount` = ' + amount_calculated + ', `exchange` = ' + exchange + ' WHERE `txnid` = ' + pool.escape(txnid), function(err1) {
							if(err1) {
								logger.error(err1);
								writeError(err1);
								
								resolve();
								return;
							}
							
							pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape(currency.toLowerCase() + '_deposit') + ', `amount` = ' + amount_calculated + ', `time` = ' + pool.escape(time()));
							pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount_calculated + ', `deposit_count` = `deposit_count` + 1, `deposit_total` = `deposit_total` + ' + amount_calculated + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2) {
								if(err2) {
									logger.error(err2);
									writeError(err2);
									
									resolve();
									return;
								}
								
								//AFFILIATES
								pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(user.userid) + ' GROUP BY referral_uses.referral', function(err3, row3) {
									if(err3) {
										logger.error(err3);
										writeError(err3);
										
										resolve();
										return;
									}
									
									if(row3.length > 0) {
										var commission_deposit = getFeeFromCommission(amount_calculated, getAffiliateCommission(getFormatAmount(row3[0].amount), 'deposit'));
										
										pool.query('INSERT INTO `referral_deposited` SET `userid` = ' + pool.escape(user.userid) + ', `referral` = ' + pool.escape(row3[0].referral) + ', `amount` = ' + amount_calculated + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
										pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row3[0].referral));
									}
							
									pool.query('INSERT INTO `users_trades` SET `type` = ' + pool.escape(type) + ', `method` = ' + pool.escape("crypto") + ', `game` = ' + pool.escape(currency.toLowerCase()) + ', `userid` = ' + pool.escape(user.userid) + ', `amount` = ' + amount_calculated + ', `value` = ' + parseFloat(value) + ', `tradeid` = ' + parseInt(transaction.id) + ', `time` = ' + pool.escape(time()), function(err4){
										if(err4) {
											logger.error(err4);
											writeError(err4);
											
											resolve();
											return;
										}
										
										var offerToAdd = {
											type: type,
											method: 'crypto',
											game: currency,
											user: user,
											amount: value,
											time: time()
										};
										
										if(offers_history.length >= 20) offers_history.shift();
										offers_history.push(offerToAdd);
										
										io.sockets.emit('message', {
											type: 'offers',
											command: 'last_offer',
											offer: offerToAdd
										});
										
										io.sockets.in(user.userid).emit('message', {
											type: 'success',
											success: 'Your currency deposit order has been finished! You received the money.'
										});
										
										logger.debug('[COINPAYMENTS] Deposit order has been finished');
										
										getBalance(user.userid);
										
										resolve();
									});
								});
							});
						});
					} else resolve();
				} else resolve();
			} else resolve();
		} else if(type == 'withdraw'){
			if(status == 2){
				pool.query('UPDATE `crypto_transactions` SET `inspected` = 1 WHERE `txnid` = ' + pool.escape(txnid), function(err1) {
					if(err1) {
						logger.error(err1);
						writeError(err1);
						
						resolve();
						return;
					}
					
					pool.query('INSERT INTO `users_trades` SET `type` = ' + pool.escape(type) + ', `method` = ' + pool.escape("crypto") + ', `game` = ' + pool.escape(currency.toLowerCase()) + ', `userid` = ' + pool.escape(user.userid) + ', `amount` = ' + amount + ', `value` = ' + parseFloat(value) + ', `tradeid` = '+ parseInt(transaction.id) + ', `time` = ' + pool.escape(time()), function(err2){
						if(err2) {
							logger.error(err2);
							writeError(err2);
							
							resolve();
							return;
						}
					
						pool.query('UPDATE `users` SET `withdraw_count` = `withdraw_count` + 1, `withdraw_total` = `withdraw_total` + ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3) {
							if(err3) {
								logger.error(err3);
								writeError(err3);
								
								resolve();
								return;
							}
							
							var offerToAdd = {
								type: type,
								method: 'crypto',
								game: currency,
								user: user,
								amount: value,
								time: time()
							};
							
							if(offers_history.length >= 20) offers_history.shift();
							offers_history.push(offerToAdd);
							
							io.sockets.emit('message', {
								type: 'offers',
								command: 'last_offer',
								offer: offerToAdd
							});
							
							io.sockets.in(user.userid).emit('message', {
								type: 'success',
								success: 'Your currency withdraw order has been finished!'
							});
							
							logger.debug('[COINPAYMENTS] Withdraw order has been finished');
							
							resolve();
						});
					});
				});
			} else if(status < 0){
				pool.query('UPDATE `crypto_transactions` SET `inspected` = 1 WHERE `txnid` = ' + pool.escape(txnid), function(err1) {
					if(err1) {
						logger.error(err1);
						writeError(err1);
						
						resolve();
						return;
					}
						
					pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape(currency.toLowerCase() + '_withdraw_refund') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ', `available` = `available` + ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2) {
						if(err2) {
							logger.error(err2);
							writeError(err2);
							
							resolve();
							return;
						}
							
						getBalance(user.userid);
						
						logger.debug('[COINPAYMENTS] Withdraw order has been refunded');
						
						resolve();
					});
				});
			} else resolve();
		} else resolve();
	});
}

function withdrawCurrency(user, socket, currency, amount, address, recaptcha){
	setUserRequest(user.userid, 'crypto_withdraw', true, true);
	
	if((user.restrictions.trade >= time() || user.restrictions.trade == -1) && !config.config_site.bantrade_excluded.includes(config.config_site.ranks_name[user.rank])){
		socket.emit('message', {
			type: 'error',
			error: 'Error: You are restricted to use our trade. The restriction expires ' + ((user.restrictions.trade == -1) ? 'never' : makeDate(new Date(user.restrictions.trade * 1000))) + '.'
		});
		setUserRequest(user.userid, 'crypto_withdraw', false, true);
		return;
	}
	
	if(!user.verified > time()){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Your account is not verified. Please verify your account and try again.'
		});
		setUserRequest(user.userid, 'crypto_withdraw', false, true);
		return;
	}
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'crypto_withdraw', false, true);
			return;
		}
		
		if(!config.config_offers.coinpayments.games.includes(currency)){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid currency!'
			});
			setUserRequest(user.userid, 'crypto_withdraw', false, true);
			return;
		}
		
		if(currency_amount[currency] === undefined){
			socket.emit('message', {
				type: 'error',
				error: 'Error: The prices are not loaded. Please try again later!'
			});
			setUserRequest(user.userid, 'crypto_withdraw', false, true);
			return;
		}
		
		if(currency_amount[currency] <= 0){
			socket.emit('message', {
				type: 'error',
				error: 'Error: The prices are not loaded. Please try again later!'
			});
			setUserRequest(user.userid, 'crypto_withdraw', false, true);
			return;
		}		
		
		verifyFormatAmount(amount, function(err1, amount){
			if(err1){
				socket.emit('message', {
					type: 'error',
					error: err1.message
				});
				setUserRequest(user.userid, 'crypto_withdraw', false, true);
				return;
			}
			
			if(amount < config.config_site.interval_amount.withdraw_crypto.min || amount > config.config_site.interval_amount.withdraw_crypto.max) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid withdraw amount [' + getFormatAmountString(config.config_site.interval_amount.withdraw_crypto.min) + '-' + getFormatAmountString(config.config_site.interval_amount.withdraw_crypto.max)  + ']!'
				});
				setUserRequest(user.userid, 'crypto_withdraw', false, true);
				return;
			}
			
			var exchange = currency_amount[currency];
			var value = parseFloat(amount / exchange);
		
			var options_withdraw = {
				amount: value,
				currency: currency,
				address: address
			}
			
			if(user.deposit.count <= 0){
				socket.emit('message', {
					type: 'error',
					error: 'Error: You need to deposit minimum 1 time to withdraw!'
				});
				setUserRequest(user.userid, 'crypto_withdraw', false, true);
				return;
			}
			
			if(getFormatAmount(user.balance) < amount){
				socket.emit('message', {
					type: 'error',
					error: 'You don\'t have enough money to withdraw!'
				});
				setUserRequest(user.userid, 'crypto_withdraw', false, true);
				return;
			}
			
			client.balances({all: 1}, function(err2, result2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'crypto_withdraw', false, true);
					return;
				}
				
				if(result2[currency] === undefined){
					socket.emit('message', {
						type: 'error',
						error: 'Error: The bank don\' have that currency!'
					});
					setUserRequest(user.userid, 'crypto_withdraw', false, true);
					return;
				}
				
				if(result2[currency]['status'] == 'unavailable'){
					socket.emit('message', {
						type: 'error',
						error: 'Error: The bank for that currency is unavailable!'
					});
					setUserRequest(user.userid, 'crypto_withdraw', false, true);
					return;
				}
				
				if(result2[currency]['coin_status'] == 'offline'){
					socket.emit('message', {
						type: 'error',
						error: 'Error: The bank for that currency is offline!'
					});
					setUserRequest(user.userid, 'crypto_withdraw', false, true);
					return;
				}
				
				// todo: remove this line when we bring back the automatic withdraws
				/*if(parseFloat(result2[currency]['balancef']) < value){
					socket.emit('message', {
						type: 'error',
						error: 'Error: The bank don\'t have enough money!'
					});
					setUserRequest(user.userid, 'crypto_withdraw', false, true);
					return;
				}*/
			
				if(getFormatAmount(user.available) < amount){
					socket.emit('message', {
						type: 'error',
						error: 'Error: You need to have withdraw available ' + getFormatAmountString(amount) + ' coins. Need ' + getFormatAmountString(amount - user.available) + '!'
					});
					setUserRequest(user.userid, 'crypto_withdraw', false, true);
					return;
				}
				
				pool.query('SELECT * FROM `crypto_transactions` WHERE `address` = ' + pool.escape(address) + ' AND `type` = ' + pool.escape('withdraw') + ' AND `inspected` = 0 LIMIT 1', function(err3, row3) {
					if(err3){
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'crypto_withdraw', false, true);
						return;
					}
					
					if(row3.length > 0){
						socket.emit('message', {
							type: 'error',
							error: 'This address is already in a withdraw transaction. Please try again later!'
						});
						setUserRequest(user.userid, 'crypto_withdraw', false, true);
						return;
					}

					var exchange2 = currency_amount[currency];
					var amount_calculated2 = getFormatAmount(exchange * value);

					if(amount_calculated2 < 5) {
						socket.emit('message', {
							type: 'error',
							error: 'Minimum withdrawal is 5 coins!'
						});
						setUserRequest(user.userid, 'crypto_withdraw', false, true);
						return;
					}

					logger.info(`[WITHDRAW] User ${user.userid} has withdrawn ${value} ${currency} to ${address}`);
				
					// comment these if u want to remove manual withdrawals
					if(IS_MANUAL_WITHDRAWAL) {
						pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape(currency.toLowerCase() + '_withdraw') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
						pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ', `available` = `available` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err5) {
							if(err5) {
								logger.error(err5);
								writeError(err5);
								setUserRequest(user.userid, 'crypto_withdraw', false, true);
								return;
							}

							getBalance(user.userid);

							var exchange = currency_amount[currency];
							var amount_calculated = getFormatAmount(exchange * value);

							// save to file that we will read later
							let trx = JSON.parse(fs.readFileSync('./crypto_withdraw.json', 'utf8'));
							trx.push({
								// options_withdraw: JSON.stringify(options_withdraw),
								userid: user.userid,
								username: user.name,
								avatar: user.avatar,
								time: new Date().getTime(),
								amount: value,
								currency: currency,
								address: address,
								amount_calculated: amount_calculated
							});

							fs.writeFileSync('./crypto_withdraw.json', JSON.stringify(trx));

							setUserRequest(user.userid, 'crypto_withdraw', false, false);
							
							socket.emit('message', {
								type: 'info',
								info: 'Your withdrawal order has to be manually approved - it shouldnt take more than 30 minutes.'
							});
						});
					} else {
						client.createWithdrawal(options_withdraw, function(err4, result4){
							if(err4) {
								logger.error(err4);
								writeError(err4);
								
								socket.emit('message', {
									type: 'error',
									error: err4.message
								});
								setUserRequest(user.userid, 'crypto_withdraw', false, true);
								return;
							}
							
							pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape(currency.toLowerCase() + '_withdraw') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
							pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ', `available` = `available` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err5) {
								if(err5) {
									logger.error(err5);
									writeError(err5);
									setUserRequest(user.userid, 'crypto_withdraw', false, true);
									return;
								}
								
								socket.emit('message', {
									type: 'info',
									info: 'Your currency withdraw order is prepared!'
								});
								
								
								getBalance(user.userid);
							
								client.getWithdrawalInfo({id: result4.id}, function(err6, result6){
									if(err6) {
										logger.error(err6);
										writeError(err6);
										setUserRequest(user.userid, 'crypto_withdraw', false, true);
										return;
									}
									
									pool.query('INSERT INTO `crypto_transactions` SET `type` = ' + pool.escape('withdraw') + ', `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + pool.escape(user.xp) + ', `address` = ' + pool.escape(address) + ', `status` = ' + pool.escape(result6.status) + ', `currency` = ' + pool.escape(result6.coin) + ', `amount` = ' + amount + ', `value` = ' + parseFloat(result6.amountf) + ', `exchange` = ' + exchange + ', `time` = ' + pool.escape(result6.time_created), function(err7) {
										if(err7) {
											logger.error(err7);
											writeError(err7);
											setUserRequest(user.userid, 'crypto_withdraw', false, true);
											return;
										}
										
										logger.debug('[COINPAYMENTS] Withdraw order is prepared');
										
										setUserRequest(user.userid, 'crypto_withdraw', false, false);
									});
								});
							});
						});
					}
				});
			});
		});
	});
}

function generateCurrencyAddress(recaptcha, currency, user, socket){
	setUserRequest(user.userid, 'crypto_address', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'crypto_address', false, true);
			return;
		}
	
		if(!config.config_offers.coinpayments.games.includes(currency)){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid currency!'
			});
			setUserRequest(user.userid, 'crypto_address', false, true);
			return;
		}
		
		pool.query('SELECT * FROM `crypto_addresses` WHERE `userid` = ' + pool.escape(user.userid) + ' AND `currency` = ' + pool.escape(currency), function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'crypto_address', false, true);
				return;
			}
		
			if(row1.length > 0){
				socket.emit('message', {
					type: 'error',
					error: 'Error: You have already a address created!'
				});
				setUserRequest(user.userid, 'crypto_address', false, true);
				return;
			}
		
			logger.debug('Creating ' + currency + ' address');
			
			client.getCallbackAddress({currency: currency}, function(err2, result2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'crypto_address', false, true);
					return;
				}
				
				pool.query('INSERT INTO `crypto_addresses` SET `address` = ' + pool.escape(result2.address) + ', `currency` = ' + pool.escape(currency.toUpperCase()) + ', `userid` = ' + pool.escape(user.userid) + ', `time` = ' + pool.escape(time()), function(err3, row3) {
					if(err3) {
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'crypto_address', false, true);
						return;
					}
					
					socket.emit('message', {
						type: 'success',
						success: currency + ' Address successfully created!'
					});
					
					socket.emit('message', {
						type: 'offers',
						command: 'refresh',
						currency: currency,
						address: result2.address
					});
					
					setUserRequest(user.userid, 'crypto_address', false, false);
				});
			});
		});
	});
}

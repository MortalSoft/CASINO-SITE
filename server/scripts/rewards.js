//DAILY
function rewards_dailyRedeem(user, socket, recaptcha) {
	setUserRequest(user.userid, 'rewards', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
	
		pool.query('SELECT SUM(amount) AS `amount` FROM `users_trades` WHERE `userid` = ? AND `type` = ? AND `time` > ?', [user.userid, "deposit", time() - config.config_site.daily_requirements.time], function(err1, row1){
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			if(row1[0].amount < config.config_site.daily_requirements.amount) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: You need to deposit at least ' + getFormatAmountString(config.config_site.daily_requirements.amount) + ' in the last ' + parseInt(config.config_site.daily_requirements.time / (24 * 60 * 60)) + ' days.'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
		
			pool.query('SELECT * FROM `users_rewards` WHERE `reward` = ? AND `userid` = ? ORDER BY `id` DESC LIMIT 1', ['daily', user.userid], function(err2, row2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
				
				if(row2.length > 0) {
					if(parseInt(row2[0].time) + 24 * 60 * 60 > time()){
						socket.emit('message', {
							type: 'error',
							error: 'Error: You already collect this daily reward!'
						});
						setUserRequest(user.userid, 'rewards', false, true);
						return;
					}
				}
				
				var amount_got = getFormatAmount(calculateLevel(user.xp).level * config.config_site.rewards_amount.daily_step + config.config_site.rewards_amount.daily_start);
				
				pool.query('INSERT INTO `users_rewards` SET `userid` = ?, `reward` = ?, `amount` = ?, `time` = ?', [user.userid, 'daily', amount_got, time()], function(err3){
					if(err3) {
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'rewards', false, true);
						return;
					}
					
					pool.query('INSERT INTO `users_transactions` SET `userid` = ?, `service` = ?, `amount` = ?, `time` = ?', [user.userid, 'daily_reward', amount_got, time()]);
					
					pool.query('UPDATE `users` SET `balance` = `balance` + ? WHERE `userid` = ?', [amount_got, user.userid], function(err4){
						if(err4) {
							logger.error(err4);
							writeError(err4);
							setUserRequest(user.userid, 'rewards', false, true);
							return;
						}
						
						rewards_dailyTime(user, socket);
						
						socket.emit('message', {
							type: 'success',
							success: 'You claimed ' + getFormatAmountString(amount_got) + ' coins!'
						});
						
						getBalance(user.userid);
						
						setUserRequest(user.userid, 'rewards', false, false);
					});
				});
			});
		});
	});
}

function rewards_dailyTime(user, socket){
	pool.query('SELECT * FROM `users_rewards` WHERE `reward` = ? AND `userid` = ? ORDER BY `id` DESC LIMIT 1', ['daily', user.userid], function(err1, row1){
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) {
			socket.emit('message', {
				type: 'rewards',
				command: 'timer',
				time: 0
			});
			return;
		}
		
		if(parseInt(row1[0].time) + 24 * 60 * 60 <= time()){
			socket.emit('message', {
				type: 'rewards',
				command: 'timer',
				time: 0
			});
			return;
		}
		
		socket.emit('message', {
			type: 'rewards',
			command: 'timer',
			time: parseInt(row1[0].time) + 24 * 60 * 60 - time()
		});
	});
}

//BIND
function rewards_bindRedeem(user, socket, data, recaptcha) {
	setUserRequest(user.userid, 'rewards', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
		
		var allowed_binds = ['steam', 'google'];
			
		if(!allowed_binds.includes(data.bind)) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid bind!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
		
		pool.query('SELECT * FROM `users_binds` WHERE `bind` = ? AND `userid` = ? AND `removed` = 0', [data.bind, user.userid], function(err1, row1){
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			if(row1.length <= 0){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Your account is not binded!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			pool.query('SELECT * FROM `users_rewards` WHERE `reward` = ? AND `userid` = ?', [data.bind, user.userid], function(err2, row2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
			
				if(row2.length > 0){
					socket.emit('message', {
						type: 'error',
						error: 'Error: You already collect this reward!'
					});
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
				
				var amount_got = getFormatAmount(config.config_site.rewards_amount[data.bind]);
				
				pool.query('INSERT INTO `users_rewards` SET `userid` = ?, `reward` = ?, `amount` = ?, `time` = ?', [user.userid, data.bind, amount_got, time()], function(err3, row3){
					if(err3) {
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'rewards', false, true);
						return;
					}
				
					pool.query('INSERT INTO `users_transactions` SET `userid` = ?, `service` = ?, `amount` = ?, `time` = ?', [user.userid, data.bind + '_reward', amount_got, time()]);
					
					pool.query('UPDATE `users` SET `balance` = `balance` + ? WHERE `userid` = ?', [amount_got, user.userid], function(err4) {
						if(err4) {
							logger.error(err4);
							writeError(err4);
							setUserRequest(user.userid, 'rewards', false, true);
							return;
						}
						
						socket.emit('message', {
							type: 'refresh'
						});
						
						socket.emit('message', {
							type: 'success',
							success: 'You claimed ' + getFormatAmountString(amount_got) + ' coins!'
						});
						
						getBalance(user.userid);
						
						setUserRequest(user.userid, 'rewards', false, false);
					});
				});
			});
		});
	});
}

//REFERRAL REDEEM
function rewards_referralRedeem(user, socket, data, recaptcha){
	setUserRequest(user.userid, 'rewards', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
		
		pool.query('SELECT * FROM `referral_uses` WHERE `userid` = ?', [user.userid], function(err1, row1){
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			if(row1.length > 0){
				socket.emit('message', {
					type: 'error',
					error: 'Error: You already collect this reward!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			var code = data.code.toLowerCase();
			
			if(!(/(^[a-zA-Z0-9]*$)/.exec(code))){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid code. Please put valid characters!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			if(code.length < 6){
				socket.emit('message', {
					type: 'error',
					error: 'Error: You need to put a code with minimum 6 characters!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
		
			pool.query('SELECT * FROM `referral_codes` WHERE `code` = ?', [code], function(err2, row2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
				
				if(row2.length == 0){
					socket.emit('message', {
						type: 'error',
						error: 'Error: Code not found!'
					});
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
				
				if(row2[0].userid == user.userid){
					socket.emit('message', {
						type: 'error',
						error: 'Error: This is you referral code!'
					});
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
			
				var amount_got = getFormatAmount(config.config_site.rewards_amount.refferal_code);
				
				pool.query('INSERT INTO `referral_uses` SET `userid` = ?, `referral` = ?, `amount` = ?, `time` = ?', [user.userid, row2[0].userid, amount_got, time()], function(err3, row3){
					if(err3) {
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'rewards', false, true);
						return;
					}
					
					pool.query('INSERT INTO `users_rewards` SET `userid` = ?, `reward` = ?, `amount` = ?, `time` = ?', [user.userid, 'referral', amount_got, time()], function(err4){
						if(err4) {
							logger.error(err4);
							writeError(err4);
							setUserRequest(user.userid, 'rewards', false, true);
							return;
						}
					
						pool.query('INSERT INTO `users_transactions` SET `userid` = ?, `service` = ?, `amount` = ?, `time` = ?', [user.userid, 'code_reward', amount_got, time()]);
						
						pool.query('UPDATE `users` SET `balance` = `balance` + ? WHERE `userid` = ?', [amount_got, user.userid], function(err5) {
							if(err5) {
								logger.error(err5);
								writeError(err5);
								setUserRequest(user.userid, 'rewards', false, true);
								return;
							}
							
							socket.emit('message', {
								type: 'refresh'
							});
							
							socket.emit('message', {
								type: 'success',
								success: 'You claimed ' + getFormatAmountString(amount_got) + ' coins!'
							});
							
							getBalance(user.userid);
							
							setUserRequest(user.userid, 'rewards', false, false);
						});
					});
				});
			});
		});
	});
}

//REFERRAL CREATE
function rewards_referralCreate(user, socket, data, recaptcha){
	setUserRequest(user.userid, 'rewards', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
		
		var code = data.code.toLowerCase();
		
		if(!(/(^[a-zA-Z0-9]*$)/.exec(code))){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid code. Please put valid characters!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
		
		if(code.length < 6){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You need to put a code with minimum 6 characters!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
		
		pool.query('SELECT * FROM `referral_codes` WHERE `code` = ?', [code], function(err1, row1){
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			if(row1.length > 0){
				socket.emit('message', {
					type: 'error',
					error: 'Error: This code is already used!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			pool.query('SELECT * FROM `referral_codes` WHERE `userid` = ?', [user.userid], function(err2, row2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
				
				if(row2.length > 0) {
					pool.query('UPDATE `referral_codes` SET `code` = ? WHERE `userid` = ?', [code, user.userid], function(err3) {
						if(err3) {
							logger.error(err3);
							writeError(err3);
							setUserRequest(user.userid, 'rewards', false, true);
							return;
						}
						
						pool.query('INSERT INTO `referral_updates` SET `userid` = ?, `code` = ?, `time` = ?', [user.userid, code, time()], function(err4) {
							if(err4) {
								logger.error(err4);
								writeError(err4);
								setUserRequest(user.userid, 'rewards', false, true);
								return;
							}
						
							socket.emit('message', {
								type: 'refresh'
							});
							
							socket.emit('message', {
								type: 'success',
								success: 'Code updated!'
							});
							
							setUserRequest(user.userid, 'rewards', false, false);
						});
					});
				} else if(row2.length == 0) {
					pool.query('INSERT INTO `referral_codes` SET `userid` = ?, `code` = ?', [user.userid, code], function(err3) {
						if(err3) {
							logger.error(err3);
							writeError(err3);
							setUserRequest(user.userid, 'rewards', false, true);
							return;
						}
						
						pool.query('INSERT INTO `referral_updates` SET `userid` = ?, `code` = ?, `time` = ?', [user.userid, code, time()], function(err4) {
							if(err4) {
								logger.error(err4);
								writeError(err4);
								setUserRequest(user.userid, 'rewards', false, true);
								return;
							}
						
							socket.emit('message', {
								type: 'success',
								success: 'Code created!'
							});
							
							setUserRequest(user.userid, 'rewards', false, false);
						});
					});
				}
			});
		});
	});
}

//BONUS REWARD
function rewards_bonusRedeem(user, socket, data, recaptcha){
	setUserRequest(user.userid, 'rewards', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
	
		var code = data.code;
		
		if(!(/(^[a-zA-Z0-9]*$)/.exec(code))){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid code. Please put valid characters!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
		
		if(code.length < 6){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You need to put a code with minimum 6 characters!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
		
		pool.query('SELECT * FROM `bonus_codes` WHERE `code` = ?', [code], function(err1, row1){
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			if(row1.length == 0){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Code not found!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			if(row1[0].uses >= row1[0].max_uses){
				socket.emit('message', {
					type: 'error',
					error: 'Error: The code already did reach the maximum uses!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
		
			pool.query('SELECT * FROM `bonus_uses` WHERE `code` = ? AND `userid` = ?', [code, user.userid], function(err2, row2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
				
				if(row2.length > 0) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: You already claimed the bonus code!'
					});
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
				
				var amount_got = getFormatAmount(row1[0].amount);
				
				pool.query('UPDATE `bonus_codes` SET `uses` = `uses` + 1 WHERE `code` = ?', [code], function(err3){
					if(err3) {
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'rewards', false, true);
						return;
					}
				
					pool.query('INSERT INTO `bonus_uses` SET `userid` = ?, `code` = ?, `amount` = ?, `time` = ?', [user.userid, code, amount_got, time()], function(err4){
						if(err4) {
							logger.error(err4);
							writeError(err4);
							setUserRequest(user.userid, 'rewards', false, true);
							return;
						}
					
						pool.query('INSERT INTO `users_transactions` SET `userid` = ?, `service` = ?, `amount` = ?, `time` = ?', [user.userid, 'bonus_code_reward', amount_got, time()]);						
						pool.query('UPDATE `users` SET `balance` = `balance` + ? WHERE `userid` = ?', [amount_got, user.userid], function(err5) {
							if(err5) {
								logger.error(err5);
								writeError(err5);
								setUserRequest(user.userid, 'rewards', false, true);
								return;
							}
							
							socket.emit('message', {
								type: 'refresh'
							});
							
							socket.emit('message', {
								type: 'success',
								success: 'You claimed ' + getFormatAmountString(amount_got) + ' coins!'
							});
							
							getBalance(user.userid);
							
							setUserRequest(user.userid, 'rewards', false, false);
						});
					});
				});
			});
		});
	});
}

//BONUS CREATE
function rewards_bonusCreate(user, socket, data, recaptcha){
	setUserRequest(user.userid, 'rewards', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
	
		if(user.rank != 1 && user.rank != 2 && user.rank != 100){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You don\'t have permission to use that!'
			});
			setUserRequest(user.userid, 'rewards', false, true);
			return;
		}
		
		verifyFormatAmount(data.amount, function(err1, amount){
			if(err1){
				socket.emit('message', {
					type: 'error',
					error: err1.message
				});
				return;
			}
		
			if(amount < 0.01 || amount > 10.00){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid amount [0.01 - 10.00]!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			if(isNaN(Number(data.uses))){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid maximum uses!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			var uses = parseInt(data.uses);
			
			if(uses < 1 || uses > 500){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid maximum uses [50 - 500]!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			var code = data.code;
			
			if(!(/(^[a-zA-Z0-9]*$)/.exec(code))){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid code. Please put valid characters!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			if(code.length < 6){
				socket.emit('message', {
					type: 'error',
					error: 'Error: You need to put a code with minimum 6 characters!'
				});
				setUserRequest(user.userid, 'rewards', false, true);
				return;
			}
			
			pool.query('SELECT * FROM `bonus_codes` WHERE `code` = ?', [code], function(err2, row2){
				if(err2){
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
				
				if(row2.length > 0){
					socket.emit('message', {
						type: 'error',
						error: 'Error: This code is already used!'
					});
					setUserRequest(user.userid, 'rewards', false, true);
					return;
				}
				
				pool.query('INSERT INTO `bonus_codes` SET `userid` = ?, `code` = ?, `amount` = ?, `max_uses` = ?, `time` = ?', [user.userid, code, amount, uses, time()], function(err3){
					if(err3){
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'rewards', false, true);
						return;
					}
					
					socket.emit('message', {
						type: 'success',
						success: 'Code created!'
					});
					
					setUserRequest(user.userid, 'rewards', false, false);
				});
			});
		});
	});
}
function getWelcomeMail(keyy) {
	let ml = fs.readFileSync('./scripts/emails/welcome.html', 'utf8').toString();
  ml = ml.replace('[VERIFY_URL]', keyy);

	return ml;
}

function addRakeback(bet_amount, game, userid) {
	const rb_amount = (bet_amount * 0.05) * 0.1;

	// updateBalance2(userid, rb_amount)
	pool.query('UPDATE `users` SET `rakeback` = `rakeback` + ' + rb_amount + ' WHERE `userid` = ' + pool.escape(userid), function(err2){
		if(err2) return;

		pool.query('SELECT `rakeback` FROM `users` WHERE `userid` = ' + pool.escape(userid), function(err1, row1) {
			if(err1) return;
			if(row1.length == 0) return;
			
			return io.sockets.in(userid).emit('rb_update', row1[0].rakeback);
		});
	});
}

function collectRakeback(userid) {
	pool.query('SELECT `rakeback` FROM `users` WHERE `userid` = ' + pool.escape(userid), function(err1, row1) {
			if(err1) return io.sockets.in(userid).emit('rb_error', err1);
			if(row1.length == 0) return io.sockets.in(userid).emit('rb_error', `Invalid user. (?)`);

			if(row1[0].rakeback <= 0) return io.sockets.in(userid).emit('rb_error', `Not enough to be collected.`);
			
			pool.query('UPDATE `users` SET `rakeback` = 0, `balance` = `balance` + ' + row1[0].rakeback + ' WHERE `userid` = ' + pool.escape(userid), async function(err2){
				if(err2) return;

				const bl = await getBalance2(userid);
				
				io.sockets.in(userid).emit('message', {type: 'balance', balance: bl});
				io.sockets.in(userid).emit('rb_update', '0.00');
			});
		});
}

function getBalance(userid) {
	pool.query('SELECT `balance` FROM `users` WHERE `userid` = ' + pool.escape(userid), function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		io.sockets.in(userid).emit('message', {
			type: 'balance',
			balance: row1[0].balance
		});
	});
}

function getBalance2(userid, getBonusBattlesBalance = false) {
	return new Promise((resolve, reject) => {
		const x = getBonusBattlesBalance ? 'balance_battles' : 'balance';

		pool.query('SELECT `' + x + '` FROM `users` WHERE `userid` = ' + pool.escape(userid), function(err1, row1) {
			if(err1) return resolve(0);
			if(row1.length == 0) return resolve(0);
			
			return resolve(getBonusBattlesBalance ? row1[0].balance_battles : row1[0].balance);
		});
	});
}

function updateBalance2(userid, amount, set = false, getBonusBattlesBalance = false) {
	// amount * -1
	return new Promise((resolve, reject) => {
		getBalance2(userid, getBonusBattlesBalance).then(bal => {
			bal += amount;
			if(set) bal = amount;

			const x = getBonusBattlesBalance ? 'balance_battles' : 'balance';

			pool.query('UPDATE `users` SET `' + x + '` = ' + bal + ' WHERE `userid` = ' + pool.escape(userid), function(err2){
				if(err2) return resolve(0);

				if(!getBonusBattlesBalance) {
					io.sockets.in(userid).emit('message', {
						type: 'balance',
						balance: bal
					});
				}
				
				return resolve(bal);
			});
		});
	});
}

function getLevel(userid) {
	pool.query('SELECT `xp` FROM `users` WHERE `userid` = ' + pool.escape(userid), function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) return;
		
		io.sockets.in(userid).emit('message', {
			type: 'level',
			level: calculateLevel(row1[0].xp)
		});
	});
}

function verifyRecaptcha(recaptcha, callback){
	request('https://www.google.com/recaptcha/api/siteverify?secret=' + config.config_site.recaptcha.private_key + '&response=' + recaptcha, function(err, response) {
		var verifiedRecaptcha = false;
		
		if(err) {
			logger.error(err);
			writeError(err);
		}else{
			var res = JSON.parse(response.body);
			
			if(res.success !== undefined){
				verifiedRecaptcha = res.success;
			}
		}
		
		callback(verifiedRecaptcha);
	});
}

function saveTradelink(user, socket, tradelink, recaptcha){
	setUserRequest(user.userid, 'tradelink', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'tradelink', false, true);
			return;
		}
		
		var reg1 = /^(http|https):\/\/steamcommunity.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)$/;
		
		if(!reg1.test(tradelink)){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid tradelink!'
			});
			setUserRequest(user.userid, 'tradelink', false, true);
			return;
		}
		
		pool.query('INSERT INTO `users_changes` SET `userid` = ' + pool.escape(user.userid) + ', `change` = ' + pool.escape('tradelink') + ', `value` = ' + pool.escape(tradelink) + ', `time` = ' + pool.escape(time()), function(err1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'tradelink', false, true);
				return;
			}
		
			pool.query('UPDATE `users` SET `tradelink` = ' + pool.escape(tradelink) + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'tradelink', false, true);
					return;
				}
				
				socket.emit('message', {
					type: 'success',
					success: 'Tradelink saved!'
				});
				
				setUserRequest(user.userid, 'tradelink', false, false);
			});
		});
	});
}

function saveApikey(user, socket, apikey, recaptcha){
	setUserRequest(user.userid, 'apikey', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'apikey', false, true);
			return;
		}
		
		socket.emit('message', {
			type: 'info',
			info: 'Processing your Apikey verify!'
		});
		
		offers_verifyApikey(user, apikey, function(err1){
			if(err1) {
				socket.emit('message', {
					type: 'error',
					error: err1.message
				});
				setUserRequest(user.userid, 'apikey', false, true);
				return;
			}
		
			pool.query('INSERT INTO `users_changes` SET `userid` = ' + pool.escape(user.userid) + ', `change` = ' + pool.escape('apikey') + ', `value` = ' + pool.escape(apikey) + ', `time` = ' + pool.escape(time()), function(err2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'apikey', false, true);
					return;
				}
			
				pool.query('UPDATE `users` SET `apikey` = ' + pool.escape(apikey) + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3) {
					if(err3) {
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'apikey', false, true);
						return;
					}
					
					socket.emit('message', {
						type: 'success',
						success: 'Apikey saved!'
					});
					
					setUserRequest(user.userid, 'apikey', false, false);
				});
			});
		});
	});
}

function profileSettings(user, socket, data){
	setUserRequest(user.userid, 'settings', true, true);
	
	var allowed_settings = ['anonymous', 'private'];
	
	if(!allowed_settings.includes(data.setting)) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid setting!'
		});
		setUserRequest(user.userid, 'settings', false, true);
		return;
	}
	
	pool.query('INSERT INTO `users_changes` SET `userid` = ' + pool.escape(user.userid) + ', `change` = ' + pool.escape(data.setting) + ', `value` = ' + pool.escape(data.value) + ', `time` = ' + pool.escape(time()), function(err1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			setUserRequest(user.userid, 'settings', false, true);
			return;
		}
	
		pool.query('UPDATE `users` SET `' + data.setting + '` = ' + pool.escape(data.value) + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2){
			if(err2) {
				logger.error(err2);
				writeError(err2);
				setUserRequest(user.userid, 'settings', false, true);
				return;
			}
			
			setUserRequest(user.userid, 'settings', false, false);
		});
	});
}

function accountExclusion(user, socket, exclusion, recaptcha) {
	setUserRequest(user.userid, 'exclusion', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'resend_verify', false, true);
			return;
		}
	
		var allowed_exclusions = ['24hours', '7days', '30days'];
		
		if(!allowed_exclusions.includes(exclusion)) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid exclusion!'
			});
			setUserRequest(user.userid, 'exclusion', false, true);
			return;
		}
		
		if(user.exclusion > time()) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You have already a exclusion. Please wait to end the currently exclusion!'
			});
			setUserRequest(user.userid, 'exclusion', false, true);
			return;
		}
		
		var time_exclusion = getTimeString(exclusion);
		
		pool.query('INSERT INTO `users_changes` SET `userid` = ' + pool.escape(user.userid) + ', `change` = ' + pool.escape("exclusion") + ', `value` = ' + pool.escape(time_exclusion) + ', `time` = ' + pool.escape(time()), function(err1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'settings', false, true);
				return;
			}
		
			pool.query('UPDATE `users` SET `exclusion` = ' + pool.escape(time_exclusion) + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'exclusion', false, true);
					return;
				}
				
				socket.emit('message', {
					type: 'success',
					success: 'Exclusion successfully setted. The exclusion will expire ' + makeDate(new Date(time_exclusion * 1000)) + '.'
				});
				
				setUserRequest(user.userid, 'exclusion', false, false);
			});
		});
	});
}

function resendVerifyProfile(user, socket, recaptcha, bypassrc = false){
	// setUserRequest(user.userid, 'resend_verify', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			if(!bypassrc) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid recaptcha!'
				});
				setUserRequest(user.userid, 'resend_verify', false, true);
				return;
			}
		}
		
		if(user.initialized == 0){
			if(bypassrc) return;
			socket.emit('message', {
				type: 'error',
				error: 'Error: Your profile is not initialized!'
			});
			setUserRequest(user.userid, 'resend_verify', false, true);
			return;
		}
		
		if(user.verified == 1){
			if(bypassrc) return;
			socket.emit('message', {
				type: 'error',
				error: 'Error: Your profile is already verified!'
			});
			setUserRequest(user.userid, 'resend_verify', false, true);
			return;
		}
		
		pool.query('SELECT * FROM `link_keys` WHERE `type` = ' + pool.escape("verify_profile") + ' AND `userid` = ' + pool.escape(user.userid) + ' AND `used` = 0 AND `removed` = 0 AND (`expire` > ' + pool.escape(time()) + ' OR `expire` = -1) AND `created` > ' + pool.escape(time() - config.config_site.profile.cooldown_verify), function(err1, row1) {
			if(err1) {
				if(bypassrc) return;
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'resend_verify', false, true);
				return;
			}
			
			if(row1.length > 0){
				if(bypassrc) return;
				socket.emit('message', {
					type: 'error',
					error: 'Error: Please wait ' + config.config_site.profile.cooldown_verify + ' seconds before try again to resend the verify email!'
				});
				setUserRequest(user.userid, 'resend_verify', false, true);
				return;
			}
			
			pool.query('UPDATE `link_keys` SET `removed` = 1 WHERE `type` = ' + pool.escape("verify_profile") + ' AND `userid` = ' + pool.escape(user.userid) + ' AND `used` = 0 AND `removed` = 0 AND (`expire` > ' + pool.escape(time()) + ' OR `expire` = -1) AND `created` > ' + pool.escape(time() - 2 * 60), function(err2, row2) {
				if(err2) {
					if(bypassrc) return;
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'resend_verify', false, true);
					return;
				}
			
				var verify_key = generateHexCode(32);
				
				pool.query('INSERT INTO `link_keys` SET `type` = ' + pool.escape("verify_profile") + ', `userid` = ' + pool.escape(user.userid) + ', `key` = ' + pool.escape(verify_key) + ', `expire` = -1, `created` = ' + pool.escape(time()), function(err3) {
					if(err3) {
						if(bypassrc) return;
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'resend_verify', false, true);
						return;
					}
					
					const verify_url = ('https://' + config.config_site.url + config.config_site.root) + 'auth/verifyprofile?key=' + verify_key;
					// var mail_message = 'Verify Profile Link: ' + (config.config_site.url + config.config_site.root) + 'auth/verifyprofile?key=' + verify_key;
				
					mailer_send(user.email, `${user.name}, welcome!`, getWelcomeMail(verify_url), function(err4, response4){
						if(err4) {
							if(bypassrc) return;
							logger.error(err4);
							writeError(err4);
							setUserRequest(user.userid, 'resend_verify', false, true);
							return;
						}
						
						socket.emit('message', {
							type: 'success',
							success: 'Verify email successfully resent.'
						});
						
						setUserRequest(user.userid, 'resend_verify', false, false);
					});
				});
			});
		});
	});
}

function recoverAccount(socket, data, recaptcha){
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			return;
		}
		
		pool.query('SELECT `email`, `userid`, `initialized` FROM `users` WHERE `email` = ' + pool.escape(data.username) + ' OR `username` = ' + pool.escape(data.username), function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				
				return callback(new Error('Error'));
			}
			
			if(row1.length <= 0){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid username or e-mail.'
				});
				return;
			}
			
			if(parseInt(row1[0].initialized) == 0){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Your account is not initialized.'
				});
				return;
			}
			
			pool.query('UPDATE `link_keys` SET `removed` = 1 WHERE `type` = ' + pool.escape("reset_password") + ' AND `userid` = ' + pool.escape(row1[0].userid) + ' AND `used` = 0 AND `removed` = 0 AND (`expire` > ' + pool.escape(time()) + ' OR `expire` = -1)', function(err2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				var recover_key = generateHexCode(32);
				
				pool.query('INSERT INTO `link_keys` SET `type` = ' + pool.escape("reset_password") + ', `userid` = ' + pool.escape(row1[0].userid) + ', `key` = ' + pool.escape(recover_key) + ', `expire` = ' + pool.escape(time() + 10 * 60) + ', `created` = ' + pool.escape(time()), function(err3) {
					if(err3) {
						logger.error(err3);
						writeError(err3);
						return;
					}
					
					var mail_message = 'Reset Password Link(expires in 10 minutes): ' + (config.config_site.url + config.config_site.root) + 'auth/recover?key=' + recover_key;
				
					mailer_send(row1[0].email, 'Reset password', mail_message, function(err4, response4){
						if(err4) {
							logger.error(err4);
							writeError(err4);
							return;
						}
						
						socket.emit('message', {
							type: 'success',
							success: 'A e-mail with recover password link was sent!'
						});
					});
				});
			});
		});
	});
}

function accountSettings(user, socket, data){
	var pattern_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w+$/;
	var pattern_username = /^[a-z0-9_]{6,}$/;
		
	if(!pattern_email.test(data.email)){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid e-mail. Invalid format e-mail.'
		});
		return;
	}
	
	if(!pattern_username.test(data.username)){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Invalid username. At least 6 characters, only lowercase, numbers and underscore are allowed.'
		});
		return;
	}
	
	pool.query('SELECT * FROM `users` WHERE `email` = ' + pool.escape(data.email), function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length > 0){
			if(row1[0].userid != user.userid){
				socket.emit('message', {
					type: 'error',
					error: 'Error: E-mail already taken.'
				});
				return;
			}
		}
	
		pool.query('SELECT * FROM `users` WHERE `username` = ' + pool.escape(data.username), function(err2, row2) {
			if(err2) {
				logger.error(err2);
				writeError(err2);
				return;
			}
			
			if(row2.length > 0) {
				if(row2[0].userid != user.userid){
					socket.emit('message', {
						type: 'error',
						error: 'Error: Username already taken.'
					});
					return;
				}
			}
			
			pool.query('UPDATE `users` SET `verified` = ' + parseInt((parseInt(user.verified) == 1) ? ((user.email == data.email) ? 1 : 0) : 0) + ', `username` = ' + pool.escape(data.username) + ', `email` = ' + pool.escape(data.email) + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3, row3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					return;
				}
				
				if(row3.affectedRows <= 0){
					socket.emit('message', {
						type: 'error',
						error: 'Error: Account saved unsuccessfully.'
					});
					return;
				}
				
				if(user.username != data.username) pool.query('INSERT INTO `users_changes` SET `userid` = ' + pool.escape(user.userid) + ', `change` = ' + pool.escape('username') + ', `value` = ' + pool.escape(data.username) + ', `time` = ' + pool.escape(time()));
				if(user.email != data.email) pool.query('INSERT INTO `users_changes` SET `userid` = ' + pool.escape(user.userid) + ', `change` = ' + pool.escape('email') + ', `value` = ' + pool.escape(data.email) + ', `time` = ' + pool.escape(time()));
				
				socket.emit('message', {
					type: 'success',
					success: 'Your account has been saved!'
				});
			});
		});
	});
}

function userUnsetRestriction(user, socket, data, callback) {
	pool.query('SELECT * FROM `users_restrictions` WHERE `removed` = 0 AND `restriction` = ' + pool.escape(data.restriction) + ' AND (`expire` = -1 OR `expire` > ' + pool.escape(time()) + ') AND `userid` = ' + pool.escape(data.userid), function(err1, row1) {
		if(err1){
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length <= 0){
			socket.emit('message', {
				type: 'error',
				error: 'Error: This user don\'t have this restriction!'
			});
			return;
		}
		
		pool.query('UPDATE `users_restrictions` SET `removed` = 1 WHERE `removed` = 0 AND `restriction` = ' + pool.escape(data.restriction) + ' AND (`expire` = -1 OR `expire` > ' + pool.escape(time()) + ') AND `userid` = '+ pool.escape(data.userid), function(err2, row2){
			if(err2){
				logger.error(err2);
				writeError(err2);
				return;
			}
			
			if(row2.affectedRows <= 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: The user was unsuccessfully unrestricted!'
				});
				return;
			}
			
			socket.emit('message', {
				type: 'success',
				success: 'The user was successfully unrestricted!'
			});
			
			if(callback != null) callback();
		});
	});
}

function userSetRestriction(user, socket, data, callback) {
	var time_restriction = getTimeString(data.time);

	if(data.restriction == 'mute') {
		time_restriction = Math.round((+new Date() / 1000) + (data.time * 60));	
		if(!data.reason) data.reason = '[no specified reason]';
	}

	if(time_restriction == 0){
		socket.emit('message', {
			type: 'error',
			error: 'Invalid restriction time!'
		});
		return;
	}
		
	pool.query('SELECT `name` FROM `users` WHERE `userid` = ' + pool.escape(data.userid), function(err1, row1) {
		if(err1){
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length == 0) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Unknown user!'
			});
			return;
		}
		
		pool.query('SELECT * FROM `users_restrictions` WHERE `removed` = 0 AND `restriction` = ' + pool.escape(data.restriction) + ' AND (`expire` = -1 OR `expire` > ' + pool.escape(time()) + ') AND `userid` = ' + pool.escape(data.userid), function(err2, row2) {
			if(err2){
				logger.error(err2);
				writeError(err2);
				return;
			}
			
			if(row2.length > 0){
				socket.emit('message', {
					type: 'error',
					error: 'Error: This user have already this restriction!'
				});
				return;
			}
			
			pool.query('INSERT INTO `users_restrictions` SET `userid` = ' + pool.escape(data.userid) + ', `restriction` = ' + pool.escape(data.restriction) + ', `reason` = ' + pool.escape(data.reason) + ', `byuserid` = '+ pool.escape(user.userid) + ', `expire` = ' + pool.escape(time_restriction) + ', `time` = '+ pool.escape(time()), function(err3){
				if(err3){
					logger.error(err3);
					writeError(err3);
					return;
				}
				
				if(data.restriction == 'play') var text_message = 'User ' + row1[0].name + ' was play banned by ' + user.name + ' for ' + data.reason + '. The restriction expires ' + ((time_restriction == -1) ? 'never' : makeDate(new Date(time_restriction * 1000))) + '.';
				else if(data.restriction == 'trade') var text_message = 'User ' + row1[0].name + ' was trade banned by ' + user.name + ' for ' + data.reason + '. The restriction expires ' + ((time_restriction == -1) ? 'never' : makeDate(new Date(time_restriction * 1000))) + '.';
				else if(data.restriction == 'site') var text_message = 'User ' + row1[0].name + ' was site banned by ' + user.name + ' for ' + data.reason + '. The restriction expires ' + ((time_restriction == -1) ? 'never' : makeDate(new Date(time_restriction * 1000))) + '.';
				else if(data.restriction == 'mute') var text_message = 'User ' + row1[0].name + ' was muted by ' + user.name + ' for ' + data.reason + '. The restriction expires ' + ((time_restriction == -1) ? 'never' : makeDate(new Date(time_restriction * 1000))) + '.';
				
				otherMessages(text_message, io.sockets, true);
				
				socket.emit('message', {
					type: 'success',
					success: 'The user was successfully restricted!'
				});
				
				if(callback != null) callback();
			});
		});
	});
}

function sendCoins(user, socket, userid, amount, recaptcha){
	setUserRequest(user.userid, 'send_coins', true, true);
	
	if(user.exclusion > time()) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Your exclusion expires ' + makeDate(new Date(user.exclusion * 1000)) + '.'
		});
		setUserRequest(user.userid, 'send_coins', false, true);
		return;
	}
	
	if(!user.verified) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Your account is not verified. Please verify your account and try again.'
		});
		setUserRequest(user.userid, 'send_coins', false, true);
		return;
	}
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'send_coins', false, true);
			return;
		}
		
		if(user.userid == userid){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You can\'t send coins to yourself!'
			});
			setUserRequest(user.userid, 'send_coins', false, true);
			return;
		}
		
		if(calculateLevel(user.xp).level < config.config_site.level_send_coins){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You need to have level ' + config.config_site.level_send_coins + ' to send coins!'
			});
			setUserRequest(user.userid, 'send_coins', false, true);
			return;
		}
		
		verifyFormatAmount(amount, function(err1, amount){
			if(err1){
				socket.emit('message', {
					type: 'error',
					error: err1.message
				});
				setUserRequest(user.userid, 'send_coins', false, true);
				return;
			}
			
			if(amount < config.config_site.interval_amount.send_coins.min || amount > config.config_site.interval_amount.send_coins.max) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid send amount [' + getFormatAmountString(config.config_site.interval_amount.send_coins.min) + '-' + getFormatAmountString(config.config_site.interval_amount.send_coins.max)  + ']!'
				});
				setUserRequest(user.userid, 'send_coins', false, true);
				return;
			}
			
			if(getFormatAmount(user.balance) < amount) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: You don\'t have enough money!'
				});
				setUserRequest(user.userid, 'send_coins', false, true);
				return;
			}
			
			pool.query('SELECT `name`, `exclusion`, `verified`, `initialized` FROM `users` WHERE `userid` = ' + pool.escape(userid), function(err2, row2) {
				if(err2){
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'send_coins', false, true);
					return;
				}
				
				if(row2.length == 0) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: Unknown user!'
					});
					setUserRequest(user.userid, 'send_coins', false, true);
					return;
				}
				
				if(!row2[0].initialized) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: The recipient can\'t receive coins.'
					});
					setUserRequest(user.userid, 'send_coins', false, true);
					return;
				}
				
				if(row2[0].exclusion > time()) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: The recipient can\'t receive coins.'
					});
					setUserRequest(user.userid, 'send_coins', false, true);
					return;
				}
				
				if(!row2[0].verified) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: The recipient can\'t receive coins.'
					});
					setUserRequest(user.userid, 'send_coins', false, true);
					return;
				}
				
				pool.query('INSERT INTO `users_transfers` SET `from_userid` = ' + pool.escape(user.userid) + ', `to_userid` = ' + pool.escape(userid) + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()), function(err3){
					if(err3) {
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'send_coins', false, true);
						return;
					}
					
					pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('sent_coins') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
					
					pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err4){
						if(err4) {
							logger.error(err4);
							writeError(err4);
							setUserRequest(user.userid, 'send_coins', false, true);
							return;
						}
						
						socket.emit('message', {
							type: 'info',
							info: 'You sent ' + getFormatAmountString(amount) + ' coins to ' + row2[0].name + '.'
						});
						
						getBalance(user.userid);
						
						pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(userid) + ', `service` = ' + pool.escape('received_coins') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
						
						pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ' WHERE `userid` = ' + pool.escape(userid), function(err5){
							if(err5) {
								logger.error(err5);
								writeError(err5);
								setUserRequest(user.userid, 'send_coins', false, true);
								return;
							}
							
							io.sockets.in(userid).emit('message', {
								type: 'info',
								info: 'You received ' + getFormatAmountString(amount) + ' coins from ' + user.name + '!'
							});
							
							getBalance(userid);
							
							setUserRequest(user.userid, 'send_coins', false, false);
						});
					});
				});
			});
		});
	});
}
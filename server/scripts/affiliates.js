function affiliates_collectAvailable(user, socket, recaptcha){
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'affiliates', false, true);
			return;
		}
		
		pool.query('SELECT * FROM `referral_codes` WHERE `userid` = ' + pool.escape(user.userid), function(err1, row1){
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'affiliates', false, true);
				return;
			}
		
			if(row1.length == 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: You don\'t have a code to collect the available coins!'
				});
				setUserRequest(user.userid, 'affiliates', false, true);
				return;
			}
			
			var available = getFormatAmount(row1[0].available);
		
			if(available <= 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: You don\'t have available coins to collect!'
				});
				setUserRequest(user.userid, 'affiliates', false, true);
				return;
			}
			
			pool.query('UPDATE `referral_codes` SET `collected` = `collected` + ' + available + ', `available` = `available` - ' + available + ' WHERE `userid` = ' + pool.escape(user.userid), function(err2){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'affiliates', false, true);
					return;
				}
			
				pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('affiliates_available') + ', `amount` = ' + available + ', `time` = ' + pool.escape(time()));
				
				pool.query('UPDATE `users` SET `balance` = `balance` + ' + available + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3) {
					if(err3) {
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'affiliates', false, true);
						return;
					}
					
					socket.emit('message', {
						type: 'refresh'
					});	
					
					socket.emit('message', {
						type: 'success',
						success: 'You collected ' + getFormatAmountString(available) + ' coins!'
					});		
					
					getBalance(user.userid);
					
					setUserRequest(user.userid, 'affiliates', false, false);
				});
			});
		});
	});
}
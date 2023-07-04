<?php

function auth_authByLogin($data, $callback){
	$crypted_password = hash('sha256', $data['password']);
	
	$sql1 = $GLOBALS['db']->query('SELECT * FROM `users` WHERE (`email` = ' . $GLOBALS['db']->quote($data['username']) . ' OR `username` = ' . $GLOBALS['db']->quote($data['username']) . ') AND `password` = ' . $GLOBALS['db']->quote($crypted_password));
	
	if($sql1->rowCount() <= 0) return $callback('Invalid username/email or password'); //ERROR
	
	$row1 = $sql1->fetch(PDO::FETCH_ASSOC);
	
	$sql2 = $GLOBALS['db']->prepare('INSERT INTO `users_logins` SET `type` = ' . $GLOBALS['db']->quote('auth_login') . ', `userid` = ' . $GLOBALS['db']->quote($row1['userid']) . ', `ip` = ' . $GLOBALS['db']->quote(getUserIp()) . ', `device` = ' . $GLOBALS['db']->quote(getUserDevice()) . ', `location` = ' . $GLOBALS['db']->quote(getUserLocation(getUserIp())) . ', `time` = ' . $GLOBALS['db']->quote(time()));
	$row2 = $sql2->execute();
	
	if(!$row2) return $callback('User logged in with Auth unsuccessfully (1)'); //ERROR
	if($sql2->rowCount() <= 0) return $callback('User logged in with Auth unsuccessfully (2)'); //ERROR
	
	return auth_checkSession($row1['userid'], $callback);
}

function auth_authByRegister($data, $callback){
	$pattern_email = '/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w+$/';
	$pattern_username = '/^[a-z0-9_]{6,}$/';
	$pattern_password = '/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})$/';
	
	if(!preg_match($pattern_email, $data['email'])) return $callback('Invalid e-mail. Invalid format e-mail'); //ERROR
	if(!preg_match($pattern_username, $data['username'])) return $callback('Invalid username. At least 6 characters, only lowercase, numbers and underscore are allowed'); //ERROR
	if(!preg_match($pattern_password, $data['password'])) return $callback('Invalid password. At least 8 characters, one uppercase, one lowercase, one number and one symbol'); //ERROR
	if(strpos($data['email'], '@alilot.com') !== false) return $callback('Emails from this domain are not allowed. Please try a different one.');
	
	$sql1 = $GLOBALS['db']->query('SELECT * FROM `users` WHERE `email` = ' . $GLOBALS['db']->quote($data['email']));
	if($sql1->rowCount() > 0) return $callback('E-mail already taken'); //ERROR
	
	$sql2 = $GLOBALS['db']->query('SELECT * FROM `users` WHERE `username` = ' . $GLOBALS['db']->quote($data['username']));
	if($sql2->rowCount() > 0) return $callback('Username already taken'); //ERROR
	
	$userid = generateHexCode(24);
	$crypted_password = hash('sha256', $data['password']);
	
	$name = $data['username'];
	$avatar = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';
	
	$sql3 = $GLOBALS['db']->prepare('INSERT INTO `users` SET `verified` = 0, `initialized` = 1, `userid` = ' . $GLOBALS['db']->quote($userid) . ', `username` = ' . $GLOBALS['db']->quote($data['username']) . ', `email` = ' . $GLOBALS['db']->quote($data['email']) . ', `password` = ' . $GLOBALS['db']->quote($crypted_password) . ', `name` = ' . $GLOBALS['db']->quote($name) . ', `avatar` = ' . $GLOBALS['db']->quote($avatar) . ', `time_create` = ' . $GLOBALS['db']->quote(time()));
	$row3 = $sql3->execute();
	
	if(!$row3) return $callback('User registered with Auth unsuccessfully (1)'); //ERROR
	if($sql3->rowCount() <= 0) return $callback('User registered with Auth unsuccessfully (2)'); //ERROR
	
	$sql4 = $GLOBALS['db']->prepare('INSERT INTO `users_logins` SET `type` = ' . $GLOBALS['db']->quote('auth_register') . ', `userid` = ' . $GLOBALS['db']->quote($userid) . ', `ip` = ' . $GLOBALS['db']->quote(getUserIp()) . ', `device` = ' . $GLOBALS['db']->quote(getUserDevice()) . ', `location` = ' . $GLOBALS['db']->quote(getUserLocation(getUserIp())) . ', `time` = ' . $GLOBALS['db']->quote(time()));
	$row4 = $sql4->execute();
	
	if(!$row4) return $callback('User registered with Auth unsuccessfully (3)'); //ERROR
	if($sql4->rowCount() <= 0) return $callback('User registered with Auth unsuccessfully (4)'); //ERROR
	
	$sql5 = $GLOBALS['db']->prepare('INSERT INTO `users_changes` SET `userid` = ' . $GLOBALS['db']->quote($userid) . ', `change` = ' . $GLOBALS['db']->quote('email') . ', `value` = ' . $GLOBALS['db']->quote($data['email']) . ', `time` = ' . $GLOBALS['db']->quote(time()));
	$row5 = $sql5->execute();
	
	$sql6 = $GLOBALS['db']->prepare('INSERT INTO `users_changes` SET `userid` = ' . $GLOBALS['db']->quote($userid) . ', `change` = ' . $GLOBALS['db']->quote('username') . ', `value` = ' . $GLOBALS['db']->quote($data['username']) . ', `time` = ' . $GLOBALS['db']->quote(time()));
	$row6 = $sql6->execute();
	
	$sql7 = $GLOBALS['db']->prepare('INSERT INTO `users_changes` SET `userid` = ' . $GLOBALS['db']->quote($userid) . ', `change` = ' . $GLOBALS['db']->quote('password') . ', `value` = ' . $GLOBALS['db']->quote($crypted_password) . ', `time` = ' . $GLOBALS['db']->quote(time()));
	$row7 = $sql7->execute();
	
	return auth_checkSession($userid, $callback);
}

function auth_authBySteam($data, $callback){
	$sql1 = $GLOBALS['db']->query('SELECT `userid` FROM `users_binds` WHERE `bind` = ' . $GLOBALS['db']->quote('steam') . ' AND `bindid` = ' . $GLOBALS['db']->quote($data['id']));
	if($sql1->rowCount() > 0) {
		$row1 = $sql1->fetch(PDO::FETCH_ASSOC);
		
		$sql2 = $GLOBALS['db']->prepare('UPDATE `users` SET `name` = ' . $GLOBALS['db']->quote($data['name']) . ', `avatar` = ' . $GLOBALS['db']->quote($data['avatar']) . ', `steamid` = ' . $GLOBALS['db']->quote($data['id']) . ' WHERE `userid` = ' . $GLOBALS['db']->quote($row1['userid']));
		$row2 = $sql2->execute();
		
		$sql3 = $GLOBALS['db']->prepare('INSERT INTO `users_logins` SET `type` = ' . $GLOBALS['db']->quote('steam_login') . ', `userid` = ' . $GLOBALS['db']->quote($row1['userid']) . ', `ip` = ' . $GLOBALS['db']->quote(getUserIp()) . ', `device` = ' . $GLOBALS['db']->quote(getUserDevice()) . ', `location` = ' . $GLOBALS['db']->quote(getUserLocation(getUserIp())) . ', `time` = ' . $GLOBALS['db']->quote(time()));
		$row3 = $sql3->execute();
		
		if(!$row3) return $callback('User logged in with Steam unsuccessfully (1)'); //ERROR
		if($sql3->rowCount() <= 0) return $callback('User logged in with Steam unsuccessfully (2)'); //ERROR
		
		return auth_checkSession($row1['userid'], $callback);
	} else {
		$userid = generateHexCode(24);
		$username = 'user_' . generateHexCode(8);
		
		$sql2 = $GLOBALS['db']->prepare('INSERT INTO `users` SET `verified` = 0, `userid` = ' . $GLOBALS['db']->quote($userid) . ', `username` = ' . $GLOBALS['db']->quote($username) . ', `steamid` = ' . $GLOBALS['db']->quote($data['id']) . ', `name` = ' . $GLOBALS['db']->quote($data['name']) . ', `avatar` = ' . $GLOBALS['db']->quote($data['avatar']) . ', `time_create` = ' . $GLOBALS['db']->quote(time()));
		$row2 = $sql2->execute();
		
		if(!$row2) return $callback('User registered with Steam unsuccessfully (1)'); //ERROR
		if($sql2->rowCount() <= 0) return $callback('User registered with Steam unsuccessfully (2)'); //ERROR
			
		$sql3 = $GLOBALS['db']->prepare('INSERT INTO `users_binds` SET `userid` = ' . $GLOBALS['db']->quote($userid) . ', `bind` = ' . $GLOBALS['db']->quote('steam') . ', `bindid` = ' . $GLOBALS['db']->quote($data['id']) . ', `created` = ' . $GLOBALS['db']->quote(time()));
		$row3 = $sql3->execute();
		
		if(!$row3) return $callback('User registered with Steam unsuccessfully (3)'); //ERROR
		if($sql3->rowCount() <= 0) return $callback('User registered with Steam unsuccessfully (4)'); //ERROR
		
		$sql4 = $GLOBALS['db']->prepare('INSERT INTO `users_logins` SET `type` = ' . $GLOBALS['db']->quote('steam_register') . ', `userid` = ' . $GLOBALS['db']->quote($userid) . ', `ip` = ' . $GLOBALS['db']->quote(getUserIp()) . ', `device` = ' . $GLOBALS['db']->quote(getUserDevice()) . ', `location` = ' . $GLOBALS['db']->quote(getUserLocation(getUserIp())) . ', `time` = ' . $GLOBALS['db']->quote(time()));
		$row4 = $sql4->execute();
		
		if(!$row4) return $callback('User registered with Steam unsuccessfully (5)'); //ERROR
		if($sql4->rowCount() <= 0) return $callback('User registered with Steam unsuccessfully (6)'); //ERROR
			
		return auth_checkSession($userid, $callback);
	}
}

function auth_authByGoogle($data, $callback){
	$sql1 = $GLOBALS['db']->query('SELECT `userid` FROM `users_binds` WHERE `bind` = ' . $GLOBALS['db']->quote('google') . ' AND `bindid` = ' . $GLOBALS['db']->quote($data['id']));
	if($sql1->rowCount() > 0) {
		$row1 = $sql1->fetch(PDO::FETCH_ASSOC);
		
		$sql2 = $GLOBALS['db']->prepare('UPDATE `users` SET `email` = ' . $GLOBALS['db']->quote($data['email']) . ', `name` = ' . $GLOBALS['db']->quote($data['name']) . ', `avatar` = ' . $GLOBALS['db']->quote($data['avatar']) . ' WHERE `userid` = ' . $GLOBALS['db']->quote($row1['userid']));
		$row2 = $sql2->execute();
		
		$sql3 = $GLOBALS['db']->prepare('INSERT INTO `users_logins` SET `type` = ' . $GLOBALS['db']->quote('google_login') . ', `userid` = ' . $GLOBALS['db']->quote($row1['userid']) . ', `ip` = ' . $GLOBALS['db']->quote(getUserIp()) . ', `device` = ' . $GLOBALS['db']->quote(getUserDevice()) . ', `location` = ' . $GLOBALS['db']->quote(getUserLocation(getUserIp())) . ', `time` = ' . $GLOBALS['db']->quote(time()));
		$row3 = $sql3->execute();
		
		if(!$row3) return $callback('User logged in with Google unsuccessfully (1)'); //ERROR
		if($sql3->rowCount() <= 0) return $callback('User logged in with Google unsuccessfully (2)'); //ERROR
		
		return auth_checkSession($row1['userid'], $callback);
	} else {
		$sql2 = $GLOBALS['db']->query('SELECT * FROM `users` WHERE `email` = ' . $GLOBALS['db']->quote($data['email']));
		if($sql2->rowCount() > 0) {
			$row2 = $sql2->fetch(PDO::FETCH_ASSOC);
			
			$sql3 = $GLOBALS['db']->prepare('INSERT INTO `users_binds` SET `userid` = ' . $GLOBALS['db']->quote($row2['userid']) . ', `bind` = ' . $GLOBALS['db']->quote('google') . ', `bindid` = ' . $GLOBALS['db']->quote($data['id']) . ', `created` = ' . $GLOBALS['db']->quote(time()));
			$row3 = $sql3->execute();
			
			if(!$row3) return $callback('User logged in and binded with Google unsuccessfully (1)'); //ERROR
			if($sql3->rowCount() <= 0) return $callback('User logged in  and binded with Google unsuccessfully (2)'); //ERROR
			
			$sql4 = $GLOBALS['db']->prepare('INSERT INTO `users_logins` SET `type` = ' . $GLOBALS['db']->quote('google_login_bind') . ', `userid` = ' . $GLOBALS['db']->quote($row2['userid']) . ', `ip` = ' . $GLOBALS['db']->quote(getUserIp()) . ', `device` = ' . $GLOBALS['db']->quote(getUserDevice()) . ', `location` = ' . $GLOBALS['db']->quote(getUserLocation(getUserIp())) . ', `time` = ' . $GLOBALS['db']->quote(time()));
			$row4 = $sql4->execute();
			
			if(!$row4) return $callback('User logged in and binded with Google unsuccessfully (3)'); //ERROR
			if($sql4->rowCount() <= 0) return $callback('User logged in and binded with Google unsuccessfully (4)'); //ERROR
			
			return auth_checkSession($row2['userid'], $callback);
		} else {
			$userid = generateHexCode(24);
			$username = 'user_' . generateHexCode(8);
			
			$sql3 = $GLOBALS['db']->prepare('INSERT INTO `users` SET `verified` = 0, `userid` = ' . $GLOBALS['db']->quote($userid) . ', `username` = ' . $GLOBALS['db']->quote($username) . ', `email` = ' . $GLOBALS['db']->quote($data['email']) . ', `name` = ' . $GLOBALS['db']->quote($data['name']) . ', `avatar` = ' . $GLOBALS['db']->quote($data['avatar']) . ', `time_create` = ' . $GLOBALS['db']->quote(time()));
			$row3 = $sql3->execute();
			
			if(!$row3) return $callback('User registered with Google unsuccessfully (1)'); //ERROR
			if($sql3->rowCount() <= 0) return $callback('User registered with Google unsuccessfully (2)'); //ERROR
				
			$sql4 = $GLOBALS['db']->prepare('INSERT INTO `users_binds` SET `userid` = ' . $GLOBALS['db']->quote($userid) . ', `bind` = ' . $GLOBALS['db']->quote('google') . ', `bindid` = ' . $GLOBALS['db']->quote($data['id']) . ', `created` = ' . $GLOBALS['db']->quote(time()));
			$row4 = $sql4->execute();
			
			if(!$row4) return $callback('User registered with Google unsuccessfully (3)'); //ERROR
			if($sql4->rowCount() <= 0) return $callback('User registered with Google unsuccessfully (4)'); //ERROR
			
			$sql5 = $GLOBALS['db']->prepare('INSERT INTO `users_logins` SET `type` = ' . $GLOBALS['db']->quote('google_register') . ', `userid` = ' . $GLOBALS['db']->quote($userid) . ', `ip` = ' . $GLOBALS['db']->quote(getUserIp()) . ', `device` = ' . $GLOBALS['db']->quote(getUserDevice()) . ', `location` = ' . $GLOBALS['db']->quote(getUserLocation(getUserIp())) . ', `time` = ' . $GLOBALS['db']->quote(time()));
			$row5 = $sql5->execute();
			
			if(!$row5) return $callback('User registered with Google unsuccessfully (5)'); //ERROR
			if($sql5->rowCount() <= 0) return $callback('User registered with Google unsuccessfully (6)'); //ERROR
				
			return auth_checkSession($userid, $callback);
		}
	}
}

function auth_bindAccount($data, $callback){
	$allowed_binds = array('steam', 'google');
	
	if(!in_array($data['bind'], $allowed_binds)) return $callback('Invalid bind');
	
	$sql1 = $GLOBALS['db']->query('SELECT * FROM `users_binds` WHERE `userid` = ' . $GLOBALS['db']->quote($data['user']['userid']) . ' AND `bind` = ' . $GLOBALS['db']->quote($data['bind']) . ' AND `removed` = 0');
	
	if($sql1->rowCount() > 0) return $callback('Account is already binded');
	
	$sql2 = $GLOBALS['db']->query('SELECT * FROM `users_binds` WHERE `bind` = ' . $GLOBALS['db']->quote($data['bind']) . ' AND `bindid` = ' . $GLOBALS['db']->quote($data['bindid']) . ' AND `removed` = 0');
	
	if($sql2->rowCount() > 0) return $callback('Other account is already binded with your id');
	
	$sql3 = $GLOBALS['db']->prepare('INSERT INTO `users_binds` SET `userid` = ' . $GLOBALS['db']->quote($data['user']['userid']) . ', `bind` = ' . $GLOBALS['db']->quote($data['bind']) . ', `bindid` = ' . $GLOBALS['db']->quote($data['bindid']) . ', `created` = ' . $GLOBALS['db']->quote(time()));
	$row3 = $sql3->execute();
	
	if(!$row3) return $callback('User binded unsuccessfully (1)'); //ERROR
	if($sql3->rowCount() <= 0) return $callback('User binded unsuccessfully (2)'); //ERROR
	
	return $callback(null);
}

function auth_logoutUserDevices($data, $callback){
	$sql1 = $GLOBALS['db']->query('SELECT * FROM `users_sessions` WHERE `expire` >= ' . $GLOBALS['db']->quote(time()) . ' AND `removed` = 0 AND `session` = ' . $GLOBALS['db']->quote($data['session']));
	
	if($sql1->rowCount() <= 0) return $callback('User session already expired or it does not exists'); //ERROR
	
	if(!$data['devices']) return $callback(null);
	
	$sql2 = $GLOBALS['db']->prepare('UPDATE `users_sessions` SET `removed` = 1 WHERE `expire` >= ' . $GLOBALS['db']->quote(time()) . ' AND `removed` = 0 AND `session` = ' . $GLOBALS['db']->quote($data['session']));
	$row2 = $sql2->execute();
	
	if(!$row2) return $callback('User session already expired or it does not exists'); //ERROR
	if($sql2->rowCount() <= 0) return $callback('User session already expired or it does not exists'); //ERROR
	
	return $callback(null);
}

function auth_resetPassword($data, $callback){
	if($data['password'] != $data['confirm_password']) return $callback('The passwords does not match'); //ERROR
		
	$pattern_password = '/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})$/';
	if(!preg_match($pattern_password, $data['password'])) return $callback('Invalid password. At least 8 characters, one uppercase, one lowercase, one number and one symbol'); //ERROR
	
	auth_checkLinkKey(array( 'key' => $data['key'], 'type' => 'reset_password' ), function($err1, $userid) use ($callback, $data){
		if($err1) return $callback($err1); //ERROR
		
		$crypted_password = hash('sha256', $data['password']);
		
		$sql2 = $GLOBALS['db']->prepare('UPDATE `users` SET `password` = ' . $GLOBALS['db']->quote($crypted_password) . ' WHERE `userid` = ' . $GLOBALS['db']->quote($userid));
		$row2 = $sql2->execute();
		
		$sql3 = $GLOBALS['db']->prepare('INSERT INTO `users_changes` SET `userid` = ' . $GLOBALS['db']->quote($userid) . ', `change` = ' . $GLOBALS['db']->quote('password') . ', `value` = ' . $GLOBALS['db']->quote($crypted_password) . ', `time` = ' . $GLOBALS['db']->quote(time()));
		$row3 = $sql3->execute();
		
		return $callback(null);
	});
}

function auth_verifyProfile($data, $callback){
	$sql1 = $GLOBALS['db']->query('SELECT * FROM `users_sessions` WHERE `expire` >= ' . $GLOBALS['db']->quote(time()) . ' AND `removed` = 0 AND `session` = ' . $GLOBALS['db']->quote($data['session']));
	
	if($sql1->rowCount() <= 0) return $callback('User session already expired or it does not exists'); //ERROR
	
	$row1 = $sql1->fetch(PDO::FETCH_ASSOC);
	
	$sql2 = $GLOBALS['db']->query('SELECT * FROM `users` WHERE `userid` = ' . $GLOBALS['db']->quote($row1['userid']));
	
	if($sql2->rowCount() <= 0) return $callback('Unknown user'); //ERROR
	
	$row2 = $sql2->fetch(PDO::FETCH_ASSOC);
	if(intval($row2['verified']) == 1) return $callback('Profile already verified'); //ERROR
	
	auth_checkLinkKey(array( 'key' => $data['key'], 'type' => 'verify_profile' ), function($err3, $userid) use ($callback, $data){
		if($err3) return $callback($err3); //ERROR
		
		$sql4 = $GLOBALS['db']->prepare('UPDATE `users` SET `verified` = 1 WHERE `userid` = ' . $GLOBALS['db']->quote($userid));
		$row4 = $sql4->execute();
		
		return $callback(null);
	});
}

function auth_accountInitializing($data, $callback){
	$pattern_email = '/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w+$/';
	$pattern_username = '/^[a-z0-9_]{6,}$/';
	$pattern_password = '/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})$/';
	
	if(!preg_match($pattern_email, $data['email'])) return $callback('Invalid e-mail. Invalid format e-mail'); //ERROR
	if(!preg_match($pattern_username, $data['username'])) return $callback('Invalid username. At least 6 characters, only lowercase, numbers and underscore are allowed'); //ERROR
	if(!preg_match($pattern_password, $data['password'])) return $callback('Invalid password. At least 8 characters, one uppercase, one lowercase, one number and one symbol'); //ERROR
	if($data['confirm_password'] != $data['password']) return $callback('Invalid password. The passwords doesn\'t match'); //ERROR
	
	if(intval($data['user']['initialized']) == 1) return $callback('Your account is already initialized'); //ERROR
	
	$sql1 = $GLOBALS['db']->query('SELECT * FROM `users` WHERE `email` = ' . $GLOBALS['db']->quote($data['email']));
	if($sql1->rowCount() > 0) {
		$row1 = $sql1->fetch(PDO::FETCH_ASSOC);
		if($row1['userid'] != $data['user']['userid']) return $callback('E-mail already taken'); //ERROR
	}
	
	$sql2 = $GLOBALS['db']->query('SELECT * FROM `users` WHERE `username` = ' . $GLOBALS['db']->quote($data['username']));
	if($sql2->rowCount() > 0) {
		$row2 = $sql2->fetch(PDO::FETCH_ASSOC);
		if($row2['userid'] != $data['user']['userid']) return $callback('Username already taken'); //ERROR
	}
	
	$crypted_password = hash('sha256', $data['password']);

	$sql3 = $GLOBALS['db']->prepare('UPDATE `users` SET `initialized` = 1, `username` = ' . $GLOBALS['db']->quote($data['username']) . ', `email` = ' . $GLOBALS['db']->quote($data['email']) . ', `password` = ' . $GLOBALS['db']->quote($crypted_password) . ' WHERE `userid` = ' . $GLOBALS['db']->quote($data['user']['userid']));
	$row3 = $sql3->execute();
	
	if(!$row3) return $callback('Account initialized unsuccessfully (1)'); //ERROR
	if($sql3->rowCount() <= 0) return $callback('Account initialized unsuccessfully (2)'); //ERROR
	
	$sql4 = $GLOBALS['db']->prepare('INSERT INTO `users_changes` SET `userid` = ' . $GLOBALS['db']->quote($data['user']['userid']) . ', `change` = ' . $GLOBALS['db']->quote('email') . ', `value` = ' . $GLOBALS['db']->quote($data['email']) . ', `time` = ' . $GLOBALS['db']->quote(time()));
	$row4 = $sql4->execute();
	
	$sql5 = $GLOBALS['db']->prepare('INSERT INTO `users_changes` SET `userid` = ' . $GLOBALS['db']->quote($data['user']['userid']) . ', `change` = ' . $GLOBALS['db']->quote('username') . ', `value` = ' . $GLOBALS['db']->quote($data['username']) . ', `time` = ' . $GLOBALS['db']->quote(time()));
	$row5 = $sql5->execute();
	
	$sql6 = $GLOBALS['db']->prepare('INSERT INTO `users_changes` SET `userid` = ' . $GLOBALS['db']->quote($data['user']['userid']) . ', `change` = ' . $GLOBALS['db']->quote('password') . ', `value` = ' . $GLOBALS['db']->quote($crypted_password) . ', `time` = ' . $GLOBALS['db']->quote(time()));
	$row6 = $sql6->execute();
	
	return $callback(null);
}

function auth_changePassword($data, $callback){
	$pattern_password = '/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})$/';
	
	if(!preg_match($pattern_password, $data['current_password'])) return $callback('Invalid current password. At least 8 characters, one uppercase, one lowercase, one number and one symbol'); //ERROR
	if(!preg_match($pattern_password, $data['password'])) return $callback('Invalid new password. At least 8 characters, one uppercase, one lowercase, one number and one symbol'); //ERROR
	if($data['confirm_password'] != $data['password']) return $callback('Invalid password. The passwords doesn\'t match'); //ERROR
	
	$crypted_current_password = hash('sha256', $data['current_password']);
	if($crypted_current_password != $data['user']['password']) return $callback('Invalid current password. Wrong password'); //ERROR
	
	$crypted_new_password = hash('sha256', $data['password']);
	if($crypted_new_password == $data['user']['password']) return $callback('Invalid new password. Same password'); //ERROR
	
	$sql1 = $GLOBALS['db']->prepare('UPDATE `users` SET `password` = ' . $GLOBALS['db']->quote($crypted_new_password) . ' WHERE `userid` = ' . $GLOBALS['db']->quote($data['user']['userid']));
	$row1 = $sql1->execute();
	
	if(!$row1) return $callback('Password changed unsuccessfully (1)'); //ERROR
	if($sql1->rowCount() <= 0) return $callback('Password changed unsuccessfully (2)'); //ERROR
	
	$sql2 = $GLOBALS['db']->prepare('INSERT INTO `users_changes` SET `userid` = ' . $GLOBALS['db']->quote($data['user']['userid']) . ', `change` = ' . $GLOBALS['db']->quote('password') . ', `value` = ' . $GLOBALS['db']->quote($crypted_new_password) . ', `time` = ' . $GLOBALS['db']->quote(time()));
	$row2 = $sql2->execute();
	
	return $callback(null);
}

function auth_checkSession($userid, $callback){
	$sql1 = $GLOBALS['db']->query('SELECT * FROM `users_sessions` WHERE `expire` > ' . $GLOBALS['db']->quote(time()) . ' AND `removed` = 0 AND `userid` = ' . $GLOBALS['db']->quote($userid) . ' ORDER BY `id` DESC LIMIT 1');
	
	if($sql1->rowCount() <= 0) return auth_insertSession($userid, $callback);
	
	$row1 = $sql1->fetch(PDO::FETCH_ASSOC);
	
	$session = $row1['session'];
	$expire = $row1['expire'];
	
	return $callback(null, array( 'session' => $session, 'expire' => $expire ));
}

function auth_insertSession($userid, $callback) {
	$session = generateHexCode(32);
	$expire = time() + 3600 * 24;
	
	$sql1 = $GLOBALS['db']->prepare('INSERT INTO `users_sessions` SET `userid` = ' . $GLOBALS['db']->quote($userid) . ', `session` = ' . $GLOBALS['db']->quote($session) . ', `expire` = ' . $GLOBALS['db']->quote($expire) . ', `created` = ' . $GLOBALS['db']->quote(time()));
	$row1 = $sql1->execute();
	
	if(!$row1) return $callback('Session registered unsuccessfully (1)'); //ERROR
	if($sql1->rowCount() <= 0) return $callback('Session registered unsuccessfully (2)'); //ERROR
	
	return $callback(null, array( 'session' => $session, 'expire' => $expire ));
}

function auth_checkLinkKey($data, $callback){
	$sql1 = $GLOBALS['db']->query('SELECT * FROM `link_keys` WHERE `type` = ' . $GLOBALS['db']->quote($data['type']) . ' AND `key` = ' . $GLOBALS['db']->quote($data['key']) . ' AND `used` = 0 AND `removed` = 0 AND (`expire` > ' . $GLOBALS['db']->quote(time()) . ' OR `expire` = -1)');
	
	if($sql1->rowCount() <= 0) return $callback('Key already expired or it does not exists (1)'); //ERROR
	$row1 = $sql1->fetch(PDO::FETCH_ASSOC);
	
	$sql2 = $GLOBALS['db']->prepare('UPDATE `link_keys` SET `used` = 1 WHERE `type` = ' . $GLOBALS['db']->quote($data['type']) . ' AND `key` = ' . $GLOBALS['db']->quote($data['key']) . ' AND `used` = 0 AND `removed` = 0 AND (`expire` > ' . $GLOBALS['db']->quote(time()) . ' OR `expire` = -1)');
	$row2 = $sql2->execute();
	
	if(!$row2) return $callback('Key already expired or it does not exists (2)'); //ERROR
	if($sql2->rowCount() <= 0) return $callback('Key already expired or it does not exists (3)'); //ERROR
	
	$sql3 = $GLOBALS['db']->prepare('UPDATE `link_keys` SET `removed` = 1 WHERE `type` = ' . $GLOBALS['db']->quote($data['type']) . ' AND `userid` = ' . $GLOBALS['db']->quote($row1['userid']) . ' AND `used` = 0 AND `removed` = 0 AND (`expire` > ' . $GLOBALS['db']->quote(time()) . ' OR `expire` = -1)');
	$row3 = $sql3->execute();
	
	return $callback(null, $row1['userid']);
}

?>
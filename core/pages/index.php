<?php
ini_set('display_errors','Off');

/*if (!(isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on' || $_SERVER['HTTPS'] == 1) ||  isset($_SERVER['HTTP_X_FORWARDED_PROTO']) &&   $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https')){
   $redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
   header('HTTP/1.1 301 Moved Permanently');
   header('location: ' . $redirect);
   exit();
}*/

$default_page = 'home';

if(!isset($_GET['page'])) {
	header('location: ' . $root . $default_page);
	exit();
}

$paths_all = explode('/', $_GET['page']);
$paths = array();

foreach($paths_all as $key => $path) if(!empty(trim($path))) array_push($paths, trim($path));

if(sizeof($paths) == 0 || empty($paths[0])){
	header('location: ' . $root . $default_page);
	exit();
}

$page = $paths[0];

include 'sql.php';

include 'functions/auth.php';
include 'functions/others.php';

if (isset($_COOKIE['session'])) {
	$sql = $db->query('SELECT * FROM `users` INNER JOIN `users_sessions` ON users.userid = users_sessions.userid WHERE users_sessions.session = ' . $db->quote($_COOKIE['session']). ' AND users_sessions.removed = 0 AND users_sessions.expire >= '. $db->quote(time()));
	if ($sql->rowCount() != 0) {
		$row = $sql->fetch(PDO::FETCH_ASSOC);
		
		if($_COOKIE['session'] == $row['session']) $user = $row;
	}
}

include 'config/config.php';

$array_page = array('user' => $user, 'site' => $site, 'profile' => $profile, 'rewards' => $rewards, 'affiliates' => $affiliates, 'paths' => $paths);

$sql_banip = $db->query('SELECT * FROM `bannedip` WHERE `ip` = ' . $db->quote(getUserIp()));
if($sql_banip->rowCount() > 0 && !in_array($ranks_name[$user['rank']], $banip_excluded)){
	$page_request = getTemplate('Your IP is banned.', 'empty');
	echo $page_request;
	exit();
}

if($maintenance == 1 && !in_array($ranks_name[$user['rank']], $maintenance_excluded) && !($page == 'auth' && in_array($paths[1], array('login', 'logout', 'register', 'steam', 'google', 'facebook', 'logout')))) {
	$page_request = getTemplate($names_pages['maintenance'], 'maintenance', array('user' => $user, 'site' => $site, 'profile' => $profile, 'paths' => $paths, 'maintenance_message' => $maintenance_message)); //MAINTENANCE
	echo $page_request;
	exit();
}

$sql_bansite = $db->query('SELECT users_restrictions.reason, users_restrictions.expire, users.name FROM `users_restrictions` INNER JOIN `users` ON users_restrictions.byuserid = users.userid WHERE users_restrictions.restriction = "site" AND users_restrictions.removed = 0 AND (users_restrictions.expire = -1 OR users_restrictions.expire > ' . $db->quote(time()) . ') AND users_restrictions.userid = ' . $db->quote($user['userid']));
if($sql_bansite->rowCount() > 0 && !in_array($ranks_name[$user['rank']], $ban_excluded) && $page != 'support' && $page != 'tos') {
	$page_request = getTemplatePage($names_pages['banned'], $page, 'banned', $array_page, array('ban' => $sql_bansite->fetch(PDO::FETCH_ASSOC))); //BANNED
	echo $page_request;
	exit();
}

switch ($page) {
	case 'slots_game':
		$details = explode('/', $site['path']);
		if(count($details) >= 3) {
			echo '<script>let SLOTS_GAME_PROVIDER="'.$details[1].'";let SLOTS_GAME_ID="'.$details[2].'";SLOTS_GAME_PROVIDER = SLOTS_GAME_PROVIDER.replaceAll("___", "");SLOTS_GAME_ID = SLOTS_GAME_ID.replaceAll("___", "-");</script>';
		}
		
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		
		echo $page_request;
		return;

	case 'admin':
		// todo: only admin have access here
		$week_start = strtotime(date("Y-m-d", strtotime('monday this week')));   

		// users
		$sql_total_users = $db->query('SELECT COUNT(id) FROM `users` WHERE time_create >= '.$week_start);
		$new_users = $sql_total_users->fetch(PDO::FETCH_ASSOC);
		$new_users = $new_users['COUNT(id)'];
		
		// deposits
		$sql_deposits = $db->query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = '.$db->quote("deposit"));
		$deposits = $sql_deposits->fetch(PDO::FETCH_ASSOC);

		if(!$deposits['total']) $deposits['total'] = 0;
		$deposits['total'] = number_format($deposits['total'], 2);
		$deposits['count'] = number_format($deposits['count'], 2);

		// deposits new
		$sql_deposits2 = $db->query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = '.$db->quote("deposit").' AND time >= '.$week_start);
		$deposits2 = $sql_deposits2->fetch(PDO::FETCH_ASSOC);

		if(!$deposits2['total']) $deposits2['total'] = 0;
		$deposits2['total'] = number_format($deposits2['total'], 2);
		$deposits2['count'] = number_format($deposits2['count'], 2);

		// withdraws
		$sql_withdraws = $db->query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = '.$db->quote("withdraw"));
		$withdraws = $sql_withdraws->fetch(PDO::FETCH_ASSOC);

		if(!$withdraws['total']) $withdraws['total'] = 0;
		$withdraws['total'] = number_format($withdraws['total'], 2);
		$withdraws['count'] = number_format($withdraws['count'], 2);

		// withdraws new
		$sql_withdraws2 = $db->query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = '.$db->quote("withdraw").' AND time >= '.$week_start);
		$withdraws2 = $sql_withdraws2->fetch(PDO::FETCH_ASSOC);

		if(!$withdraws2['total']) $withdraws2['total'] = 0;
		$withdraws2['total'] = number_format($withdraws2['total'], 2);
		$withdraws2['count'] = number_format($withdraws2['count'], 2);

		// balances all
		$sql_balance = $db->query('SELECT SUM(balance) AS `total` FROM `users` WHERE `rank` != 1 AND `rank` != 100');
		$balance = $sql_balance->fetch(PDO::FETCH_ASSOC);

		if(!$balance['total']) $balance['total'] = 0;
		$balance['total'] = number_format($balance['total'], 2);

		// profit 
		$profit = $deposits['total'] - $withdraws['total'] - $balance['total'];
		$isprofit = $profit >= 0;
		$profit = abs($profit);

		// profit 
		$profit2 = $deposits2['total'] - $withdraws2['total'] - $balance['total'];
		$isprofit2 = $profit2 >= 0;
		$profit2 = abs($profit2);

		// users
		$sql_users = $db->query('SELECT * FROM `users` ORDER BY balance DESC');
		$users = $sql_users->fetchAll(PDO::FETCH_ASSOC);

		echo $user['avatar'];

		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('new_users' => $new_users, 'deposits' => $deposits, 'deposits2' => $deposits2, 'profit' => $profit, 'isprofit' => $isprofit, 'profit2' => $profit2, 'isprofit2' => $isprofit2, 'users' => $users));
		echo $page_request;
		return;

	case 'slots':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;

	case 'profile2':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;

	case 'esports':
		/*switch($paths[1]) {
			case 'csgo': 
				$page_request = getTemplatePage($names_pages['esports_csgo'], 'esports_csgo', 'esports_csgo', $array_page);
				break;

			case 'dota2': 
				$page_request = getTemplatePage($names_pages['esports_dota2'], 'esports_dota2', 'esports_dota2', $array_page);
				break;

			default: 
				header('location: ' . $root . 'esports/csgo');
				break;
		}*/
		if(!isset($paths[1])) return header('location: '.$root.'esports/csgo');

		$page_request = getTemplatePage($names_pages['esport'], 'esport', 'esport', $array_page);
		echo '<script>var ESPORTS_GAME="'.$paths[1].'";</script>';
		echo $page_request;
		
		return;

	case 'home':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;

	case 'cases':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;

	case 'roulette':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
	
	case 'crash':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
		
	case 'jackpot':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
		
	case 'coinflip':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
		
	case 'dice':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
		
	case 'unbox':
		$location = $page;
		$name_page = $names_pages[$page];
		
		if(isset($paths[1])) {
			$location .= '_case';
		
			$name_page = ucwords(implode(' ', explode('_', $paths[1])));
		}
	
		$page_request = getTemplatePage($name_page, $page, $location, $array_page);
		echo $page_request;
		return;
		
	case 'minesweeper':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
		
	case 'tower':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
		
	case 'plinko':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
		
	case 'leaderboard':
		$l_total = 20;
		
		$sql_leaderboard = $db->query('SELECT users.userid, users.name, users.avatar, (SELECT SUM(amount) FROM `users_transactions` WHERE users_transactions.userid = users.userid AND `amount` > 0 GROUP BY users_transactions.userid) AS `winnings`, (SELECT SUM(amount) FROM `users_transactions` WHERE users_transactions.userid = users.userid AND `amount` < 0 GROUP BY users_transactions.userid) AS `bets`, (SELECT COUNT(users_transactions.userid) FROM `users_transactions` WHERE users_transactions.userid = users.userid AND `amount` < 0 GROUP BY users_transactions.userid) AS `games` FROM `users` INNER JOIN `users_transactions` ON users.userid = users_transactions.userid WHERE users.userid IN (SELECT users_transactions.userid FROM (SELECT users_transactions.userid, SUM(amount) AS `profit` FROM `users_transactions` WHERE `amount` < 0 GROUP BY users_transactions.userid ORDER BY `profit` ASC LIMIT ' . $l_total . ') AS `profit_tabel`) AND users_transactions.amount < 0 GROUP BY users.userid ORDER BY `bets` ASC');
		$leaderboard = $sql_leaderboard->fetchAll(PDO::FETCH_ASSOC);
	
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('leaderboard' => $leaderboard));
		echo $page_request;
		return;
	
	case 'profile':
		if(!$user) {
			$page_request = getTemplatePage($names_pages[$page], $page, 'login', $array_page);
			echo $page_request;
			return;
		}
		
		$sql_referral = $db->query('SELECT * FROM `referral_codes` WHERE `userid` = '.$db->quote($user['userid']));
		if($sql_referral->rowCount() > 0) {
			$row_referral = $sql_referral->fetch(PDO::FETCH_ASSOC);
			
			$affiliates['collected'] = $row_referral['collected'];
			$affiliates['available'] = $row_referral['available'];
		}
		
		$affiliates['commission_wagered'] = 0;
		$affiliates['commission_deposited'] = 0;
		$affiliates['deposited'] = 0;
		
		$sql_deposited = $db->query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount` FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = '.$db->quote($user['userid']).' GROUP BY referral_uses.referral');
		if($sql_deposited->rowCount() > 0) {
			$row_deposited = $sql_deposited->fetch(PDO::FETCH_ASSOC);
			
			$affiliates['deposited'] = $row_deposited['amount'];
		}
		
		$sql_affiliates_deposited = $db->query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, COALESCE(SUM(referral_deposited.commission), 0) AS `commission`, referral_uses.userid FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.userid = referral_deposited.userid WHERE referral_uses.referral = '.$db->quote($user['userid']).' AND COALESCE(referral_deposited.referral, '.$db->quote($user['userid']).') = '.$db->quote($user['userid']).' GROUP BY referral_uses.userid ORDER BY `amount` DESC LIMIT 50');
		$sql_affiliates_wagered = $db->query('SELECT COALESCE(SUM(referral_wagered.amount), 0) AS `amount`, COALESCE(SUM(referral_wagered.commission), 0) AS `commission`, referral_uses.userid FROM `referral_uses` LEFT JOIN `referral_wagered` ON referral_uses.userid = referral_wagered.userid WHERE referral_uses.referral = '.$db->quote($user['userid']).' AND COALESCE(referral_wagered.referral, '.$db->quote($user['userid']).') = '.$db->quote($user['userid']).' GROUP BY referral_uses.userid ORDER BY `amount` DESC LIMIT 50');
		$affiliates_deposited = $sql_affiliates_deposited->fetchAll(PDO::FETCH_ASSOC);
		$affiliates_wagered = $sql_affiliates_wagered->fetchAll(PDO::FETCH_ASSOC);
		$affiliates_referral = array();
		foreach($affiliates_deposited as $key => $value){
			$affiliates_referral[$value['userid']]['userid'] = $value['userid'];
			$affiliates_referral[$value['userid']]['deposited'] = $value['amount'];
			$affiliates_referral[$value['userid']]['commission_deposited'] = $value['commission'];
			
			$affiliates['commission_deposited'] += $value['commission'];
		}
		foreach($affiliates_wagered as $key => $value){
			$affiliates_referral[$value['userid']]['userid'] = $value['userid'];
			$affiliates_referral[$value['userid']]['wagered'] = $value['amount'];
			$affiliates_referral[$value['userid']]['commission_wagered'] = $value['commission'];
			
			$affiliates['commission_wagered'] += $value['commission'];
		}
		usort($affiliates_referral, function($first, $second){
			return ($first['commission_deposited'] + $first['commission_wagered'] < $second['commission_deposited'] + $second['commission_wagered']);
		});
		$affiliates_referral = array_slice($affiliates_referral, 0, 50);
	
		$sql_transfers = $db->query('SELECT * FROM `users_transfers` WHERE `to_userid` = '.$db->quote($user['userid']).' OR `from_userid` = '.$db->quote($user['userid']).' ORDER BY `id` DESC LIMIT 50');
		$transfers = $sql_transfers->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_steam = $db->query('SELECT * FROM `steam_transactions` WHERE `userid` = '.$db->quote($user['userid']).' ORDER BY `id` DESC LIMIT 50');
		$steam = $sql_steam->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_p2p_deposit = $db->query('SELECT * FROM `p2p_transactions` WHERE `userid` = '.$db->quote($user['userid']).' ORDER BY `id` DESC LIMIT 50');
		$sql_p2p_withdraw = $db->query('SELECT p2p_transactions.*, p2p_buyers.canceled FROM `p2p_buyers` INNER JOIN `p2p_transactions` ON p2p_transactions.id = p2p_buyers.offerid WHERE p2p_buyers.userid = '.$db->quote($user['userid']).' ORDER BY p2p_buyers.id DESC LIMIT 50');
		$p2p_deposit = $sql_p2p_deposit->fetchAll(PDO::FETCH_ASSOC);
		foreach($p2p_deposit as $key => $value) $p2p_deposit[$key]['type'] = 'deposit';
		$p2p_withdraw = $sql_p2p_withdraw->fetchAll(PDO::FETCH_ASSOC);
		foreach($p2p_withdraw as $key => $value) {
			$p2p_withdraw[$key]['type'] = 'withdraw';
			if($value['canceled']) $p2p_withdraw[$key]['status'] = -1;
		}
		$p2p = array_merge($p2p_deposit, $p2p_withdraw);
		usort($p2p, function($first, $second){
			return ($first['time'] < $second['time']);
		});
		$p2p = array_slice($p2p, 0, 50);
		
		$sql_crypto = $db->query('SELECT * FROM `crypto_transactions` WHERE `userid` = '.$db->quote($user['userid']).' ORDER BY `id` DESC LIMIT 50');
		$crypto = $sql_crypto->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_stats = $db->query('SELECT `amount`, `service` FROM `users_transactions` WHERE `userid` = '.$db->quote($user['userid']));
		$stats = $sql_stats->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_transactions = $db->query('SELECT * FROM `users_transactions` WHERE `userid` = '.$db->quote($user['userid']).' ORDER BY `id` DESC LIMIT 50');
		$transactions = $sql_transactions->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_deposits = $db->query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = '.$db->quote("deposit").' AND `userid` = '.$db->quote($user['userid']));
		$deposits = $sql_deposits->fetch(PDO::FETCH_ASSOC);
		
		$sql_withdraws = $db->query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = '.$db->quote("withdraw").' AND `userid` = '.$db->quote($user['userid']));
		$withdraws = $sql_withdraws->fetch(PDO::FETCH_ASSOC);
		
		$balance = 0;
		if(sizeof($transactions) > 0){
			if(array_reverse($transactions)[0]['id'] > 0){
				$sql8 = $db->query('SELECT SUM(amount) AS `balance` FROM `users_transactions` WHERE `userid` = '.$db->quote($user['userid']).' AND `id` < '.array_reverse($transactions)[0]['id']);
				$row8 = $sql8->fetch(PDO::FETCH_ASSOC);
				
				$balance = $row8['balance'];
			}
		}
		
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('affiliates' => $affiliates, 'stats' => array('transfers' => $transfers, 'offers_steam' => $steam, 'offers_p2p' => $p2p, 'offers_crypto' => $crypto, 'transactions' => $transactions, 'balance' => $balance, 'stats' => $stats, 'deposits' => $deposits, 'withdraws' => $withdraws, 'affiliates' => $affiliates_referral)));
		echo $page_request;
		return;
	
	case 'rewards':
		if(!$user) {
			$page_request = getTemplatePage($names_pages[$page], $page, 'login', $array_page);
			echo $page_request;
			return;
		}
		
		$rewards['rewards'] = array();
		
		$rewards['rewards']['referral_have'] = 0;
		
		$sql_referral = $db->query('SELECT * FROM `referral_codes` WHERE `userid` = '.$db->quote($user['userid']));
		if($sql_referral->rowCount() > 0) {
			$row_referral = $sql_referral->fetch(PDO::FETCH_ASSOC);
			
			$rewards['rewards']['referral_have'] = 1;
			$rewards['rewards']['referral_code'] = $row_referral['code'];
		}
		
		$sql_code = $db->query('SELECT * FROM `referral_uses` WHERE `userid` = '.$db->quote($user['userid']));
		$rewards['rewards']['collected_code'] = 0;
		
		if($sql_code->rowCount() > 0) {
			$row_code = $sql_code->fetch(PDO::FETCH_ASSOC);
			
			$rewards['rewards']['collected_code'] = 1;
			
			$sql_referral_owner = $db->query('SELECT * FROM `users` WHERE `userid` = '.$db->quote($row_code['referral']));
			$row_referral_owner = $sql_referral_owner->fetch(PDO::FETCH_ASSOC);
			
			$rewards['rewards']['referral_owner'] = $row_referral_owner['name'];
		}
		
		$sql_bind_google = $db->query('SELECT * FROM `users_rewards` WHERE `reward` = '.$db->quote('google').' AND `userid` = '.$db->quote($user['userid']));
		$sql_bind_facebook = $db->query('SELECT * FROM `users_rewards` WHERE `reward` = '.$db->quote('facebook').' AND `userid` = '.$db->quote($user['userid']));
		$sql_bind_steam = $db->query('SELECT * FROM `users_rewards` WHERE `reward` = '.$db->quote('steam').' AND `userid` = '.$db->quote($user['userid']));
		
		$sql_name = $db->query('SELECT * FROM `users_rewards` WHERE `reward` = '.$db->quote('name').' AND `userid` = '.$db->quote($user['userid']));
		$sql_group = $db->query('SELECT * FROM `users_rewards` WHERE `reward` = '.$db->quote('group').' AND `userid` = '.$db->quote($user['userid']));
		
		$rewards['rewards']['collected_google'] = $sql_bind_google->rowCount();
		$rewards['rewards']['collected_facebook'] = $sql_bind_facebook->rowCount();
		$rewards['rewards']['collected_steam'] = $sql_bind_steam->rowCount();
		
		$rewards['rewards']['collected_name'] = $sql_name->rowCount();
		$rewards['rewards']['collected_group'] = $sql_group->rowCount();
	
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('rewards' => $rewards));
		echo $page_request;
		return;

	case 'deposit':
		$location = $page;
	
		if(isset($paths[1])){
			switch($paths[1]){
				case 'steam':
					if(isset($paths[2])){
						$methodes = array('csgo', 'dota2', 'tf2', 'h1z1', 'rust');
						if(in_array($paths[2], $methodes)) {
							$location .= '_steam';
							
							break;
						}
					}
					
					header('location: ' . $root . 'deposit');
					exit();
					
					break;
					
				case 'currency':
					if(isset($paths[2])){
						$methodes = array('btc', 'eth', 'ltc', 'bch');
						if(in_array($paths[2], $methodes)){
							$crypto_addresses = array('BTC' => null, 'ETH' => null, 'LTC' => null, 'BCH' => null);

							$sql = $db->query('SELECT * FROM `crypto_addresses` WHERE `userid` = '.$db->quote($user['userid']));
							$row = $sql->fetchAll(PDO::FETCH_ASSOC);

							foreach($row as $key => $value){
								$crypto_addresses[$value['currency']] = $value['address'];
							}

							$array_page['addresses'] = $crypto_addresses;

							$location .= '_currency';
							
							break;
						}
					}
					
					header('location: ' . $root . 'deposit');
					exit();
					
					break;
					
				case 'p2p':
					if(isset($paths[2])){
						$methodes = array('csgo', 'dota2', 'tf2', 'h1z1', 'rust');
						if(in_array($paths[2], $methodes)) {
							$location .= '_p2p';
							
							break;
						}
					}
					
					header('location: ' . $root . 'deposit');
					exit();
					
					break;
				
				default:
					header('location: ' . $root . 'deposit');
					exit();
				
					break;
			}
		}
	
		$page_request = getTemplatePage($names_pages[$page], $page, $location, $array_page);
		echo $page_request;
		return;
		
	case 'withdraw':
		$location = $page;
	
		if(isset($paths[1])){
			switch($paths[1]){
				case 'steam':
					if(isset($paths[2])){
						$methodes = array('csgo', 'dota2', 'tf2', 'h1z1', 'rust');
						if(in_array($paths[2], $methodes)) {
							$location .= '_steam';
							
							break;
						}
					}
					
					header('location: ' . $root . 'withdraw');
					exit();
					
					break;
					
				case 'currency':
					if(isset($paths[2])){
						$methodes = array('btc', 'eth', 'ltc', 'bch');
						if(in_array($paths[2], $methodes)){
							$crypto_addresses = array('BTC' => null, 'ETH' => null, 'LTC' => null, 'BCH' => null);

							$sql = $db->query('SELECT * FROM `crypto_addresses` WHERE `userid` = '.$db->quote($user['userid']));
							$row = $sql->fetchAll(PDO::FETCH_ASSOC);

							foreach($row as $key => $value){
								$crypto_addresses[$value['currency']] = $value['address'];
							}

							$array_page['addresses'] = $crypto_addresses;

							$location .= '_currency';
							
							break;
						}
					}
					
					header('location: ' . $root . 'withdraw');
					exit();
					
					break;
					
				case 'p2p':
					if(isset($paths[2])){
						$methodes = array('csgo', 'dota2', 'tf2', 'h1z1', 'rust');
						if(in_array($paths[2], $methodes)) {
							$location .= '_p2p';
							
							break;
						}
					}
					
					header('location: ' . $root . 'withdraw');
					exit();
						
					break;
				
				default:
					header('location: ' . $root . 'withdraw');
					exit();
				
					break;
			}
		}
	
		$page_request = getTemplatePage($names_pages[$page], $page, $location, $array_page);
		echo $page_request;
		return;
		
	case 'tos':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
		
	case 'support':
		if(isset($_POST['new_ticket'])){
			//VARIABLES
			$title = $_POST['title'];
			$departament = intval($_POST['departament']);
			$message = $_POST['message'];
			
			//REPLACE
			$cens = array(
				'<','>'
			);
			$title = str_ireplace($cens, '', $title);
			$message = str_ireplace($cens, '', $message);
			$departament = str_ireplace($cens, '', $departament);
			
			//SET MODERATOR OR ADMIN OR QWNER FOR SEND
			if($departament == 2 || $departament == 3 || $departament == 5 || $departament == 6) {
				$sql_ranks = $db->query('SELECT `userid`, `name` FROM `users` WHERE `rank` = 1 || `rank` = 100');
			} else {
				$sql_ranks = $db->query('SELECT `userid`, `name` FROM `users` WHERE `rank` = 1 || `rank` = 2 || `rank` = 100');
			}
			
			$row_ranks = $sql_ranks->fetchAll(PDO::FETCH_ASSOC);
			if(sizeof($row_ranks) > 0){
				$user_for = $row_ranks[rand(0, sizeof($row_ranks) - 1)];
				if($user_for['userid'] == $user['userid']) if(sizeof($row_ranks) > 1) while($user_for['userid'] == $user['userid']) $user_for = $row_ranks[rand(0, sizeof($row_ranks) - 1)];
			
				if(strlen($message) > 10 && strlen($title) > 0){
					if($departament >= 1 && $departament <= 6){
						//NEW SUPPORT
						$db->exec('INSERT INTO `support_tickets` SET `title` = '.$db->quote($title).', `departament` = '.$db->quote($departament).', `to_userid` = '.$db->quote($user_for['userid']).', `to_name` = '.$db->quote($user_for['name']).', `from_userid` = '.$db->quote($user['userid']).', `from_name` = '.$db->quote($user['name']).', `time` = '.$db->quote(time()));
						
						//THE TICKET
						$id = $db->lastInsertId();
						$db->exec('INSERT INTO `support_messages` SET `support_id` = '.$db->quote($id).', `message` = '.$db->quote($message).', `userid` = '.$db->quote($user['userid']).', `name` = '.$db->quote($user['name']).', `avatar` = '.$db->quote($user['avatar']).', `time` = '.$db->quote(time()));
					}
				}
			}
			
			//RETURM TO SUPPORT
			header('Location: ' . $root . 'support');
			exit();
		} else if(isset($_POST['reply_ticket'])){
			//VARIABLES
			$id = $_GET['id'];
			$message = $_POST['message'];
			
			//GET DATES SUPPORT
			$sql_support = $db->query('SELECT * FROM `support_tickets` WHERE `id` = '.$db->quote($id));
			$row_support = $sql_support->fetch(PDO::FETCH_ASSOC);
			
			//TEST SUPPORT
			if($row_support['closed'] == 0){
				if($row_support['from_userid'] == $user['userid'] || $row_support['to_userid'] == $user['userid']){
					if(strlen($message) > 0){
						//IF REPLY FROM FOR
						$response = 0; if($row_support['to_userid'] == $user['userid']) $response = 1;
						
						//TEST REPLY
						if($response){
							$header_msg = '<span style="color: var(--site-color-main-light);">Greetings '.$row_support['from_name'].', <br><br></span>';
							$footed_msg = '<br><br><span style="color: var(--site-color-main-light);">All the best,<br>'.$user['name'].'</span>';
							
							$message = $header_msg.$message.$footed_msg;
						} else {
							$cens = array(
								'<','>'
							);
							
							$message = str_ireplace($cens, '', $message);
						}
						
						//SEND REPLY
						$db->exec('INSERT INTO `support_messages` SET `support_id` = '.$db->quote($id).', `message` = '.$db->quote($message).', `userid` = '.$db->quote($user['userid']).', `name` = '.$db->quote($user['name']).', `avatar` = '.$db->quote($user['avatar']).', `response` = '.$db->quote($response).', `time` = '.$db->quote(time()));
					}
				}
			}
			
			//RETURM TO SUPPORT
			header('Location: ' . $root . 'support');
			exit();
		} else if(isset($_POST['close_ticket'])){
			//VARIABLES
			$id = $_GET['id'];
			
			//GET DATES SUPPORT
			$sql_support = $db->query('SELECT * FROM `support_tickets` WHERE `id` = '.$db->quote($id));
			$row_support = $sql_support->fetch(PDO::FETCH_ASSOC);
			
			//TEST SUPPORT
			if($row_support['closed'] == 0){
				if($row_support['from_userid'] == $user['userid'] || $row_support['to_userid'] == $user['userid'] || $user['rank'] == 100){
					$db->exec('UPDATE `support_tickets` SET `closed` = 1 WHERE `id` = '.$db->quote($id));
				}
			}
			
			//RETURM TO SUPPORT
			header('Location: ' . $root . 'support');
			exit();
		} else if(isset($_POST['another_department'])){
			//VARIABLES
			$id = $_GET['id'];
			$departament = intval($_POST['new_departament']);
			
			//GET DATES SUPPORT
			$sql_support = $db->query('SELECT * FROM `support_tickets` WHERE `id` = '.$db->quote($id));
			$row_support = $sql_support->fetch(PDO::FETCH_ASSOC);
			
			//TEST SUPPORT
			if($row_support['closed'] == 0){
				if($row_support['to_userid'] == $user['userid'] || $user['rank'] == 100){
					if($departament >= 1 && $departament <= 6){
						$header_msg = '<span style="color: var(--site-color-main-light);">Greetings '.$row_support['from_name'].', <br><br></span>';
						$message = 'I have gone ahead and sent your ticket to the proper department for further assistance.';
						$footed_msg = '<br><br><span style="color: var(--site-color-main-light);">All the best,<br>'.$user['name'].'</span>';
						
						$message = $header_msg.$message.$footed_msg;
						
						//SET MODERATOR OR ADMIN OR QWNER FOR SEND
						if($departament == 2 || $departament == 3 || $departament == 5 || $departament == 6) {
							$sql_ranks = $db->query('SELECT `userid`, `name` FROM `users` WHERE `rank` = 1 || `rank` = 100');
						} else {
							$sql_ranks = $db->query('SELECT `userid`, `name` FROM `users` WHERE `rank` = 1 || `rank` = 2 || `rank` = 100');
						}
						
						$row_ranks = $sql_ranks->fetchAll(PDO::FETCH_ASSOC);
						if(sizeof($row_ranks) > 0){
							$user_for = $row_ranks[rand(0, sizeof($row_ranks) - 1)];
							if($user_for['userid'] == $user['userid']) if(sizeof($row_ranks) > 1) while($user_for['userid'] == $user['userid']) $user_for = $row_ranks[rand(0, sizeof($row_ranks) - 1)];
						
							//REDIRECT DEPARTAMENT
							$db->exec('UPDATE `support_tickets` SET `departament` = '.$db->quote($departament).', `to_userid` = '.$db->quote($user_for['userid']).', `to_name` = '.$db->quote($user_for['name']).' WHERE `id` = '.$db->quote($id));
							
							//SEND REPLY
							$db->exec('INSERT INTO `support_messages` SET `support_id` = '.$db->quote($id).', `message` = '.$db->quote($message).', `userid` = '.$db->quote($user['userid']).', `name` = '.$db->quote($user['name']).', `avatar` = '.$db->quote($user['avatar']).', `response` = 1, `time` = '.$db->quote(time()));
						}
					}
				}
			}
			
			//RETURM TO SUPPORT
			header('Location: ' . $root . 'support');
			exit();
		}
		
		if($user['rank'] == 100) $sql_support = $db->query('SELECT * FROM `support_tickets` WHERE `from_userid` = '.$db->quote($user['userid']).' || `to_userid` > 0 ORDER BY `id` DESC');
		else $sql_support = $db->query('SELECT * FROM `support_tickets` WHERE `from_userid` = '.$db->quote($user['userid']).' || `to_userid` = '.$db->quote($user['userid']).' ORDER BY `id` DESC');
		$row_support = $sql_support->fetchAll(PDO::FETCH_ASSOC);
		$support = $row_support;
		
		if($user['rank'] == 100) $sql_tickets = $db->query('SELECT support_messages.id, `support_id`, `message`, support_messages.userid, support_messages.name, support_messages.avatar, `response`, support_messages.time FROM `support_messages` INNER JOIN `support_tickets` ON support_messages.support_id = support_tickets.id WHERE support_tickets.from_userid = '.$db->quote($user['userid']).' || support_tickets.to_userid > 0');
		else $sql_tickets = $db->query('SELECT support_messages.id, `support_id`, `message`, support_messages.userid, support_messages.name, support_messages.avatar, `response`, support_messages.time FROM `support_messages` INNER JOIN `support_tickets` ON support_messages.support_id = support_tickets.id WHERE support_tickets.from_userid = '.$db->quote($user['userid']).' || support_tickets.to_userid = '.$db->quote($user['userid']));
		$row_tickets = $sql_tickets->fetchAll(PDO::FETCH_ASSOC);
		$tickets = $row_tickets;
	
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('support'=>$support, 'tickets'=>$tickets)); //SUPPORT
		echo $page_request;
		return;
		
	case 'history':
		$sql_roulette = $db->query('SELECT `id`, `hash`, `secret`, `roll` FROM `roulette_rolls` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
		$roulette = $sql_roulette->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_crash = $db->query('SELECT `id`, `hash`, `secret`, `point` FROM `crash_rolls` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
		$crash = $sql_crash->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_jackpot = $db->query('SELECT `id`, `hash`, `secret`, `percentage` FROM `jackpot_history` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
		$jackpot = $sql_jackpot->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_coinflip = $db->query('SELECT `id`, `hash`, `secret`, `percentage` FROM `coinflip_games` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
		$coinflip = $sql_coinflip->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_dice = $db->query('SELECT `id`, `hash`, `secret`, `roll` FROM `dice_bets` ORDER BY `id` DESC LIMIT 50');
		$dice = $sql_dice->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_unbox = $db->query('SELECT `id`, `hash`, `secret`, `percentage` FROM `unbox_opens` ORDER BY `id` DESC LIMIT 50');
		$unbox = $sql_unbox->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_minesweeper = $db->query('SELECT `id`, `hash`, `secret`, `value` FROM `minesweeper_bets` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
		$minesweeper = $sql_minesweeper->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_tower = $db->query('SELECT `id`, `hash`, `secret`, `value` FROM `tower_bets` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
		$tower = $sql_tower->fetchAll(PDO::FETCH_ASSOC);
		
		$sql_plinko = $db->query('SELECT `id`, `hash`, `secret`, `value` FROM `plinko_bets` ORDER BY `id` DESC LIMIT 50');
		$plinko = $sql_plinko->fetchAll(PDO::FETCH_ASSOC);
		
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('histories' => array('roulette' => $roulette, 'crash' => $crash, 'jackpot' => $jackpot, 'coinflip' => $coinflip, 'dice' => $dice, 'unbox' => $unbox, 'minesweeper' => $minesweeper, 'tower' => $tower, 'plinko' => $plinko)));
		echo $page_request;
		return;
		
	case 'fair':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
		
	case 'faq':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;

	case 'auth':
		switch($paths[1]) {
			case 'login':
				if($user) exit(json_encode(array('success' => false, 'error' => 'User logged in')));
			
				$username = $_POST['username'];
				$password = $_POST['password'];
				
				auth_authByLogin(array( 'username' => $username, 'password' => $password ), function($err1, $session){
					if($err1) exit(json_encode(array('success' => false, 'error' => $err1)));
						
					setcookie('session', $session['session'], $session['expire'], $GLOBALS['root']);
					exit(json_encode(array('success' => true, 'refresh' => true, 'message' => array('have' => false))));
				});
				
				break;
				
			case 'register':
				if($user) exit(json_encode(array('success' => false, 'error' => 'User logged in')));
			
				$email = $_POST['email'];
				$username = $_POST['username'];
				$password = $_POST['password'];
				
				auth_authByRegister(array( 'email' => $email, 'username' => $username, 'password' => $password ), function($err1, $session){
					if($err1) exit(json_encode(array('success' => false, 'error' => $err1)));
						
					setcookie('session', $session['session'], $session['expire'], $GLOBALS['root']);
					exit(json_encode(array('success' => true, 'refresh' => true)));
				});
			
				break;
			
			case 'steam':
				session_start();
			
				$data_parms = array();
		
				foreach($_SESSION as $key => $value){
					unset($_SESSION[$key]);
					
					$data_parms[$key] = $value;
				}
				
				foreach($_GET as $key => $value){
					$_SESSION[$key] = $value;
				}
			
				if($user && !$data_parms['assign']) return header('location: ' . $root . $data_parms['return']);
				if(!$user && $data_parms['assign']) return header('location: ' . $root . $data_parms['return']);
			
				include 'openid/steam/openid.php';
				try{
					$openid = new LightOpenID($_SERVER['SERVER_NAME'] . $root . $data_parms['return']);
					
					if (!$openid->mode) {
						$openid->identity = 'http://steamcommunity.com/openid/';
						
						header('location: '.$openid->authUrl());
					} elseif ($openid->mode == 'cancel') {
						header('location: ' . $root . $data_parms['return']);
					} else {
						if(!$openid->validate()) exit('Invalid Steam Login');
						
						$id = $openid->identity;
						$ptn = '/^https:\/\/steamcommunity\.com\/openid\/id\/(7[0-9]{15,25}+)$/';
						preg_match($ptn, $id, $matches);
						
						$link = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' . $GLOBALS['steam']['apikey'] . '&steamids=' . $matches[1];
						$json_object = file_get_contents($link);
						$json_decoded = json_decode($json_object);
						
						if(!isset($json_decoded->response)) exit('Invalid Steam Login Response (1)');
						if(!isset($json_decoded->response->players)) exit('Invalid Steam Login Response (2)');
						if(sizeof($json_decoded->response->players) <= 0) exit('Invalid Steam Login Response (3)');
						
						$steamid = $json_decoded->response->players[0]->steamid;
						$name = $json_decoded->response->players[0]->personaname;
						$avatar = $json_decoded->response->players[0]->avatarfull;
						
						if($data_parms['assign']){
							auth_bindAccount(array( 'user' => $user, 'bind' => 'steam', 'bindid' => $steamid ), function($err1){
								if($err1) exit($err1);
							});
						} else {
							auth_authBySteam(array( 'id' => $steamid, 'name' => $name, 'avatar' => $avatar ), function($err1, $session){
								if($err1) exit($err1);
									
								setcookie('session', $session['session'], $session['expire'], $GLOBALS['root']);
							});
						}
						
						header('location: ' . $root . $data_parms['return']);
					}
				} catch (ErrorException $e) {
					exit($e->getMessage());
				}
			
				break;
				
			case 'google':
				session_start();
			
				$data_parms = array();
		
				foreach($_SESSION as $key => $value){
					unset($_SESSION[$key]);
					
					$data_parms[$key] = $value;
				}
				
				foreach($_GET as $key => $value){
					$_SESSION[$key] = $value;
				}
			
				if($user && !$data_parms['assign']) return header('location: ' . $root . $data_parms['return']);
				if(!$user && $data_parms['assign']) return header('location: ' . $root . $data_parms['return']);
				
				require_once 'openid/google/vendor/autoload.php';
				try{
					$openid = new Google_Client();
					$openid->setClientId($google['client']);
					$openid->setClientSecret($google['secret']);
					$openid->setRedirectUri('https://' . $_SERVER['SERVER_NAME'] . $root . 'auth/google');
					$openid->addScope('email');
					$openid->addScope('profile');
					
					if(!isset($_GET['code'])){
						header('location: ' . $openid->createAuthUrl());
					} else {
						$token = $openid->fetchAccessTokenWithAuthCode($_GET['code']);
						$openid->setAccessToken($token['access_token']);
						  
						$google_oauth = new Google_Service_Oauth2($openid);
						
						if(!isset($google_oauth->userinfo)) exit('Invalid Google Login Response (1)');
						
						$google_account_info = $google_oauth->userinfo->get();
						
						$id =  $google_account_info->id;
						$email =  $google_account_info->email;
						$name =  $google_account_info->name;
						$avatar =  $google_account_info->picture;
						
						if($data_parms['assign']){
							auth_bindAccount(array( 'user' => $user, 'bind' => 'google', 'bindid' => $id ), function($err1){
								if($err1) exit($err1);
							});
						} else {
							auth_authByGoogle(array( 'id' => $id, 'email' => $email, 'name' => $name, 'avatar' => $avatar ), function($err1, $session){
								if($err1) exit($err1);
								
								setcookie('session', $session['session'], $session['expire'], $GLOBALS['root']);
							});
						}
						
						header('location: ' . $root . $data_parms['return']);
					}
				} catch (ErrorException $e) {
					exit($e->getMessage());
				}
			
				break;
				
			case 'facebook':
				session_start();
			
				$data_parms = array();
		
				foreach($_SESSION as $key => $value){
					unset($_SESSION[$key]);
					
					$data_parms[$key] = $value;
				}
				
				foreach($_GET as $key => $value){
					$_SESSION[$key] = $value;
				}
			
				header('location: ' . $root . $data_parms['return']);
			
				break;
			
			case 'logout':
				$return = $_GET['return'];
			
				if(!$user) return header('location: ' . $root . $return);
			
				$session = $_COOKIE['session'];
				$devices = intval($_GET['devices']);
				
				auth_logoutUserDevices(array( 'session' => $session, 'devices' => $devices ), function($err1){
					if($err1) return header('location: ' . $GLOBALS['root'] . $return);
					
					setcookie('session', '', time(), $GLOBALS['root']);
				});
				
				header('location: ' . $root . $return);
				
				break;
				
			case 'change_password':
				if(!$user) exit(json_encode(array('success' => false, 'error' => 'User not logged in')));
				
				$current_password = $_POST['current_password'];
				$password = $_POST['password'];
				$confirm_password = $_POST['confirm_password'];
				
				auth_changePassword(array( 'user' => $user, 'current_password' => $current_password, 'password' => $password, 'confirm_password' => $confirm_password ), function($err1){
					if($err1) exit(json_encode(array('success' => false, 'error' => $err1)));
						
					exit(json_encode(array('success' => true, 'refresh' => false, 'message' => array('have' => true, 'message' => 'Your password has been changed!'))));
				});
					
				break;
				
			case 'recover':
				if($user) return header('location: ' . $root);
			
				$key = $_GET['key'];
				
				$sql1 = $db->query('SELECT * FROM `link_keys` WHERE `key` = ' . $db->quote($key) . ' AND `expire` > ' . $db->quote(time()) . ' AND `used` = 0');
				if($sql1->rowCount() > 0) {
					$row1 = $sql1->fetch(PDO::FETCH_ASSOC);
					
					$sql2 = $db->query('SELECT * FROM `users` WHERE `userid` = ' . $db->quote($row1['userid']));
					if($sql2->rowCount() > 0) {
						$page_request = getTemplatePage($names_pages['reset'], 'reset', 'reset', $array_page, array('key' => $key));
						echo $page_request;
						return;
					}
				}
					
				header('location: ' . $root);
				
				break;
				
			case 'reset':
				if($user) exit(json_encode(array('success' => false, 'error' => 'User logged in')));
			
				$key = $_GET['key'];
				$password = $_POST['password'];
				$confirm_password = $_POST['confirm_password'];
				
				auth_resetPassword(array( 'key' => $key, 'password' => $password, 'confirm_password' => $confirm_password ), function($err1){
					if($err1) exit(json_encode(array('success' => false, 'error' => $err1)));
						
					exit(json_encode(array('success' => true, 'refresh' => true)));
				});
					
				break;
			
			case 'verifyprofile':
				if(!$user) return header('location: ' . $root);
			
				$session = $_COOKIE['session'];
				$key = $_GET['key'];
				
				auth_verifyProfile(array( 'session' => $session, 'key' => $key ), function($err1){
					if($err1) exit($err1);
				});
				
				header('location: ' . $root);
				
				break;
				
			case 'initializing':
				if(!$user) exit(json_encode(array('success' => false, 'error' => 'User not logged in')));
				
				$username = $_POST['username'];
				$email = $_POST['email'];
				$password = $_POST['password'];
				$confirm_password = $_POST['confirm_password'];
				
				auth_accountInitializing(array( 'user' => $user, 'username' => $username, 'email' => $email, 'password' => $password, 'confirm_password' => $confirm_password ), function($err1){
					if($err1) exit(json_encode(array('success' => false, 'error' => $err1)));
						
					exit(json_encode(array('success' => true, 'refresh' => false, 'message' => array('have' => true, 'message' => 'Your account has been initialized!'))));
				});
				
				break;
		}
		
		return;
}

$page_request = getTemplate('Page not Found (404)', 'empty');
echo $page_request;
exit();

function getTemplate($name, $page, $in = null) {
	extract($in);
	ob_start();
	include 'template/' . $page . '.tpl';
	$text = ob_get_clean();
	return $text;
}

function getTemplatePage($name, $page, $name_page, $in1 = null, $in2 = null) {
	extract($in1);
	extract($in2);
	ob_start();
	include 'template/page.tpl';
	$text = ob_get_clean();
	return $text;
}

<?php
require_once $_SERVER["DOCUMENT_ROOT"].'/core/config.php';

$default_page = "home";
$user = [];

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

if (isset($_COOKIE['session'])) {
	$user = $User->FindUserByCookie($_COOKIE['session']);
}

$array_page = array('user' => $user, 'site' => $site, 'profile' => $profile, 'rewards' => $rewards, 'affiliates' => $affiliates, 'paths' => $paths);

$DataBase->Query('SELECT * FROM `bannedip` WHERE `ip` = :ip');
$DataBase->Bind(":ip", $Other->getUserIp());
$DataBase->Execute();

if ($DataBase->RowCount() > 0 && !in_array($ranks_name[$user['rank']], $banip_excluded)) {
    $page_request = getTemplate('Your IP is banned.', 'empty');
    echo $page_request;
    exit();
}

if ($maintenance == 1 && !in_array($ranks_name[$user['rank']], $maintenance_excluded) && !($page == 'auth' && in_array($paths[1], array('login', 'logout', 'register', 'steam', 'google', 'facebook', 'logout')))) {
    $page_request = getTemplate($names_pages['maintenance'], 'maintenance', array('user' => $user, 'site' => $site, 'profile' => $profile, 'paths' => $paths, 'maintenance_message' => $maintenance_message)); //MAINTENANCE
    echo $page_request;
    exit();
}

if(!isset($user)) {
	$DataBase->Query('SELECT users_restrictions.reason, users_restrictions.expire, users.name FROM `users_restrictions` INNER JOIN `users` ON users_restrictions.byuserid = users.userid WHERE users_restrictions.restriction = "site" AND users_restrictions.removed = 0 AND (users_restrictions.expire = -1 OR users_restrictions.expire > :time) AND users_restrictions.userid = :uid');
	$DataBase->Bind(":time", time());
	$DataBase->Bind(":uid", $user['userid']);
	$DataBase->Execute();

	if ($DataBase->RowCount() > 0 && !in_array($ranks_name[$user['rank']], $ban_excluded) && $page != 'support' && $page != 'tos') {
    		$page_request = getTemplatePage($names_pages['banned'], $page, 'banned', $array_page, array('ban' => $DataBase->Single())); //BANNED
    		echo $page_request;
    		exit();
	}
}

switch ($page) {
	case 'slot_arena':
		$details = explode('/', $site['path']);
		echo '<script>const BONUS_GAME_ID="'.$details[1].'";</script>';

		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		
		echo $page_request;
		return;

	case 'slot_arenas':
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		
		echo $page_request;
		return;

	case 'slots_game':
		require_once $_SERVER["DOCUMENT_ROOT"].'/core/libs/mobiledetect/mobiledetectlib/Mobile_Detect.php';

		$pagen = $page;
		
		$detect = $detect = new Mobile_Detect;
		$deviceType = ($detect->isMobile() ? ($detect->isTablet() ? 'tablet' : 'phone') : 'computer');

		$details = explode('/', $site['path']);
		if(count($details) >= 2) {
			echo '<script>let SLOTS_GAME_ID="'.$details[1].'";</script>';
		}
		if(isset($user['userid'])) {
			$userid = $user['userid'];
			$balance = $user['balance'];
		} else {
			$userid = "demo";
			$balance = 100000;
		}

		if ($deviceType == "tablet" || $deviceType=="phone") {
			$pagen = $page."_m";
			$page_request = getTemplatePageM($names_pages[$page], $pagen, $pagen, $array_page, array("userid" => $userid, "balance" => $balance));
		} else {
			$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array("userid" => $userid, "balance" => $balance));
		}
		
		
		echo $page_request;
		return;

	case 'admin':
			$rankk = $user['rank'];
			if ($rankk !== "1" && $rankk !== "100") {
				header('location: /');
				return;
			}
			
			$week_start = strtotime(date("Y-m-d", strtotime('monday this week')));
		
			// users
			$DataBase->Query('SELECT COUNT(id) FROM `users` WHERE time_create >= :weekstart');
			$DataBase->Bind(":weekstart", $week_start);
			$DataBase->Execute();
			$new_users = $DataBase->Single();
		
			// deposits
			$DataBase->Query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = :deposit');
			$DataBase->Bind(":deposit", "deposit");
			$DataBase->Execute();
			$deposits = $DataBase->Single();
		
			if (!$deposits['total']) $deposits['total'] = 0;
			$deposits['total'] = number_format($deposits['total'], 2);
			$deposits['count'] = number_format($deposits['count'], 2);
		
			// deposits new
			$DataBase->Query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = :deposit AND time >= :weekstart');
			$DataBase->Bind(":deposit", "deposit");
			$DataBase->Bind(":weekstart", $week_start);
			$DataBase->Execute();
			$deposits2 = $DataBase->Single();
		
			if (!$deposits2['total']) $deposits2['total'] = 0;
			$deposits2['total'] = number_format($deposits2['total'], 2);
			$deposits2['count'] = number_format($deposits2['count'], 2);
		
			// withdraws
			$DataBase->Query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = :deposit');
			$DataBase->Bind(":deposit", "withdraw");
			$DataBase->Execute();
			$withdraws = $DataBase->Single();
		
			if (!$withdraws['total']) $withdraws['total'] = 0;
			$withdraws['total'] = number_format($withdraws['total'], 2);
			$withdraws['count'] = number_format($withdraws['count'], 2);
		
			// withdraws new
			$DataBase->Query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = :deposit AND time >= :weekstart');
			$DataBase->Bind(":deposit", "withdraw"); 
			$DataBase->Bind(":weekstart", $week_start);
			$DataBase->Execute();
			$withdraws2 = $DataBase->Single();
		
			if (!$withdraws2['total']) $withdraws2['total'] = 0;
			$withdraws2['total'] = number_format($withdraws2['total'], 2);
			$withdraws2['count'] = number_format($withdraws2['count'], 2);
		
			// balances all
			$DataBase->Query('SELECT SUM(balance) AS `total` FROM `users` WHERE `rank` != 1 AND `rank` != 100');
			$DataBase->Execute();
			$balance = $DataBase->Single();
		
			if (!$balance['total']) $balance['total'] = 0;
			$balance['total'] = number_format($balance['total'], 2);
		
			// profit
			$profit = 0;
			//$profit = $deposits['total'] - $withdraws['total'] - $balance['total'];
			$isprofit = $profit >= 0;
			//$profit = abs($profit);
			
			// profit
			$profit2 = 0;
			//$profit2 = $deposits2['total'] - $withdraws2['total'] - $balance['total'];
			$isprofit2 = $profit2 >= 0;
			//$profit2 = abs($profit2);*/
			
		
			// users
			$DataBase->Query('SELECT * FROM `users` ORDER BY balance DESC');
			$DataBase->Execute();
			$users = $DataBase->ResultSet();
		
			// bets
			$DataBase->Query('SELECT userid, service, amount FROM `users_transactions` WHERE service LIKE "%_bet" OR service LIKE "%_win"');
			$DataBase->Execute();
			$bets = $DataBase->ResultSet();
		
			// transactions
			$DataBase->Query('SELECT userid, service, amount, time FROM `users_transactions` WHERE service LIKE "%_deposit" OR service LIKE "%_withdraw"');
			$DataBase->Execute();
			$trx = $DataBase->ResultSet();
		
			$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('new_users' => $new_users, 'deposits' => $deposits, 'deposits2' => $deposits2, 'profit' => $profit, 'isprofit' => $isprofit, 'profit2' => $profit2, 'isprofit2' => $isprofit2, 'users' => $users, 'bets' => $bets, 'trx' => $trx));
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
		/*$l_total = 10;
		
		$sql_leaderboard = $db->query('SELECT users.userid, users.name, users.avatar, (SELECT SUM(amount) FROM `users_transactions` WHERE users_transactions.userid = users.userid AND `amount` > 0 GROUP BY users_transactions.userid) AS `winnings`, (SELECT SUM(amount) FROM `users_transactions` WHERE users_transactions.userid = users.userid AND `amount` < 0 GROUP BY users_transactions.userid) AS `bets`, (SELECT COUNT(users_transactions.userid) FROM `users_transactions` WHERE users_transactions.userid = users.userid AND `amount` < 0 GROUP BY users_transactions.userid) AS `games` FROM `users` INNER JOIN `users_transactions` ON users.userid = users_transactions.userid WHERE users.userid IN (SELECT users_transactions.userid FROM (SELECT users_transactions.userid, SUM(amount) AS `profit` FROM `users_transactions` WHERE `amount` < 0 GROUP BY users_transactions.userid ORDER BY `profit` ASC LIMIT ' . $l_total . ') AS `profit_tabel`) AND users_transactions.amount < 0 GROUP BY users.userid ORDER BY `bets` ASC');
		$leaderboard = $sql_leaderboard->fetchAll(PDO::FETCH_ASSOC);*/
	
		$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page);
		echo $page_request;
		return;
	
	case 'profile':
			if(!$user) {
				$page_request = getTemplatePage($names_pages[$page], $page, 'login', $array_page);
				echo $page_request;
				return;
			}
			$DataBase->Query('SELECT * FROM `referral_codes` WHERE `userid` = :userid');
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Execute();

			if($DataBase->RowCount() > 0) {
				$row_referral = $DataBase->Single();
				$affiliates['collected'] = $row_referral['collected'];
				$affiliates['available'] = $row_referral['available'];
			}
		
			$affiliates['commission_wagered'] = 0;
			$affiliates['commission_deposited'] = 0;
			$affiliates['deposited'] = 0;
		
			$DataBase->Query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount` FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = :userid GROUP BY referral_uses.referral');
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Execute();

			if($DataBase->RowCount() > 0) {
				$row_deposited = $DataBase->Single();
				$affiliates['deposited'] = $row_deposited['amount'];
			}

			$DataBase->Query("SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, COALESCE(SUM(referral_deposited.commission), 0) AS `commission`, referral_uses.userid FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.userid = referral_deposited.userid WHERE referral_uses.referral = :userid AND (COALESCE(referral_deposited.referral, :useridd) = :useriddd) GROUP BY referral_uses.userid ORDER BY `amount` DESC LIMIT 50");
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Bind(":useridd", $user['userid']);
			$DataBase->Bind(":useriddd", $user['userid']);
			$DataBase->Execute();
			$affiliates_deposited = $DataBase->ResultSet();
			
			
			$DataBase->Query('SELECT COALESCE(SUM(referral_wagered.amount), 0) AS `amount`, COALESCE(SUM(referral_wagered.commission), 0) AS `commission`, referral_uses.userid FROM `referral_uses` LEFT JOIN `referral_wagered` ON referral_uses.userid = referral_wagered.userid WHERE referral_uses.referral = :userid AND COALESCE(referral_wagered.referral, :useridd) = :useriddd GROUP BY referral_uses.userid ORDER BY `amount` DESC LIMIT 50');
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Bind(":useridd", $user['userid']);
			$DataBase->Bind(":useriddd", $user['userid']);
			$DataBase->Execute();
			$affiliates_wagered = $DataBase->ResultSet();
		
			$affiliates_referral = array();
			foreach($affiliates_deposited as $key => $value){
				$DataBase->Query('SELECT avatar, name FROM users WHERE userid = :userid');
				$DataBase->Bind(":userid", $user['userid']);
				$DataBase->Execute();

				if($DataBase->RowCount() > 0) {
					$userdatamore2 = $DataBase->Single();
					$affiliates_referral[$value['userid']]['avatar'] = $userdatamore2['avatar'];
					$affiliates_referral[$value['userid']]['name'] = $userdatamore2['name'];
				}
		
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
		
			$DataBase->Query('SELECT * FROM `users_transfers` WHERE `to_userid` = :userid OR `from_userid` = :useridd ORDER BY `id` DESC LIMIT 50');
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Bind(":useridd", $user['userid']);
			$DataBase->Execute();

			$transfers = $DataBase->ResultSet();
		
			$DataBase->Query('SELECT * FROM `withdraws` WHERE `userid` = :userid ORDER BY `id` DESC LIMIT 50');
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Execute();
			$crypto = $DataBase->ResultSet();
		
			$DataBase->Query('SELECT `amount`, `service` FROM `users_transactions` WHERE `userid` = :userid');
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Execute();
			$stats = $DataBase->ResultSet();
		
			$DataBase->Query('SELECT * FROM `users_transactions` WHERE `userid` = :userid ORDER BY `id` DESC LIMIT 50');
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Execute();
			$transactions = $DataBase->ResultSet();
		
			$DataBase->Query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = :deposit AND `userid` = :userid');
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Bind(":deposit", "deposit");
			$DataBase->Execute();
			$deposits = $DataBase->Single();
		
			$DataBase->Query('SELECT SUM(amount) AS `total`, COUNT(amount) AS `count` FROM `users_trades` WHERE `type` = :deposit AND `userid` = :userid');
			$DataBase->Bind(":userid", $user['userid']);
			$DataBase->Bind(":deposit", "withdraw");
			$DataBase->Execute();

			$withdraws = $DataBase->Single();
		
			$balance = 0;
		
			if(sizeof($transactions) > 0){
				if(array_reverse($transactions)[0]['id'] > 0){
					$DataBase->Query('SELECT SUM(amount) AS `balance` FROM `users_transactions` WHERE `userid` = :userid AND `id` < :trans');
					$DataBase->Bind(":userid", $user['userid']);
					$DataBase->Bind(":trans", array_reverse($transactions)[0]['id']);
					$DataBase->Execute();
					$row8 = $DataBase->Single();

					$balance = $row8['balance'];
				}
			}
		
			$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('affiliates' => $affiliates, 'stats' => array('transfers' => $transfers, 'offers_crypto' => $crypto, 'transactions' => $transactions, 'balance' => $balance, 'stats' => $stats, 'deposits' => $deposits, 'withdraws' => $withdraws, 'affiliates' => $affiliates_referral)));
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
			
				$DataBase->Query('SELECT * FROM `referral_codes` WHERE `userid` = :userid');
				$DataBase->Bind(":userid", $user['userid']);
				$DataBase->Execute();

				if($DataBase->RowCount() > 0) {
					$row_referral = $DataBase->Single();
					$rewards['rewards']['referral_have'] = 1;
					$rewards['rewards']['referral_code'] = $row_referral['code'];
				}
			
				$DataBase->Query('SELECT * FROM `referral_uses` WHERE `userid` = :userid');
				$DataBase->Bind(":userid", $user['userid']);
				$DataBase->Execute();

				$rewards['rewards']['collected_code'] = 0;
			
				if($DataBase->RowCount() > 0) {
					$row_code = $DataBase->Single();
					$rewards['rewards']['collected_code'] = 1;
			
					$DataBase->Query('SELECT * FROM `users` WHERE `userid` = :userid');
					$DataBase->Bind(":userid", $row_code['referral']);
					$DataBase->Execute();
					$row_referral_owner = $DataBase->Single();
			
					$rewards['rewards']['referral_owner'] = $row_referral_owner['name'];
				}
			
				$DataBase->Query('SELECT * FROM `users_rewards` WHERE `reward` = :reward AND `userid` = :userid');
				$DataBase->Bind(":userid", $user['userid']);
				$DataBase->Bind(":reward", "google");
				$DataBase->Execute();
				$rewards['rewards']['collected_google'] = $DataBase->RowCount();

				$DataBase->Query('SELECT * FROM `users_rewards` WHERE `reward` = :reward AND `userid` = :userid');
				$DataBase->Bind(":userid", $user['userid']);
				$DataBase->Bind(":reward", "facebook");
				$DataBase->Execute();
				$rewards['rewards']['collected_facebook'] = $DataBase->RowCount();

				$DataBase->Query('SELECT * FROM `users_rewards` WHERE `reward` = :reward AND `userid` = :userid');
				$DataBase->Bind(":userid", $user['userid']);
				$DataBase->Bind(":reward", "steam");
				$DataBase->Execute();
				$rewards['rewards']['collected_steam'] = $DataBase->RowCount();

				$DataBase->Query('SELECT * FROM `users_rewards` WHERE `reward` = :reward AND `userid` = :userid');
				$DataBase->Bind(":userid", $user['userid']);
				$DataBase->Bind(":reward", "name");
				$DataBase->Execute();
				$rewards['rewards']['collected_name'] = $DataBase->RowCount();

				$DataBase->Query('SELECT * FROM `users_rewards` WHERE `reward` = :reward AND `userid` = :userid');
				$DataBase->Bind(":userid", $user['userid']);
				$DataBase->Bind(":reward", "group");
				$DataBase->Execute();

				$rewards['rewards']['collected_group'] = $DataBase->RowCount();
			
				$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('rewards' => $rewards));
				echo $page_request;
				return;
			

			case 'deposit':
					if(!$user) return header('location: ./');

					$location = $page;
				
					if(isset($paths[1])){
						switch($paths[1]){
				
							case 'currency':
								if(isset($paths[2])){
									$methodes = array('btc', 'eth', 'ltc', 'bch', 'sol');
									if(in_array($paths[2], $methodes)){
										$crypto_addresses = array('BTC' => null, 'ETH' => null, 'LTC' => null, 'BCH' => null, 'SOL' => null);
										
										$DataBase->Query('SELECT * FROM `crypto_addresses` WHERE `userid` = :userid');
										$DataBase->Bind(":userid", $user['userid']);
										$DataBase->Execute();
										$row = $DataBase->ResultSet();
				
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
				
							default:
								header('location: ' . $root . 'deposit');
								exit();
				
								break;
						}
					}
				
					$page_request = getTemplatePage($names_pages[$page], $page, $location, $array_page);
					echo $page_request;
					return;
			case 'metamask':
				if(!$user) return header('location: ./');

				$location = $page;
				$tokens = array();

				foreach ($Metamask->Tokens() as $key => $token) {
					$tokens[] = array(
						"name" => $token["name"],
						"short" => $token["short"],
						"contractaddr" => $token["contractaddr"],
						"abi" => $token["contractabi"],
						"gas" => $token["gas"],
						"receiveaddr" => $token["receiveaddr"]
					);
				}
				
				$page_request = getTemplatePage($names_pages[$page], $page, $location, $array_page, array("metamask" => $tokens));
				echo $page_request;
				return;
			case 'pix':
					if(!$user) return header('location: ./');

					$location = $page;
					$page_request = getTemplatePage($names_pages[$page], $page, $location, $array_page);
					echo $page_request;
					return;
			case 'stripe':
				if(!$user) return header('location: ./');

				$location = $page;
				$page_request = getTemplatePage($names_pages[$page], $page, $location, $array_page);
				echo $page_request;
				return;
			case 'paymentwall':
				if(!$user) return header('location: ./');

				$location = $page;
				$page_request = getTemplatePage($names_pages[$page], $page, $location, $array_page);
				echo $page_request;
				return;
			case 'nowpayments':
					if(!$user) return header('location: ./');

					$location = $page;
					$page_request = getTemplatePage($names_pages[$page], $page, $location, $array_page);
					echo $page_request;
					return;
			case 'withdraw':
					if(!$user) return header('location: ./');

					$location = $page;
				
					if(isset($paths[1])){
						switch($paths[1]){
				
							case 'currency':
								if(isset($paths[2])){
									$methodes = array('btc', 'eth', 'ltc', 'bch');
									if(in_array($paths[2], $methodes)){
										$crypto_addresses = array('BTC' => null, 'ETH' => null, 'LTC' => null, 'BCH' => null);
				
										$DataBase->Query('SELECT * FROM `crypto_addresses` WHERE `userid` = :userid');
										$DataBase->Bind(":userid", $user['userid']);
										$DataBase->Execute();
										$row = $DataBase->ResultSet();
				
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
			if(!$user) return header('location: ./');
		
			if(isset($_POST['new_ticket'])){
				// VARIABLES
				$title = $_POST['title'];
				$departament = intval($_POST['departament']);
				$message = $_POST['message'];
		
				// REPLACE
				$cens = array(
					'<','>'
				);
				$title = str_ireplace($cens, '', $title);
				$message = str_ireplace($cens, '', $message);
				$departament = str_ireplace($cens, '', $departament);
		
				// SET MODERATOR OR ADMIN OR OWNER FOR SEND
				if($departament == 2 || $departament == 3 || $departament == 5 || $departament == 6) {
					$DataBase->Query('SELECT `userid`, `name` FROM `users` WHERE `rank` = 1 || `rank` = 100');
				} else {
					$DataBase->Query('SELECT `userid`, `name` FROM `users` WHERE `rank` = 1 || `rank` = 2 || `rank` = 100');
				}
				$DataBase->Execute();
				$row_ranks = $DataBase->ResultSet();
				if(sizeof($row_ranks) > 0){
					$user_for = $row_ranks[rand(0, sizeof($row_ranks) - 1)];
					if($user_for['userid'] == $user['userid']) {
						if(sizeof($row_ranks) > 1) {
							while($user_for['userid'] == $user['userid']) {
								$user_for = $row_ranks[rand(0, sizeof($row_ranks) - 1)];
							}
						}
					}

					if(strlen($message) > 10 && strlen($title) > 0){
						if($departament >= 1 && $departament <= 6){
							
							// NEW SUPPORT
							$DataBase->Query("INSERT INTO `support_tickets` (`title`, `departament`, `to_userid`, `closed`, `to_name`, `from_userid`, `from_name`, `time`) VALUES (:title, :department, :userid, :closed, :toname, :useridd, :namee, :timee)");
		  
							$DataBase->Bind(":title", $title);
							$DataBase->Bind(":department", $departament);
							$DataBase->Bind(":userid", $user['userid']);
							$DataBase->Bind(":closed", 0);
							$DataBase->Bind(":toname", $user_for['name']);
							$DataBase->Bind(":useridd", $user['userid']);
							$DataBase->Bind(":namee", $user['name']);
							$DataBase->Bind(":timee", time());
							$DataBase->Execute();
							
							$DataBase->Query("SELECT * FROM support_tickets WHERE from_userid = :userid ORDER BY time DESC LIMIT 1;");
							$DataBase->Bind(":userid", $user['userid']);
							$DataBase->Execute();
							$ticket = $DataBase->Single();

							$DataBase->Query("INSERT INTO `support_messages` (`support_id`, `message`, `userid`, `name`, `avatar`, `response`, `time`) VALUES (:tid, :messages, :userid, :tname, :avatar, :response, :timee)");
							$DataBase->Bind(":tid", $ticket["id"]);
							$DataBase->Bind(":messages", $message);
							$DataBase->Bind(":userid", $user['userid']);
							$DataBase->Bind(":tname", $user['name']);
							$DataBase->Bind(":avatar", $user['avatar']);
							$DataBase->Bind(":response", 0);
							$DataBase->Bind(":timee", time());
							$DataBase->Execute();
						}
					}
				}
		
				// RETURN TO SUPPORT
				header('Location: ' . $root . 'support');
				exit();
			} else if(isset($_POST['reply_ticket'])){
				// VARIABLES
				$id = $_GET['id'];
				$message = $_POST['message'];
		
				// GET DATES SUPPORT
				$DataBase->Query('SELECT * FROM `support_tickets` WHERE `id` = :tid');
				$DataBase->Bind(":tid", $id);
				$DataBase->Execute();
				$row_support = $DataBase->Single();
		
				// TEST SUPPORT
				if($row_support['closed'] == 0){
					if($row_support['from_userid'] == $user['userid'] || $row_support['to_userid'] == $user['userid']){
						if(strlen($message) > 0){
							// IF REPLY FROM FOR
							$response = 0; if($row_support['to_userid'] == $user['userid']) $response = 1;
		
							// TEST REPLY
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
		
							// SEND REPLY
							$DataBase->Query('INSERT INTO `support_messages` (`support_id`, `message`, `userid`, `name`, `avatar`, `response`, `time`) VALUES (:tid, :messages, :userid, :namee, :avatar, :response, :timee)');
		  					$DataBase->Bind(":tid", $id);
		  					$DataBase->Bind(":messages", $message);
		  					$DataBase->Bind(":userid", $user['userid']);
		  					$DataBase->Bind(":namee", $user['name']);
		  					$DataBase->Bind(":avatar", $user['avatar']);
		  					$DataBase->Bind(":response", $response);
		  					$DataBase->Bind(":timee", time());
		  					$DataBase->Execute();
		  
							$row_support = $DataBase->Single();
						}
					}
				}
		
				// RETURN TO SUPPORT
				header('Location: ' . $root . 'support');
				exit();
			} else if(isset($_POST['close_ticket'])){
				// VARIABLES
				$id = $_GET['id'];
		
				// GET DATES SUPPORT
				$DataBase->Query('SELECT * FROM `support_tickets` WHERE `id` = :id');
				$DataBase->Bind(":id", $id);
				$DataBase->Execute();
				$row_support = $DataBase->Single();
		
				// TEST SUPPORT
				if($row_support['closed'] == 0){
					if($row_support['from_userid'] == $user['userid'] || $row_support['to_userid'] == $user['userid'] || $user['rank'] == 100){
						$DataBase->Query('UPDATE `support_tickets` SET `closed` = 1 WHERE `id` = :id');
						$DataBase->Bind(":id", $id);
						$DataBase->Execute();
					}
				}
		
				// RETURN TO SUPPORT
				header('Location: ' . $root . 'support');
				exit();
			} else if(isset($_POST['another_department'])){
				// VARIABLES
				$id = $_GET['id'];
				$departament = intval($_POST['new_departament']);
		
				// GET DATES SUPPORT
				$sql_support = $DataBase->Query('SELECT * FROM `support_tickets` WHERE `id` = '.$DataBase->Quote($id));
				$row_support = $sql_support->Fetch(PDO::FETCH_ASSOC);
		
				// TEST SUPPORT
				if($row_support['closed'] == 0){
					if($row_support['to_userid'] == $user['userid'] || $user['rank'] == 100){
						if($departament >= 1 && $departament <= 6){
							$header_msg = '<span style="color: var(--site-color-main-light);">Greetings '.$row_support['from_name'].', <br><br></span>';
							$message = 'I have gone ahead and sent your ticket to the proper department for further assistance.';
							$footed_msg = '<br><br><span style="color: var(--site-color-main-light);">All the best,<br>'.$user['name'].'</span>';
		
							$message = $header_msg.$message.$footed_msg;
		
							// SET MODERATOR OR ADMIN OR OWNER FOR SEND
							if($departament == 2 || $departament == 3 || $departament == 5 || $departament == 6) {
								$DataBase->Query('SELECT `userid`, `name` FROM `users` WHERE `rank` = 1 || `rank` = 100');
							} else {
								$DataBase->Query('SELECT `userid`, `name` FROM `users` WHERE `rank` = 1 || `rank` = 2 || `rank` = 100');
							}
							$DataBase->Execute();
							$row_ranks = $DataBase->ResultSet();
							if(sizeof($row_ranks) > 0){
								$user_for = $row_ranks[rand(0, sizeof($row_ranks) - 1)];
								if($user_for['userid'] == $user['userid']) {
									if(sizeof($row_ranks) > 1) {
										while($user_for['userid'] == $user['userid']) {
											$user_for = $row_ranks[rand(0, sizeof($row_ranks) - 1)];
										}
									}
								}
		
								// REDIRECT DEPARTMENT
								$DataBase->Query('UPDATE `support_tickets` SET `departament` = :department, `to_userid` = :userid, `to_name` = :namee WHERE `id` = :id');
								$DataBase->Bind(":department", $departament);
								$DataBase->Bind(":userid", $user_for['userid']);
								$DataBase->Bind(":namee", $user_for['name']);
								$DataBase->Bind(":id", $id);
								$DataBase->Execute();
								// SEND REPLY
								$DataBase->Query('INSERT INTO `support_messages` SET `support_id` = :id, `message` = :messages, `userid` = :userid, `name` = :namee, `avatar` = :avatar, `response` = 1, `time` = :timee');
								$DataBase->Bind(":id", $id);
								$DataBase->Bind(":messages", $message);
								$DataBase->Bind(":userid", $user_for['userid']);
								$DataBase->Bind(":namee", $user_for['name']);
								$DataBase->Bind(":avatar", $user['avatar']);
								$DataBase->Bind(":timee", time());
								$DataBase->Execute();
							}
						}
					}
				}
		
				// RETURN TO SUPPORT
				header('Location: ' . $root . 'support');
				exit();
			}
		
			if($user['rank'] == 100) {
				$DataBase->Query('SELECT * FROM `support_tickets` WHERE `from_userid` = :id || `to_userid` > 0 ORDER BY `id` DESC');
				$DataBase->Bind(":id", $user['userid']);
			} else {
				$DataBase->Query('SELECT * FROM `support_tickets` WHERE `from_userid` = :id || `to_userid` = :userid ORDER BY `id` DESC');
				$DataBase->Bind(":id", $user['userid']);
				$DataBase->Bind(":userid", $user['userid']);
			}
			$DataBase->Execute();
			$row_support = $DataBase->ResultSet();
			$support = $row_support;
		
			if($user['rank'] == 100) {
				$DataBase->Query('SELECT support_messages.id, `support_id`, `message`, support_messages.userid, support_messages.name, support_messages.avatar, `response`, support_messages.time FROM `support_messages` INNER JOIN `support_tickets` ON support_messages.support_id = support_tickets.id WHERE support_tickets.from_userid = '.$DataBase->Quote($user['userid']).' || support_tickets.to_userid > 0');
			} else { 
				$DataBase->Query('SELECT support_messages.id, `support_id`, `message`, support_messages.userid, support_messages.name, support_messages.avatar, `response`, support_messages.time FROM `support_messages` INNER JOIN `support_tickets` ON support_messages.support_id = support_tickets.id WHERE support_tickets.from_userid = '.$DataBase->Quote($user['userid']).' || support_tickets.to_userid = '.$DataBase->Quote($user['userid']));
			}
			$DataBase->Execute();
			$row_tickets = $DataBase->ResultSet();
			$tickets = $row_tickets;
		
			$page_request = getTemplatePage($names_pages[$page], $page, $page, $array_page, array('support'=>$support, 'tickets'=>$tickets)); // SUPPORT
			echo $page_request;
			return;
		
		
		case 'history':
				$DataBase->Query('SELECT `id`, `hash`, `secret`, `roll` FROM `roulette_rolls` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
				$DataBase->Execute();
				$roulette = $DataBase->ResultSet();
			
				$DataBase->Query('SELECT `id`, `hash`, `secret`, `point` FROM `crash_rolls` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
				$DataBase->Execute();
				$crash = $DataBase->ResultSet();
			
				$DataBase->Query('SELECT `id`, `hash`, `secret`, `percentage` FROM `jackpot_history` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
				$DataBase->Execute();
				$jackpot = $DataBase->ResultSet();
			
				 $DataBase->Query('SELECT `id`, `hash`, `secret`, `percentage` FROM `coinflip_games` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
				$DataBase->Execute();
				$coinflip = $DataBase->ResultSet();
			
				$DataBase->Query('SELECT `id`, `hash`, `secret`, `roll` FROM `dice_bets` ORDER BY `id` DESC LIMIT 50');
				$DataBase->Execute();
				$dice = $DataBase->ResultSet();
			
				$DataBase->Query('SELECT `id`, `hash`, `secret`, `percentage` FROM `unbox_opens` ORDER BY `id` DESC LIMIT 50');
				$DataBase->Execute();
				$unbox = $DataBase->ResultSet();
			
				 $DataBase->Query('SELECT `id`, `hash`, `secret`, `value` FROM `minesweeper_bets` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
				$DataBase->Execute();
				$minesweeper = $DataBase->ResultSet();
			
				$DataBase->Query('SELECT `id`, `hash`, `secret`, `value` FROM `tower_bets` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 50');
				$DataBase->Execute();
				$tower = $DataBase->ResultSet();
			
				$DataBase->Query('SELECT `id`, `hash`, `secret`, `value` FROM `plinko_bets` ORDER BY `id` DESC LIMIT 50');
				$DataBase->Execute();
				$plinko = $DataBase->ResultSet();
			
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
				
				$User->auth_authByLogin(array( 'username' => $username, 'password' => $password ), function($err1, $session = array()){
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
				
				$User->auth_authByRegister(array( 'email' => $email, 'username' => $username, 'password' => $password ), function($err1, $session = array()){
					if($err1) exit(json_encode(array('success' => false, 'error' => $err1)));
						
					setcookie('session', $session['session'], $session['expire'], $GLOBALS['root']);
					exit(json_encode(array('success' => true, 'refresh' => true)));
				});
			
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
				
				// require_once 'openid/google/vendor/autoload.php'; // original, does not work
				// require_once 'vendor/google/auth/autoload.php';
				require_once 'google/vendor/autoload.php';
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
							$User->auth_bindAccount(array( 'user' => $user, 'bind' => 'google', 'bindid' => $id ), function($err1){
								if($err1) exit($err1);
							});
						} else {
							$User->auth_authByGoogle(array( 'id' => $id, 'email' => $email, 'name' => $name, 'avatar' => $avatar ), function($err1, $session = array()){
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
				
				$User->auth_logoutUserDevices(array( 'session' => $session, 'devices' => $devices ), function($err1){
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
				
				$User->auth_changePassword(array( 'user' => $user, 'current_password' => $current_password, 'password' => $password, 'confirm_password' => $confirm_password ), function($err1){
					if($err1) exit(json_encode(array('success' => false, 'error' => $err1)));
						
					exit(json_encode(array('success' => true, 'refresh' => false, 'message' => array('have' => true, 'message' => 'Your password has been changed!'))));
				});
					
				break;
				
			case 'recover':
				if($user) return header('location: ' . $root);
			
				$key = $_GET['key'];
				
				$DataBase->Query('SELECT * FROM `link_keys` WHERE `key` = :key AND `expire` > :time AND `used` = 0');
				$DataBase->Bind(":key", $key);
				$DataBase->Bind(":time", time());
				$DataBase->Execute();

				if($DataBase->RowCount() > 0) {
					$row1 = $DataBase->Single();

					$DataBase->Query('SELECT * FROM `users` WHERE `userid` = :uid');
					$DataBase->Bind(":uid", $row1['userid']);
					$DataBase->Execute();

					if($DataBase->RowCount() > 0) {
						$row2 = $DataBase->Single();

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
				
				$User->auth_accountInitializing(array( 'user' => $user, 'username' => $username, 'email' => $email, 'password' => $password, 'confirm_password' => $confirm_password ), function($err1){
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
	if($in1 != null) {
		extract($in1);
	}
	if($in2 != null) {
		extract($in2);
	}
	ob_start();
	include 'template/page2.tpl';
	$text = ob_get_clean();
	return $text;
}

function getTemplatePageM($name, $page, $name_page, $in1 = null, $in2 = null) {
	if($in1 != null) {
		extract($in1);
	}
	if($in2 != null) {
		extract($in2);
	}
	ob_start();
	require_once $_SERVER["DOCUMENT_ROOT"].'/core/pages/'.$name_page.'.php';
	$text = ob_get_clean();
	return $text;
}

<?php
//**************************************************//
// FOR CUSTOM GAMBLING SITES CONTACT US ON TELEGRAM //
//**************************************************//
// 	 MortalSoft Telegram https://t.me/mortalsoft    //
//   RENT YOUR SLOTS API https://mortalsoft.online  //
//**************************************************//

$port = 2053;
$root = '/';
$path = $_GET['page'];

$sitename = 'demo.gg';
$sitekeywords = 'jackpot, coinflip, csgo, cs, go, global, offensive, cs:go, vgo, csgocoinflip, csgocoinflip, csgosite, vgocoinflip, vgocoinflip, vgosite, site, vgokingdom, kingdom, bet, gambling, gamble, fair, best, great, csgoempire, csgoatse, csgo500, crypto, btc, eth, roulette, experience';
$siteauthor = 'MortalSoft';
$siteurl = "https://demo.gg";
$sitedescription = $sitename.' - The world of high stakes';

$api = "https://api-prod.mortalsoft.online";
$apiToken = ""; 

global $siteurl, $port, $api, $apiToken;

$names_pages = array(
	'landing' => 'Landing',
	'roulette' => 'Roulette', 
	'crash' => 'Crash', 
	'coinflip' => 'Coinflip', 
	'jackpot' => 'Jackpot', 
	'dice' => 'Dice',
	'unbox' => 'Unbox',
	'minesweeper' => 'Minesweeper',
	'tower' => 'Tower',
	'plinko' => 'Plinko',
	'profile' => 'Profile',
	'rewards' => 'Rewards',
	'deposit' => 'Deposit',
	'withdraw' => 'Withdraw',
	'tos' => 'Terms Of Service',
	'support' => 'Support',
	'fair' => 'Provably Fair',
	'faq' => 'Frequently Asked Questions',
	'maintenance' => 'Maintenance',
	'history' => 'History',
	'leaderboard' => 'Leaderboard',
	'banned' => 'Banned',
	'reset' => 'Reset Password',
	'home' => 'Home',
	'esport' => 'Esports',
	'esports' => 'Esports',
	'esports_csgo' => 'CS:GO Esports',
	'esports_dota2' => 'Dota 2 Esports',
	'slots' => 'Slots',
	'slots_game' => 'Slots'
);

$ranks_name = array('0' => 'member', '1' => 'admin', '2' => 'moderator', '3' => 'helper', '4' => 'veteran', '5' => 'pro', '6' => 'youtuber', '7' => 'streamer', '8' => 'developer', '100' => 'owner');

$banip_excluded = array('owner');
$ban_excluded = array('owner');
$maintenance_excluded = array('owner', 'developer', 'admin', 'moderator', 'helper');
$bonus_allowed = array('owner', 'admin');

$level_start = 500;
$level_next = 0.235;

$steam = array(
	'apikey' => '54F7F20FCBF2669DF84E03BD7813C21A'
);

$recaptcha = array(
	'sitekey' => '6Lc1mRgmAAAAAKuJ44_IzhJGhNPq4e3WFpFnqOyv'
);

$google = array(
	'client' => '984739083625-m4g8d5a421qdnpi756qvvosi6o8q11k6.apps.googleusercontent.com',
	'secret' => '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'
);

$rewards_amounts = array(
	'google' => 0.00,
	'facebook' => 0.00,
	'steam' => 0.00,
	'refferal_code' => 0.05,
	'daily_start' => 0.00,
	'daily_step' => 0.02
);

$referral_commission_deposit = 3.00;

$affiliates_requirement = array(0.00, 200.00, 500.00, 750.00, 1000.00, 2000.00, 3500.00, 5000.00, 7500.00, 10000.00);
$affiliates_commission = array('deposit' => 1, 'bet' => 2);

$info = $db->query('SELECT `maintenance`, `maintenance_message` FROM `info`');
$rowinfo = $info->fetch();
$maintenance = $rowinfo['maintenance'];
$maintenance_message = $rowinfo['maintenance_message'];

$bets1 = $db->query('SELECT SUM(`amount`) AS `bets` FROM `users_transactions` WHERE `userid` = '.$db->quote($user['userid']).' AND `amount` < 0');
$rowbets = $bets1->fetch();

//SOCIAL MEDIA
$link_steam = 'http://steamcommunity.com/groups/';
$link_twitter = 'https://twitter.com/';

//HAVE SUPPORTS ACTIVE
$sql_support = $db->query('SELECT COUNT(*) AS `countSupports` FROM `support_tickets` WHERE (`from_userid` = '.$db->quote($user['userid']).' || `to_userid` = '.$db->quote($user['userid']).') AND `closed` = 0 AND `from_userid` = (SELECT `userid` FROM `support_messages` WHERE `support_id` = support_tickets.id ORDER BY `id` DESC LIMIT 1)');
$row_support = $sql_support->fetchAll();

//TRANSITION
$sql_tWin = $db->query('SELECT SUM(`amount`) AS `win` FROM `users_transactions` WHERE `userid` = '.$db->quote($user['userid']).' AND `amount` > 0');
$row_tWin = $sql_tWin->fetch();

$sql_tBet = $db->query('SELECT SUM(`amount`) AS `bet` FROM `users_transactions` WHERE `userid` = '.$db->quote($user['userid']).' AND `amount` < 0');
$row_tBet = $sql_tBet->fetch();

//BINDS
$sql_binds = $db->query('SELECT `bind` FROM `users_binds` WHERE `removed` = 0 AND `userid` = '.$db->quote($user['userid']));
$row_binds = $sql_binds->fetchAll();

$user_binds = array('google' => false, 'facebook' => false, 'steam' => false);
foreach($row_binds as $key => $value) {
	$user_binds[$value['bind']] = true;
}

//CALLBACK
$rewards['amounts'] = $rewards_amounts;

$affiliates['requirement'] = $affiliates_requirement;
$affiliates['commission'] = $affiliates_commission;

$profile['binds'] = $user_binds;
$profile['bet'] = -$row_tBet['bet'];
$profile['win'] = $row_tWin['win'];
$profile['have_supports'] = $row_support[0]['countSupports'];
$profile['bets'] = -$rowbets['bets'];

$ip = $_SERVER['DOCUMENT_ROOT'];

$site['root'] = $root;
$site['port'] = $port;
$site['recaptcha'] = $recaptcha;
$site['path'] = $path;
$site['name'] = $sitename;
$site['ip'] = $ip;
$site['keywords'] = $sitekeywords;
$site['author'] = $siteauthor;
$site['url'] = $siteurl;
$site['description'] = $sitedescription;
$site['link_steam'] = $link_steam;
$site['link_twitter'] = $link_twitter;

$site['ranks_name'] = $ranks_name;
$site['permissions'] = array(
	'banip' => $banip_excluded,
	'ban' => $ban_excluded,
	'maintenance' => $maintenance_excluded,
	'bonus' => $bonus_allowed
);

?>

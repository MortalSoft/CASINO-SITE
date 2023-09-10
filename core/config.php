<?php
//**************************************************//
// FOR CUSTOM GAMBLING SITES CONTACT US ON TELEGRAM //
//**************************************************//
// 	 MortalSoft Telegram https://t.me/mortalsoft    //
//   RENT YOUR SLOTS API https://mortalsoft.online  //
//**************************************************//

require_once $_SERVER["DOCUMENT_ROOT"].'/core/sql.php';
require $_SERVER["DOCUMENT_ROOT"].'/core/libs/autoload.php';
require_once $_SERVER["DOCUMENT_ROOT"].'/core/loader.php';


$DataBase = new DataBase();
$User = new User();
$Other = new Other();
$Config = new Config();
$Metamask = new Metamask();

$Settings = $Config->settings();
$Config->check($Config->api("mortalsoft")["key"]);

$root = '/';
$path = $_GET['page'];
$port = $Settings["port"];

$sitename = $Settings["name"];
$sitekeywords = $Settings["keywords"];
$siteauthor = 'MortalSoft';
$siteurl = $Settings["url"];
$sitedescription = $sitename.' | '. $Settings["description"];
$metadesc = $Settings["metadesc"];

$rewards_amounts = array();
$names_pages = $Config->translation()["names_pages"];
$ranks_name = $Config->translation()["ranks"];

$referral_commission_deposit = $Settings["referralcomission"];

$affiliates_requirement = array();
$affiliates_commission = array('deposit' => $Settings["afcomdeposit"], 'bet' => $Settings["afcombet"]);

$banip_excluded = array();
$ban_excluded = array();
$maintenance_excluded = array();
$bonus_allowed = array();

global $DataBase, $Other, $Config, $Metamask, $siteurl, $port, $api, $apiToken;

$DataBase->Query("SELECT * FROM rewards");
$DataBase->Execute();

foreach($DataBase->ResultSet() as $ms => $row) {
   $rewards_amounts[$row["name"]] = floatval($row["reward"]);
}

$DataBase->Query("SELECT * FROM referral_requirements");
$DataBase->Execute();

foreach($DataBase->ResultSet() as $ms => $row) {
     $affiliates_requirement[] = floatval($row["req"]);
}

$level_start = $Settings["levelstart"];
$level_next = $Settings["levelnext"];

$maintenance = $Settings['maintenance'];
$maintenance_message = $Settings['maintenance_message'];

// SOCIAL MEDIA
$link_steam = $Settings["steam"];
$link_twitter = $Settings["twitter"];
$link_facebook = $Settings["facebook"];
$link_telegram = $Settings["telegram"];
$link_discord = $Settings["discord"];
$link_instagram = $Settings["instagram"];

$user_binds = array('google' => false, 'facebook' => false, 'steam' => false);
if(isset($user['userid'])) {
	foreach ($Config->bind($user['userid']) as $key => $value) {
    		$user_binds[$value['bind']] = true;
	}
}

$rewards['amounts'] = $rewards_amounts;

$affiliates['requirement'] = $affiliates_requirement;
$affiliates['commission'] = $affiliates_commission;

$profile['binds'] = $user_binds;
if(isset($user['userid'])) {
	$profile['bet'] = -$Config->bet()['bet'];
	$profile['win'] = $Config->win()['win'];
	$profile['have_supports'] = $Config->support()['countSupports'];
	$profile['bets'] = -$Config->bets()['bets'];
} else {
	$profile['bet'] = 0;
	$profile['win'] = 0;
	$profile['have_supports'] = 0;
	$profile['bets'] = 0;
}

$ipAddress = !empty($_SERVER['HTTP_CLIENT_IP'])
    ? $_SERVER['HTTP_CLIENT_IP']
    : (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])
        ? $_SERVER['HTTP_X_FORWARDED_FOR']
        : $_SERVER['REMOTE_ADDR']);

$ip = explode(',', $ipAddress)[0];
$ip = trim($ip);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
$site['root'] = $root;
$site['port'] = $port;
$site['recaptcha'] = $Config->api("recaptcha")["key"];
$site['path'] = $path;
$site['name'] = $sitename;
$site['ip'] = $ip;
$site['keywords'] = $sitekeywords;
$site['author'] = $siteauthor;
$site['url'] = $siteurl;
$site['description'] = $sitedescription;
$site['link_steam'] = $link_steam;
$site['link_twitter'] = $link_twitter;
$site['link_facebook'] = $link_facebook;
$site['link_telegram'] = $link_telegram;
$site['link_discord'] = $link_discord;
$site['link_instagram'] = $link_instagram;

$site['ranks_name'] = $ranks_name;
$site['permissions'] = array(
    'banip' => $banip_excluded,
    'ban' => $ban_excluded,
    'maintenance' => $maintenance_excluded,
    'bonus' => $bonus_allowed
);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
?>


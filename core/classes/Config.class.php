<?php

class Config
{

	public function settings() {
		global $DataBase;

		$DataBase->Query('SELECT * FROM `info`');
		$DataBase->Execute();
		$rowinfo = $DataBase->Single();

		return $rowinfo;
	}
	
	public function bets($uid) {
		global $DataBase;

		$DataBase->Query('SELECT SUM(`amount`) AS `bets` FROM `users_transactions` WHERE `userid` = '.$DataBase->Quote($user['userid']).' AND `amount` < 0');
		$DataBase->Execute();
		$rowbets = $DataBase->Single();

		return $rowbets;
	}

	public function support($uid) {
		global $DataBase;

		$DataBase->Query('SELECT COUNT(*) AS `countSupports` FROM `support_tickets` WHERE (`from_userid` = '.$DataBase->Quote($uid).' || `to_userid` = '.$DataBase->Quote($uid).') AND `closed` = 0 AND `from_userid` = (SELECT `userid` FROM `support_messages` WHERE `support_id` = support_tickets.id ORDER BY `id` DESC LIMIT 1)');
		$DataBase->Execute();
		$rowbets = $DataBase->Single();

		return $rowbets;
	}

	public function win($uid) {
		global $DataBase;

		$DataBase->Query('SELECT SUM(`amount`) AS `win` FROM `users_transactions` WHERE `userid` = '.$DataBase->Quote($uid).' AND `amount` > 0');
		$DataBase->Execute();
		$rowbets = $DataBase->Single();

		return $rowbets;
	}

	public function bet($uid) {
		global $DataBase;

		$DataBase->Query('SELECT SUM(`amount`) AS `bet` FROM `users_transactions` WHERE `userid` = '.$DataBase->Quote($uid).' AND `amount` < 0');
		$DataBase->Execute();
		$rowbets = $DataBase->Single();

		return $rowbets;
	}

	public function bind($uid) {
		global $DataBase;

		$DataBase->Query('SELECT `bind` FROM `users_binds` WHERE `removed` = 0 AND `userid` = '.$DataBase->Quote($uid));
		$row_binds = $sql_binds->ResultSet();
		return $row_binds;
	}

	public function api($name) {
		global $DataBase;

		$sql_binds = $DataBase->Query('SELECT * FROM `apis` WHERE `name` = :name');
		$DataBase->Bind(':name', $name);
		$DataBase->Execute();
		$row_binds = $DataBase->Single();
		
		return $row_binds;
	} 
	
	public function translation($language = "en") {
		$language = $this->settings()["lang"];

		$translations_file = $_SERVER["DOCUMENT_ROOT"]."/core/translations/" . $language . ".json";

		if (file_exists($translations_file)) {
   		 	$translations_data = file_get_contents($translations_file);
   		 	$translations = json_decode($translations_data, true);
		} else {
			$translations_file = $_SERVER["DOCUMENT_ROOT"]."/core/translations/en.json";
   		 	$translations_data = file_get_contents($translations_file);
   		 	$translations = json_decode($translations_data, true);
		}
		return $translations;
	}

	public function check($key) {
		$api_url = 'https://api-prod.mortalsoft.online/api/'.$key.'/license';
	
		$timestamp_file = $_SERVER["DOCUMENT_ROOT"].'/core/setup.json';
	
		if (file_exists($timestamp_file)) {
			$last_modified_time = filemtime($timestamp_file);
			if (time() - $last_modified_time < 0) {
				return;
			}
		}
	
		$api_response = file_get_contents($api_url);
		$license_data = json_decode($api_response, true);
	
		if ($license_data["original"]['valid']==true) {
			touch($timestamp_file);
		} else {
			$response = [
				"status" => 400,
				"msg" => "Invalid license. Site execution blocked."
			];
			header('Content-Type: application/json');
			echo json_encode($response);
			exit;
		}
	}
}
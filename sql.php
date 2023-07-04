<?php
	try {
		$db = new PDO('mysql:host=localhost;dbname=demo', 'demo_usr', 'password', array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
	} catch (PDOException $e) {
		exit($e->getMessage());
	}
?>
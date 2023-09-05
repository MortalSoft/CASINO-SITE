<?php
	if ($_SERVER['HTTP_HOST'] == 'localhost') {
		// Database for my localhost
		define("DB_HOST", "localhost"); 	// MySQL Database Host
		define("DB_USER", "root");			// MySQL Username
		define("DB_PASS", "");  			// MySQL Password
		define("DB_NAME", "rgb_gpanel");  	// Database Name
	} else {
		// Database for public
		define("DB_HOST", "localhost"); 	// MySQL Database Host
		define("DB_USER", "admin_demo");			// MySQL Username
		define("DB_PASS", "oulL3iZfU");  	// MySQL Password
		define("DB_NAME", "admin_demo");  		// Database Name
	}

       try {
		$db = new PDO('mysql:host=localhost;dbname=admin_demo', 'admin_demo', 'oulL3iZfU', array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
	} catch (PDOException $e) {
		exit($e->getMessage());
	}
?>
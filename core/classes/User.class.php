<?php

class User
{
    public function auth_authByLogin($data, $callback)
    {
	    global $DataBase, $Other;

        $crypted_password = hash("sha256", $data["password"]);

        $DataBase->Query("SELECT * FROM `users` WHERE (`email` = :username OR `username` = :usernamee) AND `password` = :crpassword");
        $DataBase->Bind(":username", $data["username"]);
        $DataBase->Bind(":usernamee", $data["username"]);
        $DataBase->Bind(":crpassword", $crypted_password);
        $DataBase->Execute();

        if ($DataBase->RowCount() <= 0) {
            return $callback("Invalid username/email or password"); //ERROR
        }

        $row1 = $DataBase->Single();

        $DataBase->Query("INSERT INTO `users_logins` SET `type` = :auth, `userid` = :userid, `ip` = :ip, `device` = :device, `location` = :loc, `time` = :timee");
        $DataBase->Bind(":auth", "auth_login");
        $DataBase->Bind(":userid", $row1["userid"]);
        $DataBase->Bind(":ip", $Other->getUserIp());
        $DataBase->Bind(":device", $Other->getUserDevice());
        $DataBase->Bind(":loc", $Other->getUserLocation($Other->getUserIp()));
        $DataBase->Bind(":timee",  time()); 
        
        if (!$DataBase->Execute()) {
            return $callback("User logged in with Auth unsuccessfully (1)"); //ERROR
        }

        if ($DataBase->RowCount() <= 0) {
            return $callback("User logged in with Auth unsuccessfully (2)"); //ERROR
        }

        return $this->auth_checkSession($row1["userid"], $callback);
    }

    public function auth_authByRegister($data, $callback)
    {
	    global $DataBase, $Other;

        $pattern_email = '/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w+$/';
        $pattern_username = '/^[a-z0-9_]{6,}$/';
        $pattern_password = '/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})$/';

        if (!preg_match($pattern_email, $data["email"])) {
            return $callback("Invalid e-mail. Invalid format e-mail"); //ERROR
        }

        if (!preg_match($pattern_username, $data["username"])) {
            return $callback(
                "Invalid username. At least 6 characters, only lowercase, numbers and underscore are allowed"
            ); //ERROR
        }

        if (!preg_match($pattern_password, $data["password"])) {
            return $callback(
                "Invalid password. At least 8 characters, one uppercase, one lowercase, one number and one symbol"
            ); //ERROR
        }

        $DataBase->Query("SELECT * FROM `users` WHERE `email` = :email");
        $DataBase->Bind(":email", $data["email"]);
        $DataBase->Execute();

        if ($DataBase->RowCount() > 0) {
            return $callback("E-mail already taken"); //ERROR
        }

        $DataBase->Query("SELECT * FROM `users` WHERE `username` = :username");
        $DataBase->Bind(":username", $data["username"]);
        $DataBase->Execute();

        if ($DataBase->RowCount() > 0) {
            return $callback("Username already taken"); //ERROR
        }

        $userid = $Other->generateHexCode(24);
        $crypted_password = hash("sha256", $data["password"]);

        $name = $data["username"];
        $avatar = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";

        $DataBase->Query("INSERT INTO `users` SET `verified` = 0, `initialized` = 1, `userid` = :userid, `username` = :username, `email` = :email, `password` = :crpassword, `name` = :namee, `avatar` = :avatar, `time_create` = :timee");
        $DataBase->Bind(":userid", $userid);
        $DataBase->Bind(":username", $data["username"]);
        $DataBase->Bind(":email", $data["email"]);
        $DataBase->Bind(":crpassword", $crypted_password);
        $DataBase->Bind(":namee", $name);
        $DataBase->Bind(":avatar", $avatar);
        $DataBase->Bind(":timee", time());

        if (!$DataBase->Execute()) {
            return $callback("User registered with Auth unsuccessfully (1)"); //ERROR
        }

        if ($DataBase->RowCount() <= 0) {
            return $callback("User registered with Auth unsuccessfully (2)"); //ERROR
        }

        $DataBase->Query("INSERT INTO `users_logins` SET `type` = :auth, `userid` = :userid, `ip` = :ip, `device` = :device, `location` = :loc, `time` = :timee");
        $DataBase->Bind(":auth", "auth_register");
        $DataBase->Bind(":userid", $userid);
        $DataBase->Bind(":ip", $Other->getUserIp());
        $DataBase->Bind(":loc", $Other->getUserLocation($Other->getUserIp()));
        $DataBase->Bind(":device", $Other->getUserDevice());
        $DataBase->Bind(":timee",  time()); 


        if (!$DataBase->Execute()) {
            return $callback("User registered with Auth unsuccessfully (3)"); //ERROR
        }

        if ($DataBase->RowCount() <= 0) {
            return $callback("User registered with Auth unsuccessfully (4)"); //ERROR
        }

        $DataBase->Query("INSERT INTO `users_changes` SET `userid` = :userid, `change` = :email, `value` = :emval, `time` = :timee");
        $DataBase->Bind(":userid",  $userid); 
        $DataBase->Bind(":email",  "email"); 
        $DataBase->Bind(":emval",  $data["email"]); 
        $DataBase->Bind(":timee",  time()); 
        $DataBase->Execute();

        return $this->auth_checkSession($userid, $callback);
    }

    public function auth_authBySteam($data, $callback)
    {
	    global $DataBase, $Other;

        $DataBase->Query("SELECT `userid` FROM `users_binds` WHERE `bind` = :bind AND `bindid` = :bindid");
        $DataBase->Bind(":bind",  "steam"); 
        $DataBase->Bind(":bindid",  $data["id"]); 
        $DataBase->Execute();

        if ($DataBase->RowCount() > 0) {
            $row1 = $DataBase->Single();

            $DataBase->Query("UPDATE `users` SET `name` = :namee, `avatar` = :avatar, `steamid` = :id WHERE `userid` =  :userid");
            $DataBase->Bind(":namee",  $data["name"]); 
            $DataBase->Bind(":avatar",  $data["avatar"]); 
            $DataBase->Bind(":id",  $data["id"]); 
            $DataBase->Bind(":userid",  $row1["userid"]); 
            $DataBase->Execute();

            $DataBase->Query("INSERT INTO `users_logins` SET `type` = :auth, `userid` = :userid, `ip` = :ip, `device` = :device, `location` = :loc, `time` = :timee");
            $DataBase->Bind(":auth", "steam_login");
            $DataBase->Bind(":userid", $row1["userid"]);
            $DataBase->Bind(":ip", $Other->getUserIp());
            $DataBase->Bind(":loc", $Other->getUserLocation($Other->getUserIp()));
            $DataBase->Bind(":device", $Other->getUserDevice());
            $DataBase->Bind(":timee",  time()); 

            
            if (!$DataBase->Execute()) {
                return $callback(
                    "User logged in with Steam unsuccessfully (1)"
                ); //ERROR
            }

            if ($DataBase->RowCount() <= 0) {
                return $callback(
                    "User logged in with Steam unsuccessfully (2)"
                ); //ERROR
            }

            return $this->auth_checkSession($row1["userid"], $callback);
        } else {
            $userid = generateHexCode(24);
            $username = "user_" . generateHexCode(8);

            $DataBase->Query("INSERT INTO `users` SET `verified` = 1, `initialized` = 1, `userid` = :userid, `username` = :username, `steamid` = :steamid, `name` = :namee, `avatar` = :avatar, `time_create` = :timee");
            $DataBase->Bind(":userid", $userid);
            $DataBase->Bind(":username", $username);
            $DataBase->Bind(":steamid", $data["id"]);
            $DataBase->Bind(":namee", $data["name"]);
            $DataBase->Bind(":avatar", $data["avatar"]);
            $DataBase->Bind(":timee", time());

            if ($DataBase->Execute()) {
                return $callback(
                    "User registered with Steam unsuccessfully (1)"
                ); //ERROR
            }

            $DataBase->Query("INSERT INTO `users_binds` SET `userid` = :userid, `bind` = :bind, `bindid` = :bindid, `created` = :created");
            $DataBase->Bind(":userid", $userid);
            $DataBase->Bind(":bind", "steam");
            $DataBase->Bind(":bindid", $data["id"]);
            $DataBase->Bind(":created", time());
            $DataBase->Execute();

            if ($DataBase->rowCount() <= 0) {
                return $callback(
                    "User registered with Steam unsuccessfully (3)"
                ); //ERROR
            }

            $DataBase->Query("INSERT INTO `users_logins` SET `type` = :auth, `userid` = :userid, `ip` = :ip, `device` = :device, `location` = :loc, `time` = :timee");
            $DataBase->Bind(":auth", "steam_login");
            $DataBase->Bind(":userid", $userid);
            $DataBase->Bind(":ip", $Other->getUserIp());
            $DataBase->Bind(":loc", $Other->getUserLocation($Other->getUserIp()));
            $DataBase->Bind(":device", $Other->getUserDevice());
            $DataBase->Bind(":timee",  time()); 
            $DataBase->Execute();

            if ($DataBase->rowCount() <= 0) {
                return $callback(
                    "User registered with Steam unsuccessfully (5)"
                ); //ERROR
            }

            return $this->auth_checkSession($userid, $callback);
        }
    }

    public function auth_authByGoogle($data, $callback)
    {
	    global $DataBase, $Other;

        $DataBase->Query("SELECT `userid` FROM `users_binds` WHERE `bind` = :bind AND `bindid` = :bindid");
        $DataBase->Bind(":bind", "google");
        $DataBase->Bind(":bindid", $data["id"]);
        $DataBase->Execute();

        if ($DataBase->RowCount() > 0) {
            $row1 = $DataBase->Single();

            $DataBase->Query("UPDATE `users` SET `email` = :email, `name` = :namee, `avatar` = :avatar WHERE `userid` = :userid");
            $DataBase->Bind(":email", $data["email"]);
            $DataBase->Bind(":namee", $data["name"]);
            $DataBase->Bind(":avatar", $data["avatar"]);
            $DataBase->Bind(":userid", $row1["userid"]);
            $DataBase->Execute();

            $DataBase->Query("INSERT INTO `users_logins` SET `type` = :auth, `userid` = :userid, `ip` = :ip, `device` = :device, `location` = :loc, `time` = :timee");
            $DataBase->Bind(":auth", "google_login");
            $DataBase->Bind(":userid", $row1["userid"]);
            $DataBase->Bind(":ip", $Other->getUserIp());
            $DataBase->Bind(":loc", $Other->getUserLocation($Other->getUserIp()));
            $DataBase->Bind(":device", $Other->getUserDevice());
            $DataBase->Bind(":timee",  time()); 

            if (!$DataBase->Execute()) {
                return $callback(
                    "User logged in with Google unsuccessfully (1)"
                );
            }

            if ($DataBase->RowCount() <= 0) {
                return $callback(
                    "User logged in with Google unsuccessfully (2)"
                ); 
            }

            return $this->auth_checkSession($row1["userid"], $callback);
        } else {
            $DataBase->Query("SELECT * FROM `users` WHERE `email` = :email");
            $DataBase->Bind(":email", $data["email"]);
            $DataBase->Execute();

            if ($DataBase->RowCount() > 0) {
                $row2 = $DataBase->Single();

                $DataBase->Query("INSERT INTO `users_binds` SET `userid` = :userid, `bind` = :bind, `bindid` = :bindid, `created` = :timee");
                $DataBase->Bind(":userid", $row2["userid"]);
                $DataBase->Bind(":bind", "google");
                $DataBase->Bind(":bindid", $data["id"]);
                $DataBase->Bind(":timee", time());
                $DataBase->Execute();

                if ($DataBase->RowCount() <= 0) {
                    return $callback(
                        "User logged in and binded with Google unsuccessfully (1)"
                    ); //ERROR
                }

                $DataBase->Query("INSERT INTO `users_logins` SET `type` = :auth, `userid` = :userid, `ip` = :ip, `device` = :device, `location` = :loc, `time` = :timee");
                $DataBase->Bind(":auth", "google_login_bind");
                $DataBase->Bind(":userid", $row2["userid"]);
                $DataBase->Bind(":ip", $Other->getUserIp());
                $DataBase->Bind(":loc", $Other->getUserLocation($Other->getUserIp()));
                $DataBase->Bind(":device", $Other->getUserDevice());
                $DataBase->Bind(":timee",  time()); 
                $DataBase->Execute();

                if ($DataBase->RowCount() <= 0) {
                    return $callback(
                        "User logged in and binded with Google unsuccessfully (3)"
                    ); //ERROR
                }

                return auth_checkSession($row2["userid"], $callback);
            } else {
                $userid = generateHexCode(24);
                $username = "user_" . generateHexCode(8);

                $DataBase->Query("INSERT INTO `users` SET `verified` = 0, `userid` = :userid, `username` = :username, `email` = :email, `name` = :namee, `avatar` = :avatar, `time_create` = :timee");
                $DataBase->Bind(":userid", $userid);
                $DataBase->Bind(":username", $username);
                $DataBase->Bind(":email", $data["email"]);
                $DataBase->Bind(":namee", $data["name"]);
                $DataBase->Bind(":avatar", $data["avatar"]);
                $DataBase->Bind(":timee", time());
                $DataBase->Execute();

                if ($DataBase->RowCount() <= 0) {
                    return $callback(
                        "User registered with Google unsuccessfully (1)"
                    ); //ERROR
                }

                $DataBase->Query("INSERT INTO `users_binds` SET `userid` = :userid, `bind` = :bind, `bindid` = :bindid, `created` = :timee");
                $DataBase->Bind(":userid", $userid);
                $DataBase->Bind(":bind", "google");
                $DataBase->Bind(":bindid", $data["id"]);
                $DataBase->Bind(":timee", time());
                $DataBase->Execute();

                if ($DataBase->RowCount() <= 0) {
                    return $callback(
                        "User registered with Google unsuccessfully (3)"
                    ); //ERROR
                }

                $DataBase->Query("INSERT INTO `users_logins` SET `type` = :auth, `userid` = :userid, `ip` = :ip, `device` = :device, `location` = :loc, `time` = :timee");
                $DataBase->Bind(":auth", "google_register");
                $DataBase->Bind(":userid", $userid);
                $DataBase->Bind(":ip", $Other->getUserIp());
                $DataBase->Bind(":loc", $Other->getUserLocation($Other->getUserIp()));
                $DataBase->Bind(":device", $Other->getUserDevice());
                $DataBase->Bind(":timee",  time()); 
                $DataBase->Execute();

                if ($DataBase->RowCount() <= 0) {
                    return $callback(
                        "User registered with Google unsuccessfully (5)"
                    ); //ERROR
                }

                return $this->auth_checkSession($userid, $callback);
            }
        }
    }

    public function auth_bindAccount($data, $callback)
    {
	    global $DataBase;

        $allowed_binds = ["steam", "google"];

        if (!in_array($data["bind"], $allowed_binds)) {
            return $callback("Invalid bind");
        }

        $DataBase->Query("SELECT * FROM `users_binds` WHERE `userid` = :userid AND `bind` = :bind AND `removed` = 0");
        $DataBase->Bind(":userid",  $data["user"]["userid"]); 
        $DataBase->Bind(":bind",  $data["bind"]); 
        $DataBase->Execute();

        if ($DataBase->RowCount() > 0) {
            return $callback("Account is already binded");
        }

        $DataBase->Query("SELECT * FROM `users_binds` WHERE `bind` = :bind AND `bindid` = :bindid AND `removed` = 0");
        $DataBase->Bind(":bind",  $data["bind"]); 
        $DataBase->Bind(":bindid",  $data["bindid"]); 
        $DataBase->Execute();

        if ($DataBase->RowCount() > 0) {
            return $callback("Other account is already binded with your id");
        }

        $DataBase->Query("INSERT INTO `users_binds` SET `userid` = :userid, `bind` = :bind, `bindid` = :bindid, `created` = :timee");
        $DataBase->Bind(":userid",  $data["user"]["userid"]); 
        $DataBase->Bind(":bind",  $data["bind"]); 
        $DataBase->Bind(":bindid",  $data["bindid"]); 
        $DataBase->Bind(":timee",  time()); 
        $DataBase->Execute();

        if (!$DataBase->RowCount()) {
            return $callback("User binded unsuccessfully (1)"); //ERROR
        }

        return $callback(null);
    }

    public function auth_logoutUserDevices($data, $callback)
    {
	    global $DataBase;

        $DataBase->Query("SELECT * FROM `users_sessions` WHERE `expire` >= :timee AND `removed` = 0 AND `session` = :sesion" );
        $DataBase->Bind(":timee",  time()); 
        $DataBase->Bind(":sesion",  $data["session"]); 
        $DataBase->Execute();

        if ($DataBase->RowCount() <= 0) {
            return $callback(
                "User session already expired or it does not exist"
            ); //ERROR
        }

        if (!$data["devices"]) {
            return $callback(null);
        }

        $DataBase->Query("UPDATE `users_sessions` SET `removed` = 1 WHERE `expire` >= :timee AND `removed` = 0 AND `session` = :sesion");
        $DataBase->Bind(":timee",  time()); 
        $DataBase->Bind(":sesion",  $data["session"]); 
        $DataBase->Execute();

        if (!$DataBase->RowCount()) {
            return $callback(
                "User session already expired or it does not exist"
            ); //ERROR
        }

        return $callback(null);
    }

    public function auth_resetPassword($data, $callback)
    {
	    global $DataBase;

        if ($data["password"] != $data["confirm_password"]) {
            return $callback("The passwords do not match"); //ERROR
        }

        $pattern_password = '/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})$/';
        if (!preg_match($pattern_password, $data["password"])) {
            return $callback(
                "Invalid password. At least 8 characters, one uppercase, one lowercase, one number and one symbol"
            ); //ERROR
        }

        $this->auth_checkLinkKey(
            ["key" => $data["key"], "type" => "reset_password"],
            function ($err1, $userid) use ($callback, $data, $DataBase) {
                if ($err1) {
                    return $callback($err1); //ERROR
                }

                $crypted_password = hash("sha256", $data["password"]);

                $DataBase->Query("UPDATE `users` SET `password` = :pass WHERE `userid` = :userid");
                $DataBase->Bind(":pass",  $crypted_password); 
                $DataBase->Bind(":userid",  $userid); 
                $DataBase->Execute();

                $DataBase->Query("INSERT INTO `users_changes` SET `userid` = :userid, `change` = :change, `value` = :pass, `time` = :timee");
                $DataBase->Bind(":userid",  $userid); 
                $DataBase->Bind(":change",  "password"); 
                $DataBase->Bind(":pass",  $crypted_password); 
                $DataBase->Bind(":timee",  time()); 
                $DataBase->Execute();

                return $callback(null);
            }
        );
    }

    public function auth_verifyProfile($data, $callback)
    {
	    global $DataBase;

        $DataBase->Query("SELECT * FROM `users_sessions` WHERE `expire` >= :timee AND `removed` = 0 AND `session` = :sesion" );
        $DataBase->Bind(":timee",  time()); 
        $DataBase->Bind(":sesion",  $data["session"]); 
        $DataBase->Execute();

        if ($DataBase->RowCount() <= 0) {
            return $callback(
                "User session already expired or it does not exist"
            ); //ERROR
        }

        $row1 = $DataBase->Single();

        $DataBase->Query("SELECT * FROM `users` WHERE `userid` = :userid");
        $DataBase->Bind(":userid",  $row1["userid"]);
        $DataBase->Execute();

        if ($DataBase->RowCount() <= 0) {
            return $callback("Unknown user"); //ERROR
        }

        $row2 = $DataBase->Single();
        if (intval($row2["verified"]) == 1) {
            return $callback("Profile already verified"); //ERROR
        }

        $this->auth_checkLinkKey(
            ["key" => $data["key"], "type" => "verify_profile"],
            function ($err3, $userid) use ($callback, $DataBase) {
                if ($err3) {
                    return $callback($err3); //ERROR
                }

                $DataBase->Query("UPDATE `users` SET `verified` = 1 WHERE `userid` = :userid");
                $DataBase->Bind(":userid",  $userid);
                $DataBase->Execute();

                return $callback(null);
            }
        );
    }

    public function auth_accountInitializing($data, $callback)
    {
	    global $DataBase;

        $pattern_email = '/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w+$/';
        $pattern_username = '/^[a-z0-9_]{6,}$/';
        $pattern_password = '/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})$/';

        if (!preg_match($pattern_email, $data["email"])) {
            return $callback("Invalid e-mail. Invalid format e-mail"); //ERROR
        }
        if (!preg_match($pattern_username, $data["username"])) {
            return $callback(
                "Invalid username. At least 6 characters, only lowercase, numbers and underscore are allowed"
            ); //ERROR
        }
        if (!preg_match($pattern_password, $data["password"])) {
            return $callback(
                "Invalid password. At least 8 characters, one uppercase, one lowercase, one number and one symbol"
            ); //ERROR
        }
        if ($data["confirm_password"] != $data["password"]) {
            return $callback("Invalid password. The passwords do not match"); //ERROR
        }

        if (intval($data["user"]["initialized"]) == 1) {
            return $callback("Your account is already initialized"); //ERROR
        }

        $DataBase->Query("SELECT * FROM `users` WHERE `email` = :email");
        $DataBase->Bind(":email",  $data["email"]);
        $DataBase->Execute();

        if ($DataBase->RowCount() > 0) {
            $row1 = $DataBase->Single();
            if ($row1["userid"] != $data["user"]["userid"]) {
                return $callback("E-mail already taken"); //ERROR
            }
        }

        $DataBase->Query("SELECT * FROM `users` WHERE `username` = :username");
        $DataBase->Bind(":username",  $data["username"]);
        $DataBase->Execute();

        if ($DataBase->RowCount() > 0) {
            $row2 = $DataBase->Single();
            if ($row2["userid"] != $data["user"]["userid"]) {
                return $callback("Username already taken"); //ERROR
            }
        }

        $crypted_password = hash("sha256", $data["password"]);

        $DataBase->Query("UPDATE `users` SET `initialized` = 1, `username` = :username, `email` = :email, `password` = :crpass WHERE `userid` = :userid");
        $DataBase->Bind(":username",  $data["username"]);
        $DataBase->Bind(":email",  $data["email"]);
        $DataBase->Bind(":crpass",  $crypted_password);
        $DataBase->Bind(":userid",  $data["user"]["userid"]);
        $DataBase->Execute();

        $DataBase->Query("INSERT INTO `users_changes` SET `userid` = :userid, `change` = :change, `value` = :email, `time` = :timee");
        $DataBase->Bind(":userid",  $data["user"]["userid"]);
        $DataBase->Bind(":change",  "email");
        $DataBase->Bind(":email",  $data["email"]);
        $DataBase->Bind(":timee",  time());
        $DataBase->Execute();

        $DataBase->Query("INSERT INTO `users_changes` SET `userid` = :userid, `change` = :change, `value` = :email, `time` = :timee");
        $DataBase->Bind(":userid",  $data["user"]["userid"]);
        $DataBase->Bind(":change",  "username");
        $DataBase->Bind(":email",  $data["username"]);
        $DataBase->Bind(":timee",  time());
        $DataBase->Execute();

        $DataBase->Query("INSERT INTO `users_changes` SET `userid` = :userid, `change` = :change, `value` = :email, `time` = :timee");
        $DataBase->Bind(":userid",  $data["user"]["userid"]);
        $DataBase->Bind(":change",  "password");
        $DataBase->Bind(":email",  $crypted_password);
        $DataBase->Bind(":timee",  time());
        $DataBase->Execute();

        return $callback(null);
    }

    public function auth_changePassword($data, $callback)
    {
	    global $DataBase;

        $pattern_password = '/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})$/';

        if (!preg_match($pattern_password, $data["current_password"])) {
            return $callback(
                "Invalid current password. At least 8 characters, one uppercase, one lowercase, one number and one symbol"
            ); //ERROR
        }
        if (!preg_match($pattern_password, $data["password"])) {
            return $callback(
                "Invalid new password. At least 8 characters, one uppercase, one lowercase, one number and one symbol"
            ); //ERROR
        }
        if ($data["confirm_password"] != $data["password"]) {
            return $callback("Invalid password. The passwords do not match"); //ERROR
        }

        $crypted_current_password = hash("sha256", $data["current_password"]);
        if ($crypted_current_password != $data["user"]["password"]) {
            return $callback("Invalid current password. Wrong password"); //ERROR
        }

        $crypted_new_password = hash("sha256", $data["password"]);
        if ($crypted_new_password == $data["user"]["password"]) {
            return $callback("Invalid new password. Same password"); //ERROR
        }

        $DataBase->Query("UPDATE `users` SET `password` = :pass WHERE `userid` = :userid");
        $DataBase->Bind(":pass",  $crypted_new_password);
        $DataBase->Bind(":userid",  $data["user"]["userid"]);
        $DataBase->Execute();

        $DataBase->Query("INSERT INTO `users_changes` SET `userid` = :userid, `change` = :change, `value` = :email, `time` = :timee");
        $DataBase->Bind(":userid",  $data["user"]["userid"]);
        $DataBase->Bind(":change",  "password");
        $DataBase->Bind(":email",  $crypted_new_password);
        $DataBase->Bind(":timee",  time());
        $DataBase->Execute();

        return $callback(null);
    }

    public function auth_checkSession($userid, $callback)
    {
	    global $DataBase;

        $DataBase->Query("SELECT * FROM `users_sessions` WHERE `expire` > :timee AND `removed` = 0 AND `userid` = :userid ORDER BY `id` DESC LIMIT 1");
        $DataBase->Bind(":timee",  time());
        $DataBase->Bind(":userid",  $userid);
        $DataBase->Execute();

        if ($DataBase->RowCount() <= 0) {
            return $this->auth_insertSession($userid, $callback);
        }

        $row1 = $DataBase->Single();

        $session = $row1["session"];
        $expire = $row1["expire"];

        return $callback(null, ["session" => $session, "expire" => $expire]);
    }

    public function auth_insertSession($userid, $callback)
    {
	    global $DataBase, $Other;

        $session = $Other->generateHexCode(32);
        $expire = time() + 3600 * 24;

        $DataBase->Query("INSERT INTO `users_sessions` SET `userid` = :userid, `session` = :sesion, `expire` = :expire, `created` = :timee");
        $DataBase->Bind(":userid",  $userid);
        $DataBase->Bind(":sesion",  $session);
        $DataBase->Bind(":expire",  $expire);
        $DataBase->Bind(":timee",  time());

        $DataBase->Execute();

        return $callback(null, ["session" => $session, "expire" => $expire]);
    }

    public function auth_checkLinkKey($data, $callback)
    {
	    global $DataBase;

        $DataBase->Query("SELECT * FROM `link_keys` WHERE `type` = :typee AND `key` = :keyy AND `used` = 0 AND `removed` = 0 AND (`expire` > :timee OR `expire` = -1)");
        $DataBase->Bind(":typee",  $data["type"]);
        $DataBase->Bind(":keyy",  $data["key"]);
        $DataBase->Bind(":timee",  time());
        $DataBase->Execute();

        if ($DataBase->RowCount() <= 0) {
            return $callback("Key already expired or does not exist (1)"); //ERROR
        }
        $row1 = $DataBase->Single();

        $DataBase->Query("UPDATE `link_keys` SET `used` = 1 WHERE `type` = :typee AND `key` = :keyy AND `used` = 0 AND `removed` = 0 AND (`expire` > :timee OR `expire` = -1)");
        $DataBase->Bind(":typee",  $data["type"]);
        $DataBase->Bind(":keyy",  $data["key"]);
        $DataBase->Bind(":timee",  time());

        $DataBase->Execute();

        $DataBase->Query("UPDATE `link_keys` SET `removed` = 1 WHERE `type` = :typee AND `userid` = :userid AND `used` = 0 AND `removed` = 0 AND (`expire` > :timee OR `expire` = -1)");
        $DataBase->Bind(":typee",  $data["type"]);
        $DataBase->Bind(":userid",  $row1["userid"]);
        $DataBase->Bind(":timee",  time());

        $DataBase->Execute();

        return $callback(null, $row1["userid"]);
    }

    public function isAdmin($rank) {
        if(!isset($rank) || $rank == 0) {
            return false;
        } else {
            return true;
        }
    }
    
    public function FindUserByCookie($cookie) {
            global $DataBase;

            $DataBase->Query('SELECT * FROM `users` INNER JOIN `users_sessions` ON users.userid = users_sessions.userid WHERE users_sessions.session = :session AND users_sessions.removed = 0 AND users_sessions.expire >= :expire');
            $DataBase->Bind(":session", $cookie);
            $DataBase->Bind(":expire", time());
            $DataBase->Execute();
        
            if ($DataBase->RowCount() != 0) {
                $row = $DataBase->Single();
        
                if ($cookie == $row['session']) {
                    return $row;
                } else {
                    return false;
                }
            } else {
                return false;
            }
    }

    public function FindUserByID($id) {
        global $DataBase;

        $DataBase->Query('SELECT * FROM `users` WHERE userid = :userid');
        $DataBase->Bind(":userid", $id);
        $DataBase->Execute();
        
        return $DataBase->Single();
    }
}
?>

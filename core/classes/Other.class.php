<?php

class Other {
    public function roundedToFixed($number, $decimals) {
        $number = round($number, 5);

        $number_string = strval($number);
        $decimals_string = 0;

        if(isset(explode('.', $number_string)[1])) $decimals_string = strlen(explode('.', $number_string)[1]);

        while($decimals_string - $decimals > 0) {
            $number_string = substr($number_string, 0, -1);

            $decimals_string--;
        }

        return (float)$number_string;
    }

    public function getFormatAmount($amount) {
        return $this->roundedToFixed((float)$amount, 2);
    }

    public function getFormatAmountString($amount) {
        return number_format($this->getFormatAmount($amount), 2, '.', ''); 
    }

    public function makeDate($date){
        $months = array('January','February','March','April','May','June','July','August','September','October','November','December');

        $type_time = (date('G', $date) < 12) ? 'AM' : 'PM';

        return date('d', $date) . ' ' . $months[(int)date('m', $date) - 1] . ' ' . date('Y', $date) . ', ' . substr('0' . date('g', $date), -2) . ':' . substr('0' . date('i', $date), -2) . ' ' . $type_time;
    }

    public function calculateLevel($xp){
        $level_start = 0; // You need to provide the values for these variables
        $level_next = 0;  // You need to provide the values for these variables

        $start = 0;
        $next = $level_start;

        $level = 0;

        for($i = 1; $next <= $xp && $level < 100; $i++){
            $start = $next;
            $next += intval($next * $level_next * (1.00 - 0.0095 * $level));

            $level++;
        }

        return array(
            'level' => $level,
            'start' => 0,
            'next' => $next - $start,
            'have' => (($xp > $next) ? $next : $xp) - $start
        );
    }

    public function generateHexCode($length) {
        $text = '';
        $possible = 'abcdef0123456789';

        for($i = 0; $i < $length; $i++) $text .= $possible[rand(0, strlen($possible) - 1)];

        return $text;
    }

    public function getUserIp(){
        $client  = @$_SERVER['HTTP_CLIENT_IP'];
        $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
        $remote  = $_SERVER['REMOTE_ADDR'];
        if(filter_var($client, FILTER_VALIDATE_IP)){
            $ip = $client;
        } elseif(filter_var($forward, FILTER_VALIDATE_IP)) {
            $ip = $forward;
        } else {
            $ip = $remote;
        }

        return $ip;
    }

    public function getUserDevice(){
        $device  = $_SERVER['HTTP_USER_AGENT'];

        return $device;
    }

    public function getUserLocation($ip){
        $json = file_get_contents('http://ipinfo.io/' . $ip . '/geo');
        $json = json_decode($json, true);
        $country = $json['country'];
        $region = $json['region'];
        $city = $json['city'];

        return $city . ', ' . $region . ', ' . $country;
    }

    public function convertCurrency($amount, $toCurrency, $reverse = false) {
        $DataBase = new DataBase();
    
        $DataBase->Query("SELECT * FROM `currencies` WHERE `short` = :currency");
        $DataBase->Bind(":currency", $toCurrency);
        $currency = $DataBase->Single();
    
        if ($reverse) {
            return $amount / $currency["rate"];
        } else {
            return $amount * $currency["rate"];
        }
    }

    public function CheckRecaptcha($token) {
        $Config = new Config();
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.google.com/recaptcha/api/siteverify");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['secret' => $Config->api("recaptcha")["secret"], 'response' => $token]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        $decodedResponse = json_decode($response, true);
    
        return $decodedResponse;
    }

    public function GenerateQR($data) {
        $QR = file_get_contents("https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=".$data."&choe=UTF-8&chld=L|2");
        return base64_encode($QR);
    }
}

?>
<?php

class Metamask
{
    public function Tokens()
    {
        global $DataBase;

        $DataBase->Query("SELECT * FROM `custom_tokens`");
        $DataBase->Execute();

        return $DataBase->ResultSet();
    }

    public function getPrice($tokenAddress, $numberOfCoin, $currency = "usd") {
        $apiUrl = "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses={$tokenAddress}&vs_currencies={$currency}";
        $response = file_get_contents($apiUrl);
        $data = json_decode($response, true);
    
        $currentPriceUSD = $data[$tokenAddress][$currency];
    
        $totalValueUSD = $numberOfCoin * $currentPriceUSD;
    
        return $totalValueUSD;
    }    

    public function getContract($short) {
        global $DataBase;

        $DataBase->Query("SELECT * FROM `custom_tokens` WHERE `short` = :short");
        $DataBase->Bind(":short", $short);
        $DataBase->Execute();
        $contract = $DataBase->Single()["contractaddr"];
        return $contract;
    }

    function checkTransactionStatus($transactionHash) {
        $apiUrl = "https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=$transactionHash&apikey=$apiKey";
        $response = file_get_contents($apiUrl);
    
        if ($response) {
            $responseData = json_decode($response, true);
    
            if (isset($responseData['status'])) {
                if ($responseData['status'] == 1) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
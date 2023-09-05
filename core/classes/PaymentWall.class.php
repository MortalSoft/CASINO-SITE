<?php
require_once $_SERVER["DOCUMENT_ROOT"].'/core/libs/paymentwall/paymentwall-php/lib/paymentwall.php';

class PaymentWall {
    private $publicKey;
    private $privateKey;

    public function __construct($publicKey, $privateKey) {
        $this->publicKey = $publicKey;
        $this->privateKey = $privateKey;

        Paymentwall_Config::getInstance()->set(array(
            'api_type' => Paymentwall_Config::API_GOODS,
            'public_key' => $this->publicKey,
            'private_key' => $this->privateKey
        ));
    }

    public function processCasinoDeposit($amount, $currency, $userId, $pid, $widget) {

        $widget = new Paymentwall_Widget(
            $userId,
            $widget,
            array(
                'amount' => $amount,
                'currency' => $currency,
                'description' => 'Deposit',
                'custom[transaction_id]' => $pid
            )
        );

        return $widget->getHtmlCode();
    }

    public function getCasinoPaymentStatus($userId) {
        $widget = new Paymentwall_Widget(
            $userId,
            $this->publicKey,
            array()
        );

        $response = $widget->getPingback();

        if ($response->isDeliverable()) {
            return true;
        } else {
            return false;
        }
    }
}

?>
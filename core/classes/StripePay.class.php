<?php 
require_once $_SERVER["DOCUMENT_ROOT"].'/core/libs/stripe/stripe-php/init.php';
use Stripe\Stripe;

class StripePay {
    private $stripeSecretKey;
    private $stripePublicKey;

    public function __construct($secretKey, $publicKey) {
        $this->stripeSecretKey = $secretKey;
        $this->stripePublicKey = $publicKey;
        $this->stripeClient = new \Stripe\StripeClient($this->stripeSecretKey);
    }

    public function createPaymentIntent($amount, $currency = 'usd') {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
    
        $urls = $protocol . "://" . $host . '/callback/stripe';
        $urlc = $protocol . "://" . $host . '/';

        try {
            Stripe::setApiKey($this->stripeSecretKey);
    
            $session = $this->stripeClient->checkout->sessions->create([ 
                'line_items' => [[ 
                    'price_data' => [ 
                        'product_data' => [ 
                            'name' => "Deposit", 
                            'metadata' => [ 
                                'pro_id' => rand(900000, 9999999)
                            ] 
                        ], 
                        'unit_amount' => $amount, 
                        'currency' => $currency, 
                    ], 
                    'quantity' => 1 
                ]], 
                'mode' => 'payment', 
                'success_url' => $urls.'?id={CHECKOUT_SESSION_ID}', 
                'cancel_url' => $urlc, 
            ]); 
    
            return $session->id;
        } catch (\Stripe\Exception\ApiErrorException $e) {
            throw $e;
        }
    }    

    public function getClientPublicKey() {
        return $this->stripePublicKey;
    }

    public function handlePaymentCallback($paymentIntentId) {
        try {
            Stripe::setApiKey($this->stripeSecretKey);

            $paymentIntent = \Stripe\PaymentIntent::retrieve($paymentIntentId);
            
            if ($paymentIntent->status === 'succeeded') {
                return true;
            } else {
                return false;
            }
        } catch (\Stripe\Exception\ApiErrorException $e) {
            return false;
        }
    }
}
?>
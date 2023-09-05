<?php
class Paymentwall_Mobiamo extends Paymentwall_ApiObject {
	protected $token;
	const API_OBJECT_MOBIAMO = 'mobiamo';
	public function getEndpointName()
	{
		return self::API_OBJECT_MOBIAMO;
	}
	
	public function getToken($params){
	    $defaultParams = [
	    	'key' => $this->getConfig()->getPublicKey(),
		    'ts' => time(),
		    'sign_version' => Paymentwall_Signature_Abstract::VERSION_TWO
	    ];
	    $params = array_merge($defaultParams, $params);
	    $params['sign'] = $this->calculateSignature($params);
	    $this->doApiAction('token', 'post', $params);
	    return $this->getProperties();
	}

	public function initPayment($token, $params){
		$this->token = $token;
		$params['key'] = $this->getConfig()->getPublicKey();
		$this->doApiAction('init-payment', 'post', $params);
		return $this->getProperties();
	}

	public function processPayment($token, $params){
		$this->token = $token;
		$params['key'] = $this->getConfig()->getPublicKey();
		$this->doApiAction('process-payment', 'post', $params);
		return $this->getProperties();
	}

	public function getPaymentInfo($token, $params){
		$this->token = $token;
		$params['key'] = $this->getConfig()->getPublicKey();
		$this->doApiAction('get-payment', 'post', $params);
		return $this->getProperties();
	}

	protected function calculateSignature($params = array())
	{
		$baseString = '';
		$this->ksortMultiDimensional($params);

		$baseString = $this->prepareParams($params, $baseString);

		$baseString .= $this->getConfig()->getPrivateKey();

		return md5($baseString);
	}

	protected function prepareParams($params = array(), $baseString = '')
	{
		foreach ($params as $key => $value) {
			if (is_array($value)) {
				foreach ($value as $k => $v) {
					$baseString .= $key . '[' . $k . ']' . '=' . $v;
				}
			} else {
				$baseString .= $key . '=' . $value;
			}
		}
		return $baseString;
	}

	protected function ksortMultiDimensional(&$params = array())
	{
		if (is_array($params)) {
			ksort($params);
			foreach ($params as &$p) {
				if (is_array($p)) {
					ksort($p);
				}
			}
		}
	}

	public function getApiUrl()
	{
		if ($this->getEndpointName() === self::API_OBJECT_ONE_TIME_TOKEN && !$this->getConfig()->isTest()) {
			return Paymentwall_OneTimeToken::GATEWAY_TOKENIZATION_URL;
		} else {
			return $this->getApiBaseUrl() . '/' .  $this->getEndpointName();
		}
	}

	protected function doApiAction($action = '', $method = 'post', $params = [])
	{
		$actionUrl = $this->getApiUrl() . '/' . $action;
		$httpAction = new Paymentwall_HttpAction($this, $params, [$this->getApiBaseHeader()]);
		$this->setPropertiesFromResponse(
			$method == 'get' ? $httpAction->get($actionUrl) : $httpAction->post($actionUrl)
		);
		return $this;
	}

	protected function getApiBaseHeader()
	{
		if ($this->token){
			return 'token: ' . $this->token;
		}
		return '';
	}
}

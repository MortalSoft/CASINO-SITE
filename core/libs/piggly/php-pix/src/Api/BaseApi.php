<?php
namespace Piggly\Pix\Api;

use DateInterval;
use DateTime;
use InvalidArgumentException;
use Piggly\Pix\Api\Http\CurlRequest;
use Piggly\Pix\Api\Interfaces\CobPayloadInterface;
use Piggly\Pix\Api\Interfaces\DevoPayloadInterface;
use Piggly\Pix\Exceptions\ApiEndpointIsNotSet;
use Piggly\Pix\Exceptions\ApiRequestError;
use Piggly\Pix\Exceptions\InvalidApiUriParameter;
use RuntimeException;

/**
 * The Base Api class.
 *
 * @since      1.2.1
 * @package    Piggly\Pix
 * @subpackage Piggly\Pix
 * @author     Caique <caique@piggly.com.br>
 */
abstract class BaseApi 
{
	/**
	 * @since 1.2.1
	 * @var BaseApi
	 */
	public static $instance;

	/** @var string Endpoint to create a new cob. */
	const ENDPOINT_CREATE_COB = 1;
	/** @var string Endpoint to review a {tid} cob. */
	const ENDPOINT_UPDATE_COB = 2;
	/** @var string Endpoint to get a {tid} cob. */
	const ENDPOINT_GET_COB = 3;
	/** @var string Endpoint to create a new devo with {e2eid} and {id}. */
	const ENDPOINT_CREATE_DEVO = 4;
	/** @var string Endpoint to get devo with {e2eid} and {id}. */
	const ENDPOINT_GET_DEVO = 5;
	/** @var string Endpoint to get access token. */
	const ENDPOINT_OAUTH = 99;

	/** @var string GET request method. */
	const REQUEST_METHOD_GET = 'GET';
	/** @var string POST request method. */
	const REQUEST_METHOD_POST = 'POST';
	/** @var string PUT request method. */
	const REQUEST_METHOD_PUT = 'PUT';
	/** @var string PATCH request method. */
	const REQUEST_METHOD_PATCH = 'PATCH';
	/** @var string DELETE request method. */
	const REQUEST_METHOD_DELETE = 'DELETE';

	/**
	 * Api base url.
	 * @var string
	 * @since 1.2.1
	 */
	protected $baseUrl;

	/**
	 * Api access token with token/type/expiration date.
	 * @var array
	 * @since 1.2.1
	 */
	protected $accessToken;

	/**
	 * Api uri endpoints with method/uri.
	 * @var array
	 * @since 1.2.1
	 */
	protected $endPoints;

	/**
	 * Api oauth client id.
	 * @var string
	 * @since 1.2.1
	 */
	protected $clientId;

	/**
	 * Api oauth client secret.
	 * @var string
	 * @since 1.2.1
	 */
	protected $clientSecret;

	/**
	 * Api oauth grant type.
	 * @var string
	 * @since 1.2.1
	 */
	protected $grantType;

	/**
	 * Api oauth scopes.
	 * @var array
	 * @since 1.2.1
	 */
	protected $scopes = [];

	/**
	 * Api ssl pem file.
	 * @var string
	 * @since 1.2.1
	 */
	protected $sslCert = null;

	/**
	 * Api ssl password.
	 * @var string
	 * @since 1.2.1
	 */
	protected $sslPass = null;

	/**
	 * Cannot create an instance out of this class.
	 * 
	 * @param string $baseUrl
	 * @param string $sslCert Absolute path to pem file.
	 * @param string $sslPass
	 * @param string $baseUrl
	 * @since 1.2.1
	 * @return self
	 */
	protected function __construct( string $baseUrl, string $sslCert = null, string $sslPass = null )
	{
		$this->baseUrl = $baseUrl;
		$this->sslCert = $sslCert;
		$this->sslPass = $sslPass;
		return $this;
	}

	/**
	 * Get an unique instance to this class.
	 * 
	 * @param string $baseUrl
	 * @param string $sslCert Absolute path to pem file.
	 * @param string $sslPass
	 * @since 1.2.1
	 * @return self
	 */
	public static function use ( string $baseUrl = null, string $sslCert = null, string $sslPass = null )
	{
		if ( !isset( self::$instance ) )
		{ 
			if ( empty($baseUrl) )
			{ throw new InvalidArgumentException('O parâmetro $baseUrl não pode ser vazio, na criação da instância.'); }
			
			self::$instance = new static($baseUrl, $sslCert, $sslPass); 
		}

		return self::$instance;
	}

	/**
	 * Get the first access token to api.
	 * 
	 * @since 1.2.1
	 * @return bool TRUE when access token is set.
	 * @throws ApiRequestError when something went wrong trying to get api token.
	 */
	public function oAuth ( 
		string $method, 
		string $uri, 
		string $clientId, 
		string $clientSecret,
		string $grantType = 'client_credentials',
		array $scopes = [] ) : bool
	{
		$body = [
			'grant_type' => $grantType
		];

		if ( !empty( $scopes ) )
		{ $body['scope'] = implode(' ', $scopes); }

		$headers = [
			'Authorization' => sprintf('Basic %s', base64_encode($clientId.':'.$clientSecret) )
		];

		$response = $this->sendRequest(
			$method,
			$uri,
			$body,
			$headers
		);

		$this->addEndpoint(
			self::ENDPOINT_OAUTH,
			$method,
			$uri
		);

		$this->clientId = $clientId;
		$this->clientSecret = $clientSecret;
		$this->grantType = $grantType;
		$this->scopes = $scopes;

		$this->accessToken = [
			'access_token' => $response['access_token'],
			'token_type' => $response['token_type'],
			'expires_in' => $response['expires_in'],
			'created_at' => (new DateTime()),
			'expires_at' => (new DateTime())->add(new DateInterval('PT%sS', strval($response['expires_in'])))
		];

		return true;
	}

	/**
	 * Get access token as Authorization header. If access token is expires,
	 * tries to request again.
	 * 
	 * @since 1.2.1
	 * @return array
	 * @throws RuntimeException When oAuth() was not called before.
	 * @throws ApiRequestError when something went wrong trying to refresh api token.
	 */
	public function getAuthHeader () : array
	{
		if ( empty($this->accessToken) )
		{ throw new RuntimeException('Chame o método `oAuth()` para criar o Token de Acesso.'); }

		$currentTime = new DateTime();

		if ( $currentTime > $this->accessToken['expires_at'] )
		{ 
			$endpoint = $this->hasEndpoint(self::ENDPOINT_OAUTH, 'BaseApi::getAuthHeader()');
			$this->oAuth(
				$endpoint['method'],
				$endpoint['uri'],
				$this->clientId,
				$this->clientSecret,
				$this->grantType,
				$this->scopes
			);
		}

		return [
			sprintf(
				'Authorization: %s %s',
				$this->accessToken['token_type'],
				$this->accessToken['access_token']
			)
		];
	}	

	/**
	 * Add an endpoint to this api. When transaction id is a URI parameter
	 * use as {tid}.
	 * 
	 * @see BaseApi::ENDPOINT_* constants.
	 * @param int $endpoint see all available in BaseApi::ENDPOINT_* constants.
	 * @param string $method see all available in BaseApi::REQUEST_METHOD_* constants.
	 * @param string $uri
	 * @since 1.2.1
	 * @return self
	 * @throws InvalidApiUriParameter if endpoint does not contain an uri parameter required.
	 */
	public function addEndpoint ( int $endpoint, string $method, string $uri )
	{
		$this->validateUriParams($endpoint, $uri);
		$this->endPoints[$endpoint] = [
			'method' => $method,
			'uri' => $uri
		];
		return $this;
	}

	/**
	 * Create a new cob.
	 * 
	 * @param CobPayloadInterface $cob
	 * @return CobPayloadInterface
	 * @throws ApiRequestError when something went wrong.
	 */
	public function createCob ( CobPayloadInterface $cob )
	{
		$endpoint = $this->hasEndpoint(self::ENDPOINT_CREATE_COB, 'BaseApi::createCob()');
		$method   = $endpoint['method'];
		$uri      = \str_replace('{tid}', $cob->getTid(), $endpoint['uri']);

		$response = $this->sendRequest(
			$method,
			$uri,
			$cob->export(),
			$this->getAuthHeader()
		);

		return $cob->import($response);
	}

	/**
	 * Update a cob based in {tid}.
	 * 
	 * @param CobPayloadInterface $cob
	 * @return CobPayloadInterface
	 * @throws ApiRequestError when something went wrong.
	 */
	public function updateCob ( CobPayloadInterface $cob )
	{
		$endpoint = $this->hasEndpoint(self::ENDPOINT_UPDATE_COB, 'BaseApi::updateCob()');
		$method   = $endpoint['method'];
		$uri      = \str_replace('{tid}', $cob->getTid(), $endpoint['uri']);

		$response = $this->sendRequest(
			$method,
			$uri,
			$cob->export(),
			$this->getAuthHeader()
		);

		return $cob->import($response);
	}

	/**
	 * Get a cob based in {tid}.
	 * 
	 * @param CobPayloadInterface $cob
	 * @return CobPayloadInterface
	 * @throws ApiRequestError when something went wrong.
	 */
	public function getCob ( CobPayloadInterface $cob )
	{
		$endpoint = $this->hasEndpoint(self::ENDPOINT_GET_COB, 'BaseApi::getCob()');
		$method   = $endpoint['method'];
		$uri      = \str_replace('{tid}', $cob->getTid(), $endpoint['uri']);

		$response = $this->sendRequest(
			$method,
			$uri,
			[],
			$this->getAuthHeader()
		);

		return $cob->import($response);
	}

	/**
	 * Get a devo based in {e2eid} and {tid}.
	 * 
	 * @param DevoPayloadInterface $devo
	 * @return DevoPayloadInterface
	 * @throws ApiRequestError when something went wrong.
	 */
	public function createDevo ( DevoPayloadInterface $devo )
	{
		$endpoint = $this->hasEndpoint(self::ENDPOINT_CREATE_DEVO, 'BaseApi::createDevo()');
		$method   = $endpoint['method'];
		$uri      = \str_replace('{e2eid}', $devo->getE2eId(), $endpoint['uri']);
		$uri      = \str_replace('{tid}', $devo->getId(), $uri);

		$response = $this->sendRequest(
			$method,
			$uri,
			$devo->export(),
			$this->getAuthHeader()
		);

		return $devo->import($response);
	}

	/**
	 * Get a devo based in {e2eid} and {tid}.
	 * 
	 * @param DevoPayloadInterface $devo
	 * @return DevoPayloadInterface
	 * @throws ApiRequestError when something went wrong.
	 */
	public function getDevo ( DevoPayloadInterface $devo )
	{
		$endpoint = $this->hasEndpoint(self::ENDPOINT_GET_DEVO, 'BaseApi::getDevo()');
		$method   = $endpoint['method'];
		$uri      = \str_replace('{e2eid}', $devo->getE2eId(), $endpoint['uri']);
		$uri      = \str_replace('{tid}', $devo->getId(), $uri);

		$response = $this->sendRequest(
			$method,
			$uri,
			[],
			$this->getAuthHeader()
		);

		return $devo->import($response);
	}

	/**
	 * Send a request and throws an exception when something went wrong.
	 * Or return an array with the response body.
	 * 
	 * @param string $method
	 * @param string $uri
	 * @param array $body
	 * @param array $headers
	 * @since 1.2.1
	 * @return array 
	 * @throws ApiRequestError when something went wrong.
	 */
	protected function sendRequest ( 
		string $method, 
		string $uri, array 
		$body = [], 
		array $headers = [] 
	) : array
	{
		$url = sprintf('$s/%s', trim('/', $this->baseUrl), trim('/', $uri));

		$defaultHeaders = [
			'Cache-Control: no-cache',
      	'Content-type: application/json'
		];

		$curl = new CurlRequest($url);

		$curl->setOptions([
			CURLOPT_URL            => $url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_CUSTOMREQUEST  => $method,
			CURLOPT_SSLCERT        => $this->sslCert,
			CURLOPT_SSLCERTPASSWD  => $this->sslPass,
			CURLOPT_HTTPHEADER     => array_merge($defaultHeaders, $headers)
		]);

		switch ($method) {
			case 'POST':
			case 'PUT':
			case 'PATCH':
			case 'DELETE':
				$curl->setOption(
					CURLOPT_POSTFIELDS,
					json_encode($body)
				);
				break;
		}

		$response = $curl->execute();

		if ( empty( $reponse ) )
		{
			$error = $curl->getError();
			$curl->close();

			throw new ApiRequestError(
				$method, 
				$error
			);
		}

		$info = $curl->getInfo();
		$curl->close();

		if ( empty( $info['http_code'] ) )
		{ 
			throw new ApiRequestError(
				$method, 
				'Nenhum código HTTP foi retornado.'
			); 
		}
		else if ( strval($info['http_code'])[0] !== '2' )
		{
			throw new ApiRequestError(
				$method, 
				'A requisição retornou alguns erros.', 
				$info['http_code'],
				$response
			);
		}

		return json_decode( $response, true );
	}

	/**
	 * Check if $endpoint is set in api endpoints and return.
	 * 
	 * @param int $endpoint see all available in BaseApi::ENDPOINT_* constants.
	 * @param string $method
	 * @since 1.2.1
	 * @return array
	 * @throws ApiEndpointIsNotSet if endpoint is not set.
	 */
	protected function hasEndpoint ( int $endpoint, string $method ) : array
	{
		if ( !isset( $this->endPoints[$endpoint] ) )
		{ throw new ApiEndpointIsNotSet($endpoint, $method); }

		return $this->endPoints[$endpoint];
	}

	/**
	 * Check if $uri based on $endpoint has the required parameters.
	 * 
	 * @param int $endpoint see all available in BaseApi::ENDPOINT_* constants.
	 * @param string $uri
	 * @since 1.2.1
	 * @return void
	 * @throws InvalidApiUriParameter if endpoint does not contain an uri parameter required.
	 */
	protected function validateUriParams ( int $endpoint, string $uri )
	{
		if ( ( $endpoint === self::ENDPOINT_GET_COB
					|| $endpoint === self::ENDPOINT_UPDATE_COB )
				&& strpos($uri, '{tid}') === false )
		{ throw new InvalidApiUriParameter('{tid}', $uri); }
		
		if ( ( $endpoint === self::ENDPOINT_CREATE_DEVO
					|| $endpoint === self::ENDPOINT_GET_DEVO )
				&& strpos($uri, '{e2eid}') === false )
		{ throw new InvalidApiUriParameter('{e2eid}', $uri); }
		
		if ( ( $endpoint === self::ENDPOINT_CREATE_DEVO
					|| $endpoint === self::ENDPOINT_GET_DEVO )
				&& strpos($uri, '{id}') === false )
		{ throw new InvalidApiUriParameter('{id}', $uri); }
	}

	/**
	 * Prevent to clone current instance.
	 *
	 * @since 1.2.1
	 */
	private function __clone()
	{ }

	/**
	 * Prevent to unserialize current instance.
	 *
	 * @since 1.2.1
	 */
	private function __wakeup()
	{ }
}
<?php
namespace Piggly\Pix\Exceptions;

use Exception;

class ApiRequestError extends Exception
{
	/**
	 * @since 1.2.1
	 * @var string $requestError
	 */
	protected $requestError;

	/**
	 * @since 1.2.1
	 * @var string $httpCode
	 */
	protected $httpCode;

	/**
	 * @since 1.2.1
	 * @var string $body
	 */
	protected $body;

	/**
	 * Get requestError.
	 * @since 1.2.1
	 * @var string $requestError
	 */
	public function getRequestError () : ?string
	{ return $this->requestError; }

	/**
	 * Get httpCode.
	 * @since 1.2.1
	 * @var string $httpCode
	 */
	public function getHttpCode () : ?string
	{ return $this->httpCode; }

	/**
	 * Get body.
	 * @since 1.2.1
	 * @var string $body
	 */
	public function getBody () : ?string
	{ return $this->body; }

	/**
	 * Exception when the api requestError is not set.
	 * 
	 * @since 1.2.1
	 * @param string $method
	 * @param string|null $requestError
	 * @param string|int|null $httpCode 
	 * @param string|null $body 
	 */
	public function __construct ( string $method, $requestError = null, $httpCode = null, $body = null )
	{
		$this->requestError = $requestError;
		$this->httpCode = is_null($httpCode) ? null : strval($httpCode);
		$this->body = $body;

		parent::__construct(sprintf('Ocorreu um erro ao executar a requisição %s.', $method));
	}
}
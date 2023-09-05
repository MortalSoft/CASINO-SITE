<?php
namespace Piggly\Pix\Exceptions;

use Exception;

class ApiEndpointIsNotSet extends Exception
{
	/**
	 * @since 1.2.1
	 * @var int $endpoint
	 */
	protected $endpoint;

	/**
	 * Get endpoint.
	 * @since 1.2.1
	 * @var int $endpoint
	 */
	public function getEndpoint () : int
	{ return $this->endpoint; }

	/**
	 * Exception when the api endpoint is not set.
	 * 
	 * @since 1.2.1
	 * @param int $endpoint
	 * @param string $method 
	 */
	public function __construct ( int $endpoint, string $method )
	{
		$this->endpoint = $endpoint;

		parent::__construct(
			\sprintf('Não foi possível acessar o endpoint `%s` em `%s`. Ele não foi adicionado a api.', $endpoint, $method )
		);
	}
}
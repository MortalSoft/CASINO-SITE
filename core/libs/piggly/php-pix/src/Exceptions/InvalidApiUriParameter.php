<?php
namespace Piggly\Pix\Exceptions;

use Exception;

class InvalidApiUriParameter extends Exception
{
	/**
	 * @since 1.2.1
	 * @var string $parameter
	 */
	protected $parameter;

	/**
	 * @since 1.2.1
	 * @var string $uri
	 */
	protected $uri;

	/**
	 * Get parameter.
	 * @since 1.2.1
	 * @var string $parameter
	 */
	public function getParameter () : string
	{ return $this->parameter; }

	/**
	 * Get uri.
	 * @since 1.2.1
	 * @var string $uri
	 */
	public function getUri () : string
	{ return $this->uri; }

	/**
	 * Exception when the api uri parameter is invalid.
	 * 
	 * @since 1.2.1
	 * @param string $parameter
	 * @param string $uri 
	 */
	public function __construct ( string $parameter, string $uri )
	{
		$this->parameter = $parameter;
		$this->uri = $uri;

		parent::__construct(
			\sprintf('O parâmetro `%s` na URI `%s` é requerido e está ausente.', $parameter, $uri )
		);
	}
}
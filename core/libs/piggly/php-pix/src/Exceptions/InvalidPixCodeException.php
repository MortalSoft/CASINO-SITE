<?php
namespace Piggly\Pix\Exceptions;

use Exception;

class InvalidPixCodeException extends Exception
{
	/**
	 * @since 1.2.0
	 * @var string $pixCode
	 */
	protected $pixCode;

	/**
	 * Get pix key.
	 * @since 1.2.0
	 * @var string $pixCode
	 */
	public function getPixCode () : string
	{ return $this->pixCode; }

	/**
	 * Exception when the pix code is invalid.
	 * 
	 * @since 1.2.0
	 * @param string $pixCode
	 */
	public function __construct ( string $pixCode )
	{
		$this->pixCode = $pixCode;

		parent::__construct(
			\sprintf('O código Pix `%s` é invalido.', $pixCode)
		);
	}
}
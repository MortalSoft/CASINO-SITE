<?php
namespace Piggly\Pix\Exceptions;

use Exception;

class InvalidPixKeyException extends Exception
{
	/**
	 * @since 1.2.0
	 * @var string $pixKey
	 */
	protected $pixKey;

	/**
	 * @since 1.2.0
	 * @var string $pixKeyType
	 */
	protected $pixKeyType;

	/**
	 * Get pix key.
	 * @since 1.2.0
	 * @var string $pixKey
	 */
	public function getPixKey () : string
	{ return $this->pixKey; }

	/**
	 * Get pix keyType.
	 * @since 1.2.0
	 * @var string $pixKeyType
	 */
	public function getPixKeyType () : string
	{ return $this->pixKeyType; }

	/**
	 * Exception when the Pix Key is invalid based in your Key Type.
	 * 
	 * @since 1.2.0
	 * @param string $keyType
	 * @param string $key
	 */
	public function __construct ( string $keyType, string $key )
	{
		$this->pixKey = $key;
		$this->pixKeyType = $keyType;

		parent::__construct(
			\sprintf('O valor `%s` para o tipo `%s` é invalido.', $key, $keyType)
		);
	}
}
<?php
namespace Piggly\Pix\Api\Http;

class CurlRequest implements HttpRequestInterface
{
	/**
	 * Current request.
	 * @since 1.2.1
	 * @var mixed $handle
	 */
	private $handle = null;

	/**
	 * Startup request.
	 * 
	 * @param string $url
	 * @since 1.2.1
	 * @return self
	 */
	public function __construct( string $url ) 
	{ $this->handle = curl_init($url); }

	/** {@inheritDoc} */
	public function setOption( $name, $value ) 
	{ curl_setopt($this->handle, $name, $value); }

	/** {@inheritDoc} */
	public function setOptions (array $options)
	{ curl_setopt_array($this->handle, $options); }

	/** {@inheritDoc} */
	public function execute() 
	{ return curl_exec($this->handle); }

	/** {@inheritDoc} */
	public function getError() 
	{ return curl_error($this->handle); }

	/** {@inheritDoc} */
	public function getInfo() 
	{ return curl_getinfo($this->handle); }

	/** {@inheritDoc} */
	public function close() 
	{ curl_close($this->handle); }
}
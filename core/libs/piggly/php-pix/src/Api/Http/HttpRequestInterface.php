<?php
namespace Piggly\Pix\Api\Http;

interface HttpRequestInterface
{
	/**
	 * Execute current request.
	 * 
	 * @since 1.2.1
	 * @return mixed
	 */
	public function execute ();

	/**
	 * Close current request.
	 * 
	 * @since 1.2.1
	 * @return mixed
	 */
	public function close ();

	/**
	 * Get current request info
	 * 
	 * @since 1.2.1
	 * @return array
	 */
	public function getInfo ();

	/**
	 * Get current request error.
	 * 
	 * @since 1.2.1
	 * @return mixed
	 */
	public function getError ();

	/**
	 * Add option to request.
	 * 
	 * @param mixed $name
	 * @param mixed $value
	 * @since 1.2.1
	 * @return void
	 */
	public function setOption ( $name, $value );

	/**
	 * Add options to request.
	 * 
	 * @param array $options
	 * @since 1.2.1
	 * @return void
	 */
	public function setOptions ( array $options );
}
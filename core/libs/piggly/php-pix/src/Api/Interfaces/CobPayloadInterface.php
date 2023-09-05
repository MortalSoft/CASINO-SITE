<?php
namespace Piggly\Pix\Api\Interfaces;

/**
 * All types of CobPayload needs to implements this interface.
 *
 * @since      1.2.1
 * @package    Piggly\Pix
 * @subpackage Piggly\Pix
 * @author     Caique <caique@piggly.com.br>
 */
interface CobPayloadInterface
{
	/**
	 * Get transaction id to current cob.
	 * @since 1.2.1
	 * @return string
	 */
	public function getTid () : string;

	/**
	 * Import data to this cob object based in the cob response array model.
	 * 
	 * @param array $response
	 * @since 1.2.0
	 * @return self
	 */
	public function import ( array $response );

	/**
	 * Export current payload data to an valid array.
	 * 
	 * @since 1.2.1
	 * @return array
	 */
	public function export () : array;
}
<?php
namespace Piggly\Pix;

/**
 * The Pix Payload class.
 * 
 * This is used to set up pix data and follow the EMV®1 pattern and standards.
 * When set up all data, the export() method will generate the full pix payload.
 *
 * @since      1.0.0 
 * @package    Piggly\Pix
 * @subpackage Piggly\Pix
 * @author     Caique <caique@piggly.com.br>
 */
class StaticPayload extends Payload
{
	/**
	 * Defines if payment is reusable.
	 * @since 1.2.0
	 * @var boolean
	 */
	protected $reusable = true;

	/**
	 * In static payload always will be true. It will be ignored.
	 * 
	 * @param string $reusable If pix can be reusable.
	 * @since 1.2.0 Will be ignored
	 * @return self
	 */
	public function setAsReusable ( bool $reusable = true )
	{ $this->reusable = true; return $this; }
}
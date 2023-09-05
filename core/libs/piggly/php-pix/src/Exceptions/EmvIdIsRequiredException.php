<?php
namespace Piggly\Pix\Exceptions;

use Exception;

class EmvIdIsRequiredException extends Exception
{
	/**
	 * @since 1.2.0
	 * @var string $emvId
	 */
	protected $emvId;

	/**
	 * Get emvId.
	 * @since 1.2.0
	 * @var string $emvId
	 */
	public function getEmvId () : string
	{ return $this->emvId; }

	/**
	 * Exception when the emv id is required.
	 * 
	 * @since 1.2.0
	 * @param string $emvId
	 */
	public function __construct ( string $emvId )
	{
		$this->emvId = $emvId;
		
		parent::__construct(
			\sprintf('O campo EMV `%s` é obrigatório.', $emvId )
		);
	}
}
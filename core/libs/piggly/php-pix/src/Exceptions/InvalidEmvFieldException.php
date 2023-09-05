<?php
namespace Piggly\Pix\Exceptions;

use Exception;

class InvalidEmvFieldException extends Exception
{
	/**
	 * @since 1.2.0
	 * @var string $fieldName
	 */
	protected $fieldName;

	/**
	 * @since 1.2.0
	 * @var string $fieldValue
	 */
	protected $fieldValue;
	
	/**
	 * @since 1.2.0
	 * @var string $errorMessage
	 */
	protected $fieldMessage;

	/**
	 * Get fieldName.
	 * @since 1.2.0
	 * @var string $fieldName
	 */
	public function getFieldName () : string
	{ return $this->fieldName; }

	/**
	 * Get fieldValue.
	 * @since 1.2.0
	 * @var string $fieldValue
	 */
	public function getFieldValue () : string
	{ return $this->fieldValue; }

	/**
	 * Get fieldMessage.
	 * @since 1.2.0
	 * @var string $fieldMessage
	 */
	public function getFieldMessage () : string
	{ return $this->fieldMessage; }

	/**
	 * Exception when the emv field value is invalid.
	 * 
	 * @since 1.2.0
	 * @param string $emvField
	 * @param string $emvValue
	 * @param string $error
	 */
	public function __construct ( string $emvField, string $emvValue, string $error )
	{
		$this->fieldName = $emvField;
		$this->fieldValue = $emvValue;
		$this->fieldMessage = $error;

		parent::__construct(
			\sprintf('O valor `%s` para o EMV `%s` é invalido: %s', $emvField, $emvValue, $error )
		);
	}
}
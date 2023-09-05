<?php
namespace Piggly\Pix;

/**
 * The Pix Dynamic Payload class.
 * 
 * This is used to set up pix data and follow the EMV®1 pattern and standards.
 * When set up all data, the export() method will generate the full pix payload.
 *
 * @since      1.2.0 
 * @package    Piggly\Pix
 * @subpackage Piggly\Pix
 * @author     Caique <caique@piggly.com.br>
 */
class DynamicPayload extends Payload
{
	/**
	 * Defines if payment is reusable.
	 * @since 1.2.0
	 * @var boolean
	 */
	protected $reusable = false;
	
	/**
	 * Payload url.
	 * @since 1.2.0
	 * @var string
	 */
	protected $payloadUrl;

	/**
	 * Set the current payload json url.
	 * 
	 * @param string $url
	 * @return self
	 */
	public function setPayloadUrl ( string $url )
	{
		$url = \preg_replace('/(http[s]?)(\:\/\/)?/', '', $url);
		$this->payloadUrl = $url;
		return $this;
	}

	/**
	 * In dynamic payload pix key cannot be set. It will be ignored.
	 * 
	 * @param string $keyType Pix key type.
	 * @param string $pixKey Pix key.
	 * @since 1.2.0 Will be ignored
	 * @return self
	 */
	public function setPixKey ( string $keyType, string $pixKey )
	{ return $this; }

	/**
	 * In dynamic payload description cannot be set. It will be ignored.
	 * 
	 * @param string $description Pix description.
	 * @since 1.2.0 Will be ignored
	 * @return self
	 */
	public function setDescription ( string $description, bool $applyMaxLength = true )
	{ return $this; }

	/**
	 * In dynamic payload always will be false. It will be ignored.
	 * 
	 * @param string $reusable If pix can be reusable.
	 * @since 1.2.0 Will be ignored
	 * @return self
	 */
	public function setAsReusable ( bool $reusable = true )
	{ $this->reusable = false; return $this; }

	/**
	 * Get the current merchant account information.
	 * 
	 * EMV -> ID 26
	 * 
	 * @since 1.2.0
	 * @return string
	 */
	protected function getMerchantAccountInformation () : string
	{
		// Global bank domain
		// ID 00
		$gui = $this->formatID(
			self::ID_MERCHANT_ACCOUNT_INFORMATION_GUI,
			'br.gov.bcb.pix'
		);

		// Current payload url
		// ID 02
		$payloadUrl = $this->formatID(
			self::ID_MERCHANT_ACCOUNT_INFORMATION_URL,
			$this->payloadUrl,
			false
		);

		return $this->formatID(
			self::ID_MERCHANT_ACCOUNT_INFORMATION,
			$gui.$payloadUrl
		);
	}
}
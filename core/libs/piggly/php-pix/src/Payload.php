<?php
namespace Piggly\Pix;

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Exception;
use Piggly\Pix\Exceptions\EmvIdIsRequiredException;
use Piggly\Pix\Exceptions\InvalidEmvFieldException;
use Piggly\Pix\Exceptions\InvalidPixKeyTypeException;
use Piggly\Pix\Exceptions\QRCodeNotSupported;
use Piggly\Pix\Exceptions\RequiredPhpExtension;
use Piggly\Pix\Parser;

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
class Payload
{
	/** @var string Version of QRCPS-MPM payload. */
	const ID_PAYLOAD_FORMAT_INDICATOR = '00';
	/** @var string Point of initiation method. When set to 12, means can be used only one time. */
	const ID_POINT_OF_INITIATION_METHOD = '01';
	/** @var string Merchant account information. */
	const ID_MERCHANT_ACCOUNT_INFORMATION = '26';
	/** @var string Merchant account GUI information */
	const ID_MERCHANT_ACCOUNT_INFORMATION_GUI = '00';
	/** @var string Merchant account key information */
	const ID_MERCHANT_ACCOUNT_INFORMATION_KEY = '01';
	/** @var string Merchant account description information */
	const ID_MERCHANT_ACCOUNT_INFORMATION_DESCRIPTION = '02';
	/** @var string Merchant account url information */
	const ID_MERCHANT_ACCOUNT_INFORMATION_URL = '25';
	/** @var string Merchant account category code */
	const ID_MERCHANT_CATEGORY_CODE = '52';
	/** @var string Transaction currency code */
	const ID_TRANSACTION_CURRENCY = '53';
	/** @var string Transaction amount code */
	const ID_TRANSACTION_AMOUNT = '54';
	/** @var string Country code */
	const ID_COUNTRY_CODE = '58';
	/** @var string Merchant name */
	const ID_MERCHANT_NAME = '59';
	/** @var string Merchant city */
	const ID_MERCHANT_CITY = '60';
	/** @var string Additional data field */
	const ID_ADDITIONAL_DATA_FIELD_TEMPLATE = '62';
	/** @var string Additional data field TID */
	const ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TID = '05';
	/** @var string CRC16 */
	const ID_CRC16 = '63';

	/** @var string OUTPUT_SVG Return QR Code in SVG. */
	const OUTPUT_SVG = QRCode::OUTPUT_MARKUP_SVG;
	/** @var string OUTPUT_PNG Return QR Code in PNG. */
	const OUTPUT_PNG = QRCode::OUTPUT_IMAGE_PNG;

	/** @var int */
	const ECC_L = 0b01; // 7%.
	/** @var int */
	const ECC_M = 0b00; // 15%.
	/** @var int */
	const ECC_Q = 0b11; // 25%.
	/** @var int */
	const ECC_H = 0b10; // 30%.
	
	/**
	 * Pix key.
	 * @since 1.0.0
	 * @var string
	 */
	protected $pixKey;

	/**
	 * Payment description.
	 * @since 1.0.0
	 * @var string
	 */
	protected $description;

	/**
	 * Merchant name.
	 * @since 1.0.0
	 * @var string
	 */
	protected $merchantName;

	/**
	 * Merchant city.
	 * @since 1.0.0
	 * @var string
	 */
	protected $merchantCity;

	/**
	 * Pix Transaction ID.
	 * @since 1.0.0
	 * @since Set *** as default value.
	 * @var string
	 */
	protected $tid = '***';

	/**
	 * Transaction amount.
	 * @since 1.0.0
	 * @var string
	 */
	protected $amount;

	/**
	 * Defines if payment is reusable.
	 * @since 1.0.0
	 * @var boolean
	 */
	protected $reusable = true;

	/**
	 * The current pix code mounted.
	 * @since 1.0.0
	 * @var string
	 */
	protected $pixCode = null;

	/**
	 * Defines if e-mail needs whitespace
	 * @since 1.1.0
	 * @var boolean
	 */
	protected $emailWhitespace = false;

	/**
	 * Defines if needs to convert characters to only valid characters.
	 * @since 1.1.0
	 * @var boolean
	 */
	protected $validCharacters = false;

	/**
	 * Defines if needs to uppercase data.
	 * @since 1.1.0
	 * @var boolean
	 */
	protected $upper = false;

	/**
	 * Ignore the point of initiation method.
	 * @since 1.1.0
	 * @var boolean
	 */
	protected $ignorePoIM = false;

	/**
	 * Replaces the @ character in e-mail key to a space.
	 * 
	 * @param bool $apply
	 * @since 1.1.0
	 * @since 1.2.0 Descontinuada.
	 * @return self
	 * @deprecated Aplica-se apenas as versões Pix anteriores a 2.
	 */
	public function applyEmailWhitespace ( bool $apply = true )
	{ $this->emailWhitespace = $apply; return $this; }

	/**
	 * Replaces any invalid character to a valid character.
	 * 
	 * @param bool $apply
	 * @since 1.1.0
	 * @return self
	 */
	public function applyValidCharacters ( bool $apply = true )
	{ $this->validCharacters = $apply; return $this; }

	/**
	 * Replaces any invalid character to a valid character.
	 * 
	 * @param bool $apply
	 * @since 1.1.0
	 * @return self
	 */
	public function applyUppercase ( bool $apply = true )
	{ $this->upper = $apply; return $this; }

	/**
	 * Ignore point of initiation method.
	 * 
	 * @param bool $apply
	 * @since 1.2.4
	 * @return self
	 */
	public function ignorePointOfInitiationMethod ( bool $apply = true )
	{ $this->ignorePoIM = $apply; return $this; }

	/**
	 * Set the current pix key.
	 * 
	 * EMV -> ID 26 . ID 01
	 * 
	 * @param string $keyType Pix key type.
	 * @param string $pixKey Pix key.
	 * @since 1.0.0
	 * @since 1.2.0 Custom exception errors.
	 * @return self
	 * @throws InvalidPixKeyTypeException When pix key type is invalid.
	 * @throws InvalidPixKeyException When pix key is invalid base in key type.
	 */
	public function setPixKey ( string $keyType, string $pixKey )
	{
		// Validate Key
		Parser::validate($keyType, $pixKey);

		// Parses key
		if ( $keyType === Parser::KEY_TYPE_EMAIL )
		{ $this->pixKey = Parser::parseEmail($pixKey, $this->emailWhitespace); }
		else 
		{ $this->pixKey = Parser::parse($keyType, $pixKey); }

		return $this; 
	}

	/**
	 * Set the current pix description.
	 * 
	 * EMV -> ID 26 . ID 02
	 * Max length 40
	 * 
	 * Merchant Account Information has size limit as 99
	 * characters including:
	 * 
	 * GUI ID+SIZE = 04 chars
	 * KEY ID+SIZE = 04 chars
	 * GUI SIZE = 14 chars
	 * KEY SIZE = 00..36 chars
	 * 
	 * The number of chars which has left will be vary based
	 * in GUI + KEY size. Which means at least it will have
	 * 40 chars available to description field. 
	 * 
	 * That's why we choose 40 chars as max length size.
	 * 
	 * @param string $description Pix description.
	 * @param bool $applyMaxLength Apply max length to field. Apply by default.
	 * @since 1.0.0
	 * @since 1.2.0 Max size limit increased to 40 chars.
	 * @since 1.2.4 Apply max length to field. Continue to apply by default.
	 * @return self
	 */
	public function setDescription ( string $description, bool $applyMaxLength = true )
	{ 
		$description = $applyMaxLength ? $this->applyLength('Description', $description, 40) : $description;
		$this->description = $this->replacesChar( $this->uppercase( $description ) ); 
		return $this; 
	}

	/**
	 * Set the current pix merchant name.
	 * 
	 * EMV -> ID 59
	 * Max length 25
	 * 
	 * @param string $merchantName Pix merchant name.
	 * @param bool $applyMaxLength Apply max length to field.
	 * @since 1.0.0
	 * @since 1.0.2 Removed character limit.
	 * @since 1.0.3 Removed applyLength function.
	 * @since 1.2.4 Apply max length to field.
	 * @since 1.2.7 Cannot allow digits as 0-9.
	 * @return self
	 */
	public function setMerchantName ( string $merchantName, bool $applyMaxLength = false )
	{ 
		$merchantName = $applyMaxLength ? $this->applyLength('Merchant Name', $merchantName, 25) : $merchantName;
		$this->merchantName = $this->replacesChar( $this->uppercase( $merchantName ), false ); 
		return $this; 
	}

	/**
	 * Set the current pix merchant city.
	 * 
	 * EMV -> ID 60
	 * Max length 15
	 * 
	 * @param string $merchantCity Pix merchant city.
	 * @param bool $applyMaxLength Apply max length to field.
	 * @since 1.0.0
	 * @since 1.0.2 Removed character limit.
	 * @since 1.0.3 Removed applyLength function.
	 * @since 1.2.4 Apply max length to field.
	 * @since 1.2.7 Cannot allow digits as 0-9.
	 * @return self
	 */
	public function setMerchantCity ( string $merchantCity, bool $applyMaxLength = false  )
	{ 
		$merchantCity = $applyMaxLength ? $this->applyLength('Merchant City', $merchantCity, 15) : $merchantCity;
		$this->merchantCity = $this->replacesChar( $this->uppercase( $merchantCity ), false ); 
		return $this; 
	}

	/**
	 * Set the current pix transaction id.
	 * 
	 * EMV -> ID 62 . ID 05
	 * Max length 25
	 * 
	 * When $tid is null, Parser::getRandom() will generate
	 * an unique transaction id. You can still use Parse::getRandom()
	 * as parameter of this method.
	 * 
	 * A static pix code created including a transaction id, 
	 * can be consulted by usign an pix api.
	 * 
	 * @param string|null $tid Pix transaction id.
	 * @since 1.0.0
	 * @since 1.2.0 Generate a random string when $tid is null.
	 * @return self
	 */
	public function setTid ( ?string $tid )
	{ 
		if ( is_null( $tid ) )
		{ $this->tid = Parser::getRandom(); }
		else
		{ $this->tid = $this->applyLength('Tid', $tid, 25); }

		return $this; 
	}

	/**
	 * Get the current transaction id. When setTid() was set to
	 * null, Parser::getRandom() will generate an unique transaction id.
	 * You may need to know this transaction id.
	 * 
	 * @since 1.2.0
	 * @return string
	 */
	public function getTid () : string
	{ return $this->tid; }

	/**
	 * Set the current pix transaction amount.
	 * 
	 * EMV -> ID 54
	 * Max length 13 0000000.00
	 * 
	 * @param string $amount Pix transaction amount.
	 * @since 1.0.0
	 * @since 1.2.0 Custom exception error.
	 * @return self
	 * @throws InvalidEmvFieldException When amount is greater than max length.
	 */
	public function setAmount ( float $amount )
	{ $this->amount = $this->applyLength('Amount', (string) number_format( $amount, 2, '.', '' ), 13, true); return $this; }

	/**
	 * Set the if the current pix can or can not be reusable.
	 * 
	 * EMV -> ID 01
	 * 
	 * @param string $reusable If pix can be reusable.
	 * @since 1.0.0
	 * @since 1.2.0 not change $reusable variable anymore
	 * @return self
	 */
	public function setAsReusable ( bool $reusable = true )
	{ $this->reusable = $reusable; return $this; }

	/**
	 * Get the current pix code.
	 * 
	 * @since 1.0.0
	 * @since 1.2.0 Custom exception error.
	 * @return string
	 * @throws EmvIdIsRequiredException When some field is invalid.
	 */
	public function getPixCode () : string
	{
		$this->pixCode = 
			$this->getPayloadFormat() .
			$this->getPointOfInitiationMethod() .
			$this->getMerchantAccountInformation() .
			$this->getMerchantCategoryCode() .
			$this->getTransactionCurrency() .
			$this->getTransactionAmount() .
			$this->getCountryCode() .
			$this->getMerchantName() .
			$this->getMerchantCity() .
			$this->getAdditionalDataFieldTemplate();

		$this->pixCode .= $this->getCRC16($this->pixCode);
		return $this->pixCode;	
	}

	/**
	 * Return the qr code based in current pix code.
	 * The qr code format is a base64 image/png.
	 * 
	 * @param string $imageType Type of output image.
	 * @since 1.0.0
	 * @since 1.0.2 Added support for output image.
	 * @since 1.2.2 Check if PHP supports QR Codes image.
	 * @return string
	 * @throws Exception When something went wrong.
	 * @throws QRCodeNotSupported QR Code is not supported.
	 */
	public function getQRCode ( string $imageType = self::OUTPUT_SVG, int $ecc = self::ECC_M ) : string
	{ 
		if ( !self::supportQrCode() )
		{ throw new QRCodeNotSupported(); }

		$options = new QROptions([
			'outputLevel' => $ecc,
			'outputType' => $imageType
		]);

		if ( empty( $this->pixCode ) ) 
		{ $this->getPixCode(); }

		return (new QRCode($options))->render($this->pixCode); 
	}

	/**
	 * Get the current payload format. Default is 01.
	 * 
	 * EMV -> ID 00
	 * 
	 * @since 1.0.0
	 * @return string
	 */
	protected function getPayloadFormat ()
	{ return '000201'; }

	/**
	 * Get the current point of initiation method.
	 * 
	 * EMV -> ID 01
	 * 
	 * @since 1.0.0
	 * @since 1.2.4 Point of initiation method can be ignored.
	 * @return string
	 */
	protected function getPointOfInitiationMethod ()
	{
		if ( $this->ignorePoIM )
		{ return ''; }

		return 
			$this->reusable ?
				// Reusable
				$this->formatID(
					self::ID_POINT_OF_INITIATION_METHOD,
					'11'
				) :
				// Unique
				$this->formatID(
					self::ID_POINT_OF_INITIATION_METHOD,
					'12'
				);
	}

	/**
	 * Get the current merchant account information.
	 * 
	 * EMV -> ID 26
	 * 
	 * @since 1.0.0
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

		// Current pix key
		// ID 01
		$key = $this->formatID(
			self::ID_MERCHANT_ACCOUNT_INFORMATION_KEY,
			$this->pixKey
		);

		// Current pix description
		// ID 02
		$description = $this->formatID(
			self::ID_MERCHANT_ACCOUNT_INFORMATION_DESCRIPTION,
			$this->description,
			false
		);

		return $this->formatID(
			self::ID_MERCHANT_ACCOUNT_INFORMATION,
			$gui.$key.$description
		);
	}

	/**
	 * Get the current merchant category code.
	 * 
	 * EMV -> ID 52
	 * 
	 * @since 1.0.0
	 * @return string
	 */
	protected function getMerchantCategoryCode ()
	{ return '52040000'; }

	/**
	 * Get the current transaction currency.
	 * 
	 * EMV -> ID 53
	 * 
	 * @since 1.0.0
	 * @return string
	 */
	protected function getTransactionCurrency () : string 
	{
		return $this->formatID(
			self::ID_TRANSACTION_CURRENCY,
			'986'
		);
	}

	/**
	 * Get the current transaction currency.
	 * 
	 * EMV -> ID 54
	 * 
	 * @since 1.0.0
	 * @return string
	 */
	protected function getTransactionAmount () : string 
	{
		return $this->formatID(
			self::ID_TRANSACTION_AMOUNT,
			$this->amount,
			false
		);
	}

	/**
	 * Get the current country code.
	 * 
	 * EMV -> ID 58
	 * 
	 * @since 1.0.0
	 * @return string
	 */
	protected function getCountryCode () : string 
	{ return '5802BR'; }

	/**
	 * Get the current merchant name.
	 * 
	 * EMV -> ID 59
	 * 
	 * @since 1.0.0
	 * @return string
	 */
	protected function getMerchantName () : string 
	{
		return $this->formatID(
			self::ID_MERCHANT_NAME,
			$this->merchantName
		);
	}

	/**
	 * Get the current merchant city.
	 * 
	 * EMV -> ID 60
	 * 
	 * @since 1.0.0
	 * @return string
	 */
	protected function getMerchantCity () : string 
	{
		return $this->formatID(
			self::ID_MERCHANT_CITY,
			$this->merchantCity
		);
	}

	/**
	 * Get the current addictional data field template.
	 * 
	 * EMV -> ID 62
	 * 
	 * @since 1.0.0
	 * @return string
	 */
	protected function getAdditionalDataFieldTemplate ()
	{
		// Current pix transaction id
		$tid = $this->formatID(
			self::ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TID,
			Parser::parseTid( $this->tid ),
			false
		);

		return $this->formatID(
			self::ID_ADDITIONAL_DATA_FIELD_TEMPLATE,
			$tid,
			false
		);
	}

	/**
	 * Get the current CRC16 by following standard values provieded by BACEN.
	 * 
	 * @since 1.0.0
	 * @since 1.2.8 Pad string with zeros at left.
	 * @param string $payload The full payload.
	 * @return string
	 */
	protected function getCRC16 ( string $payload )
	{
		// Standard data
		$payload .= self::ID_CRC16.'04'; 

		// Standard values by BACEN
		$polynomial = 0x1021;
		$response   = 0xFFFF;

		// Checksum
		if ( ( $length = strlen($payload) ) > 0 ) 
		{
			for ( $offset = 0; $offset < $length; $offset++ ) 
			{
				$response ^= ( ord( $payload[$offset] ) << 8 );
				
				for ( $bitwise = 0; $bitwise < 8; $bitwise++ ) 
				{
					if ( ( $response <<= 1 ) & 0x10000 ) 
					{ $response ^= $polynomial; }

					$response &= 0xFFFF;
				}
			}
	  }

	  // CRC16 calculated
	  return self::ID_CRC16.'04' . strtoupper( \str_pad( dechex( $response ), 4, '0', \STR_PAD_LEFT ) );
	}

	/**
	 * Return formated data following the EMV patterns.
	 * 
	 * @since 1.0.0
	 * @since 1.2.0 EMV field is required.
	 * @param string $id Data ID.
	 * @param string|null $value Data value.
	 * @param bool $required When data value is required.
	 * @return string Formated data.
	 * @throws EmvIdIsRequiredException When value is empty and required.
	 */
	protected function formatID ( string $id, $value, bool $required = true ) : string 
	{
		if ( empty( $value ) )
		{ 
			if ( $required ) 
			{ throw new EmvIdIsRequiredException($id); }
			else 
			{ return ''; } 
		}

		$valueSize = str_pad( mb_strlen($value), 2, '0', STR_PAD_LEFT );
		return $id.$valueSize.$value;
	}

	/**
	 * Replaces any invalid character to a valid one.
	 * 
	 * @since 1.1.0
	 * @param string $str
	 * @return string
	 */
	private function uppercase ( string $str ) : string
	{
		if ( !$this->upper )
		{ return $str; }

		return mb_strtoupper($str);
	}

	/**
	 * Replaces any invalid character to a valid one.
	 * 
	 * @since 1.1.0
	 * @since 1.2.7 Allow to remove or include digits.
	 * @param string $str
	 * @param bool $allowDigits If allow digits 0-9
	 * @return string
	 */
	private function replacesChar ( string $str, bool $allowDigits = true ) : string
	{
		if ( !$this->validCharacters )
		{ return $str; }

		$invalid = array("Á", "À", "Â", "Ä", "Ă", "Ā", "Ã", "Å", "Ą", "Æ", "Ć", "Ċ", "Ĉ", "Č", "Ç", "Ď", "Đ", "Ð", "É", "È", "Ė", "Ê", "Ë", "Ě", "Ē", "Ę", "Ə", "Ġ", "Ĝ", "Ğ", "Ģ", "á", "à", "â", "ä", "ă", "ā", "ã", "å", "ą", "æ", "ć", "ċ", "ĉ", "č", "ç", "ď", "đ", "ð", "é", "è", "ė", "ê", "ë", "ě", "ē", "ę", "ə", "ġ", "ĝ", "ğ", "ģ", "Ĥ", "Ħ", "Í", "Ì", "İ", "Î", "Ï", "Ī", "Į", "Ĳ", "Ĵ", "Ķ", "Ļ", "Ł", "Ń", "Ň", "Ñ", "Ņ", "Ó", "Ò", "Ô", "Ö", "Õ", "Ő", "Ø", "Ơ", "Œ", "ĥ", "ħ", "ı", "í", "ì", "î", "ï", "ī", "į", "ĳ", "ĵ", "ķ", "ļ", "ł", "ń", "ň", "ñ", "ņ", "ó", "ò", "ô", "ö", "õ", "ő", "ø", "ơ", "œ", "Ŕ", "Ř", "Ś", "Ŝ", "Š", "Ş", "Ť", "Ţ", "Þ", "Ú", "Ù", "Û", "Ü", "Ŭ", "Ū", "Ů", "Ų", "Ű", "Ư", "Ŵ", "Ý", "Ŷ", "Ÿ", "Ź", "Ż", "Ž", "ŕ", "ř", "ś", "ŝ", "š", "ş", "ß", "ť", "ţ", "þ", "ú", "ù", "û", "ü", "ŭ", "ū", "ů", "ų", "ű", "ư", "ŵ", "ý", "ŷ", "ÿ", "ź", "ż", "ž");
		$valid   = array("A", "A", "A", "A", "A", "A", "A", "A", "A", "AE", "C", "C", "C", "C", "C", "D", "D", "D", "E", "E", "E", "E", "E", "E", "E", "E", "G", "G", "G", "G", "G", "a", "a", "a", "a", "a", "a", "a", "a", "a", "ae", "c", "c", "c", "c", "c", "d", "d", "d", "e", "e", "e", "e", "e", "e", "e", "e", "g", "g", "g", "g", "g", "H", "H", "I", "I", "I", "I", "I", "I", "I", "IJ", "J", "K", "L", "L", "N", "N", "N", "N", "O", "O", "O", "O", "O", "O", "O", "O", "CE", "h", "h", "i", "i", "i", "i", "i", "i", "i", "ij", "j", "k", "l", "l", "n", "n", "n", "n", "o", "o", "o", "o", "o", "o", "o", "o", "o", "R", "R", "S", "S", "S", "S", "T", "T", "T", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "W", "Y", "Y", "Y", "Z", "Z", "Z", "r", "r", "s", "s", "s", "s", "B", "t", "t", "b", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "w", "y", "y", "y", "z", "z", "z");
		$str     = str_ireplace( $invalid, $valid, $str );
		$str     = $allowDigits ? preg_replace('/[^A-Za-z0-9\-\s]+/', '', $str) : preg_replace('/[^A-Za-z\s]+/', '', $str);

		return $str;
	}

	/**
	 * Cut data more than $maxLength.
	 * 
	 * @since 1.0.0
	 * @since 1.2.0 Added $emvField and custom exception.
	 * @param string $emvField
	 * @param string $value
	 * @param int $maxLength
	 * @param bool $throws To throw exception when exceed.
	 * @return string
	 * @throws InvalidEmvFieldException When value exceed max length.
	 */
	private function applyLength ( string $emvField, string $value, int $maxLength = 25, bool $throws = false )
	{
		if ( strlen($value) > $maxLength )
		{ 
			if ( $throws )
			{ throw new InvalidEmvFieldException($emvField, $value, sprintf('Excede o limite de %s caracteres.', $maxLength)); }

			return substr($value, 0, $maxLength);
		}

		return $value;
	}

	/**
	 * Return if php supports QR Code.
	 * 
	 * @since 1.2.2
	 * @return bool
	 */
	public static function supportQrCode () : bool
	{ return ((float)phpversion('Core') >= 7.2) && (extension_loaded('gd') && function_exists('gd_info')); }
}
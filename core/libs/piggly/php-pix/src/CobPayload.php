<?php
namespace Piggly\Pix;

use Piggly\Pix\Api\Interfaces\CobPayloadInterface;
use Piggly\Pix\Entities\Cob\Amount;
use Piggly\Pix\Entities\Cob\Calendar;
use Piggly\Pix\Entities\Cob\Location;
use Piggly\Pix\Entities\Cob\Person;
use Piggly\Pix\Exceptions\CannotParseKeyTypeException;
use Piggly\Pix\Exceptions\InvalidCobFieldException;

/**
 * The Cob Payload class.
 *
 * @since      1.2.0 
 * @package    Piggly\Pix
 * @subpackage Piggly\Pix
 * @author     Caique <caique@piggly.com.br>
 */
class CobPayload implements CobPayloadInterface
{
	/** @var string Cob status as "NAO_SETADO" . */
	const STATUS_NAO_SETADO = 'NAO_SETADO';
	/** @var string Cob status as "ATIVA" . */
	const STATUS_ATIVA = 'ATIVA';
	/** @var string Cob status as "CONCLUIDA" . */
	const STATUS_CONCLUIDA = 'CONCLUIDA';
	/** @var string Cob status as "REMOVIDA_PELO_USUARIO_RECEBEDOR" . */
	const STATUS_REMOVIDA_PELO_USUARIO_RECEBEDOR = 'REMOVIDA_PELO_USUARIO_RECEBEDOR';
	/** @var string Cob status as "REMOVIDA_PELO_PSP" . */
	const STATUS_REMOVIDA_PELO_PSP = 'REMOVIDA_PELO_PSP';

	/**
	 * Sender person.
	 * @since 1.2.0
	 * @var Person
	 */
	protected $sender;

	/**
	 * Recipient person.
	 * @since 1.2.0
	 * @var Person
	 */
	protected $recipient;

	/**
	 * Calendar rules.
	 * @since 1.2.0
	 * @var Calendar
	 */
	protected $calendar;

	/**
	 * Amount rules.
	 * @since 1.2.0
	 * @var Amount
	 */
	protected $amount;

	/**
	 * Location data.
	 * @since 1.2.0
	 * @var Location
	 */
	protected $location;

	/**
	 * Pix key.
	 * @since 1.2.0
	 * @var string
	 */
	protected $pixKey;

	/**
	 * Pix key type.
	 * @since 1.2.0
	 * @var string
	 */
	protected $pixKeyType;

	/**
	 * Transaction id.
	 * @since 1.2.0
	 * @var string
	 */
	protected $tid;

	/**
	 * RequestToRecipient.
	 * @since 1.2.0
	 * @var string
	 */
	protected $requestToRecipient;

	/**
	 * Additional fields.
	 * @since 1.2.0
	 * @var array
	 */
	protected $additionalFields = [];
	
	/**
	 * Cob revision.
	 * @since 1.2.0
	 * @var int
	 */
	protected $revision = 0;
	
	/**
	 * Cob status.
	 * @since 1.2.0
	 * @var string
	 */
	protected $status = self::STATUS_NAO_SETADO;

	/**
	 * Set the cob sender.
	 * 
	 * @param Person $person
	 * @since 1.2.0
	 * @return self
	 */
	public function setSender ( Person $person )
	{
		$this->sender = $person;
		return $this;
	}

	/**
	 * Set the cob recipient.
	 * 
	 * @param Person $person
	 * @since 1.2.0
	 * @return self
	 */
	public function setRecipient ( Person $person )
	{
		$this->recipient = $person;
		return $this;
	}

	/**
	 * Set the cob calendar rules.
	 * 
	 * @param Calendar $calendar
	 * @since 1.2.0
	 * @return self
	 */
	public function setCalendar ( Calendar $calendar )
	{
		$this->calendar = $calendar;
		return $this;
	}

	/**
	 * Set the cob amount rules.
	 * 
	 * @param Amount $amount
	 * @since 1.2.0
	 * @return self
	 */
	public function setAmount ( Amount $amount )
	{
		$this->amount = $amount;
		return $this;
	}

	/**
	 * Set the cob location data.
	 * 
	 * @param Location $location
	 * @since 1.2.0
	 * @return self
	 */
	public function setLocation ( Location $location )
	{
		$this->location = $location;
		return $this;
	}

	/**
	 * Set the cob pix key.
	 * 
	 * @param string $pixKey
	 * @since 1.2.0
	 * @return self
	 * @throws CannotParseKeyTypeException Cannot parse type of pix key, may be invalid.
	 */
	public function setPixKey ( string $pixKey )
	{
		$this->pixKeyType = Parser::getKeyType($pixKey);
		$this->pixKey = $pixKey;
		return $this;
	}

	/**
	 * Set the cob transaction id.
	 * 
	 * @param string $tid
	 * @since 1.2.0
	 * @return self
	 */
	public function setTid ( string $tid )
	{
		$this->tid = $tid;
		return $this;
	}

	/**
	 * Set the cob request to recipient.
	 * 
	 * @param string $requestToRecipient
	 * @since 1.2.0
	 * @return self
	 */
	public function setRequestToRecipient ( string $requestToRecipient )
	{
		$this->requestToRecipient = $requestToRecipient;
		return $this;
	}

	/**
	 * Add a custom field to cob.
	 * 
	 * @param string $fieldName
	 * @param string $fieldValue
	 * @since 1.2.0
	 * @return self
	 */
	public function addField ( string $fieldName, string $fieldValue )
	{
		$this->additionalFields[] = [
			'nome' => $fieldName,
			'valor' => $fieldValue
		];
	}

	/**
	 * Set the cob revision.
	 * 
	 * @param int $revision
	 * @since 1.2.0
	 * @return self
	 */
	public function setRevision ( int $revision )
	{
		$this->revision = $revision;
		return $this;
	}

	/**
	 * Set the cob status.
	 * 
	 * @param string $status
	 * @since 1.2.0
	 * @return self
	 */
	public function setStatus ( string $status )
	{
		switch ( $status )
		{
			case self::STATUS_ATIVA:
			case self::STATUS_CONCLUIDA:
			case self::STATUS_NAO_SETADO:
			case self::STATUS_REMOVIDA_PELO_PSP:
			case self::STATUS_REMOVIDA_PELO_USUARIO_RECEBEDOR:
				break;
			default:
				throw new InvalidCobFieldException('Status', $status, 'O status não foi identificado.');
		}

		$this->status = $status;
		return $this;
	}

	/**
	 * Return if current cob status is $expected.
	 * 
	 * @param string $expected
	 * @since 1.2.0
	 * @return bool
	 */
	public function isStatus ( string $expected ) : bool
	{ return $this->status === $expected; }

	/**
	 * Get sender to current cob.
	 * @since 1.2.0
	 * @return Person
	 */
	public function getSender () : Person
	{ return $this->sender; }

	/**
	 * Get recipient to current cob.
	 * @since 1.2.0
	 * @return Person
	 */
	public function getRecipient () : Person
	{ return $this->recipient; }

	/**
	 * Get calendar to current cob.
	 * @since 1.2.0
	 * @return Calendar
	 */
	public function getCalendar () : Calendar
	{ return $this->calendar; }

	/**
	 * Get amount to current cob.
	 * @since 1.2.0
	 * @return Amount
	 */
	public function getAmount () : Amount
	{ return $this->amount; }

	/**
	 * Get location to current cob.
	 * @since 1.2.0
	 * @return Location
	 */
	public function getLocation () : Location
	{ return $this->location; }

	/**
	 * Get pix key to current cob.
	 * @since 1.2.0
	 * @return string
	 */
	public function getPixKey () : string
	{ return $this->pixKey; }

	/**
	 * Get pix key to current cob.
	 * @since 1.2.0
	 * @return string
	 */
	public function getPixKeyType () : string
	{ return $this->pixKeyType; }

	/**
	 * Get request to recipient name to current cob.
	 * @since 1.2.0
	 * @return string
	 */
	public function getRequestToRecipient () : string
	{ return $this->requestToRecipient; }

	/**
	 * Get additional fields to current cob.
	 * @since 1.2.0
	 * @return array
	 */
	public function getAdditionalFields () : array
	{ return $this->additionalFields; }

	/**
	 * Get revision to current cob.
	 * @since 1.2.0
	 * @return int
	 */
	public function getRevision () : int
	{ return $this->revision; }

	/**
	 * Get status to current cob.
	 * @since 1.2.0
	 * @return string
	 */
	public function getStatus () : string
	{ return $this->status; }

	/**
	 * Get tid to current cob.
	 * @since 1.2.1
	 * @return string
	 */
	public function getTid () : string
	{ return $this->tid; }

	/**
	 * Import data to this cob object based in the cob response array model.
	 * 
	 * @param array $response
	 * @since 1.2.0
	 * @return self
	 */
	public function import ( array $response )
	{
		if ( isset($response['txid']) )
		{ $this->setTid($response['txid']); }

		if ( isset($response['revisao']) )
		{ $this->setRevision(intval($response['revisao'])); }

		if ( isset($response['solicitacaoPagador']) )
		{ $this->setRequestToRecipient($response['solicitacaoPagador']); }

		if ( isset($response['chave']) )
		{ $this->setPixKey($response['chave']); }

		if ( isset($response['status']) )
		{ $this->setStatus($response['status']); } 

		if ( isset($response['infoAdicionais']) )
		{ $this->additionalFields = $response['infoAdicionais']; }

		if ( isset($response['calendario']) )
		{ $this->setCalendar((new Calendar())->import($response['calendario'])); }

		if ( isset($response['loc']) )
		{ $this->setLocation((new Location())->import($response['loc'])); }

		if ( isset($response['devedor']) )
		{ $this->setRecipient((new Person())->import(Person::TYPE_DEVEDOR, $response['devedor'])); }
	
		if ( isset($response['recebedor']) )
		{ $this->setSender((new Person())->import(Person::TYPE_RECEBEDOR, $response['recebedor'])); }
		
		if ( isset($response['valor']) )
		{ $this->setAmount((new Amount())->import($response['valor'])); }

		return $this;
	}

	/**
	 * Export current payload data to an valid array.
	 * 
	 * @since 1.2.0
	 * @return array
	 */
	public function export () : array 
	{
		$array = [];

		if ( isset($this->calendar) )
		{ $array = \array_merge($array, $this->calendar->export()); }

		if ( isset($this->recipient) )
		{ $array = \array_merge($array, $this->recipient->export()); }

		if ( isset($this->amount) )
		{ $array = \array_merge($array, $this->amount->export()); }

		if ( isset($this->pixKey) )
		{ $array['chave'] = $this->pixKey; }

		if ( isset($this->requestToRecipient) )
		{ $array['solicitacaoPagador'] = $this->requestToRecipient; }

		if ( isset($this->additionalFields) )
		{ $array['infoAdicionais'] = $this->additionalFields; }

		if ( isset($this->tid) )
		{ $array['txid'] = $this->tid; }

		if ( isset($this->revision) )
		{
			if ( $this->revision !== 0 ) 
			{ $array['revision'] = $this->revision; }
		}

		if ( isset($this->status) )
		{
			if ( $this->status !== self::STATUS_NAO_SETADO ) 
			{ $array['status'] = $this->status; }
		}

		if ( isset($this->location) )
		{ $array = \array_merge($array, $this->location->export()); }

		if ( isset($this->sender) )
		{ $array = \array_merge($array, $this->sender->export()); }

		return $array;
	}
}
<?php
namespace Piggly\Pix\Entities\Cob;

use DateTime;

/**
 * This class represents a calendar cob data type.
 *
 * @since      1.2.0 
 * @package    Piggly\Pix
 * @subpackage Piggly\Pix
 * @author     Caique <caique@piggly.com.br>
 */
class Calendar
{
	/**
	 * Cob created at.
	 * @since 1.2.0
	 * @var DateTime
	 */
	protected $createdAt;

	/**
	 * Cob presented at.
	 * @since 1.2.0
	 * @var DateTime
	 */
	protected $presentedAt;

	/**
	 * Cob expires after x seconds.
	 * @since 1.2.0
	 * @var int
	 */
	protected $expiresIn;

	/**
	 * Cob due date.
	 * @since 1.2.0
	 * @var DateTime
	 */
	protected $dueDate;

	/**
	 * Cob expires after x days.
	 * @since 1.2.0
	 * @var int
	 */
	protected $expirationAfter;

	/**
	 * Set created at to current calendar.
	 * 
	 * @param string|DateTime $createdAt
	 * @since 1.2.0
	 * @return self
	 */
	public function setCreatedAt ( $createdAt )
	{
		if ( !($createdAt instanceof DateTime))
		{ $this->createdAt = new DateTime($createdAt); }
		else
		{ $this->createdAt = $createdAt; }

		return $this;
	}

	/**
	 * Set presented at to current calendar.
	 * 
	 * @param string|DateTime $presentedAt
	 * @since 1.2.0
	 * @return self
	 */
	public function setPresentedAt ( $presentedAt )
	{
		if ( !($presentedAt instanceof DateTime))
		{ $this->presentedAt = new DateTime($presentedAt); }
		else
		{ $this->presentedAt = $presentedAt; }

		return $this;
	}

	/**
	 * Set time in seconds to expiration of current calendar.
	 * 
	 * @param int $seconds
	 * @since 1.2.0
	 * @return self
	 */
	public function setExpiresIn ( int $seconds )
	{ 
		$this->expiresIn = $seconds;
		return $this;
	}

	/**
	 * Set due date to current calendar.
	 * 
	 * @param string|DateTime $dueDate
	 * @since 1.2.0
	 * @return self
	 */
	public function setDueDate ( $dueDate )
	{
		if ( !($dueDate instanceof DateTime))
		{ $this->dueDate = new DateTime($dueDate); }
		else
		{ $this->dueDate = $dueDate; }

		return $this;
	}

	/**
	 * Set time in days to expiration after due date of current calendar.
	 * 
	 * @param int $days
	 * @since 1.2.0
	 * @return self
	 */
	public function setExpirationAfter ( int $days )
	{ 
		$this->expirationAfter = $days;
		return $this;
	}

	/**
	 * Get date of creation to current calendar.
	 * @since 1.2.0
	 * @return DateTime
	 */
	public function getCreatedAt () : DateTime
	{ return $this->createdAt; }

	/**
	 * Get date of presentation to current calendar.
	 * @since 1.2.0
	 * @return DateTime
	 */
	public function getPresentedAt () : DateTime
	{ return $this->presentedAt; }

	/**
	 * Get time to expires in seconds to current calendar.
	 * @since 1.2.0
	 * @return int
	 */
	public function getExpiresIn () : int
	{ return $this->expiresIn; }

	/**
	 * Get due date to current calendar.
	 * @since 1.2.0
	 * @return DateTime
	 */
	public function getDueDate () : DateTime
	{ return $this->dueDate; }

	/**
	 * Get days after due date to expires to current calendar.
	 * @since 1.2.0
	 * @return int
	 */
	public function getExpirationAfter () : int
	{ return $this->expirationAfter; }

	/**
	 * Convert calendar to payload array as [ $type => [ $data ] ].
	 * 
	 * @since 1.2.0
	 * @return array
	 */
	public function export () : array
	{
		$array = [ 'calendario' => [] ];
		
		if ( isset( $this->createdAt ) )
		{ $array['calendario']['criacao'] = $this->createdAt->format(DateTime::RFC3339); }
		
		if ( isset( $this->presentedAt ) )
		{ $array['calendario']['apresentacao'] = $this->presentedAt->format(DateTime::RFC3339); }
		
		if ( isset( $this->expiresIn ) )
		{ $array['calendario']['expiracao'] = $this->expiresIn; }

		if ( isset( $this->dueDate ) )
		{ $array['calendario']['dataDeVencimento'] = $this->dueDate->format('yyyy-mm-dd'); }

		if ( isset( $this->expirationAfter ) )
		{ $array['calendario']['validadeAposVencimento'] = $this->expirationAfter; }

		return $array;
	}

	/**
	 * Import calendar data to array.
	 * 
	 * @param array $data
	 * @since 1.2.0
	 * @return self
	 */
	public function import ( array $data )
	{
		if ( isset ( $data['criacao'] ) )
		{ $this->setCreatedAt($data['criacao']); }

		if ( isset ( $data['apresentacao'] ) )
		{ $this->setPresentedAt($data['apresentacao']); }

		if ( isset ( $data['expiracao'] ) )
		{ $this->setExpiresIn($data['expiracao']); }

		if ( isset ( $data['dataDeVencimento'] ) )
		{ $this->setDueDate($data['dataDeVencimento']); }

		if ( isset ( $data['validadeAposVencimento'] ) )
		{ $this->setExpirationAfter($data['validadeAposVencimento']); }

		return $this;
	}
}
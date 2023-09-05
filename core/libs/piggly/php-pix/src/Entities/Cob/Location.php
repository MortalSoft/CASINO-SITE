<?php
namespace Piggly\Pix\Entities\Cob;

use Piggly\Pix\Exceptions\InvalidFieldException;

/**
 * The Cob Payload class.
 *
 * @since      1.2.0 
 * @package    Piggly\Pix
 * @subpackage Piggly\Pix
 * @author     Caique <caique@piggly.com.br>
 */
class Location
{
	/** @var string Immediate charge. */
	const TYPE_COB_IMMEDIATE = 'cob';
	/** @var string Charges due type. */
	const TYPE_COB_DUE = 'cobv';

	/**
	 * Location id.
	 * @since 1.2.0
	 * @var int
	 */
	protected $id;

	/**
	 * Location url.
	 * @since 1.2.0
	 * @var string
	 */
	protected $location;

	/**
	 * Location type.
	 * @since 1.2.0
	 * @var string
	 */
	protected $type = self::TYPE_COB_IMMEDIATE;

	/**
	 * Set the location id.
	 * 
	 * @param int $person
	 * @since 1.2.0
	 * @return self
	 */
	public function setId ( int $id )
	{
		$this->id = $id;
		return $this;
	}

	/**
	 * Set the location url.
	 * 
	 * @param string $location
	 * @since 1.2.0
	 * @return self
	 */
	public function setLocation ( string $location )
	{
		$this->location = $location;
		return $this;
	}

	/**
	 * Set the location type.
	 * 
	 * @param string $type
	 * @since 1.2.0
	 * @return self
	 */
	public function setType ( string $type )
	{
		switch ( $type )
		{
			case self::TYPE_COB_IMMEDIATE:
			case self::TYPE_COB_DUE:
				break;
			default:
				throw new InvalidFieldException('Tipo da Locação', $type, 'O tipo não foi identificado.');
		}

		$this->type = $type;
		return $this;
	}

	/**
	 * Get type to current location.
	 * @since 1.2.0
	 * @return int
	 */
	public function getType () : string
	{ return $this->type; }

	/**
	 * Get url to current location.
	 * @since 1.2.0
	 * @return string
	 */
	public function getLocationUrl () : string
	{ return $this->location; }

	/**
	 * Get id to current location.
	 * @since 1.2.0
	 * @return int
	 */
	public function getId () : int
	{ return $this->id; }

	/**
	 * Return if type is equal to $expected.
	 * @since 1.2.0
	 * @return bool
	 */
	public function isType ( string $expected ) : bool
	{ return $this->type === $expected; }

	/**
	 * Convert location to payload array as [ $type => [ $data ] ].
	 * 
	 * @since 1.2.0
	 * @return array
	 */
	public function export () : array
	{
		$array = [ 'loc' => [] ];
		
		if ( isset( $this->id ) )
		{ $array['loc']['id'] = $this->id; }
		
		if ( isset( $this->location ) )
		{ $array['loc']['location'] = $this->location; }
		
		if ( isset( $this->type ) )
		{ 
			if ( $this->type !== self::TYPE_COB_IMMEDIATE )
			{ $array['loc']['tipoCob'] = $this->type; }
		}
		
		return $array;
	}

	/**
	 * Import location data to array.
	 * 
	 * @param array $data
	 * @since 1.2.0
	 * @return self
	 */
	public function import ( array $data )
	{
		if ( isset ( $data['id'] ) )
		{ $this->setId(intval($data['id'])); }

		if ( isset ( $data['location'] ) )
		{ $this->setLocation($data['location']); }

		if ( isset ( $data['tipoCob'] ) )
		{ $this->setType($data['tipoCob']); }

		return $this;
	}
}
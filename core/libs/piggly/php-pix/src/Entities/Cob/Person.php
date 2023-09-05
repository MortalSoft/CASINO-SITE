<?php
namespace Piggly\Pix\Entities\Cob;

use Piggly\Pix\Exceptions\InvalidFieldException;
use Piggly\Pix\Parser;

/**
 * This class represents a person cob data type.
 *
 * @since      1.2.0 
 * @package    Piggly\Pix
 * @subpackage Piggly\Pix
 * @author     Caique <caique@piggly.com.br>
 */
class Person
{
	/** @var string "Devedor" person type. */
	const TYPE_DEVEDOR = 'devedor';
	/** @var string "Recebedor" person type. */
	const TYPE_RECEBEDOR = 'recebedor';

	/**
	 * Person document.
	 * @since 1.2.0
	 * @var string
	 */
	protected $document;

	/**
	 * Person document type.
	 * @since 1.2.0
	 * @var string
	 */
	protected $documentType;

	/**
	 * Person name.
	 * @since 1.2.0
	 * @var string
	 */
	protected $name;

	/**
	 * Person fantasy name.
	 * @since 1.2.0
	 * @var string
	 */
	protected $fantasyName;
	
	/**
	 * Person street address.
	 * @since 1.2.0
	 * @var string
	 */
	protected $streetAddress;
	
	/**
	 * Person city.
	 * @since 1.2.0
	 * @var string
	 */
	protected $city;
	
	/**
	 * Person state.
	 * @since 1.2.0
	 * @var string
	 */
	protected $state;
	
	/**
	 * Person zip code.
	 * @since 1.2.0
	 * @var string
	 */
	protected $zipCode;
	
	/**
	 * Person type.
	 * @since 1.2.0
	 * @var string
	 */
	protected $type;

	/**
	 * Create a person.
	 * 
	 * @param string $type 
	 * @since 1.2.0
	 * @return self
	 */
	public function __construct ( string $type = self::TYPE_DEVEDOR )
	{
		if ( $type !== self::TYPE_DEVEDOR && $type !== self::TYPE_RECEBEDOR )
		{ throw new InvalidFieldException('Tipo de Pessoa', $type, 'O tipo é desconhecido. Confira as constantes TYPE_* da classe.'); }

		$this->type = $type;
		return $this;
	}

	/**
	 * Set CPF/CNPJ to current person.
	 * 
	 * @param string $document
	 * @since 1.2.0
	 * @return self
	 * @throws InvalidFieldException When document is not a valid CPF/CNPJ.
	 */
	public function setDocument ( string $document )
	{
		if ( Parser::validateCpf($document) )
		{ 
			$this->document = $document; 
			$this->documentType = 'cpf';
			return $this; 
		}
		else if ( Parser::validateCnpj($document) )
		{ 
			$this->document = $document; 
			$this->documentType = 'cnpj';
			return $this; 
		}

		throw new InvalidFieldException('Documento', $document, 'Nenhum CPF/CNPJ válido detectado.');
	}

	/**
	 * Set name to current person.
	 * 
	 * @param string $name
	 * @since 1.2.0
	 * @return self
	 */
	public function setName ( string $name )
	{
		$this->name = $name;
		return $this;
	}

	/**
	 * Set fantasy name to current person.
	 * 
	 * @param string $fantasyName
	 * @since 1.2.0
	 * @return self
	 */
	public function setFantasyName ( string $fantasyName )
	{
		$this->fantasyName = $fantasyName;
		return $this;
	}

	/**
	 * Set street address to current person.
	 * 
	 * @param string $streetAddress
	 * @since 1.2.0
	 * @return self
	 */
	public function setStreetAddress ( string $streetAddress )
	{
		$this->streetAddress = $streetAddress;
		return $this;
	}

	/**
	 * Set city to current person.
	 * 
	 * @param string $city
	 * @since 1.2.0
	 * @return self
	 */
	public function setCity ( string $city )
	{
		$this->city = $city;
		return $this;
	}

	/**
	 * Set state to current person. As "UF" 2 chars.
	 * 
	 * @param string $state
	 * @since 1.2.0
	 * @return self
	 */
	public function setState ( string $state )
	{
		if ( strlen($state) > 2 )
		{ throw new InvalidFieldException('UF', $state, 'O estado precisa ser identificado com apenas duas letras.'); }

		$this->state = $state;
		return $this;
	}

	/**
	 * Set zipcode to current person. As "UF" 2 chars.
	 * 
	 * @param string $state
	 * @since 1.2.0
	 * @return self
	 */
	public function setZipCode ( string $zipcode )
	{
		if ( strlen($zipcode) > 2 )
		{ throw new InvalidFieldException('UF', $zipcode, 'O estado precisa ser identificado com apenas duas letras.'); }

		$this->zipcode = $zipcode;
		return $this;
	}

	/**
	 * Get document to current person.
	 * @since 1.2.0
	 * @return string
	 */
	public function getDocument () : string
	{ return $this->document; }

	/**
	 * Get document type to current person.
	 * @since 1.2.0
	 * @return string
	 */
	public function getDocumentType () : string
	{ return $this->documentType; }

	/**
	 * Get name to current person.
	 * @since 1.2.0
	 * @return string
	 */
	public function getName () : string
	{ return $this->name; }

	/**
	 * Get fantasy name to current person.
	 * @since 1.2.0
	 * @return string
	 */
	public function getFantasyName () : string
	{ return $this->fantasyName; }

	/**
	 * Get street address to current person.
	 * @since 1.2.0
	 * @return string
	 */
	public function getStreetAddress () : string
	{ return $this->streetAddress; }

	/**
	 * Get city to current person.
	 * @since 1.2.0
	 * @return string
	 */
	public function getCity () : string
	{ return $this->city; }

	/**
	 * Get state to current person.
	 * @since 1.2.0
	 * @return string
	 */
	public function getState () : string
	{ return $this->state; }

	/**
	 * Get zipcode to current person.
	 * @since 1.2.0
	 * @return string
	 */
	public function getZipCode () : string
	{ return $this->zipCode; }

	/**
	 * Get type to current person.
	 * @since 1.2.0
	 * @return string
	 */
	public function getType () : string
	{ return $this->type; }

	/**
	 * Return if type is equal to $expected.
	 * @since 1.2.0
	 * @return bool
	 */
	public function isType ( string $expected ) : bool
	{ return $this->type === $expected; }

	/**
	 * Convert person to payload array as [ $type => [ $data ] ].
	 * 
	 * @since 1.2.0
	 * @return array
	 */
	public function export () : array
	{
		$array = [ $this->type => [] ];
		
		if ( isset( $this->document ) )
		{ $array[$this->type][$this->documentType] = $this->document; }
		
		if ( isset( $this->name ) )
		{ $array[$this->type]['nome'] = $this->name; }
		
		if ( isset( $this->fantasyName ) )
		{ $array[$this->type]['nomeFantasia'] = $this->fantasyName; }
		
		if ( isset( $this->city ) )
		{ $array[$this->type]['cidade'] = $this->city; }
		
		if ( isset( $this->state ) )
		{ $array[$this->type]['uf'] = $this->state; }
		
		if ( isset( $this->streetAddress ) )
		{ $array[$this->type]['logradouro'] = $this->streetAddress; }
		
		if ( isset( $this->zipCode ) )
		{ $array[$this->type]['cep'] = $this->zipCode; }

		return $array;
	}

	/**
	 * Import person data to array.
	 * 
	 * @param string $type Person type
	 * @param array $data
	 * @since 1.2.0
	 * @return self
	 */
	public function import ( string $type, array $data )
	{
		if ( $type !== self::TYPE_DEVEDOR && $type !== self::TYPE_RECEBEDOR )
		{ throw new InvalidFieldException('Tipo de Pessoa', $type, 'O tipo é desconhecido. Confira as constantes TYPE_* da classe.'); }

		if ( isset ( $data['nome'] ) )
		{ $this->setName($data['nome']); }

		if ( isset ( $data['nomeFantasia'] ) )
		{ $this->setFantasyName($data['nomeFantasia']); }

		if ( isset ( $data['cpf'] ) )
		{ $this->setDocument($data['cpf']); }
		else if ( isset ( $data['cnpj'] ) )
		{ $this->setDocument($data['cnpj']); }

		if ( isset ( $data['logradouro'] ) )
		{ $this->setStreetAddress($data['logradouro']); }

		if ( isset ( $data['cidade'] ) )
		{ $this->setCity($data['cidade']); }

		if ( isset ( $data['cep'] ) )
		{ $this->setZipCode($data['cep']); }

		if ( isset ( $data['uf'] ) )
		{ $this->setState($data['uf']); }

		return $this;
	}
}

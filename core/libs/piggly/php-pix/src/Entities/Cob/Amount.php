<?php
namespace Piggly\Pix\Entities\Cob;

use DateTime;
use Piggly\Pix\Exceptions\InvalidFieldException;

/**
 * This class represents a amount cob data type.
 *
 * @since      1.2.0 
 * @package    Piggly\Pix
 * @subpackage Piggly\Pix
 * @author     Caique <caique@piggly.com.br>
 */
class Amount
{
	/** @var string Reduction modality as fixed */
	const REDUCTION_MODALITY_FIXED = "1";
	/** @var string Reduction modality as percentage */
	const REDUCTION_MODALITY_PERCENTAGE = "2";

	/** @var string Fee modality as fixed by day */
	const FEE_MODALITY_FIXED_REGULAR_CALENDAR = "1";
	/** @var string Fee modality as fixed by business day */
	const FEE_MODALITY_FIXED_BUSINESS_CALENDAR = "5";
	/** @var string Fee modality as percentage by day at regular calendar */
	const FEE_MODALITY_PERCENTAGE_BY_DAY_REGULAR_CALENDAR = "2";
	/** @var string Fee modality as percentage by mount at regular calendar */
	const FEE_MODALITY_PERCENTAGE_BY_MONTH_REGULAR_CALENDAR = "3";
	/** @var string Fee modality as percentage by year at regular calendar */
	const FEE_MODALITY_PERCENTAGE_BY_YEAR_REGULAR_CALENDAR = "4";
	/** @var string Fee modality as percentage by day at business calendar */
	const FEE_MODALITY_PERCENTAGE_BY_DAY_BUSINESS_CALENDAR = "6";
	/** @var string Fee modality as percentage by mount at business calendar */
	const FEE_MODALITY_PERCENTAGE_BY_MONTH_BUSINESS_CALENDAR = "7";
	/** @var string Fee modality as percentage by year at business calendar */
	const FEE_MODALITY_PERCENTAGE_BY_YEAR_BUSINESS_CALENDAR = "8";

	/** @var string Discount modality as fixed */
	const DISCOUNT_MODALITY_FIXED = "1";
	/** @var string Discount modality as fixed by day */
	const DISCOUNT_MODALITY_FIXED_REGULAR_CALENDAR = "3";
	/** @var string Discount modality as fixed by business day */
	const DISCOUNT_MODALITY_FIXED_BUSINESS_CALENDAR = "4";
	/** @var string Discount modality as percentage */
	const DISCOUNT_MODALITY_PERCENTAGE = "2";
	/** @var string Discount modality as percentage by day */
	const DISCOUNT_MODALITY_PERCENTAGE_REGULAR_CALENDAR = "5";
	/** @var string Discount modality as percentage by business day */
	const DISCOUNT_MODALITY_PERCENTAGE_BUSINESS_CALENDAR = "6";

	/** @var string Bank fine modality as fixed */
	const BANK_FINE_MODALITY_FIXED = "1";
	/** @var string Bank fine modality as percentage */
	const BANK_FINE_MODALITY_PERCENTAGE = "2";

	/**
	 * Original amount
	 * @since 1.2.0
	 * @var string
	 */
	protected $original;

	/**
	 * Final amount
	 * @since 1.2.0
	 * @var string
	 */
	protected $final;

	/**
	 * Reduction modality
	 * @since 1.2.0
	 * @var string
	 */
	protected $reductionModality;

	/**
	 * Reduction amount
	 * @since 1.2.0
	 * @var string
	 */
	protected $reductionValue;

	/**
	 * Fees modality
	 * @since 1.2.0
	 * @var string
	 */
	protected $feeModality;

	/**
	 * Fees amount
	 * @since 1.2.0
	 * @var string
	 */
	protected $feeValue;

	/**
	 * Bank fine modality
	 * @since 1.2.0
	 * @var string
	 */
	protected $bankFineModality;

	/**
	 * Bank fine amount
	 * @since 1.2.0
	 * @var string
	 */
	protected $bankFineValue;

	/**
	 * Discount modality
	 * @since 1.2.0
	 * @var string
	 */
	protected $discountModality;

	/**
	 * Discount amount
	 * @since 1.2.0
	 * @var string
	 */
	protected $discountValue;

	/**
	 * Discount rules
	 * @since 1.2.0
	 * @var array
	 */
	protected $discountDates = [];

	/**
	 * Set cob original amount. 
	 * 
	 * @param string $value
	 * @since 1.2.0
	 * @return self
	 */
	public function setOriginalAmount ( string $value )
	{
		$this->original = (string) number_format( $value, 2, '.', '' );
		return $this;
	}

	/**
	 * Set cob final amount. 
	 * 
	 * @param string $value
	 * @since 1.2.0
	 * @return self
	 */
	public function setFinalAmount ( string $value )
	{
		$this->final = (string) number_format( $value, 2, '.', '' );
		return $this;
	}

	/**
	 * Set reduction for cob amount. 
	 * 
	 * Percentage will always be at base 10. Not 0.10 by 10.00.
	 * 
	 * @param string $modality
	 * @param string $value
	 * @since 1.2.0
	 * @return self
	 * @throws InvalidFieldException when modality is invalid.
	 */
	public function setReduction ( string $modality, string $value )
	{
		switch ( $modality )
		{
			case self::REDUCTION_MODALITY_FIXED:
			case self::REDUCTION_MODALITY_PERCENTAGE:
				break;
			default:
				throw new InvalidFieldException('Modalidade do Abatimento', $modality, 'A modalidade não foi identificada.');
		}

		$this->reductionModality = $modality;
		$this->reductionValue = (string) number_format( $value, 2, '.', '' );

		return $this;
	}

	/**
	 * Set bank fine for cob amount. 
	 * 
	 * Percentage will always be at base 10. Not 0.10 by 10.00.
	 * 
	 * @param string $modality
	 * @param string $value
	 * @since 1.2.0
	 * @return self
	 * @throws InvalidFieldException when modality is invalid.
	 */
	public function setBankFine ( string $modality, string $value )
	{
		switch ( $modality )
		{
			case self::BANK_FINE_MODALITY_FIXED:
			case self::BANK_FINE_MODALITY_PERCENTAGE:
				break;
			default:
				throw new InvalidFieldException('Modalidade da Multa', $modality, 'A modalidade não foi identificada.');
		}

		$this->reductionModality = $modality;
		$this->reductionValue = (string) number_format( $value, 2, '.', '' );

		return $this;
	}

	/**
	 * Set fees for cob amount. 
	 * 
	 * Percentage will always be at base 10. Not 0.10 by 10.00.
	 * 
	 * @param string $modality
	 * @param string $value
	 * @since 1.2.0
	 * @return self
	 * @throws InvalidFieldException when modality is invalid.
	 */
	public function setFees ( string $modality, string $value )
	{
		switch ( $modality )
		{
			case self::FEE_MODALITY_FIXED_REGULAR_CALENDAR:
			case self::FEE_MODALITY_FIXED_BUSINESS_CALENDAR:
			case self::FEE_MODALITY_PERCENTAGE_BY_DAY_REGULAR_CALENDAR:
			case self::FEE_MODALITY_PERCENTAGE_BY_MONTH_REGULAR_CALENDAR:
			case self::FEE_MODALITY_PERCENTAGE_BY_YEAR_REGULAR_CALENDAR:
			case self::FEE_MODALITY_PERCENTAGE_BY_DAY_BUSINESS_CALENDAR:
			case self::FEE_MODALITY_PERCENTAGE_BY_MONTH_BUSINESS_CALENDAR:
			case self::FEE_MODALITY_PERCENTAGE_BY_YEAR_BUSINESS_CALENDAR:
				break;
			default:
				throw new InvalidFieldException('Modalidade do Juros', $modality, 'A modalidade não foi identificada.');
		}

		$this->feesModality = $modality;
		$this->feesValue = (string) number_format( $value, 2, '.', '' );

		return $this;
	}

	/**
	 * Set discount for cob amount. 
	 * 
	 * Percentage will always be at base 10. Not 0.10 by 10.00.
	 * 
	 * @param string $modality
	 * @param string $value Only when modality is 
	 * 				  self::DISCOUNT_MODALITY_FIXED_REGULAR_CALENDAR
	 * 				  or self::DISCOUNT_MODALITY_PERCENTAGE_BUSINESS_CALENDAR
	 * @since 1.2.0
	 * @return self
	 * @throws InvalidFieldException when modality is invalid; or $value is required
	 */
	public function setDiscount ( string $modality, string $value = null )
	{
		switch ( $modality )
		{
			case self::DISCOUNT_MODALITY_FIXED:
			case self::DISCOUNT_MODALITY_FIXED_REGULAR_CALENDAR:
			case self::DISCOUNT_MODALITY_FIXED_BUSINESS_CALENDAR:
			case self::DISCOUNT_MODALITY_PERCENTAGE:
			case self::DISCOUNT_MODALITY_PERCENTAGE_REGULAR_CALENDAR:
			case self::DISCOUNT_MODALITY_PERCENTAGE_BUSINESS_CALENDAR:
				break;
			default:
				throw new InvalidFieldException('Modalidade do Desconto', $modality, 'A modalidade não foi identificada.');
		}

		$this->discountModality = $modality;

		if ( ($modality === self::DISCOUNT_MODALITY_FIXED_REGULAR_CALENDAR 
				|| $modality === self::DISCOUNT_MODALITY_PERCENTAGE_BUSINESS_CALENDAR) 
				&& empty($value) )
		{ throw new InvalidFieldException('Valor do Desconto', '-ausente-', 'O valor do desconto para a modalidade escolhida precisa ser preencido.'); }
		else
		{ $this->discountValue = (string) number_format( $value, 2, '.', '' ); }

		return $this;
	}

	/**
	 * Add a discount by date.
	 * 
	 * @param string|DateTime $date
	 * @param string $value
	 * @since 1.2.0
	 * @return self
	 * @throws InvalidFieldException when modality is not set; when modality is not compatible
	 *			  when already has 3 date rules.
	 */
	public function addDiscountRule ( $date, string $value )
	{
		if ( empty($this->discountModality) )
		{ throw new InvalidFieldException('Desconto por Data', '-ignorado-', 'É preciso preencher a modalidade antes de adicionar os descontos por data.'); }
	
		switch ( $this->discountModality )
		{
			case self::DISCOUNT_MODALITY_FIXED:
			case self::DISCOUNT_MODALITY_PERCENTAGE:
				break;
			default:
				throw new InvalidFieldException('Desconto por Data', '-invalido-', 'Não pode ser preenchido em modalidades diferentes de 1 ou 2.');
		}

		if ( count($this->discountDates) > 3 )
		{ throw new InvalidFieldException('Desconto por Data', '-ignorado-', 'Você não pode adicionar mais valores.'); }

		if ( !($date instanceof DateTime))
		{ $date = new DateTime($date); }
		else
		{ $date = $date; }

		$this->discountDates[] = [
			'valorPerc' => $value,
			'data' => $date->format('yyyy-mm-dd')
		];
	}

	/**
	 * Get original amount to current amount data.
	 * @since 1.2.0
	 * @return int
	 */
	public function getOriginalAmount () : string
	{ return $this->original; }

	/**
	 * Get final amount to current amount data.
	 * @since 1.2.0
	 * @return int
	 */
	public function getFinalAmount () : string
	{ return $this->final; }

	/**
	 * Get reduction modality to current amount data.
	 * @since 1.2.0
	 * @return string
	 */
	public function getReductionModality () : string
	{ return $this->reductionModality; }

	/**
	 * Get reduction value to current amount data.
	 * @since 1.2.0
	 * @return string
	 */
	public function getReductionValue () : string
	{ return $this->reductionValue; }

	/**
	 * Return if reduction modality is equal to $expected.
	 * @since 1.2.0
	 * @return bool
	 */
	public function isReductionModality ( string $expected ) : bool
	{ return $this->reductionModality === $expected; }

	/**
	 * Get fee modality to current amount data.
	 * @since 1.2.0
	 * @return string
	 */
	public function getFeeModality () : string
	{ return $this->feeModality; }

	/**
	 * Get fee value to current amount data.
	 * @since 1.2.0
	 * @return string
	 */
	public function getFeeValue () : string
	{ return $this->feeValue; }

	/**
	 * Return if fee modality is equal to $expected.
	 * @since 1.2.0
	 * @return bool
	 */
	public function isFeeModality ( string $expected ) : bool
	{ return $this->feeModality === $expected; }

	/**
	 * Get bank fine modality to current amount data.
	 * @since 1.2.0
	 * @return string
	 */
	public function getBankFineModality () : string
	{ return $this->bankFineModality; }

	/**
	 * Get bank fine value to current amount data.
	 * @since 1.2.0
	 * @return string
	 */
	public function getBankFineValue () : string
	{ return $this->bankFineValue; }

	/**
	 * Return if bank fine modality is equal to $expected.
	 * @since 1.2.0
	 * @return bool
	 */
	public function isBankFineModality ( string $expected ) : bool
	{ return $this->bankFineModality === $expected; }

	/**
	 * Get discount modality to current amount data.
	 * @since 1.2.0
	 * @return string
	 */
	public function getDiscountModality () : string
	{ return $this->discountModality; }

	/**
	 * Get discount value to current amount data.
	 * @since 1.2.0
	 * @return string
	 */
	public function getDiscountValue () : string
	{ return $this->discountValue; }

	/**
	 * Get discount value to current amount data.
	 * @since 1.2.0
	 * @return array
	 */
	public function getDiscountDates () : array
	{ return $this->discountDates; }

	/**
	 * Return if discount modality is equal to $expected.
	 * @since 1.2.0
	 * @return bool
	 */
	public function isDiscountModality ( string $expected ) : bool
	{ return $this->discountModality === $expected; }

	/**
	 * Convert calendar to payload array as [ $type => [ $data ] ].
	 * 
	 * @since 1.2.0
	 * @return array
	 */
	public function export () : array
	{
		$array = [ 'valor' => [] ];
		
		if ( isset( $this->original ) )
		{ $array['valor']['original'] = $this->original; }
		
		if ( isset( $this->final ) )
		{ $array['valor']['final'] = $this->final; }
		
		if ( isset( $this->reductionModality ) )
		{ 
			$array['valor']['abatimento'] = [
				'modalidade' => $this->reductionModality,
				'valorPerc' => $this->reductionValue
			];
		}
		
		if ( isset( $this->bankFineModality ) )
		{ 
			$array['valor']['multa'] = [
				'modalidade' => $this->bankFineModality,
				'valorPerc' => $this->bankFineValue
			];
		}
		
		if ( isset( $this->feesModality ) )
		{ 
			$array['valor']['juros'] = [
				'modalidade' => $this->feesModality,
				'valorPerc' => $this->feesValue
			];
		}
		
		if ( isset( $this->discountModality ) )
		{ 
			$array['valor']['desconto'] = [
				'modalidade' => $this->discountModality
			];

			if ( isset($this->discountValue) )
			{ $array['valor']['desconto']['valorPerc'] = $this->discountValue; }

			if ( isset($this->discountDates) && !empty($this->discountDates) )
			{ $array['valor']['desconto']['descontoDataFixa'] = $this->discountDates; }
		}

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
		if ( isset ( $data['original'] ) )
		{ $this->setOriginalAmount($data['original']); }

		if ( isset ( $data['final'] ) )
		{ $this->setOriginalAmount($data['final']); }

		if ( isset ( $data['juros'] ) )
		{ $this->setFees($data['juros']['modalidade'], $data['juros']['valorPerc']); }

		if ( isset ( $data['multa'] ) )
		{ $this->setBankFine($data['multa']['modalidade'], $data['multa']['valorPerc']); }

		if ( isset ( $data['abatimento'] ) )
		{ $this->setReduction($data['abatimento']['modalidade'], $data['abatimento']['valorPerc']); }
		
		if ( isset ( $data['desconto'] ) )
		{ 
			$this->setDiscount(
				$data['desconto']['modalidade'], 
				isset($data['desconto']['valorPerc']) ? $data['abatimento']['valorPerc'] : null
			); 

			$this->discountDates = isset($data['desconto']['descontoDataFixa']) ? $data['desconto']['descontoDataFixa'] : null;
		}

		return $this;
	}
}
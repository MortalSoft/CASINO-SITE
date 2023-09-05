<?php
namespace Piggly\Tests\Pix;

use PHPUnit\Framework\TestCase;
use Piggly\Pix\Exceptions\EmvIdIsRequiredException;
use Piggly\Pix\Exceptions\InvalidPixKeyException;
use Piggly\Pix\Parser;
use Piggly\Pix\Payload;

/**
 * @coversDefaultClass \Piggly\Pix\Payload
 */
class PayloadTest extends TestCase
{
	/** @var array Pix data. */
	protected $pixData;

	/**
	 * Main data.
	 *
	 * @return void
	 */
	protected function setUp () : void
	{
		$this->pixData = [
			'keyType'  => Parser::KEY_TYPE_RANDOM,
			'keyValue' => 'aae2196f-5f93-46e4-89e6-73bf4138427b',
			'merchantName' => 'Studio Piggly',
			'merchantCity' => 'Uberaba',
			'amount' => 109.90, // float
			'tid' => 'Boleto 00001-00',
			'description' => 'Descrição do Pagamento!',
			'reusable' => false
		];
	}

	/** @test */
	public function aValidPixCodeWithAllData ()
	{
		$pix = 
			(new Payload())
				->setPixKey($this->pixData['keyType'], $this->pixData['keyValue'])
				->setMerchantName($this->pixData['merchantName'])
				->setMerchantCity($this->pixData['merchantCity'])
				->setAmount($this->pixData['amount'])
				->setTid($this->pixData['tid'])
				->setDescription($this->pixData['description']);

		$this->assertSame(
			'00020101021126850014br.gov.bcb.pix0136aae2196f-5f93-46e4-89e6-73bf4138427b0223Descrição do Pagamento!5204000053039865406109.905802BR5913Studio Piggly6007Uberaba62170513Boleto00001006304D7C7',
			$pix->getPixCode()
		);
	}

	/** @test */
	public function aValidPixQRCodeWithAllData ()
	{
		$pix = 
			(new Payload())
				->setPixKey($this->pixData['keyType'], $this->pixData['keyValue'])
				->setMerchantName($this->pixData['merchantName'])
				->setMerchantCity($this->pixData['merchantCity'])
				->setAmount($this->pixData['amount'])
				->setTid($this->pixData['tid'])
				->setDescription($this->pixData['description']);

		$this->assertSame(
			'data:image/png;base64,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',
			$pix->getQRCode(Payload::OUTPUT_PNG, Payload::ECC_L)
		);
	}

	/** @test */
	public function aValidPixCodeOnlyRequiredData ()
	{
		$pix = 
			(new Payload())
				->setPixKey($this->pixData['keyType'], $this->pixData['keyValue'])
				->setMerchantName($this->pixData['merchantName'])
				->setMerchantCity($this->pixData['merchantCity']);

		$this->assertSame(
			'00020101021126580014br.gov.bcb.pix0136aae2196f-5f93-46e4-89e6-73bf4138427b5204000053039865802BR5913Studio Piggly6007Uberaba62070503***6304B416',
			$pix->getPixCode()
		);
	}

	/** @test */
	public function emailToWhitespace ()
	{
		$pix = 
			(new Payload())
				->applyEmailWhitespace()
				->setPixKey(Parser::KEY_TYPE_EMAIL, 'caique@piggly.com.br')
				->setMerchantName($this->pixData['merchantName'])
				->setMerchantCity($this->pixData['merchantCity']);

		$this->assertSame(
			'00020101021126420014br.gov.bcb.pix0120caique piggly.com.br5204000053039865802BR5913Studio Piggly6007Uberaba62070503***63047D35',
			$pix->getPixCode()
		);
	}

	/** @test */
	public function removeInvalidChars ()
	{
		$pix = 
			(new Payload())
			->applyValidCharacters()
			->setPixKey($this->pixData['keyType'], $this->pixData['keyValue'])
			->setMerchantName($this->pixData['merchantName'])
			->setMerchantCity($this->pixData['merchantCity'])
			->setAmount($this->pixData['amount'])
			->setTid($this->pixData['tid'])
			->setDescription($this->pixData['description']);

		$this->assertSame(
			'00020101021126840014br.gov.bcb.pix0136aae2196f-5f93-46e4-89e6-73bf4138427b0222Descricao do Pagamento5204000053039865406109.905802BR5913Studio Piggly6007Uberaba62170513Boleto00001006304FA8A',
			$pix->getPixCode()
		);
	}

	/** @test */
	public function uppercaseAll ()
	{
		$pix = 
			(new Payload())
			->applyUppercase() 
			->setPixKey($this->pixData['keyType'], $this->pixData['keyValue'])
			->setMerchantName($this->pixData['merchantName'])
			->setMerchantCity($this->pixData['merchantCity'])
			->setAmount($this->pixData['amount'])
			->setTid($this->pixData['tid'])
			->setDescription($this->pixData['description']);

		$this->assertSame(
			'00020101021126850014br.gov.bcb.pix0136aae2196f-5f93-46e4-89e6-73bf4138427b0223DESCRIÇÃO DO PAGAMENTO!5204000053039865406109.905802BR5913STUDIO PIGGLY6007UBERABA62170513Boleto00001006304CF54',
			$pix->getPixCode()
		);
	}

	/** @test */
	public function removeInvalidCharsAndUppercaseAll ()
	{
		$pix = 
			(new Payload())
			->applyUppercase() 
			->applyValidCharacters()
			->setPixKey($this->pixData['keyType'], $this->pixData['keyValue'])
			->setMerchantName($this->pixData['merchantName'])
			->setMerchantCity($this->pixData['merchantCity'])
			->setAmount($this->pixData['amount'])
			->setTid($this->pixData['tid'])
			->setDescription($this->pixData['description']);

		$this->assertSame(
			'00020101021126840014br.gov.bcb.pix0136aae2196f-5f93-46e4-89e6-73bf4138427b0222DESCRICAO DO PAGAMENTO5204000053039865406109.905802BR5913STUDIO PIGGLY6007UBERABA62170513Boleto0000100630455C1',
			$pix->getPixCode()
		);
	}

	/** @test */
	public function throwExceptionWhenPixKeyNotSet ()
	{
		$this->expectException(EmvIdIsRequiredException::class);

		(new Payload())
			->setMerchantName($this->pixData['merchantName'])
			->setMerchantCity($this->pixData['merchantCity'])
			->getPixCode();
	}

	/** @test */
	public function throwExceptionWhenInvalidPixKey ()
	{
		$this->expectException(InvalidPixKeyException::class);

		(new Payload())
			->setPixKey($this->pixData['keyType'], '0000')
			->setMerchantName($this->pixData['merchantName'])
			->setMerchantCity($this->pixData['merchantCity'])
			->getPixCode();
	}

	/** @test */
	public function throwExceptionWhenPixMerchantNotSet ()
	{
		$this->expectException(EmvIdIsRequiredException::class);

		(new Payload())
			->setPixKey($this->pixData['keyType'], $this->pixData['keyValue'])
			->setMerchantCity($this->pixData['merchantCity'])
			->getPixCode();
	}

	/** @test */
	public function applyMaxLength()
	{
		$pix = (new Payload())
			->setPixKey($this->pixData['keyType'], $this->pixData['keyValue'])
			->setMerchantName('AAAAAAAAAAAAAAAAAAAAAAAAAB', true) // 26 caracteres, maximo 25
			->setMerchantCity('AAAAAAAAAAAAAAAB', true) // 16 caracteres, maximo 15
			->setAmount($this->pixData['amount'])
			->setTid($this->pixData['tid'])
			->setDescription('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB', true); // 41 caracteres, maximo 40

		$this->assertSame(
			'000201010211261020014br.gov.bcb.pix0136aae2196f-5f93-46e4-89e6-73bf4138427b0240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5204000053039865406109.905802BR5925AAAAAAAAAAAAAAAAAAAAAAAAA6015AAAAAAAAAAAAAAA62170513Boleto00001006304516D',
			$pix->getPixCode()
		);
	}
}

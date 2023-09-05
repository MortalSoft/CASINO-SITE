<?php
namespace Piggly\Tests\Pix;

use PHPUnit\Framework\TestCase;
use Piggly\Pix\Exceptions\InvalidPixCodeException;
use Piggly\Pix\Parser;
use Piggly\Pix\Reader;
use Piggly\Pix\StaticPayload;

/**
 * @coversDefaultClass \Piggly\Pix\Reader
 */
class ReaderTest extends TestCase
{
	/** 
	 * @covers ::isValidCode
	 * @test Expecting negative assertion.
	 * @return void
	 */
	public function isNotPixCodeValid ()
	{
		$this->expectException(InvalidPixCodeException::class);
		new Reader('0020101021126780014br.gov.bcb.pix0136285fb964-0087-4a94-851a-5a161ed8888a0216DS PIX PAGAMENTO52040000530398654041.005802BR5913STUDIO PIGGLY6007Uberaba62080504TX01630422D4');
	}

	/**
	 * Assert if $data matches with $expected.
	 *
	 * @covers ::getPixKey
	 * @covers ::getKeyType
	 * @covers ::getDescription
	 * @covers ::getMerchantName
	 * @covers ::getMerchantCity
	 * @covers ::getAmount
	 * @covers ::export
	 * @dataProvider dataToMatch
	 * @test Expecting positive assertion.
	 * @param mixed $expected
	 * @param mixed $data
	 * @return void
	 */
	public function isMatching ( $expected, $data )
	{ $this->assertEquals($expected, $data); }

	/**
	 * Provider to isMatching() method.
	 * @return array
	 */
	public function dataToMatch () : array
	{
		$pix_one = new Reader('00020101021126860014br.gov.bcb.pix0136285fb964-0087-4a94-851a-5a161ed8888a0224Solicitacao de pagamento52040000530398654041.005802BR5913STUDIO PIGGLY6007Uberaba62070503***63045C9B');
		$pix_two = new Reader('00020101021126780014br.gov.bcb.pix0136285fb964-0087-4a94-851a-5a161ed8888a0216DS PIX PAGAMENTO52040000530398654041.005802BR5913STUDIO PIGGLY6007Uberaba62080504TX01630422D4');

		return [
			['285fb964-0087-4a94-851a-5a161ed8888a', $pix_one->getPixKey()],
			['285fb964-0087-4a94-851a-5a161ed8888a', $pix_two->getPixKey()],
			[Parser::KEY_TYPE_RANDOM, Parser::getKeyType($pix_one->getPixKey())],
			[Parser::KEY_TYPE_RANDOM, Parser::getKeyType($pix_two->getPixKey())],
			['Solicitacao de pagamento', $pix_one->getDescription()],
			['DS PIX PAGAMENTO', $pix_two->getDescription()],
			['STUDIO PIGGLY', $pix_one->getMerchantName()],
			['STUDIO PIGGLY', $pix_two->getMerchantName()],
			['Uberaba', $pix_one->getMerchantCity()],
			['Uberaba', $pix_two->getMerchantCity()],
			[1, $pix_one->getAmount()],
			[1, $pix_two->getAmount()],
			[StaticPayload::class, get_class($pix_one->export())],
			[StaticPayload::class, get_class($pix_two->export())],
		];
	}
}
<?php
namespace Piggly\Tests\Pix;

use PHPUnit\Framework\TestCase;
use Piggly\Pix\CobPayload;

class CobPayloadTest extends TestCase
{
	/** @var array Cob Data. */
	protected $cobData;

	protected function setUp () : void
	{
		$this->cobData = [
			"calendario" => [
				"expiracao" => 3600
			],
			"devedor" => [
				"cnpj" => "12345678000195",
				"nome" => "Empresa de Serviços SA"
			],
			"valor" => [
				"original" => "37.00"
			],
			"chave" => "7d9f0335-8dcc-4054-9bf9-0dbd61d36906",
			"solicitacaoPagador" => "Serviço realizado.",
			"infoAdicionais" => [
				[
					"nome" => "Campo 1",
					"valor" => "Informação Adicional1 do PSP-Recebedor"
				],
				[
					"nome" => "Campo 2",
					"valor" => "Informação Adicional2 do PSP-Recebedor"
				]
			]
		];
	}

	/** @test */
	public function isImportingRight ()
	{
		$cob = (new CobPayload())->import($this->cobData);
		$this->assertSame($this->cobData, $cob->export());
	}
}
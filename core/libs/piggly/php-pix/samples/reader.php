<?php
use Piggly\Pix\DynamicPayload;
use Piggly\Pix\Exceptions\CannotParseKeyTypeException;
use Piggly\Pix\Exceptions\InvalidPixCodeException;
use Piggly\Pix\Parser;
use Piggly\Pix\Reader;
use Piggly\Pix\StaticPayload;

// Obtém o código pix informado pelo usuário
$pixCode = filter_input( INPUT_POST, 'pixCode', FILTER_SANITIZE_STRING );

try
{
	$reader = new Reader($pixCode);

	// Dados que podem ser obtidos
	$keyValue = $reader->getPixKey();
	$keyType  = Parser::getKeyType($keyValue);
	$merchantName = $reader->getMerchantName();
	$merchantCity = $reader->getMerchantCity();
	$amount = $reader->getAmount();
	$tid = $reader->getTid();

	/** @var StaticPayload|DynamicPayload Payload Pix exportado */
	$payload = $reader->export();

	/** @var StaticPayload Payload Pix manual */
	$payload = 
	(new StaticPayload())
		// ->applyValidCharacters()
		// ->applyUppercase()
		// ->applyEmailWhitespace()
		->setPixKey($keyType, $keyValue)
		->setMerchantName($merchantName)
		->setMerchantCity($merchantCity)
		->setAmount($amount)
		->setTid($tid)
		->setDescription('Descrição do Pix');

	// Continue o código
	
	// Código pix
	echo $pix->getPixCode();
	// QR Code
	echo '<img style="margin:12px auto" src="'.$pix->getQRCode().'" alt="QR Code de Pagamento" />';
}
catch ( InvalidPixCodeException $e )
{ /** Retorna que o código pix é inválido. */ }
catch ( CannotParseKeyTypeException $e )
{ /** Não foi possível determinar o tipo da chave pix. */ }
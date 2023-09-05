<?php
use Piggly\Pix\DynamicPayload;
use Piggly\Pix\Exceptions\EmvIdIsRequiredException;
use Piggly\Pix\Exceptions\InvalidEmvFieldException;
use Piggly\Pix\Exceptions\InvalidPixKeyException;
use Piggly\Pix\Exceptions\InvalidPixKeyTypeException;
use Piggly\Pix\StaticPayload;

try
{
	// Pix estático
	// Obtém os dados pix do usuário
	// -> Dados obrigatórios
	$keyType  = filter_input( INPUT_POST, 'keyType', FILTER_SANITIZE_STRING);
	$keyValue = filter_input( INPUT_POST, 'keyValue', FILTER_SANITIZE_STRING);
	$merchantName = filter_input( INPUT_POST, 'merchantName', FILTER_SANITIZE_STRING);
	$merchantCity = filter_input( INPUT_POST, 'merchantCity', FILTER_SANITIZE_STRING);

	// -> Dados opcionais
	$amount = filter_input( INPUT_POST, 'amount', FILTER_SANITIZE_STRING);
	$tid = filter_input( INPUT_POST, 'tid', FILTER_SANITIZE_STRING);
	$description = filter_input( INPUT_POST, 'description', FILTER_SANITIZE_STRING);

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
			->setDescription($description);

			
	// Pix dinâmico
	// Obtém os dados pix do usuário
	// -> Dados obrigatórios
	$merchantName = filter_input( INPUT_POST, 'merchantName', FILTER_SANITIZE_STRING);
	$merchantCity = filter_input( INPUT_POST, 'merchantCity', FILTER_SANITIZE_STRING);

	// Obtém os dados do SPI para o Pix
	$payload = 
	(new DynamicPayload())
		->setPayloadUrl($spiUrl) // URL do Pix no SPI
		->setMerchantName($merchantName)
		->setMerchantCity($merchantCity);
		
	// Continue o código

	// Código pix
	echo $pix->getPixCode();
	// QR Code
	echo '<img style="margin:12px auto" src="'.$pix->getQRCode().'" alt="QR Code de Pagamento" />';
}
catch ( InvalidPixKeyException $e )
{ /** Retorna que a chave pix está inválida. */ }
catch ( InvalidPixKeyTypeException $e )
{ /** Retorna que a chave pix está inválida. */ }
catch ( InvalidEmvFieldException $e )
{ /** Retorna que algum campo está inválido. */ }
catch ( EmvIdIsRequiredException $e )
{ /** Retorna que um campo obrigatório não foi preenchido. */ }
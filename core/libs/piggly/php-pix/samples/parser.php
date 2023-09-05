<?php
use Piggly\Pix\Exceptions\InvalidPixKeyException;
use Piggly\Pix\Exceptions\InvalidPixKeyTypeException;
use Piggly\Pix\Parser;

// Tratando dados de um formulário
// Inputs digitados pelo usuário
$keyType = filter_input ( INPUT_POST, 'keyType', FILTER_SANITIZE_STRING );
$key = filter_input ( INPUT_POST, 'key', FILTER_SANITIZE_STRING );

if ( empty( $keyType ) 
		|| empty( $key ) )
{ /** Retorna para o usuário que a chave é obrigatória */ }

try
{ 
	Parser::validate($keyType, $key); 

	// Continue o código...
}
catch ( InvalidPixKeyTypeException $e )
{ /** Retorna para o usuário que tipo da chave está inválido... */ }
catch ( InvalidPixKeyException $e )
{ /** Retorna para o usuário que a chave está inválida... */ }

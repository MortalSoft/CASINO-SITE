<?php
namespace Piggly\Pix\Exceptions;

use Exception;

class QRCodeNotSupported extends Exception
{
	/**
	 * Exception when does not have support to QR Code
	 * 
	 * @since 1.2.2
	 */
	public function __construct ()
	{ parent::__construct('Para gerar QR Codes, certifique-se de ter a versão `7.2` do PHP instalada e a extensão `gd`.'); }
}
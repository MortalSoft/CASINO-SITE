<?php
use Piggly\Pix\Api\BaseApi;

// Crie uma classe para o Banco/SPI e extenda BaseApi
// Configura a classe BaseApi
$bradesco = BradescoApi::use(
	'https://qrpix-h.bradesco.com.br',
	SSL_CERT_ABSPATH,
	SSL_CERT_PASS
)->addEndpoint(
	BaseApi::ENDPOINT_CREATE_COB,
	BaseApi::REQUEST_METHOD_POST,
	'/cob/{tid}'
)->addEndpoint(
	BaseApi::ENDPOINT_UPDATE_COB,
	BaseApi::REQUEST_METHOD_PATCH,
	'/cob/{tid}'
)->addEndpoint(
	BaseApi::ENDPOINT_GET_COB,
	BaseApi::REQUEST_METHOD_GET,
	'/cob/{tid}'
);

// Obtem o token de acesso
$bradesco->oAuth(
	BaseApi::REQUEST_METHOD_POST,
	'/auth/server/oauth/token',
	CLIENT_ID,
	CLIENT_SECRET
);

// Crie um payload para a cobrança implementando CobPayloadInterface
$cob = new BradescoCobPayload();
// Crie os dados do $cob
// Envie o $cob e receba os novos dados
$cob = $bradesco->createCob($cob);
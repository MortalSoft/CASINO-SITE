# Changelog

## 1.2.8

* Correção no CRC16 quando o hexadecimal possui zeros à esquerda.

## 1.2.7

* Correções no método `Parser::getKeyType()` e no método `Payload::replacesChar()`.
* Atualizações dos testes.

## 1.2.6

* Correção do método `Parser::parseTid` para receber o valor `***`.

## 1.2.5

* Correção de bugs.

## 1.2.4

* Adição do método `ignorePointOfInitiationMethod()` para não retornar o **Point of Initiation Method** do código Pix criado;
* Adição do parâmetro `$applyMaxLength` nos métodos `setDescription()`, `setMerchantName()` e `setMerchantCity()` que cortará os valores respeitando os limites de `40`, `25` e `15` caracteres respectivamente. O valor padrão do `$applyMaxLength` é `true` para `setDescription()` e `false` para `setMerchantName()` e `setMerchantCity()`;
* Adição do método `getField()` na classe `Reader` para obter qualquer campo EMV a partir do seu ID. O método `$additionalDataField = $reader->getField('62')` retorna o EMV com ID `62`, para obter os campos dentro desse EMV basta enviá-lo e obter o ID desejado `$tid = $reader->getField('05', $additionalDataField)`.

## 1.2.3

* Remoção do tipo de retorno `: self` habilitando funcionalidade para PHP 7+, entretanto, para QR Code permanece 7.2+.

## 1.2.2

* A exceção `QRCodeNotSupported` foi criada para impedir a criação do QR Code se a versão do PHP for inferior a 7.2 e a extensão `gd` não estiver instalada.

## 1.2.1

* A base de comunicação com as **Apis Pix**, agora você poderá utilizar nossa estrutura para melhorar seu processo de comunicação com qualquer Api Pix. Veja mais detalhes [aqui](https://github.com/piggly-dev/php-pix/wiki);
* Criação da documentação do código disponível [aqui](https://github.com/piggly-dev/php-pix/wiki).

## 1.2.0

* A segunda grande mudança da biblioteca, a fim de fazer ponte com as **Apis Pix**. Criações das classes `StaticPayload` e `DynamicPayload`, além de inclusões de novas funcionalidades. Veja os detalhes no [Release 1.2.0](https://github.com/piggly-dev/php-pix/releases/tag/1.2.0) *(necessário para atualizar das versões 1.1.\* para 1.2.\*)*.

## 1.1.2

* Alinhamento com a última versão do Pix e tratamento do `tid`;

## 1.1.1

* Suporte para PHP 7.2

## 1.1.0

* Essa é a primeira grande mudança da biblioteca. Lapidamos melhor alguns métodos da classe `Parser`, adicionamos modificadores na classe `Payload` e criamos a classe `Reader` para extrair dados de códigos Pix válidos. Veja os detalhes no [Release 1.1.0](https://github.com/piggly-dev/php-pix/releases/tag/1.1.0) *(necessário para atualizar das versões 1.0.\* para 1.1.\*)*.

## 1.0.4

* Correção de bugs.

## 1.0.3

* Correção de bugs.

## 1.0.2

* Remoção dos limites de caracteres para Merchant Name e Merchant City.
* Adição do tipo de formato de saída da imagem do QR Code.

## 1.0.1

* Correção de bugs.

## 1.0.0

* Versão inicial da biblioteca.
# Contribuindo

As contribuições são **bem-vindas** e serão totalmente **creditadas**. Mas é importante seguir os padrões determinados neste documento para sempre manter a consistência do código.

Leia e entenda o guia de contribuição antes de criar uma *issue* ou *pull request*.

## Etiqueta

Este projeto é de código aberto e, como tal, os contribuidores dão seu tempo livre para construir e manter o código-fonte contido nele. Eles disponibilizam o código gratuitamente na esperança de que seja útil para outros desenvolvedores. Seria extremamente injusto para eles sofrerem ofenças por seu trabalho árduo.

Por favor, seja atencioso com os contribuidores ao levantar questões ou apresentar as suas *pull requests*. Dedicamos um tempo, também, para construir uma [wiki](https://github.com/piggly-dev/php-pix/wiki) para essa biblioteca. Talvez suas questões sejam resolvidas por lá. Vamos mostrar ao mundo que os desenvolvedores são pessoas civilizadas e altruístas.

É dever do contribuidor, ainda, garantir que todas as submissões ao projeto sejam de qualidade suficiente para beneficiá-lo. Muitos desenvolvedores têm diferentes conjuntos de habilidades, pontos fortes e fracos. Respeite a decisão do contribuidor e não fique chateado ou ofendido se o seu envio não for utilizado.

## Branches

Somente os três branches abaixo serão permanentes:

* `master` é o branch intocável;
* `dev` é o branch de desenvolvimento da versão mais recente;
* `v1.x.x` é o branch de desenvolvimento da versão 1.x.x;

Os branches temporários são:

* `hotfix/<id>` envia `PATCHS` de correção para a última versão estável, pull requests desse tipo podem ser enviadas para o `master` e o `v1.x.x`;
* `feature/<nome>` cria novos recursos que mantém a compatibilidade com a última versão estável, são criados e enviados a partir do branch `dev`, sem excessões;
* `release/<versão>` finaliza uma série de recursos para uma nova versão estável a partir do `dev` que deve ser refletida para o `master` com tag;
* `bugfix/<id>` envia `PATCHS` de correção para o `release` antes de ser refletido para os demais branches.

## Viabilidade

Ao solicitar ou enviar novos recursos, primeiro considere se eles podem ser úteis para outras pessoas. Projetos de código aberto são usados ​​por muitos desenvolvedores, que podem ter necessidades totalmente diferentes das suas. Pense se o seu recurso pode ou não ser usado por outros usuários do projeto.

## Procedimento

Antes de registrar uma *issue*:

- Tente replicar o problema, para garantir que não foi um incidente coincidente;
- Certifique-se de que sua sugestão de recurso ainda não esteja presente no projeto;
- Verifique a guia de *[pull requests](https://github.com/piggly-dev/php-pix/pulls)* para garantir que o bug não tenha uma correção em andamento;
- Também, verifique a guia de *[pull requests](https://github.com/piggly-dev/php-pix/pulls)* para garantir que o recurso ainda não esteja em andamento.

Antes de enviar uma *pull request*:

- Verifique a base de código para garantir que seu recurso ainda não exista;
- Verifique as *[pull requests](https://github.com/piggly-dev/php-pix/pulls)* para garantir que outra pessoa ainda não tenha enviado o recurso ou correção.

## Requisitos

- **[Padrão de codificação PSR-4](https://www.php-fig.org/psr/psr-4/)**;

- **Adicione testes!** - Seu patch não será aceito se não tiver testes;

- **Documente qualquer mudança de comportamento** - Certifique-se de que o `README.md` e qualquer outra documentação relevante sejam mantidos atualizados;

- **Considere nosso ciclo de lançamento** - Tentamos seguir [SemVer v2.0.0] (https://semver.org/). Quebrar APIs públicas aleatoriamente não é uma opção;

- **Gitflow Workflow** - Para ser consistente, este projeto segue o padrão de fluxo de trabalho, certifique-se de usá-lo ao enviar qualquer solicitação pull.

- **Uma pull request por recurso** - Se você quiser fazer mais de uma coisa, envie várias pull requests.

## Como?

Primeiro, dê um **fork** neste repositório. Então, no branch `dev`, crie um novo branch `feature/<nome>`:

```bash
# -> Certifique-se de que você está no ramo de desenvolvimento
git checkout dev
# <- Puxe o branch de desenvolvimento antes de criar um novo branch
git pull origin dev
# -> Crie um novo branch do tipo feature onde <nome> é um nome que identifica o seu recurso
git checkout -b feature/<nome>
```

No branch `feature/<nome>` você pode fazer quantos `commits` forem necessários necessário:

```bash
# == Para que as coisas funcionem bem, sempre faça commits, não se preocupe com eles, apenas organize-se, faremos um squash quando a pull request for aceita
git add -A
git commit -m "<mensagem>"
```

Depois que seu trabalho estiver concluído, dê um **push** de `feature/<nome>` para seu repositório de origem e faça uma pull request a partir dele.

### Você quer concertar um bug?

Caso sua pull request vise concertar um bug, ao invés do branch `feature` deve ser criado um branch de `hotfix/<id>` a partir do `master` ou da versão ativa que deve ser corrigida.

## Testes

Esta biblioteca usa o **PHPUnit**. Realizamos testes de todas as classes principais desta aplicação.

```bash
vendor /bin/phpunit
```

Você deve sempre executar testes com todas as versões do PHP atualmente compatíveis em `composer.json`. Por exemplo:

```bash
php7.4 vendor /bin/phpunit
php8.0 vendor /bin/phpunit
```

**Bom desenvolvimento**!
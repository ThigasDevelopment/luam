# MTA

O Luam foi feito especificamente para o Multi Theft Auto. Ele sabe qual API
pertence a qual lado, quais eventos existem, como um resource (recurso do MTA) se
parece em disco e onde fica a fronteira entre o servidor e a máquina de um
jogador.

| Página | O que cobre |
| --- | --- |
| [Ambientes](/pt-br/mta/environments) | Como `server`, `client` e `shared` são decididos e cobrados. |
| [APIs e eventos](/pt-br/mta/apis-and-events) | O catálogo gerado, os tipos de elemento e o escopo dos eventos. |
| [API OOP](/pt-br/mta/oop) | `player:getName()`, métodos estáticos e construtores chamáveis. |
| [Resources e meta.xml](/pt-br/mta/resources) | O que um build escreve e como o manifesto é gerado. |
| [config.lua e .env](/pt-br/mta/configuration) | Os dois arquivos de configuração e quem é dono de cada um. |
| [Fronteiras de segurança](/pt-br/mta/security) | O que um cliente pode ver, e o que precisa ficar no servidor. |

## O catálogo

O compilador traz um catálogo gerado da superfície do MTA:

| Tipo | Quantidade |
| --- | --- |
| Declarações de API | 1413 |
| Eventos | 221 |
| Tipos de elemento | 58 |
| Classes OOP | 58 |
| Métodos OOP | 656 |
| Métodos estáticos OOP | 120 |
| Construtores OOP | 47 |

A biblioteca padrão de Lua 5.1 é declarada junto. O catálogo é gerado a partir do
wiki do MTA, então pode ficar atrás de uma versão: um nome que o catálogo não
conhece continua sendo `any`, o que significa que uma declaração faltando nunca
bloqueia um build.

## A regra que pega mais bugs

Todo arquivo é `server`, `client` ou `shared`, e isso decide quais APIs e eventos
resolvem:

```luam static
#!client

dxDrawText('hud', 10, 10)     # ok
kickPlayer(target, 'afk')     # erro: kickPlayer é exclusivo do servidor
```

Arquivos `server` e `client` podem usar declarações `shared`. Um arquivo `shared`
pode usar apenas as `shared`. `server` e `client` nunca enxergam um ao outro.

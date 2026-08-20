# Rigor de verificação

Uma diretiva nas primeiras linhas de um arquivo decide o quanto o checker exige. O
padrão é `#!strict` — você nunca precisa escrevê-lo.

| Diretiva | Efeito |
| --- | --- |
| `#!strict` | Padrão. Toda regra de tipo é aplicada. |
| `#!nonstrict` | Valores sem anotação são tratados como `any`; os anotados continuam verificados. |
| `#!nocheck` | O arquivo é analisado e compilado, mas não verificado. |

```luam
#!nonstrict

function readLegacyGreeting(): string
    local greeting = Config.greeting

    return greeting
end
```

## Por arquivo, não por projeto

O rigor é uma propriedade de um arquivo. Um módulo `#!nocheck` ao lado de um
módulo `#!strict` é normal e esperado — é assim que um projeto migra um arquivo de
cada vez.

A diretiva precisa aparecer antes do primeiro comando. Diretivas de ambiente
(`#!server`, `#!client`, `#!shared`) podem ficar ao lado, em qualquer ordem:

```luam env=client
#!client
#!nonstrict
```

## O que cada nível ainda faz

Mesmo com `#!nocheck`, o arquivo continua sendo **lido e analisado**. Erros de
sintaxe continuam sendo erros, o arquivo continua sendo compilado para Lua e
continua contribuindo com seus scripts para o `meta.xml`. O que para é a
verificação de tipos.

`#!nonstrict` fica no meio: as anotações que você escreveu são respeitadas, mas um
valor sem anotação é `any` em vez de ser inferido e cobrado. É o nível a usar
quando um módulo lê muitos dados sem tipo.

::: tip Verificação de ambiente não é rigor
A regra `server` / `client` / `shared` **não** faz parte do rigor. Um arquivo
`#!nocheck` continua sem poder chamar uma API só de cliente a partir de
`src/server`, porque o ambiente decide qual API existe. Veja
[Ambientes](/pt-br/mta/environments).
:::

## Migrando Lua existente

1. Renomeie `main.lua` para `main.luam`.
2. Coloque `#!nocheck` na primeira linha. O build passa.
3. Troque comentários `--` por `#`, e `!=` por `~=`, se o arquivo tiver algum.
4. Mude para `#!nonstrict` e anote a superfície exportada.
5. Apague a diretiva quando o arquivo estiver limpo sob `#!strict`.

Os passos 2 a 5 podem ser espalhados por quantos commits você quiser; cada um é um
arquivo que continua construindo.

## Um exemplo completo

<<< @/snippets/language/src/shared/strictness.luam

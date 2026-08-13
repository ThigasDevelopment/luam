# Diretivas

Uma diretiva é uma linha `#!` no topo de um arquivo, antes do primeiro comando.
Ela configura **apenas aquele arquivo**.

```luam
#!client
#!nonstrict
```

Várias diretivas podem aparecer juntas, em qualquer ordem. Uma linha `#!` depois do
primeiro comando não é uma diretiva.

## Diretivas de ambiente

| Diretiva | Efeito |
| --- | --- |
| `#!server` | O arquivo roda no servidor. |
| `#!client` | O arquivo roda no cliente. |
| `#!shared` | O arquivo roda nos dois lados e pode usar apenas declarações compartilhadas. |

Uma diretiva **sobrepõe a pasta**, e é isso que permite a um arquivo viver fora de
`src/server`, `src/client` ou `src/shared`:

```luam
#!client

dxDrawText('hud', 10, 10)
```

Sem diretiva, o ambiente vem do primeiro segmento de caminho dentro de um diretório
de código. Veja [Ambientes](/pt-br/mta/environments).

O ambiente também decide o atributo `type` que o arquivo compilado recebe no
`meta.xml`.

## Diretivas de rigor

| Diretiva | Efeito |
| --- | --- |
| `#!strict` | Padrão. Toda regra de tipo é aplicada. |
| `#!nonstrict` | Valores sem anotação são `any`; as anotações que você escreveu continuam verificadas. |
| `#!nocheck` | O arquivo é analisado e compilado, mas não verificado. |

`#!strict` nunca precisa ser escrito — é o que um arquivo sem diretiva de rigor
recebe. Veja [Rigor de verificação](/pt-br/language/strictness).

::: warning O rigor não relaxa a regra de ambiente
Mesmo sob `#!nocheck`, uma API só de cliente em um arquivo de servidor é
`check-environment-api`. O ambiente decide qual API existe, o que não é uma
questão de tipos.
:::

## Combinando diretivas

```luam
#!shared
#!nocheck
```

Uma diretiva de ambiente mais uma de rigor é a combinação útil. Duas diretivas de
ambiente **diferentes** em um arquivo é `env-conflicting-directive`: um arquivo
declara um único ambiente.

Uma diretiva que discorda do caminho do arquivo é permitida — a diretiva vence —
mas reporta `env-path-directive-conflict` como **warning**, então um arquivo que
saiu da sua pasta fica visível sem falhar o build.

## O que uma diretiva não é

- Não é um shebang. O compilador nunca executa um arquivo.
- Não é uma configuração de projeto. Use o
  [`.luam.manifest`](/pt-br/tooling/luam-manifest) para qualquer coisa que atravesse
  arquivos.
- Não é uma instrução de build. As diretivas que configuravam o `meta.xml` —
  `#!setting` e `#!depends` — foram removidas; o manifesto é gerado a partir do
  projeto. Veja [Resources e meta.xml](/pt-br/mta/resources).

## Referência rápida

| Diretiva | Categoria | Padrão quando ausente |
| --- | --- | --- |
| `#!server` | Ambiente | Vem da pasta |
| `#!client` | Ambiente | Vem da pasta |
| `#!shared` | Ambiente | Vem da pasta |
| `#!strict` | Rigor | `#!strict` |
| `#!nonstrict` | Rigor | `#!strict` |
| `#!nocheck` | Rigor | `#!strict` |

# Função exportada

Duas funções que outro resource pode chamar, e as entradas de `meta.xml` que
tornam isso possível.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).
- Um segundo resource para chamar, ou o console do servidor.

## Árvore de arquivos

```
luam-docs-exported-function/
├── .luam.manifest
└── src/
    └── server/
        └── scores.luam
```

## Código

<<< @/snippets/exported-function/.luam.manifest{js}

<<< @/snippets/exported-function/src/server/scores.luam

## O que observar

- **`export` é apagado do Lua.** O que ele produz é uma entrada `<export>` no
  `meta.xml`. A função gerada é um global comum.
- **`reset` não tem `export`,** então continua interna. Exportar é opcional por
  função.
- **`scores[name] or 0` é anotado como `any`,** porque o Luam não faz estreitamento
  e um padrão com `or` produz uma união.
- **O tipo do export segue o ambiente.** Estas funções vivem em `src/server`, então
  são exportadas para o lado do servidor.

## Comandos

```bash
luam check
luam build
```

## Resultado esperado

<<< @/snippets/output/exported-function.check.txt{text}

O `meta.xml` ganha uma entrada por função exportada:

```xml
<export function="getScore" type="server" http="false" />
<export function="addScore" type="server" http="false" />
```

## Chamando

De outro resource, em Lua puro:

```lua
local score = exports['luam-docs-exported-function']:getScore(player)

exports['luam-docs-exported-function']:addScore(player, 10)
```

Os dois resources precisam estar rodando, e a ACL do MTA precisa permitir a
chamada.

## Erros comuns

| Você escreveu | Diagnóstico |
| --- | --- |
| `export` dentro de uma função ou de um `if` | `check-export-not-top-level` |
| `export function api.getScore()` | `check-export-member` |
| `export local function f()` | `parse-export-local` |
| `export` em um arquivo `.d.luam` | `check-export-in-declaration-file` |
| O mesmo nome de export em dois arquivos | `project-duplicate-export` |

## Limitações

Um export é **nomeado, nunca verificado** contra o lado que chama. Escreva
`export http function` quando a entrada precisar de `http="true"`. Veja
[Limitações](/pt-br/reference/limitations).

## Nota de segurança

Um export é um ponto de entrada público no seu resource. Valide os argumentos como
faria com um evento de cliente — outro resource, ou um chamador que você não
escreveu, pode passar qualquer coisa.

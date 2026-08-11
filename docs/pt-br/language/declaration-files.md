# Arquivos de declaração

Um arquivo `.d.luam` descreve tipos para Lua que o compilador não controla:
`config.lua`, uma biblioteca de terceiros, um trecho copiado de outro resource.
Ele é verificado, **não contribui com nada** para o resource gerado e recebe o
ambiente do seu caminho como qualquer outro arquivo de código.

```luam
interface ConfigShape {
    greeting: string
    limit: number
}

declare Config: ConfigShape
declare legacyVersion: string
```

## `declare`

`declare NOME: Tipo` associa um global a um tipo. É válido **apenas** dentro de um
arquivo `.d.luam`; usá-lo em código comum é
`check-declare-outside-declaration-file`.

Onde uma declaração e o código real nomeiam o mesmo global, a declaração vence e o
código é verificado contra ela.

## Somente declarações

Um arquivo de declaração contém declarações. Uma chamada, uma atribuição ou um
laço é `check-declaration-file-statement`:

```luam
declare Config: ConfigShape

outputDebugString('hello')   # check-declaration-file-statement
```

`export` também não tem efeito em um arquivo de declaração, porque não há código
emitido para exportar — isso é `check-export-in-declaration-file`.

## Onde colocar

Dentro de um diretório de código, no ambiente em que o Lua descrito roda:

```
src/
├── shared/legacy.d.luam    descreve globais que os dois lados podem usar
└── server/admin.d.luam     descreve globais só do servidor
```

`config.lua` é um script compartilhado no resource gerado, então um arquivo de
declaração para ele pertence a `src/shared`.

## Tipando o `config.lua`

`config.lua` é copiado como está e nunca é analisado, então o compilador não sabe
o que há dentro dele. Um arquivo de declaração é como você obtém completação e
verificação para ele:

```lua
Config = {
    greeting = 'Welcome to the server.',
    limit = 32,
}
```

```luam
interface ConfigShape {
    greeting: string
    limit: number
}

declare Config: ConfigShape
```

A partir daí, `Config.greeting` é uma `string` e `Config.greting` é um erro.

Veja [config.lua e .env](/pt-br/mta/configuration).

## Um exemplo completo

<<< @/snippets/language/src/shared/legacy.d.luam

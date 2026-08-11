# API OOP

A forma de objeto do MTA — `player:getName()` — tipada pelo compilador e declarada
no `meta.xml`.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).
- MTA:SA 1.5+, que é onde a API OOP existe.

## Árvore de arquivos

```
luam-docs-oop-api/
├── luam.json
└── src/
    └── server/
        └── admin.luam
```

## Código

<<< @/snippets/oop-api/luam.json

<<< @/snippets/oop-api/src/server/admin.luam

## O que observar

- **`"oop": true` é obrigatório.** Ele escreve `<oop>true</oop>` no `meta.xml`,
  que é o que faz a forma de objeto existir em tempo de execução, e diz ao checker
  para tipar a superfície de objeto. Sem ele, `player:getName()` é
  `check-oop-disabled`.
- **Os tipos de retorno são reais.** `player:getName()` é `string` e
  `player:getMoney()` é `number`, então as anotações nos locais são verificadas em
  vez de presumidas.
- **Um erro de digitação vira erro de build.** `player:getNmae()` é
  `check-unknown-member`.
- **O Lua emitido não muda.** O compilador nunca reescreve uma chamada OOP para a
  forma procedural; `oop` decide o que o checker aceita e o que o manifesto
  declara.

## Comandos

```bash
luam check
luam build
```

## Resultado esperado

<<< @/snippets/output/oop-api.check.txt{text}

O `meta.xml` começa com a flag de OOP:

```xml
<oop>true</oop>
<info ... />
<script src="src/server/**/*.lua" />
```

## Métodos estáticos e construtores

A mesma flag tipa membros estáticos e classes chamáveis:

```luam
local player = Player.getRandom()
local exists: boolean = File.exists('data.json')
local handle = File('data.json')
```

::: warning `File.new` trunca
`File(path)` abre um arquivo existente para leitura e escrita e o cria quando não
existe. `File.new(path)` **trunca** um arquivo existente. Use `fileOpen(path, true)`
quando precisar de acesso somente leitura.
:::

## Um erro comum

Estender uma classe do MTA a partir de uma classe de projeto:

```
src/server/admin.luam:1:1 error check-native-class-inheritance: A project class cannot extend the native class "Player".
```

Componha em vez disso: guarde o elemento em um campo da sua própria classe.

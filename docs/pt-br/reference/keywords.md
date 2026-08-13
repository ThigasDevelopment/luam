# Palavras-chave

Toda palavra desta página é reservada pelo lexer: nenhuma delas pode nomear uma
variável, um parâmetro ou uma função. O Luam reserva as 21 palavras-chave do
Lua 5.1 e adiciona 11 próprias.

O único lugar onde uma palavra reservada continua permitida é como **nome de
propriedade** — depois de um `.` ou de um `:`, como chave de campo de tabela e
como membro de classe, interface ou enum. É isso que mantém `Threads.new(...)`,
`element.type` e `constructor = function (...)` válidos.

## Palavras-chave do Lua 5.1

Estas 21 palavras são reservadas exatamente como em Lua 5.1.

| Palavra-chave | Papel | Página |
| --- | --- | --- |
| `and` | Operador booleano | [Operadores](/pt-br/reference/operators) |
| `break` | Sai do laço mais interno | [Fundamentos de Lua](/pt-br/language/syntax) |
| `do` | Abre um bloco | [Fundamentos de Lua](/pt-br/language/syntax) |
| `else` | Ramo alternativo | [Fundamentos de Lua](/pt-br/language/syntax) |
| `elseif` | Ramo encadeado | [Fundamentos de Lua](/pt-br/language/syntax) |
| `end` | Fecha um bloco | [Fundamentos de Lua](/pt-br/language/syntax) |
| `false` | Literal booleano | [Tipos](/pt-br/language/types) |
| `for` | Laços numérico e genérico | [Fundamentos de Lua](/pt-br/language/syntax) |
| `function` | Declaração e expressão de função | [Funções](/pt-br/language/functions) |
| `if` | Condicional | [Fundamentos de Lua](/pt-br/language/syntax) |
| `in` | Cláusula do `for` genérico | [Fundamentos de Lua](/pt-br/language/syntax) |
| `local` | Declara um vínculo local | [Tipos](/pt-br/language/types) |
| `nil` | O valor ausente | [Tipos](/pt-br/language/types) |
| `not` | Negação booleana | [Operadores](/pt-br/reference/operators) |
| `or` | Operador booleano | [Operadores](/pt-br/reference/operators) |
| `repeat` | Laço testado ao final | [Fundamentos de Lua](/pt-br/language/syntax) |
| `return` | Retorna de uma função | [Funções](/pt-br/language/functions) |
| `then` | Abre o corpo de um `if` | [Fundamentos de Lua](/pt-br/language/syntax) |
| `true` | Literal booleano | [Tipos](/pt-br/language/types) |
| `until` | Fecha um laço `repeat` | [Fundamentos de Lua](/pt-br/language/syntax) |
| `while` | Laço testado no início | [Fundamentos de Lua](/pt-br/language/syntax) |

::: tip Lua 5.1 não tem `goto`
`goto` virou palavra-chave em Lua 5.2. O Luam tem como alvo o 5.1, então aqui
`goto` é um identificador comum. `continue` é o único salto que o Luam adiciona,
e ele é reescrito em vez de mapeado para `goto` — veja
[Fundamentos de Lua](/pt-br/language/syntax).
:::

## Palavras-chave que o Luam adiciona

Estas 11 palavras são reservadas além das do Lua 5.1.

| Palavra-chave | Papel | Página |
| --- | --- | --- |
| `continue` | Pula para a próxima iteração do laço mais interno | [Fundamentos de Lua](/pt-br/language/syntax) |
| `class` | Abre uma declaração de classe | [Classes](/pt-br/language/classes) |
| `extends` | Nomeia a classe pai | [Classes](/pt-br/language/classes) |
| `implements` | Nomeia as interfaces que a classe satisfaz | [Classes](/pt-br/language/classes) |
| `constructor` | Nomeia o construtor dentro do corpo de uma classe | [Classes](/pt-br/language/classes) |
| `new` | Instancia uma classe | [Classes](/pt-br/language/classes) |
| `interface` | Abre uma declaração de interface | [Enums e interfaces](/pt-br/language/enums-and-interfaces) |
| `enum` | Abre uma declaração de enum | [Enums e interfaces](/pt-br/language/enums-and-interfaces) |
| `type` | Abre um alias de tipo | [Tipos](/pt-br/language/types) |
| `declare` | Abre uma declaração em um arquivo `.d.luam` | [Arquivos de declaração](/pt-br/language/declaration-files) |
| `export` | Precede uma `function` de nível superior | [Exports](/pt-br/language/exports) |

Migrar Lua que usa uma delas como variável é erro de sintaxe, e a correção é
renomear:

```luam
local exported: number = 1

print(exported)
```

`fun` é o único termo que continua contextual: nomeia um tipo de função apenas em
posição de tipo, então uma variável chamada `fun` ainda compila. Veja
[Funções](/pt-br/language/functions).

## Nomes de propriedade são exceção

Uma palavra reservada depois de um `.` ou de um `:`, como chave de campo de tabela
ou como nome de membro dentro de uma classe, interface ou enum é lida como um nome
comum:

```luam
local pool: table = { new = 1, type = 2, class = 3 }

print(pool.new, pool.type, pool.class)
```

`constructor` é a única exceção dentro do corpo de uma classe: ele nomeia o
construtor, então precisa ser um método. Declará-lo como campo é
`check-invalid-constructor`.

## `self` e `super` são contextuais

Nenhum dos dois é reservado pelo lexer, então ambos continuam sendo nomes comuns
fora de uma classe. `self` é vinculado automaticamente dentro de um método de
classe e dentro de uma declaração `function Nome:metodo()`; em qualquer outro
lugar ele lê um global que é `nil`, o que é `check-invalid-self`. Declarar o seu
próprio `local self` é válido e desliga a verificação.

`super` só existe como `self:super(...)`, a implementação do método na classe
pai. Fora de um método de classe é `check-invalid-super`, e uma classe pai sem
esse método é `check-unknown-super-method`. Veja
[Classes](/pt-br/language/classes).

## `type` continua chamável

`type` é um global padrão do Lua 5.1. Reservar a palavra não remove a função,
então `type(value)` continua funcionando — uma palavra reservada seguida
diretamente de `(` é lida como uma chamada:

```luam
local kind: string = type(1)
```

`type X = ...` continua sendo o alias de tipo, porque um alias sempre tem um nome
e um `=` depois da palavra-chave.

## Nomes de tipo não são palavras-chave

`string`, `number`, `boolean`, `table`, `any` e `void` são **nomes de tipo**
resolvidos em posição de tipo. Em posição de expressão são identificadores comuns,
e é por isso que `table.concat` e `string.format` continuam funcionando.

Os tipos de elemento do MTA — `Player`, `Vehicle`, `Element` e os demais — vêm do
catálogo gerado, não da gramática. Veja
[APIs e eventos](/pt-br/mta/apis-and-events).

## Nomes de decorador

`@Getter` e `@Setter` são reconhecidos apenas depois de `@`, em posição de
decorador. Não são identificadores que você possa sombrear, e um nome desconhecido
ali é `check-unknown-decorator`. Veja
[Decoradores](/pt-br/language/decorators).

## Globais de runtime

`sleep`, `Threads`, `Async`, `Dotenv` e `process` são **globais declarados pelo
runtime**, não palavras-chave. Nomear um deles traz o helper correspondente para o
build; sombrear um com um local seu é Lua válido e simplesmente o esconde.

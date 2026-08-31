# Funções

## Declarando

```luam
function greet(name: string, tag?: string): string
    if tag ~= nil then
        return name .. ' (' .. tostring(tag) .. ')'
    end

    return name
end

local function double(value: number): number
    return value * 2
end

local anonymous = function (...)
    print(...)
end
```

Uma `function` global é visível para todos os outros arquivos do mesmo grupo de
ambiente; uma `local function` é visível dentro do seu arquivo. Veja
[Ambientes](/pt-br/mta/environments) para saber quais arquivos enxergam quais
globais.

## Tipos de retorno

O tipo de retorno vem depois da lista de parâmetros. `void` significa que a função
não retorna nada útil:

```luam
function log(message: string): void
    outputDebugString(message)
end
```

Um `return` que não bate é `check-return-mismatch`. Uma função sem tipo de retorno
declarado não é verificada contra nenhum.

Um tipo de retorno declarado precisa ser produzido em **todo** caminho. Um corpo
que consegue alcançar o `end` final sem retornar é `check-missing-return`, porque
quem chamou receberia `nil` onde a anotação prometeu um valor:

```luam static
function pick(flag: boolean): string
    if flag then
        return 'sim'
    end
end
```

Há dois reparos, e a mensagem nomeia os dois. Retornar em todo caminho, ou
declarar a anotação opcional — `: string?` — o que torna verdadeiro terminar sem
valor. `void`, `nil`, `any` e qualquer união que contenha `nil` já toleram isso e
nunca são reportados.

Um laço que não consegue cair fora não é reportado: `while true do` e
`repeat ... until false` sem `break` encerram o caminho. Um corpo que termina em
`error(...)` **é** reportado, porque uma chamada não é um terminador — veja
[Limitações](/pt-br/reference/limitations).

## Parâmetros opcionais

Um `?` no tipo do parâmetro permite omitir o argumento:

```luam static
function formatLabel(name: string, tag?: string): string
```

Chamar com argumentos de menos é `check-argument-count`. Passar um argumento do
tipo errado é `check-type-mismatch`.

## Métodos em tabelas

As duas formas de Lua são suportadas e mantêm o significado:

```luam
local player: table = {}

function player.describe(): void
    print('player')
end

function player:rename(name: string): void
    print(name)
end
```

## Tipos de função

`fun(...)` é o tipo de algo chamável. Use-o para callbacks e handlers guardados:

```luam
local log: fun(string): void = print
local reduce: fun(total: number, value: number): number = function (total: number, value: number): number
    return total + value
end
local variadic: fun(...): void = print
local loose: fun = print
```

Nomes de parâmetro dentro de `fun(...)` são documentais — `fun(string): void` e
`fun(message: string): void` são o mesmo tipo.

## Funções genéricas

Uma função recebe os seus próprios parâmetros de tipo entre o nome e a lista de
parâmetros, como um [alias de tipo](/pt-br/language/types#aliases) e uma
[classe](/pt-br/language/classes#parametros-de-tipo) fazem:

```luam
function identity<T>(value: T): T
    return value
end

local text: string = identity('pronto')
local total: number = identity(1)
```

O argumento liga o parâmetro, então `identity('pronto')` é `string` e
`identity(1)` é `number`. Uma declaração, verificada nas duas chamadas.

Escreva os argumentos explicitamente quando a inferência não tiver de onde
partir, ou para fixar um tipo mais largo do que o argumento daria:

```luam static
local text = identity<string>('pronto')
```

A quantidade errada é `check-generic-arity`, e um argumento que não bate com o
tipo explícito é `check-type-mismatch`. Um parâmetro que nenhum argumento liga
vira `any` em vez de um erro — inclusive um que só aparece no tipo de retorno,
que a inferência de passada única não alcança. Veja
[Limitações](/pt-br/reference/limitations).

Um parâmetro pode carregar uma restrição, que todo argumento precisa satisfazer.
Qualquer outra coisa é `check-generic-constraint`, o mesmo diagnóstico que uma
restrição de classe produz:

```luam static
function label<T extends Named>(value: T): string
    return value.name
end
```

Uma função anônima recebe os parâmetros depois da palavra `function`, que é
também como um método de classe declara os seus:

```luam static
class Box<T> {
    value: T

    convert = function <U>(change: fun(T): U): U
        return change(self.value)
    end
}
```

Os dois conjuntos estão em escopo dentro de `convert`, e um parâmetro do método
com o mesmo nome de um parâmetro da classe o sombreia.

Nada disso chega à saída. Os parâmetros e os argumentos são apagados junto com
todas as outras anotações, nos dois layouts de saída, então o Lua gerado é o
mesmo da forma não genérica.

## Múltiplos retornos

Declare vários tipos de retorno como uma tupla. O Lua continua retornando valores
separados; a tupla existe apenas para verificação estática:

```luam
function describe(): (string, boolean)
    return 'pronto', true
end

local label, enabled = describe()
```

O checker valida a quantidade e o tipo de cada valor retornado. Funções do MTA
que retornam vários valores também são tipadas pelo catálogo, então cada destino
recebe o seu próprio tipo:

```luam
local x, y, z = getElementPosition(element)
```

Aqui `x`, `y` e `z` são `number`, não `any`. Pedir mais valores do que a função
retorna deixa os destinos extras como `nil`, como em Lua.

## Variádicos

`...` é uma lista de parâmetros de tamanho desconhecido, exatamente como em Lua:

```luam
local function trace(...): void
    outputDebugString(table.concat({ ... }, ' '))
end
```

## Um exemplo completo

<<< @/snippets/language/src/shared/functions.luam

## Erros comuns

| Você escreveu | Diagnóstico |
| --- | --- |
| `greet()` para `greet(name: string)` | `check-argument-count` |
| `return 1` em uma função `: string` | `check-return-mismatch` |
| uma função `: string` que pode terminar sem retornar | `check-missing-return` |
| `identity<string, number>(x)` para `identity<T>` | `check-generic-arity` |
| `greet(1)` para `greet(name: string)` | `check-type-mismatch` |

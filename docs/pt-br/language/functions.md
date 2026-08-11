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

local anonymous = function(...)
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

## Parâmetros opcionais

Um `?` no tipo do parâmetro permite omitir o argumento:

```luam
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
local reduce: fun(total: number, value: number): number = function(total: number, value: number): number
    return total + value
end
local variadic: fun(...): void = print
local loose: fun = print
```

Nomes de parâmetro dentro de `fun(...)` são documentais — `fun(string): void` e
`fun(message: string): void` são o mesmo tipo.

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
| `greet(1)` para `greet(name: string)` | `check-type-mismatch` |

# Tipos

As anotações são verificadas no build e apagadas do Lua gerado. Elas nunca custam
nada em tempo de execução.

## Anotando um valor

```luam
local name: string = 'Thigas'
local health: number = 100
local alive: boolean = true
local element: Player = source
local anything: any = nil
```

Uma variável anotada é verificada em toda atribuição. Uma variável sem anotação
assume o tipo do seu inicializador.

## Tipos primitivos

| Tipo | Valores |
| --- | --- |
| `string` | Strings de Lua. |
| `number` | Números de Lua. Não há divisão entre inteiro e ponto flutuante. |
| `boolean` | `true` e `false`. |
| `nil` | Apenas `nil`. |
| `table` | Qualquer tabela, sem forma definida. |
| `any` | Qualquer coisa. Nunca reportado. |
| `void` | Válido apenas como tipo de retorno: a função não retorna nada útil. |

Os tipos de elemento do MTA — `Player`, `Vehicle`, `Element`, `Marker` e o resto
do catálogo — também são tipos. Veja
[APIs e eventos](/pt-br/mta/apis-and-events).

## Opcionais

Um `?` no final permite `nil`:

```luam
local target?: Player = nil
local tag?: string = nil
```

### Onde o `?` fica

**O marcador gruda no nome, nunca no tipo.** Uma regra só, em toda declaração que
tem nome:

```luam
local title?: string = nil

function greet(name: string, tag?: string): string
    return name
end

interface Session {
    tag?: string
}
```

Escrever no tipo é detectado nas três posições, com uma mensagem que já diz a
correção:

<<< @/snippets/output/errors/optional-position.txt{text}

### Onde não há nome

Um tipo ainda pode ser opcional em uma posição sem nome para carregar o
marcador, porque não há outro lugar para colocá-lo:

| Posição | Forma |
| --- | --- |
| Tipo de retorno | `function find(id: number): Player?` |
| Aninhado em outro tipo | `local handlers: (fun(string): void)[] = {}` |
| Alias de tipo | `type Maybe<T> = T?` |

Ou seja, `?` no tipo continua fazendo parte da gramática; o que a regra proíbe é
usá-lo onde existe um nome disponível.

::: warning Sem estreitamento
`if target ~= nil then` **não** refina `Player?` para `Player` dentro do bloco. O
Luam não faz estreitamento de tipos. Quando você já garantiu que um valor está
presente, anote o local que o recebe como `any`.
:::

## Uniões

```luam
local key: string | number = 1
```

Uma união aceita qualquer um dos seus membros. Como não há estreitamento, uma
operação precisa ser válida para a união inteira — `key + 1` sobre
`string | number` é `check-invalid-operand`.

## Arrays

```luam
local scores: number[] = { 10, 20 }
local grid: number[][] = {}
local players: Player[] = {}
```

`T[]` é uma tabela de Lua usada como sequência. Ela carrega as
[extensões de objeto](/pt-br/language/extensions) de tabela, então `scores.count`
e `scores.isEmpty` funcionam.

## Aliases

`type` dá nome a um tipo. Ele é apagado por completo.

```luam
type PlayerId = number
type Nullable<T> = T | nil

local id: PlayerId = 7
local pending: Nullable<string> = nil
```

Aliases podem receber parâmetros de tipo, como `Nullable<T>` mostra. **Classes**
genéricas não são suportadas — veja
[Limitações](/pt-br/reference/limitations).

## Tipos de função

`fun(...)` descreve algo chamável:

```luam
local log: fun(string): void = print
local reduce: fun(total: number, value: number): number = function(total: number, value: number): number
    return total + value
end
local variadic: fun(...): void = print
local loose: fun = print
local optional?: fun(string): void = nil
```

Nomes de parâmetro dentro de `fun(...)` são opcionais e documentais. Veja
[Funções](/pt-br/language/functions).

## Um exemplo completo

<<< @/snippets/language/src/shared/types.luam

## Erros comuns

| Você escreveu | Diagnóstico |
| --- | --- |
| `local n: number = 'text'` | `check-type-mismatch: Variable "n" expects "number" but received "string".` |
| `local x: number = tonumber(v) or 0` | `check-type-mismatch: ... received "number? \| number".` |
| `local p: Playr = source` | `parse-invalid-type` |
| `key + 1` com `key: string \| number` | `check-invalid-operand` |

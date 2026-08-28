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

## Tipos literais

Um valor literal é um tipo por si só — um que aceita exatamente aquele valor:

```luam
local mode: 'auto' = 'auto'
local ready: true = true
local port: 3306 = 3306
local nothing: nil = nil
```

Strings, booleanos e números funcionam, e um número pode ser negativo ou decimal
(`-1`, `0.5`). Atribuir qualquer outra coisa é `check-type-mismatch`:

```
error  check-type-mismatch  Variable "ready" expects "true" but received "false".
```

Todo literal é assinalável ao seu tipo base, então `local flag: boolean = true`
funciona. O contrário não: um `boolean` não cabe em um `true`.

Um tipo literal só aparece onde você escreve um. Um local sem anotação alarga,
então `local flag = true` é `boolean` e pode ser reatribuído:

```luam
local flag = true

flag = false
```

Literais são mais úteis em uma união, que é como se escreve um conjunto fechado
de valores:

```luam
local level: 1 | 2 | 3 = 2
local mode: 'auto' | 'manual' | false = 'auto'
```

São também o que faz uma [união discriminada](#unioes-discriminadas) estreitar.

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

`if target ~= nil then` refina `Player?` para `Player` dentro do bloco. Veja
[guardas de tipo](#guardas-de-tipo).

## Uniões

```luam
local key: string | number = 1
```

Uma união aceita qualquer um dos seus membros. Para uma união de primitivos, uma
operação precisa ser válida para todos os membros — `key + 1` sobre
`string | number` é `check-invalid-operand`.

Quando todos os membros são tipos objeto, interfaces ou classes, a leitura de uma
chave é checada. Uma chave que todos os membros declaram devolve a união dos seus
tipos; uma chave que só alguns declaram é `check-unknown-union-key`:

```luam expect-error
type Circle = {
    kind: 'circle',
    radius: number
}

type Square = {
    kind: 'square',
    side: number
}

type Shape = Circle | Square

function area(shape: Shape): number
    return shape.radius
end
```

```
error  check-unknown-union-key  "radius" is not a key of every member of
       "Circle | Square". It is missing from "Square".
```

Uniões de qualquer outra coisa continuam sem checagem, então um receptor
`string | number` segue aceitando qualquer chave.

## Nomes que não estão declarados

Um nome de tipo que o arquivo não alcança é `check-unknown-type`, um **warning**.
O build continua passando e o nome segue se comportando como sempre — assinalável
nos dois sentidos, sem checagem de membros — então fontes existentes continuam
compilando:

```
warning  check-unknown-type  Type "Databse" is not defined.
```

Um nome conta como declarado quando é um primitivo, um alias de tipo, uma
interface, uma classe, um enum, um tipo de elemento do MTA ou o parâmetro de tipo
de um alias genérico. Ele não precisa aparecer antes do uso: a checagem roda
depois que o arquivo é lido por inteiro, então um tipo declarado no fim, um alias
recursivo e uma interface que se referencia continuam silenciosos. Declarações de
um arquivo `.d.luam` contam quando o ambiente daquele arquivo alcança o que o
usa.

## Interseções

`&` funde tipos objeto em um só:

```luam
type Base = {
    id: string
}

type SQLite = Base & {
    kind: 'sqlite',
    sender: string
}
```

`SQLite` declara `id`, `kind` e `sender`. Cada parte precisa ser um tipo objeto,
uma interface ou uma classe — `string & { id: string }` é
`check-invalid-intersection`. Duas partes só podem repetir uma chave quando a
declaram com o mesmo tipo; caso contrário a fusão é
`check-conflicting-intersection-member`.

`&` liga mais forte que `|`, então `A & B | C` se lê como `(A & B) | C`.

Uma interseção existe só no compilador. Ela funde o formato e não emite nada,
então o Lua gerado é a mesma tabela que já seria.

## Uniões discriminadas

Uma união cujos membros compartilham uma chave tipada como literal estreita por
essa chave. Comparar a chave com um literal mantém apenas os membros
que podem casar:

```luam expect-error
type SQLite = Base & {
    kind: 'sqlite',
    sender: string
}

type MySQL = Base & {
    kind: 'mysql',
    host: string,
    port: number
}

type Config = SQLite | MySQL

function connect(config: Config): void
    if config.kind == 'mysql' then
        outputChatBox(config.host .. ':' .. config.port)
    else
        outputChatBox(config.sender)
    end
end
```

Dentro do primeiro bloco `config` é `MySQL`, então `host` e `port` resolvem e
`sender` é `check-unknown-record-key`. O `else` recebe o membro restante. `~=`
estreita para o outro lado, o que faz a forma com saída antecipada funcionar:

```luam static
function connect(config: Config): void
    if config.kind ~= 'mysql' then
        return
    end

    outputChatBox(config.host)
end
```

O receptor precisa ser um caminho de acesso estável — um nome, ou um nome
seguido de campos literais — então `config.kind` estreita `config` e
`state.config.kind` estreita `state.config`. Uma chamada ou um índice dinâmico
no receptor não estreita nada. O estreitamento termina com o bloco que o
estabeleceu.

Uma string é o discriminante usual, mas qualquer [tipo literal](#tipos-literais)
funciona, o que torna o resultado de dois casos uma forma natural:

```luam
type Ok = {
    ok: true,
    value: string
}

type Err = {
    ok: false,
    reason: string
}

function report(result: Ok | Err): string
    if result.ok == false then
        return result.reason
    end

    return result.value
end
```

## Arrays

```luam
local scores: number[] = { 10, 20 }
local grid: number[][] = {}
local players: Player[] = {}
```

`T[]` é uma tabela de Lua usada como sequência. Ela carrega as
[extensões de objeto](/pt-br/language/extensions) de tabela, então `scores.count`
e `scores.isEmpty` funcionam.

## Mapas

`table` sozinho é qualquer tabela. Com dois argumentos de tipo ele vira um mapa —
o primeiro é a chave, o segundo é o valor:

```luam
local ages: table<string, number> = {}

ages['thigas'] = 27

local age: number = ages['thigas']

for name, value in pairs(ages) do
    outputChatBox(name .. ' is ' .. value)
end
```

Ler uma chave devolve o tipo do valor, e `ages.thigas` e `ages['thigas']` são
tratados igual. Uma chave de outro tipo é `check-type-mismatch`, e `pairs` tipa
as duas variáveis do laço (`ipairs` tipa a primeira como `number`).

Um mapa é atribuível a `table`, e `table` é atribuível a um mapa, então o código
que ainda usa tabelas simples continua funcionando. Entre dois mapas, a chave e o
valor precisam ser atribuíveis.

| Você escreveu | Diagnóstico |
| --- | --- |
| `ages[1]` em `table<string, number>` | `check-type-mismatch: Key expects "string" but received "number".` |
| `table<string>` | `check-generic-arity: Type "table" expects a key type and a value type but received 1.` |

## Tipos de objeto

`{ chave: Tipo }` descreve uma tabela pelas chaves que ela declara. Ele é escrito
no lugar, onde qualquer tipo é aceito:

```luam
local point: { x: number, y: number } = { x = 0, y = 0 }

function spawn(args: { name: string, team?: string }): void
    outputChatBox(args.name)
end
```

As chaves são separadas por vírgula, ponto e vírgula ou quebra de linha, e o
marcador de opcional fica na chave — `team?: string`, nunca `team: string?`. Ler
uma chave que o tipo não declara é `check-unknown-record-key`:

| Você escreveu | Diagnóstico |
| --- | --- |
| `args.nmae` em `{ name: string }` | `check-unknown-record-key: "nmae" is not a key of "{ name: string }". Declared keys: "name".` |
| `{ name: string, name: number }` | `parse-duplicate-key` |
| `{ name }` | `parse-invalid-type` |

Um tipo de objeto é aceito onde outro é esperado quando declara todas as chaves
que o alvo exige, com um tipo compatível. Uma chave que o alvo marca como
opcional pode faltar.

Uma tabela literal escrita com chaves tem o tipo dessas chaves, então ela é
verificada contra a forma para a qual é atribuída. Uma chave obrigatória faltando
é `check-type-mismatch`, e é isso que pega um erro de digitação —
`spawn({ nmae = 'a' })` é reportado porque `name` está faltando, não porque
`nmae` sobra:

```
error  check-type-mismatch  Argument 1 expects "Args" but received "{ nmae: 'a' }".
                            Key "name" is missing from "Args".
```

Quando o alvo é uma união, as chaves da literal que são tipadas como literais
escolhem o membro contra o qual reportar, então a mensagem diz o que falta no
ramo que você quis dizer:

```
error  check-type-mismatch  Variable "conn" expects "SQLite | MySQL" but received
                            "{ id: 'a', type: 'sqlite' }".
                            Key "path" is missing from "SQLite".
```

Duas literais mantêm o significado antigo. `{}` não carrega forma nenhuma, então
continua servindo para um array, um mapa ou `table`, e só falha contra uma forma
que exige alguma chave. Uma literal com entradas posicionais é um array, e uma
que mistura as duas é `table`.

Sem anotação a literal mantém sua forma, então `local config = { name = 'a' }`
tipa `config.name` e reporta `config.tag`. A exceção é `{}`, que alarga para
`table` — é isso que mantém `local items = {}` funcionando com as
[extensões de objeto](/pt-br/language/extensions).

Uma chave cujo tipo é uma função é um método quando é chamada com `:`. A chamada
é verificada contra a assinatura declarada — quantidade e tipo dos argumentos — e
produz o tipo de retorno declarado:

```luam
type Counter = { bump: fun(step: number): number }

local counter: Counter = { bump = function (step: number): number return step end }

local total: number = counter:bump(1)
```

```
error  check-argument-count  This call expects at most 1 argument but received 2.
error  check-type-mismatch   Argument 1 expects "number" but received "string".
```

Um primeiro parâmetro chamado `self` é o receptor, então ele não conta como
argumento de uma chamada com `:`. `bump: fun(self: Counter, step: number): number`
e `bump: fun(step: number): number` reportam a mesma aridade para
`counter:bump(1)`. Uma chamada com `.` passa todos os parâmetros, `self` incluso.

Um tipo de objeto é uma forma, não um contrato que uma classe possa implementar.
Para isso, use uma [interface](/pt-br/language/enums-and-interfaces).

## Aliases

`type` dá nome a um tipo. Ele é apagado por completo.

```luam
type PlayerId = number
type Nullable<T> = T | nil
type SpawnArgs = { name: string, team?: string }

local id: PlayerId = 7
local pending: Nullable<string> = nil
local args: SpawnArgs = { name = 'Thigas' }
```

Aliases podem receber parâmetros de tipo, como `Nullable<T>` mostra. **Classes**
genéricas não são suportadas — veja
[Limitações](/pt-br/reference/limitations).

Um alias de um tipo de objeto leva o nome dele para os diagnósticos: ler
`args.nmae` acima reporta `"nmae" is not a key of "SpawnArgs"`. Um alias precisa
ser declarado antes do código que o usa.

## Tipos de função

`fun(...)` descreve algo chamável:

```luam
local log: fun(string): void = print
local reduce: fun(total: number, value: number): number = function (total: number, value: number): number
    return total + value
end
local variadic: fun(...): void = print
local loose: fun = print
local optional?: fun(string): void = nil
```

Nomes de parâmetro dentro de `fun(...)` são opcionais e documentais. Veja
[Funções](/pt-br/language/functions).

## Guardas de tipo

Uma condição estreita um caminho de acesso estável dentro do bloco que ela
protege. Um caminho é um nome, ou um nome seguido de campos literais:

```luam
function announce(name?: string, handler?: fun(text: string): void): void
    if name ~= nil then
        outputChatBox(name)
    end

    if type(handler) == 'function' then
        handler('ready')
    end
end
```

- `type(value) == '...'` estreita para aquele tipo, para todo nome que `type`
  devolve.
- Um campo é um caminho, então `self.connection ~= nil` refina
  `self.connection`, e um `self.socket.handle` aninhado também.
- `value ~= nil` e um `if value then` simples descartam o `nil`.
- `value == nil` estreita para `nil`, e o `else` desse teste descarta o `nil`.
- `value.key == '...'` escolhe os membros da união que declaram `key` com aquele
  literal, e `~=` escolhe o resto. Veja
  [uniões discriminadas](#unioes-discriminadas).
- Cadeias com `and` aplicam todos os fatos que carregam.

Um fato cai assim que o caminho, um prefixo dele ou a raiz dele é atribuído ou
sombreado — incluindo uma escrita dentro do corpo de um laço ou dentro de uma
função declarada no mesmo bloco. Uma chamada ou um índice dinâmico no caminho
não produz estreitamento nenhum. Uma atribuição sempre é checada contra o tipo
declarado, então reatribuir um caminho estreitado ao tipo original é aceito. O
que uma guarda não consegue seguir é uma segunda referência à mesma tabela; veja
[Limitações](/pt-br/reference/limitations).

### O que um fato sobrevive

Um fato passa do bloco que o estabeleceu quando todo caminho até o código
seguinte concorda. Onde os ramos discordam, o caminho volta ao tipo declarado.

Uma atribuição refina uma união ou um opcional para o membro que escreveu, então
um ramo que preenche o valor ausente conta como concordância:

```luam
function label(name?: string): string
    if name == nil then
        name = 'anonymous'
    end

    return name
end
```

Um ramo que sai leva o outro lado para o resto do bloco, seja com `return`,
`break` ou `continue`:

```luam
function announce(name?: string): void
    if name == nil then
        return
    end

    outputChatBox(name)
end
```

Um laço é analisado como se o corpo pudesse rodar de novo, então todo caminho
que o corpo escreve perde o fato dele no laço inteiro. O que sobrevive ao laço é
a negação da condição:

```luam
function fill(name?: string): string
    while name == nil do
        name = 'anonymous'
    end

    return name
end
```

O que não carrega é uma condição guardada em variável: a variável não é o teste.
Escreva o teste onde o valor é usado, ou estreite para um local.

Um `or` mantém só o que os dois lados concordam, e une os dois tipos:

```luam
if type(value) == 'string' or type(value) == 'number' then
    outputChatBox(value .. '')
end
```

### Resultado de `and` e `or`

`a or b` é `b` sempre que `a` está ausente, então o resultado descarta o `nil` do
lado esquerdo — `tonumber(amount) or 100` é `number`, não `number?`. `a and b` é
`b`, mais `nil` quando o próprio `a` pode faltar. Juntos eles tipam a linha de
sempre:

```luam
local label: string = ok and 'yes' or 'no'
```

::: warning Uma tabela, dois nomes
Uma guarda segue o caminho que testou, não a tabela por trás dele. Se um segundo
nome alcança a mesma tabela e limpa o campo, o fato continua valendo e o
programa falha em execução. Veja [Limitações](/pt-br/reference/limitations).
:::

## Um exemplo completo

<<< @/snippets/language/src/shared/types.luam

## Erros comuns

| Você escreveu | Diagnóstico |
| --- | --- |
| `local n: number = 'text'` | `check-type-mismatch: Variable "n" expects "number" but received "string".` |
| `local x: number = v and 1` com `v?: string` | `check-type-mismatch: ... received "number?".` |
| `local p: Playr = source` | `parse-invalid-type` |
| `key + 1` com `key: string \| number` | `check-invalid-operand` |

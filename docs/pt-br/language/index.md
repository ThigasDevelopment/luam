# A linguagem

Luam é Lua 5.1 com tipos estáticos. Blocos continuam terminando com `end`, a
desigualdade continua sendo `~=` e tabelas continuam sendo tabelas. O que a
linguagem adiciona é verificado no build e depois apagado, então o Lua que você
publica é o Lua que você teria escrito.

```luam
local name: string = 'Thigas'
local target?: Player = nil
local key: string | number = 1
local scores: number[] = {}

type PlayerId = number

enum GameState { LOBBY, PLAYING }

interface Command {
    name: string
    execute(player: Player): void
}

class VIPPlayer extends Player implements Command {
    level: number = 1
}
```

## O que é verificado, e o que é emitido

| Recurso | Lua emitido |
| --- | --- |
| Anotações de tipo | Nada. Apagadas. |
| Aliases `type` | Nada. Apagados. |
| `interface` | Nada. Verificada apenas pelo checker. |
| `enum` | Uma tabela, e só quando o enum é usado. |
| `class` | Uma chamada ao helper de runtime `class`. |
| `@Getter` / `@Setter` | Métodos de acesso reais na classe. |
| Strings de template | Concatenação de strings via o helper `string`. |
| `++`, `--`, `+=` | `x = x + 1`, e assim por diante. |
| Extensões de objeto | Uma chamada a `table`, `string` ou `math`. |
| `export` | Nada no Lua. Uma entrada `<export>` no `meta.xml`. |

## Páginas

| Página | O que cobre |
| --- | --- |
| [Fundamentos de Lua](/pt-br/language/syntax) | O Lua que continuou igual, e as três coisas que mudaram. |
| [Tipos](/pt-br/language/types) | Anotações, opcionais, uniões, arrays, aliases, genéricos. |
| [Funções](/pt-br/language/functions) | Declarações, tipos de função, múltiplos retornos, variádicos. |
| [Strings de template](/pt-br/language/template-strings) | Interpolação, padrões e a regra de escopo. |
| [Enums e interfaces](/pt-br/language/enums-and-interfaces) | Enums baseados em zero e contratos só de compilação. |
| [Classes](/pt-br/language/classes) | Campos, construtores, herança, `super`, `new`. |
| [Decoradores](/pt-br/language/decorators) | `@Getter` e `@Setter` em um campo ou na classe inteira. |
| [Extensões de objeto](/pt-br/language/extensions) | `items.count`, `name.trim`, `ratio.clamp(a, b)`. |
| [Exports](/pt-br/language/exports) | `export function`, e o que chega ao `meta.xml`. |
| [Arquivos de declaração](/pt-br/language/declaration-files) | `.d.luam` e `declare` para Lua que não é seu. |
| [Rigor de verificação](/pt-br/language/strictness) | `#!strict`, `#!nonstrict` e `#!nocheck`. |

## Palavras reservadas

`class`, `constructor`, `declare`, `enum`, `export`, `extends`, `implements`,
`interface`, `new` e `type` são **reservadas**, além das 21 palavras-chave do
Lua 5.1. Nenhuma delas pode nomear uma variável, um parâmetro ou uma função.

Elas continuam válidas como nome de propriedade — depois de um `.` ou de um `:`,
como chave de campo de tabela e como membro de classe, interface ou enum:

```luam
local pool: table = { new = 1, type = 2, class = 3 }

print(pool.new, pool.type, pool.class)
```

`fun` é o único termo que continua contextual. Veja
[Palavras-chave](/pt-br/reference/keywords).

## Migrando Lua existente

Renomeie um arquivo `.lua` para `.luam` e coloque `#!nocheck` na primeira linha. O
build passa enquanto você anota módulo por módulo. Veja
[Rigor de verificação](/pt-br/language/strictness).

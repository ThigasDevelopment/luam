# Extensões de objeto

Uma extensão é um membro que se lê como propriedade ou método sobre um valor e
compila para uma chamada de biblioteca comum. Elas existem para que operações
frequentes deixem de exigir uma função auxiliar em cada resource.

```luam
local size: number = items.count       # table.size(items)
local trimmed: string = label.trim     # string.trim(label)
local safe: number = ratio.clamp(0, 1) # math.clamp(ratio, 0, 1)
```

## Extensões de tabela

| Extensão | Forma | Resultado | Compila para |
| --- | --- | --- | --- |
| `count` | propriedade | `number` | `table.size` |
| `isEmpty` | propriedade | `boolean` | `table.isEmpty` |
| `keys` | propriedade | `table` | `table.keys` |
| `values` | propriedade | `table` | `table.values` |
| `includes(value)` | chamada | `boolean` | `table.includes` |

## Extensões de string

| Extensão | Forma | Resultado | Compila para |
| --- | --- | --- | --- |
| `trim` | propriedade | `string` | `string.trim` |
| `length` | propriedade | `number` | `string.len` |
| `upper` | propriedade | `string` | `string.upper` |
| `lower` | propriedade | `string` | `string.lower` |
| `startsWith(prefix)` | chamada | `boolean` | `string.startsWith` |
| `endsWith(suffix)` | chamada | `boolean` | `string.endsWith` |

## Extensões de número

| Extensão | Forma | Resultado | Compila para |
| --- | --- | --- | --- |
| `abs` | propriedade | `number` | `math.abs` |
| `ceil` | propriedade | `number` | `math.ceil` |
| `floor` | propriedade | `number` | `math.floor` |
| `max(other)` | chamada | `number` | `math.max` |
| `min(other)` | chamada | `number` | `math.min` |
| `clamp(low, high)` | chamada | `number` | `math.clamp` |

## Propriedade ou chamada

Uma extensão de **propriedade** não recebe argumentos e é escrita sem parênteses:
`items.count`, não `items.count()`. Uma extensão de **chamada** recebe
argumentos: `items.includes('a')`. Usar a forma errada é `check-extension-form`,
porque a outra forma não existe: chamar uma extensão de propriedade chamaria o
resultado dela, e ler uma extensão de chamada nunca a executaria.

## Helpers de runtime

`table.size`, `string.trim` e `math.clamp` não existem em Lua 5.1, então o
compilador inclui o helper apenas quando o código gerado usa o recurso. A saída em
bundle o coloca dentro do bundle do ambiente; a saída em árvore escreve arquivos
como `lib/<ambiente>/table.lua`. Extensões que mapeiam para uma função padrão,
como `label.upper` ou `ratio.floor`, não precisam de helper nenhum.

## A indexação não muda

`lookup['count']` continua sendo uma leitura comum de tabela. A extensão se aplica
apenas à forma de membro com `.`, então uma tabela com uma chave `count` de
verdade continua funcionando pela forma com colchetes.

## Um exemplo completo

<<< @/snippets/language/src/shared/extensions.luam

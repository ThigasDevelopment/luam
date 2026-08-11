# Operadores

## Aritméticos

| Operador | Significado |
| --- | --- |
| `+` | Adição |
| `-` | Subtração, e negação unária |
| `*` | Multiplicação |
| `/` | Divisão |
| `%` | Módulo |
| `^` | Exponenciação |

## Comparação

| Operador | Significado |
| --- | --- |
| `==` | Igual |
| `~=` | **Diferente.** `!=` é `lex-foreign-operator`. |
| `<` | Menor que |
| `<=` | Menor ou igual |
| `>` | Maior que |
| `>=` | Maior ou igual |

## Lógicos

| Operador | Significado |
| --- | --- |
| `and` | Retorna o primeiro valor falso, ou o último valor |
| `or` | Retorna o primeiro valor verdadeiro, ou o último valor |
| `not` | Negação booleana |

`nil` e `false` são os únicos valores falsos. Um padrão com `or`, como
`tonumber(x) or 0`, produz a união `number? | number`, porque o Luam não faz
estreitamento — veja [Limitações](/pt-br/reference/limitations).

## String e tabela

| Operador | Significado |
| --- | --- |
| `..` | Concatenação |
| `#` | Comprimento, quando escrito **sem espaço** antes do operando |
| `[ ]` | Índice |
| `.` | Acesso a membro, e [extensões de objeto](/pt-br/language/extensions) |
| `:` | Chamada de método |

```luam
local total: number = #names   # comprimento
# names                        # comentário
```

## Atribuição composta

| Operador | Equivalente |
| --- | --- |
| `+=` | `x = x + v` |
| `-=` | `x = x - v` |
| `*=` | `x = x * v` |
| `/=` | `x = x / v` |
| `..=` | `x = x .. v` |

## Incremento e decremento

| Operador | Equivalente |
| --- | --- |
| `++` | `x = x + 1` |
| `--` | `x = x - 1` |

Os dois são **comandos**, não expressões. `local y = x++` é
`parse-invalid-increment`.

`--` é o operador de decremento, e é por isso que os comentários migraram para
`#`. Escrever um `-- comentário` no estilo Lua é `lex-foreign-comment`.

## Pontuação de tipo

| Pontuação | Significado | Página |
| --- | --- | --- |
| `:` | Introduz um tipo ou um tipo de retorno | [Tipos](/pt-br/language/types) |
| `?` | Opcional: permite `nil` | [Tipos](/pt-br/language/types) |
| `\|` | União | [Tipos](/pt-br/language/types) |
| `[]` | Array do tipo anterior | [Tipos](/pt-br/language/types) |
| `<>` | Parâmetros de tipo em um alias `type` | [Tipos](/pt-br/language/types) |
| `fun(...)` | Tipo de função | [Funções](/pt-br/language/functions) |
| `=` em `type X = Y` | Alias de tipo | [Tipos](/pt-br/language/types) |

## Comentários

| Forma | Significado |
| --- | --- |
| `# texto` | Comentário de linha. Hash seguido de espaço ou fim de linha. |
| `#* texto *#` | Comentário de bloco. |
| `#valor` | Operador de comprimento. Sem espaço. |

Formas não terminadas são `lex-unterminated-comment`.

## Strings

| Forma | Significado |
| --- | --- |
| `'texto'`, `"texto"` | Literais de string |
| `[[texto]]` | String de colchete longo, como em Lua |
| `` `texto ${name}` `` | [String de template](/pt-br/language/template-strings) |
| `${name:fallback}` | Interpolação com valor padrão |

## Outras pontuações

| Pontuação | Significado |
| --- | --- |
| `...` | Parâmetro e expressão variádicos |
| `@` | Introduz um [decorador](/pt-br/language/decorators) |
| `{ }` | Construtor de tabela, e corpos de classe, interface e enum |
| `( )` | Agrupamento e argumentos de chamada |
| `;` | Separador opcional de comandos |
| `,` | Separa elementos de lista |

## Precedência

Precedência e associatividade seguem Lua 5.1 exatamente, da menor para a maior:

```
or
and
<  >  <=  >=  ~=  ==
..                     (associativo à direita)
+  -
*  /  %
not  #  - (unário)
^                      (associativo à direita)
```

Atribuição composta, `++` e `--` são comandos e portanto não participam da
precedência de expressões.

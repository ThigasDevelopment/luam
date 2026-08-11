# Fundamentos de Lua

Luam é Lua 5.1. Comandos, blocos, tabelas, metatabelas, escopo e a biblioteca
padrão se comportam exatamente como já se comportam no MTA hoje. Esta página cobre
o que continuou igual e os três pontos em que a sintaxe precisou mudar.

## O que continuou igual

```luam
local rounds: number = 3

if rounds ~= 0 then
    rounds = rounds - 1
elseif rounds == 0 then
    rounds = 3
end

for index = 1, rounds do
    print(index)
end

while rounds > 0 do
    rounds = rounds - 1
end

repeat
    rounds = rounds + 1
until rounds >= 3
```

- Blocos terminam com `end`, não com chave de fechamento.
- Desigualdade é `~=`, nunca `!=`.
- `and`, `or` e `not` são os operadores booleanos.
- Concatenação é `..`, comprimento é `#`, e tabelas começam em 1.
- `nil` e `false` são os únicos valores falsos.

## O que mudou: comentários

O comentário `--` de Lua colidiria com o operador de decremento `--`, então o
Luam moveu os comentários para `#`:

| Forma | Significado |
| --- | --- |
| `# texto` | Comentário de linha. O hash precisa vir seguido de espaço ou do fim da linha. |
| `#* texto *#` | Comentário de bloco. |
| `#items` | O **operador de comprimento**, sem espaço. |

```luam
# A line comment starts with a hash followed by a space.

#*
    A block comment opens with hash-star and closes with star-hash.
*#

local total: number = #names
```

Escrever `--` querendo um comentário é `lex-foreign-comment`, e a mensagem diz
para usar `#`.

## O que mudou: incremento e atribuição composta

```luam
score++          # score = score + 1
score--          # score = score - 1

health += 10     # health = health + 10
health -= 10
damage *= 2
damage /= 2
label ..= '!'
```

`++` e `--` são **comandos**, não expressões: `local x = y++` não é aceito. Isso
é `parse-invalid-increment`.

## O que mudou: anotações de tipo

Um `:` depois de um nome introduz um tipo, e um `:` depois da lista de parâmetros
introduz o tipo de retorno:

```luam
local health: number = 100

function heal(player: Player, amount: number): void
    health += amount
end
```

Toda anotação é apagada. O Lua emitido é:

```lua
local health = 100

function heal(player, amount)
    health = health + amount
end
```

Veja [Tipos](/pt-br/language/types).

## Um exemplo completo

<<< @/snippets/language/src/shared/syntax.luam

## Erros comuns

| Você escreveu | Diagnóstico | Correção |
| --- | --- | --- |
| `-- comment` | `lex-foreign-comment` | Use `# comment`. |
| `a != b` | `lex-foreign-operator` | Use `a ~= b`. |
| `local x = y++` | `parse-invalid-increment` | Faça de `y++` um comando próprio. |
| `#count` querendo um comentário | sem erro, sentido errado | Adicione um espaço: `# count`. |

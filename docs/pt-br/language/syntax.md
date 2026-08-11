# Fundamentos de Lua

Luam é Lua 5.1. Comandos, blocos, tabelas, metatabelas, escopo e a biblioteca
padrão se comportam exatamente como já se comportam no MTA hoje. Esta página cobre
o que continuou igual, os três pontos em que a sintaxe precisou mudar e o único
comando que o Luam adiciona.

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

## O que o Luam adiciona: `continue`

`continue` pula para a próxima iteração do `for`, `while` ou `repeat` mais
interno:

```luam
for index = 1, 10 do
    if skip(index) then continue end

    print(index)
end
```

Lua 5.1 não tem `continue` nem `goto`, então o compilador reescreve o comando. O
corpo vira um bloco `repeat ... until true`, onde `break` sai apenas desse bloco
e portanto cai na próxima iteração:

```lua
for index = 1, 10 do
    repeat
        if skip(index) then
            break
        end
        print(index)
    until true
end
```

O envelope não custa nada em runtime. Um bloco não emite instrução em Lua 5.1, e
um `until true` constante não emite teste, então o laço executa as mesmas
instruções que executaria sem o `repeat`. Um laço sem `continue` é emitido
exatamente como antes — o `repeat` só aparece onde você pediu um `continue`.

Quando um `break` de verdade divide o mesmo nível do laço, o compilador os separa
com uma flag, então `break` continua saindo do laço e `continue` continua pulando
uma volta:

```luam
for index = 1, 10 do
    if skip(index) then continue end
    if done(index) then break end

    print(index)
end
```

```lua
for index = 1, 10 do
    local __luam_break = false
    repeat
        if skip(index) then
            break
        end
        if done(index) then
            __luam_break = true
            break
        end
        print(index)
    until true
    if __luam_break then break end
end
```

Valem três regras, cada uma com seu diagnóstico:

- `continue` só aparece dentro de um laço, e um corpo de função dentro de um laço
  não é o mesmo nível. Caso contrário, `check-invalid-continue`.
- `continue` é o último comando do seu bloco, que é a regra do Lua 5.1 para o
  `break` também. Caso contrário, `check-invalid-continue` ou
  `check-invalid-break`.
- `continue` dentro de um `repeat` não pode pular sobre um local que a condição
  do `until` lê, porque o envelope deixaria esse local fora de escopo. Declare o
  local acima do laço, ou use `while`.

```luam
repeat
    local found: boolean = search()

    if retry() then continue end
until found
```

Esse último caso é `check-invalid-continue`: o `until` lê `found`, que o
`continue` pularia.

## Um exemplo completo

<<< @/snippets/language/src/shared/syntax.luam

## Erros comuns

| Você escreveu | Diagnóstico | Correção |
| --- | --- | --- |
| `-- comment` | `lex-foreign-comment` | Use `# comment`. |
| `a != b` | `lex-foreign-operator` | Use `a ~= b`. |
| `local x = y++` | `parse-invalid-increment` | Faça de `y++` um comando próprio. |
| `#count` querendo um comentário | sem erro, sentido errado | Adicione um espaço: `# count`. |
| `continue` fora de um laço | `check-invalid-continue` | Mova para dentro do corpo do laço. |
| `break print(x)` | `check-invalid-break` | Deixe `break` por último no bloco. |

# Strings de template

Uma string de template é delimitada por crases e interpola valores com `${...}`.

```luam expect-error
local greeting: string = `Welcome to ${serverName}!`
```

Ela compila para concatenação simples através do helper de runtime `string`,
então o Lua gerado continua legível e compatível com o MTA.

## Valores padrão

`${name:fallback}` usa o padrão quando o valor é `nil`:

```luam
local caption: string = `HUD ${title:untitled}`
```

O padrão é texto literal até a chave de fechamento. Ele não é uma expressão.

Um padrão também flexibiliza a regra de escopo abaixo. `${title:untitled}`
compila mesmo onde `title` não está declarado, porque o padrão já afirma que o
valor pode faltar. Sem ele, o nome precisa estar no escopo.

## Caminhos de membro

Uma interpolação pode percorrer uma tabela:

```luam expect-error
local line: string = `Player ${session.player}`
```

## A regra de escopo

::: warning Uma interpolação aceita um nome, não uma expressão
`${getPlayerName(player)}` é `check-unknown-template-root`. O compilador resolve
a raiz do caminho no escopo atual, então uma chamada, um operador ou um literal
dentro de `${...}` é rejeitado, com padrão ou sem.
:::

Calcule o valor antes:

```luam
local name: string = getPlayerName(player)
local uptime: number = getTickCount() - startedAt

outputChatBox(`${name} has been here ${uptime} ms`, root)
```

É isso que torna o recurso seguro: todo nome interpolado é um nome que o checker
já viu ou um que você marcou como opcional com um padrão, então um erro de
digitação dentro de uma string vira erro de build em vez de um `nil` no chat.

## Um exemplo completo

<<< @/snippets/language/src/shared/template-strings.luam

## Lua emitido

```luam expect-error
local greeting: string = `Welcome to ${serverName}!`
```

vira a concatenação das partes literais com os valores interpolados — sem
interpretação de template em tempo de execução e sem uma chamada a
`string.format` para manter em sincronia com os argumentos.

## Erros comuns

| Você escreveu | Diagnóstico |
| --- | --- |
| `` `${getName(p)}` `` | `check-unknown-template-root` |
| `` `${}` `` | `check-empty-interpolation` |
| `` `${name` `` | `lex-unterminated-interpolation` |
| `` `text `` sem crase de fechamento | `lex-unterminated-template` |

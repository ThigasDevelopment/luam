# APIs e eventos

## O catálogo

A superfície do MTA é um catálogo **gerado**, produzido a partir do wiki do MTA e
embarcado no compilador. Ele é a única fonte de verdade sobre o que um arquivo
`server`, `client` ou `shared` pode usar.

| Tipo | Quantidade |
| --- | --- |
| Declarações de API | 1294 |
| Eventos | 203 |
| Tipos de elemento | 57 |

A biblioteca padrão de Lua 5.1 — `math`, `string`, `table`, `os`, `tostring`,
`tonumber` e o resto — é declarada junto.

## Chamando uma API

Argumentos e tipo de retorno são verificados:

```luam
local name: string = getPlayerName(player)
local ok: boolean = setElementHealth(player, 100)
```

| Erro | Diagnóstico |
| --- | --- |
| Lado errado | `check-environment-api` |
| Argumentos de menos | `check-argument-count` |
| Tipo de argumento errado | `check-type-mismatch` |

Argumentos opcionais são declarados como tal, então uma chamada que os omite está
correta. Funções variádicas do MTA aceitam qualquer número de argumentos finais.

## Múltiplos retornos

Funções que retornam vários valores são tipadas por posição:

```luam
local x, y, z = getElementPosition(element)
```

`x`, `y` e `z` são `number`. Veja [Funções](/pt-br/language/functions).

## Tipos de elemento

`Player`, `Vehicle`, `Ped`, `Marker`, `Blip`, `ColShape` e o resto dos 57 tipos de
elemento são usáveis como tipos, e respeitam a hierarquia de elementos do MTA:

```luam
function highlight(element: Element): boolean
    return setElementAlpha(element, 180)
end

highlight(vehicle)   # um Vehicle é um Element
```

`source` dentro de um handler não tem tipo por si só, então anote-o quando quiser
a API do elemento:

```luam
addEventHandler('onPlayerJoin', root, function()
    local player: Player = source

    outputChatBox(getPlayerName(player) .. ' joined.', root)
end)
```

## Eventos

Um nome de evento é verificado contra o catálogo e contra o ambiente do arquivo:

```luam
# src/server/join.luam
addEventHandler('onPlayerJoin', root, function() end)      # ok
addEventHandler('onClientRender', root, function() end)    # check-environment-event
```

| Ambiente | Eventos típicos |
| --- | --- |
| `server` | `onPlayerJoin`, `onPlayerQuit`, `onResourceStart`, `onPlayerChat` |
| `client` | `onClientRender`, `onClientResourceStart`, `onClientKey` |

Um evento que o catálogo não conhece não é erro — eventos personalizados criados
com `addEvent` continuam funcionando.

## Um nome desconhecido não é erro

O catálogo é um snapshot fixo, então pode ficar atrás de uma versão do MTA. Um
nome que ele não conhece resolve para `any`: a chamada compila e você perde apenas
completação e verificação de argumentos. Isso é deliberado — uma função nova do
MTA nunca deve bloquear um build.

## Um exemplo completo

<<< @/snippets/event-handler/src/server/join-listener.luam

<<< @/snippets/event-handler/src/client/render-listener.luam

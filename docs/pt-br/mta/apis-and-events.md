# APIs e eventos

## O catálogo

A superfície do MTA é um catálogo **gerado**, produzido a partir do wiki do MTA e
embarcado no compilador. Ele é a única fonte de verdade sobre o que um arquivo
`server`, `client` ou `shared` pode usar.

| Tipo | Quantidade |
| --- | --- |
| Declarações de API | 1413 |
| Eventos | 221 |
| Tipos de elemento | 58 |

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

```luam env=server
addEventHandler('onPlayerJoin', root, function ()
    local player: Player = source

    outputChatBox(getPlayerName(player) .. ' joined.', root)
end)
```

## Eventos

Um nome de evento é verificado contra o catálogo e contra o ambiente do arquivo:

```luam expect-error
# src/server/join.luam
addEventHandler('onPlayerJoin', root, function () end)      # ok
addEventHandler('onClientRender', root, function () end)    # check-environment-event
```

| Ambiente | Eventos típicos |
| --- | --- |
| `server` | `onPlayerJoin`, `onPlayerQuit`, `onResourceStart`, `onPlayerChat` |
| `client` | `onClientRender`, `onClientResourceStart`, `onClientKey` |

Um evento que o catálogo não conhece não é erro — eventos personalizados criados
com `addEvent` continuam funcionando.

## Handlers tipados

Todo evento do catálogo carrega a assinatura do seu handler, então um callback
escrito para um nome conhecido recebe os parâmetros tipados sem anotação:

```luam env=server
addEventHandler('onPlayerQuit', root, function (quitType, reason, responsibleElement)
    # quitType: string, reason: string, responsibleElement: Element
    outputChatBox(quitType .. ': ' .. reason, responsibleElement)
end)
```

A assinatura é resolvida no ambiente da chamada, então `onClientRender` em um
arquivo cliente e `onPlayerQuit` em um arquivo servidor recebem cada um os seus
próprios parâmetros.

O payload de um trigger é verificado contra a mesma assinatura:

```luam expect-error
triggerEvent('onPlayerQuit', root, 'Quit', 'Timed out.', root)   # ok
triggerEvent('onPlayerQuit', root, 1, 'Timed out.', root)        # check-type-mismatch
triggerEvent('onPlayerQuit', root, 'Quit')                       # check-argument-count
```

`triggerClientEvent`, `triggerServerEvent` e suas variantes latentes são
verificados contra a assinatura do lado de **destino**, nas duas ordens de
argumentos.

Um nome que o compilador não consegue resolver — uma variável no lugar de um
literal, ou um evento que ninguém declarou — mantém a assinatura permissiva do
MTA. Nada é bloqueado.

## Eventos personalizados

`addEvent` cria um evento em tempo de execução e não carrega tipos.
`declare event` dá um contrato a esse nome, e o contrato tipa todo handler e todo
trigger dele:

```luam
declare event 'onMatchStart'(player: Player, round: number, ...tags: string)

addEvent('onMatchStart', true)

addEventHandler('onMatchStart', root, function (player, round)
    outputChatBox(getPlayerName(player) .. ' started round ' .. round, root)
end)

function startMatch(player: Player): void
    triggerEvent('onMatchStart', root, player, 1, 'ranked')
end
```

A declaração não emite nada — é apagada como uma anotação de tipo — e tira o
ambiente do caminho do arquivo: um contrato em `src/shared` cobre os dois lados,
um em `src/client` tipa o que `triggerClientEvent` envia. O mesmo nome pode ter
um contrato diferente em cada lado. Manter os contratos em um arquivo `.d.luam`
deixa todos no mesmo lugar; veja
[Arquivos de declaração](/pt-br/language/declaration-files).

Os parâmetros seguem as regras de uma assinatura de função: `round?: number` é
opcional, `...tags: string` é um variádico tipado e um parâmetro sem anotação é
`any`.

| Erro | Diagnóstico |
| --- | --- |
| O mesmo evento declarado duas vezes | `check-duplicate-event` |
| Um nome de evento vazio | `check-invalid-event-name` |
| Dois parâmetros com um nome | `check-duplicate-event-parameter` |
| Um parâmetro variádico que não é o último | `check-invalid-event-parameter` |
| Um tipo de retorno diferente de `void` | `check-event-return-type` |

## Um nome desconhecido não é erro

O catálogo é um snapshot fixo, então pode ficar atrás de uma versão do MTA. Um
nome que ele não conhece resolve para `any`: a chamada compila e você perde apenas
completação e verificação de argumentos. Isso é deliberado — uma função nova do
MTA nunca deve bloquear um build.

## Um exemplo completo

<<< @/snippets/event-handler/src/server/join-listener.luam

<<< @/snippets/event-handler/src/client/render-listener.luam

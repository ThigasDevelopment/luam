# Tratador de evento

Handlers para eventos nativos do MTA nos dois lados, cada um no ambiente que é
dono do evento.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).

## Árvore de arquivos

```
luam-docs-event-handler/
├── luam.json
└── src/
    ├── server/join-listener.luam
    └── client/render-listener.luam
```

## Código

<<< @/snippets/event-handler/luam.json

<<< @/snippets/event-handler/src/server/join-listener.luam

<<< @/snippets/event-handler/src/client/render-listener.luam

## O que observar

- **`source` é anotado.** Dentro de um handler, `source` não carrega tipo por si
  só. `local player: Player = source` é o que dá acesso a `getPlayerName` com
  verificação e completação.
- **Parâmetros do handler são tipados.** `onPlayerQuit` passa um motivo, e anotá-lo
  como `string` torna segura a interpolação logo abaixo.
- **O valor interpolado é um local.** `${getPlayerName(player)}` seria
  `check-unknown-template-root` — calcule o nome antes.
- **`root` versus `resourceRoot`.** `root` cobre todo elemento no servidor;
  `resourceRoot` cobre apenas este resource, que é o que um handler de parada quer.

## Comandos

```bash
luam check
luam build
```

## Resultado esperado

<<< @/snippets/output/event-handler.check.txt{text}

Um jogador entrando produz uma linha de chat para todos, e um jogador saindo grava
uma linha no `server.log`. O cliente conta quadros e informa o total ao console de
debug quando o resource para.

## Um erro comum

Tratar um evento de cliente em um arquivo de servidor:

```
src/server/join-listener.luam:3:1 error check-environment-event: Event "onClientRender" is client-only and cannot be used in a "server" file.
```

Eventos têm exatamente o mesmo escopo das APIs. Mova o handler para `src/client`,
ou use o evento de servidor que corresponde ao que você precisa.

## Eventos personalizados

Um evento que o catálogo não conhece não é erro, então `addEvent` mais
`addEventHandler` continua funcionando:

```luam
addEvent('onMatchStarted', true)

addEventHandler('onMatchStarted', root, function(round: number)
    outputChatBox(`round ${round}`, root)
end)
```

## Nota de segurança

Um handler para um evento que um cliente pode disparar recebe o que aquele cliente
escolheu enviar. A anotação de tipo é apagada no build, então ela é um contrato de
compilação, não uma guarda de execução — valide os valores antes de agir sobre
eles. Veja [Fronteiras de segurança](/pt-br/mta/security).

# Função compartilhada

Uma função, escrita uma única vez em `src/shared`, chamada tanto pelo servidor
quanto pelo cliente.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).

## Árvore de arquivos

```
luam-docs-shared-function/
├── .luam.manifest
└── src/
    ├── shared/labels.luam
    ├── server/greet.luam
    └── client/greet.luam
```

## Código

<<< @/snippets/shared-function/.luam.manifest{js}

<<< @/snippets/shared-function/src/shared/labels.luam

<<< @/snippets/shared-function/src/server/greet.luam

<<< @/snippets/shared-function/src/client/greet.luam

## Por que isso funciona

`src/shared` resolve para o ambiente `shared`, então os globais dele são visíveis
tanto para os arquivos de servidor quanto para os de cliente. O compilador sabe
disso sem nenhum comando de importação — a pasta é a declaração.

O inverso também é cobrado: um arquivo `shared` pode usar apenas APIs `shared`. É
por isso que `labels.luam` não tem `outputChatBox` (servidor) nem `dxDrawText`
(cliente). Mover qualquer uma das chamadas para o arquivo compartilhado é
`check-environment-api`.

## Comandos

```bash
luam check
luam build
```

## Resultado esperado

<<< @/snippets/output/shared-function.check.txt{text}

O `meta.xml` declara um curinga por ambiente, na ordem shared, server, client:

```xml
<script src="src/shared/**/*.lua" type="shared" cache="false" />
<script src="src/server/**/*.lua" />
<script src="src/client/**/*.lua" type="client" cache="false" />
```

Um script compartilhado é baixado pelos clientes, então **nada que um jogador não
possa ver pertence a `src/shared`**. Veja
[Fronteiras de segurança](/pt-br/mta/security).

No servidor, um jogador entrando produz:

```
[luam-docs] Thigas joined.
```

## Um erro comum

Chamar uma função compartilhada de um arquivo de cliente funciona. Chamar um
global **de servidor** de um arquivo de cliente, não:

```
src/client/greet.luam:4:5 error project-environment-import: "announceJoin" is declared in the "server" module "src/server/greet.luam" and cannot be used from a "client" file.
```

Mova a função para `src/shared` — ou, se ela precisa ficar no servidor, envie uma
mensagem com `triggerClientEvent`.

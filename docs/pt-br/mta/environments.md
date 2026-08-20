# Ambientes

Todo arquivo resolve para exatamente um ambiente — `server`, `client` ou
`shared` — **antes de qualquer outra coisa acontecer**. Essa decisão determina
quais APIs do MTA existem, quais eventos existem, quais globais de outros arquivos
são visíveis e onde o arquivo compilado é declarado no `meta.xml`.

## Como o ambiente é decidido

1. Uma diretiva `#!server`, `#!client` ou `#!shared` no arquivo, se houver.
2. Caso contrário, o primeiro segmento de caminho dentro de um diretório de
   código:

| Caminho | Ambiente |
| --- | --- |
| `src/server/**` | `server` |
| `src/client/**` | `client` |
| `src/shared/**` | `shared` |

```luam env=client
#!client

dxDrawText('hud', 10, 10)
```

A diretiva vence a pasta, e é isso que permite a um arquivo viver fora da árvore
usual.

## O que cada ambiente pode usar

| Arquivo | Pode usar |
| --- | --- |
| `server` | declarações `server` e declarações `shared` |
| `client` | declarações `client` e declarações `shared` |
| `shared` | apenas declarações `shared` |

`server` e `client` nunca enxergam um ao outro. `shared` é o mais restrito dos
três, porque o seu código precisa ser válido dos dois lados.

```luam env=client
# src/server/admin.luam
outputChatBox('hi', player)   # ok, outputChatBox é shared
dxDrawText('hud', 10, 10)     # check-environment-api
```

```luam env=server
# src/shared/util.luam
outputDebugString('hello')    # ok, outputDebugString é shared
kickPlayer(player)            # check-environment-api: kickPlayer é exclusivo do servidor
```

## Globais seguem a mesma regra

Um global declarado por outro arquivo só é visível quando os ambientes são
compatíveis. Um arquivo `server` enxerga globais de módulos `shared` e de outros
módulos `server`, nunca de módulos `client`. Quebrar isso é
`project-environment-import`.

É por isso que um helper compartilhado é o lugar certo para tudo que os dois lados
precisam:

<<< @/snippets/shared-function/src/shared/labels.luam

<<< @/snippets/shared-function/src/server/greet.luam

## Eventos também têm escopo

`onPlayerJoin` é um evento de servidor e `onClientRender` é de cliente. Tratar um
evento do lado errado é `check-environment-event`:

```luam env=client
# src/server/main.luam
addEventHandler('onClientRender', root, draw)   # check-environment-event
```

Veja [APIs e eventos](/pt-br/mta/apis-and-events).

## Nomes desconhecidos continuam `any`

Um nome que o catálogo não conhece resolve para `any` em vez de falhar. Uma função
adicionada em uma versão do MTA mais nova que o snapshot fixo do catálogo
continua, portanto, compilando — você perde completação e verificação de
argumentos para ela, não o build.

## No editor

A completação tem exatamente o mesmo escopo do checker: `dxDrawText` nunca aparece
em um arquivo de servidor e `kickPlayer` nunca aparece em um de cliente. O hover
informa o ambiente de uma API do MTA, então dá para ver por que um nome está
faltando.

## O que chega ao meta.xml

O ambiente decide o atributo `type` da entrada `<script>` gerada:

```xml
<script src="src/shared/**/*.lua" type="shared" cache="false" />
<script src="src/server/**/*.lua" />
<script src="src/client/**/*.lua" type="client" cache="false" />
```

Uma entrada de servidor não carrega nenhum dos dois atributos porque ambos são o
padrão do MTA. Veja [Resources e meta.xml](/pt-br/mta/resources).

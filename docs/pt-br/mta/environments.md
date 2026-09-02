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
| `shared` | tudo — as declarações compartilhadas e os dois lados |

`server` e `client` nunca enxergam um ao outro, e usar a API do outro lado é um
erro que interrompe o build.

```luam env=client
# src/server/admin.luam
outputChatBox('hi', player)   # ok, outputChatBox é shared
dxDrawText('hud', 10, 10)     # check-environment-api, erro
```

Um arquivo `shared` é diferente. Ele roda dos dois lados, então enxerga tudo e o
checker não diz nada sobre a que lado um nome pertence:

```luam env=shared
# src/shared/util.luam
outputDebugString('hello')    # outputDebugString é shared
kickPlayer(player)            # kickPlayer é exclusivo do servidor — aceito, sem diagnóstico
```

O arquivo é `shared` porque você disse que é — pela pasta, pelo mapeamento
`sources` ou por uma diretiva `#!shared`. O compilador trata isso como a decisão
que é e não pergunta de novo a cada linha.

O que ele **não** faz é verificar a ramificação em tempo de execução. Nada impede
`kickPlayer` de ser alcançado no cliente, onde ele não existe, e isso falha em
tempo de execução ao tentar chamar um valor `nil`. Num arquivo shared, manter cada
chamada exclusiva de um lado atrás da ramificação certa é responsabilidade sua.

O editor é onde o lado continua aparecendo: a completação marca um nome exclusivo
com `(client)` ou `(server)`, e o hover nomeia o lado. Você vê na hora de escolher
o nome, e não depois de ter escrito a linha.

## Decidindo o lado em tempo de execução

Um módulo que precisa funcionar dos dois lados pergunta em qual lado está e
ramifica. O teste usual é se `localPlayer` é um elemento, o que só é verdade no
cliente:

```luam env=shared
# src/shared/network.luam
class Network {
    isClient: boolean = false

    constructor = function ()
        self.isClient = isElement(localPlayer)
    end

    emit = function (name: string, target: Element): void
        if self.isClient then
            triggerServerEvent(name, target)
        else
            triggerClientEvent(target, name, target)
        end
    end
}
```

Esse arquivo compila limpo — sem erro e sem aviso. Os tipos são reais, então a
verificação que importa continua ali: `localPlayer` é um `Player`, e as duas
funções de trigger mantêm suas assinaturas, então `triggerServerEvent()` sem
argumentos ainda é `check-argument-count`.

O que o compilador não consegue fazer é verificar a ramificação. `self.isClient` é
um campo, não uma expressão sobre a qual ele possa raciocinar; se a ramificação
estiver errada — invertida, ou contornada por outro método — a chamada alcança o
lado errado e falha em tempo de execução.

Se você não precisa dos dois lados em um arquivo, prefira dois arquivos. Isso
existe para o módulo que realmente não pode ser dividido.

## Globais seguem a mesma regra

Um global declarado por outro arquivo só é visível quando os ambientes são
compatíveis. Um arquivo `server` enxerga globais de módulos `shared` e de outros
módulos `server`, nunca de módulos `client`. Quebrar isso é
`project-environment-import`.

Essa regra **não** afrouxa para um arquivo `shared`: importar um módulo `server`
ou `client` a partir de `shared` continua sendo um erro. Um import resolve quando
o chunk carrega, então nenhuma ramificação em tempo de execução pode desfazê-lo.

É por isso que um helper compartilhado é o lugar certo para tudo que os dois lados
precisam:

<<< @/snippets/shared-function/src/shared/labels.luam

<<< @/snippets/shared-function/src/server/greet.luam

## Eventos também têm escopo

`onPlayerJoin` é um evento de servidor e `onClientRender` é de cliente. Tratar um
evento do lado errado é `check-environment-event` — um erro em um arquivo
`server` ou `client`, e nada em um `shared`:

```luam env=client
# src/server/main.luam
addEventHandler('onClientRender', root, draw)   # check-environment-event, erro
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

Um arquivo `shared` recebe os dois lados. As APIs compartilhadas vêm primeiro,
como a lista padrão; as de servidor e de cliente seguem como complementos, cada
uma carregando seu lado no detalhe do item — então um nome sem selo de lado é
seguro dos dois lados. O hover sobre uma delas mostra a assinatura completa mais
uma linha nomeando o lado. Esse é o único lugar onde o lado é informado em um
arquivo shared, e é por isso que vale ler.

## O que chega ao meta.xml

O ambiente decide o atributo `type` da entrada `<script>` gerada:

```xml
<script src="src/shared/**/*.lua" type="shared" cache="false" />
<script src="src/server/**/*.lua" />
<script src="src/client/**/*.lua" type="client" cache="false" />
```

Uma entrada de servidor não carrega nenhum dos dois atributos porque ambos são o
padrão do MTA. Veja [Resources e meta.xml](/pt-br/mta/resources).

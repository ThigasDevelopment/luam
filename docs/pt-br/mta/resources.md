# Resources e meta.xml

Um build produz um resource (recurso do MTA) completo. Nada mais é necessário
antes de `refresh` e `start`.

## O que é escrito

```
build/
├── my-resource.luam-map.json
└── my-resource/
    ├── meta.xml
    ├── config.lua
    ├── .env
    ├── assets/
    └── src/
        ├── shared.lua
        ├── server.lua
        └── client.lua
```

Esta é a estrutura padrão de bundle. Ambientes vazios são omitidos. `ensure` usa
uma árvore espelhada por padrão e `dev` sempre usa uma. Veja
[Estruturas de saída e mapas de código](/pt-br/reference/output-layouts) para os
dois formatos.

O **nome** do resource vem do `.luam.manifest` e nomeia a pasta. Ele nunca chega ao
`meta.xml`, porque o MTA lê o nome de um resource a partir do diretório.

## O manifesto gerado

Na estrutura de bundle, o `meta.xml` lista `config.lua` e então um script por
ambiente não vazio, na ordem shared, server, client.

```xml
<script src="config.lua" type="shared" cache="false" />
<script src="src/shared.lua" type="shared" cache="false" />
<script src="src/server.lua" />
<script src="src/client.lua" type="client" cache="false" />
```

Uma entrada de servidor não carrega `type` nem `cache`, já que ambos são o padrão
do MTA; toda entrada de cliente e compartilhada carrega `cache="false"`. A saída
em árvore lista helpers, `config.lua`, entradas fixadas por `loadOrder` e grupos
de código.

Entradas `<export>` vêm de [funções `export`](/pt-br/language/exports), e entradas
`<file>` vêm de `assetDirs`.

## Helpers de runtime

Helpers são incluídos **somente quando o código gerado usa o recurso**. A saída em
bundle os coloca antes dos módulos dentro do bundle do ambiente. A saída em árvore
os escreve em `lib/<ambiente>/`, fora da árvore de código:

| Helper | Copiado quando |
| --- | --- |
| `class.lua` | O resource declara uma classe ou um enum. |
| `string.lua` | Uma string de template ou uma extensão de string é usada. |
| `table.lua` | Uma extensão de tabela é usada. |
| `math.lua` | Uma extensão de número como `clamp` é usada. |
| `threads.lua` | `sleep` ou `Threads` é nomeado. Também selecionável por `helpers`. |
| `async.lua` | `Async` é nomeado. |
| `dotenv.lua`, `env.lua` | O projeto tem um `.env`. Só de servidor. |

Um resource sem classes nunca carrega `class.lua`, e um helper só de servidor
nunca é baixado por um cliente.

## `min_mta_version`

O build resolve a última versão publicada do MTA e a guarda em
`.luam/mta-version.json`. Sem rede, ele usa o cache; sem os dois, avisa, omite o
elemento e mesmo assim produz um resource completo. `--offline` ou a variável de
ambiente `LUAM_OFFLINE` pula a consulta de propósito.

Essa é a única chamada de rede em um build, e ela nunca é necessária para que ele
tenha sucesso.

## Ordem de carga

`loadOrder` fixa caminhos de código à frente do seu grupo:

```luam
loadOrder = { 'src/server/index.luam', 'assets/shaders/base.fx' }
```

Um script é colocado antes dos outros módulos do seu ambiente, e um asset antes
dos outros assets. A ordem também importa para assets, já que um shader pode depender de outro. Uma
entrada que não casa com nenhum arquivo falha o build com
`project-load-order-missing`, então uma renomeação não quebra a ordem em silêncio.

## Escrita incremental e limpeza

Arquivos cujo conteúdo não mudou são deixados em paz, então uma sincronização move
apenas o que realmente mudou. Assets são comparados byte a byte, então um arquivo
binário não é reescrito.

A limpeza remove o que o build não produz mais: arquivos `.lua`, o `meta.xml` e
qualquer coisa dentro de um diretório de código configurado, de um diretório de
assets configurado ou de `lib/`. Um arquivo que o build nunca escreveu é mantido, e
o `.env` nunca é tocado.

**Um build que reporta qualquer erro não escreve nada**, então um resource que
funcionava nunca é substituído por uma saída parcial.

## Instalando

```
refresh
start my-resource
```

Copie `build/my-resource` para `<Servidor MTA>/mods/deathmatch/resources/`, ou
deixe o [`luam ensure`](/pt-br/guide/daily-development) espelhar para você a cada
gravação.

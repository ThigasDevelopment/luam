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
    ├── env.lua
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
`<file>` vêm dos mapeamentos de `assets`. Entradas `<include>` vêm de
`dependencies`.

## Helpers de runtime

Helpers são incluídos **somente quando o código gerado usa o recurso**. A saída em
bundle os coloca antes dos módulos dentro do bundle do ambiente. A saída em árvore
os escreve direto em `lib/`, fora da árvore de código:

| Helper | Copiado quando |
| --- | --- |
| `class.lua` | O resource declara uma classe ou um enum. |
| `string.lua` | Uma string de template ou uma extensão de string é usada. |
| `table.lua` | Uma extensão de tabela é usada. |
| `math.lua` | Uma extensão de número como `clamp` é usada. |
| `promise.lua` | Uma `async function` é declarada, ou `Promise`, `delay` ou `sleep` é nomeado. Também selecionável por `helpers`. |
| `threads.lua` | `Threads` é nomeado. Requer `promise.lua`. |
| `async.lua` | `Async` é nomeado. Requer `threads.lua`. |

Um resource sem classes nunca carrega `class.lua`, e um helper só de servidor
nunca é baixado por um cliente. Valores de implantação não são um helper: um
projeto com `.env` recebe um `env.lua` gerado na raiz do resource.

### O runtime de promises

O `promise.lua` declara `Promise`, `delay` e `sleep`. Uma
[função async](/pt-br/language/functions#funcoes-async) compila em cima dele, e
estes membros também estão disponíveis para código escrito à mão:

| Membro | O que faz |
| --- | --- |
| `new Promise(executor)` | Cria uma promise a partir de um executor que recebe `resolve` e `reject`. Um erro lançado dentro do executor rejeita a promise. |
| `Promise.resolve(...)` / `Promise.reject(...)` | Uma promise já resolvida. O `resolve` devolve inalterada uma promise passada para ele. |
| `Promise.all(list)` / `Promise.race(list)` | Espera todas as promises, ou espelha a primeira que se resolver. |
| `Promise.settle(promise)` | Espera e reporta: `true` e os valores, ou `false` e o motivo. Válido dentro de uma função async. |
| `promise:next(onFulfilled, onRejected)` | Roda um callback quando a promise resolve, sem suspender quem chamou. Encadeável. |
| `promise:catch(onRejected)` | Roda um callback quando a promise rejeita. Encadeável. |
| `delay(milliseconds)` | Uma promise que resolve depois de uma espera, limitada ao piso de 50ms dos timers do MTA. |
| `sleep(milliseconds)` | Suspende a corrotina em execução. Válido dentro de uma função async e dentro de um job de `Threads`; em qualquer outro lugar levanta erro. |

### Uma promise ou um pool

Use uma **promise** quando o trabalho *espera* — uma ida ao banco, uma chamada
remota, um evento respondido em outro tick. Use um **pool** quando o trabalho é
*longo* — um laço sobre dez mil linhas que não pode segurar um frame.

O motivo é o orçamento de frames. Fatiar com `await delay(0)` custa um timer por
fatia e cai no piso de 50ms, algo como 20 fatias por segundo. Um pool retoma jobs
a partir de um único pulso compartilhado, sob um orçamento de 150 frames em
`normal` e 500 em `high` — uma a duas ordens de grandeza a mais de fatias no
mesmo tempo de relógio.

As duas bibliotecas rodam nesse mesmo escalonador e no mesmo timer de pulso,
então misturá-las não custa nada: o `await` se comporta igual dentro de um job
de pool, e `pool:add(fn)` devolve primeiro o id do job e, em segundo, uma
promise que se resolve quando ele termina.

```luam
local pool = new Threads('concurrent', 'normal')

async function slice(): void
    local id, done = pool:add(function ()
        for index = 1, 10000 do
            sleep(0)
        end
    end)

    await done

    outputDebugString('job ' .. tostring(id) .. ' finished')
end
```

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
o `env.lua` nunca é tocado.

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

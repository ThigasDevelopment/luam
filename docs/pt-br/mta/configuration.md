# config.lua e .env

Um resource carrega dois arquivos de configuração, e eles têm **donos
diferentes**.

| Arquivo | Dono | Versionado | Chega ao cliente |
| --- | --- | --- | --- |
| `config.lua` | O autor do resource | sim | **sim** |
| `.env` | A implantação | sim | não |
| `.env.local` | A máquina de um desenvolvedor | não | não |
| `<outDir>/<name>/env.lua` | O administrador do servidor | não | não |

## `config.lua`

`config.lua` na raiz do projeto pertence ao autor do resource. É Lua 5.1 puro,
copiado como está, nunca analisado pelo compilador e declarado no `meta.xml` como
script **shared** — o que significa que os clientes o baixam.

```lua
Config = {
    greeting = 'Welcome to the server.',
    limit = 32,
}
```

Tudo que um jogador pode ver pertence aqui. Nada secreto pertence.

Como o compilador nunca o analisa, dê a ele um
[arquivo de declaração](/pt-br/language/declaration-files) para obter tipos:

```luam decl
interface ConfigShape {
    greeting: string
    limit: number
}

declare Config: ConfigShape
```

## `.env`

`.env` na raiz do projeto pertence à implantação. Ele declara as chaves, os
padrões seguros e — o mais importante — **os tipos**:

<<< @/snippets/environment-configuration/.env{ini}

| Valor | Tipo |
| --- | --- |
| `MAX_PLAYERS=32` | `number` |
| `DEBUG=false` | `boolean` |
| `SERVER_NAME="Luam Docs Server"` | `string` |

Um número sem aspas é `number`, `true` e `false` são `boolean`, e usar aspas força
`string`.

## Lendo os valores

Os valores chegam ao Luam por `env` e `process.env`, publicados no servidor pelo
`env.lua` gerado:

<<< @/snippets/environment-configuration/src/server/startup.luam

`process` é declarado `server`, então usá-lo de um arquivo de cliente ou
compartilhado é `check-environment-api`. Uma chave que o `.env` não declara é
`check-unknown-record-key`, e a mensagem lista as chaves declaradas.

O `.env` nunca recebe uma entrada `<file>`, então nunca é transmitido a um
jogador.

## `.env.local`

`.env.local` sobrescreve valores em uma máquina e nunca é versionado. Os tipos
continuam vindo do `.env`, então uma chave que só existe no `.env.local` continua
desconhecida para o checker.

::: warning A nomenclatura é invertida em relação a Vite e Next
Aqui o `.env` é **versionado** e o `.env.local` é ignorado. O `.env` é uma
declaração de chaves e padrões seguros, não um cofre de segredos.
:::

## O `env.lua` implantado

O primeiro build escreve `<outDir>/<name>/env.lua` a partir das chaves declaradas,
esvaziando qualquer chave cujo nome pareça sensível — `password`, `secret`,
`token`, `key`, `credential`, `dsn` ou `private`:

```lua
local values = {
    DEBUG = false,
    MAX_PLAYERS = 32,
    SERVER_NAME = 'Luam Docs Server',
    WEBHOOK_TOKEN = '',
}
```

Ele **nunca é sobrescrito depois** e nunca é removido pela limpeza, então as
edições do administrador sobrevivem a todo rebuild e a todo `ensure`. É isso que
impede um deploy de substituir a configuração de um servidor em execução pelos
valores da sua máquina. Apague-o para regenerar o esqueleto.

Os valores são editados no lugar, então seguem a sintaxe Lua: texto fica entre
aspas, números e booleanos não. Abaixo da tabela o arquivo publica `env` e
`process.env` por trás de um metatable que levanta erro em chave não declarada e
recusa atribuição.

O resource não leva um `.env` próprio. O `.env.local` nunca chega ao arquivo
gerado — os overrides dele valem só para o checker na sua máquina.

## Escolhendo entre os dois

| O valor é | Coloque em |
| --- | --- |
| Ajuste de jogo que um jogador pode ler | `config.lua` |
| Nome do servidor, um limite, uma flag de recurso | `.env` |
| Uma senha, um token, uma chave de API | `env.lua` no servidor, esvaziado no `.env` versionado |
| Diferente por máquina durante o desenvolvimento | `.env.local` |

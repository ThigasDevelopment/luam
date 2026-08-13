# .luam.manifest

O `.luam.manifest` fica na raiz do projeto. **Apenas `name` é obrigatório.**

```luam
name = 'luam-demo'
author = 'Thigas'
version = '1.0.0'
description = 'A demo resource'

sourceDirs = { 'src' }
assetDirs = { 'assets' }
outDir = 'build'
loadOrder = { 'src/server/index.luam', 'assets/shaders/base.fx' }

output = {
    bundle = true,
    map = true,
}

oop = false
helpers = { 'threads' }
serverPath = 'C:/MTA Server'
resourcesDir = 'mods/deathmatch/resources'

development = {
    logs = {
        enabled = false,
        maxMessageLength = 4096,
        rateLimit = 30,
        rateWindowMs = 1000,
    },
}

transport = {
    kind = 'http',
    host = '127.0.0.1',
    port = 22005,
    resource = 'luam-sync',
    username = 'luam',
    passwordEnv = 'LUAM_MTA_PASSWORD',
}
```

`--manifest <path>` carrega outro arquivo, que é como um projeto mantém um manifesto
separado para um segundo servidor. O caminho precisa terminar em `.luam.manifest` —
`deploy.luam.manifest` é aceito, `luam.config.js` é `config-unsupported-manifest`.

## O dialeto

O manifesto é escrito em Luam, restrito ao que um arquivo de configuração precisa.
O compilador o analisa, verifica e avalia — o mesmo lexer, o mesmo parser, os
mesmos diagnósticos com posição. Não há uma linguagem de configuração separada
para aprender nem um processo separado para executá-la.

Duas instruções são permitidas:

```luam
local prefix = 'luam'          # um local, para nomear um valor usado mais de uma vez
name = prefix .. '-demo'       # uma atribuição a um campo de configuração
```

Qualquer outra coisa — uma função, um laço, um `if`, um `return`, uma chamada, uma
diretiva de ambiente — é `config-invalid-statement`. Uma atribuição a um nome que
não é campo de configuração é `config-unknown-field`, reportada no nome e não no
arquivo:

```
.luam.manifest:2:1 error config-unknown-field: "outdir" is not defined in this
manifest. Declare it with "local", or read "mode", "env", or "root".
```

Todo diagnóstico de configuração carrega linha e coluna, e um terminal interativo
sublinha o trecho exatamente como faz com um arquivo de código.

Um valor é um literal, uma tabela, ou esses combinados com `and`, `or`, `not`,
comparação, aritmética e concatenação:

```luam
outDir = mode == 'production' and 'build' or 'build-dev'
port = 22000 + 5
transport = {
    kind = env.LUAM_MTA_PASSWORD and 'http' or 'none',
    passwordEnv = 'LUAM_MTA_PASSWORD',
}
```

Vale a veracidade do Lua, então `a and b or c` se lê como um condicional e o
verificador o tipa com precisão: o ramo acima é `'http' | 'none'`, que é o que
`transport.kind` aceita.

### Por que não há chamadas

A linguagem de expressões não tem chamadas nem valores de função. Esse é
justamente o ponto: avaliar um manifesto é puro e total, então é seguro rodá-lo em
qualquer lugar. O compilador o avalia no próprio processo, e o servidor de
linguagem também, a cada tecla — abrir uma pasta nunca executa código do projeto e
nunca cria um processo.

### Valores injetados

Três nomes estão em escopo além dos campos de configuração:

| Valor | Tipo | Significado |
| --- | --- | --- |
| `mode` | `string` | `development` para `dev` e `ensure`, `production` para `build`, caso contrário o nome do comando — `check`, `trace`. |
| `env` | tabela de `string?` | O ambiente que a CLI recebeu. Leia uma variável pelo nome; o valor nunca chega a um diagnóstico. |
| `root` | `string` | Raiz absoluta do projeto, para compor caminhos que não dependem do diretório de trabalho. |

Os membros de `env` são strings opcionais, então uma variável ausente é `nil` e
não um erro. Comparar ou dar um padrão é a forma de usar uma:

```luam
local password = env.LUAM_MTA_PASSWORD

transport = {
    kind = password and 'http' or 'none',
}
```

Nada mais está em escopo. Não há `print`, `os` nem `require` — um nome que o
manifesto não declarou é `config-unknown-field`, que é também por que um erro de
digitação em um campo é apontado no campo em vez de ignorado em silêncio.

### No editor

Para o servidor de linguagem, o manifesto é um documento comum. Os diagnósticos
aparecem enquanto você digita, o autocompletar oferece os campos válidos no cursor
— com tipo, se são obrigatórios e o padrão — e os conjuntos fechados
(`transport.kind`, `helpers` e os valores de `mode`) completam dentro das aspas. O
hover nomeia o caminho completo do campo e seu tipo.

Como o servidor lê o arquivo diretamente, mudar `oop` passa a valer ao salvar. Não
há snapshot para atualizar nem execução da CLI para esperar; o
`.luam/settings.json` deixou de existir.

## Campos

| Campo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- |
| `name` | sim | — | Nomeia `<outDir>/<name>` e o resource que o `ensure` reinicia. Nunca chega ao `meta.xml` — o MTA lê o nome da pasta. |
| `author`, `version`, `description` | não | não definido | Atributos de info do `meta.xml`. |
| `sourceDirs` | não | `{ 'src' }` | Varridos em busca de `.luam` e `.d.luam`. Outros arquivos aqui são copiados, mas não declarados. |
| `assetDirs` | não | `{ 'assets' }` | Copiados como estão e declarados como `<file>`, para os clientes baixarem. |
| `outDir` | não | `'build'` | Recebe `<outDir>/<name>`. |
| `loadOrder` | não | `{ }` | Caminhos fixados à frente do seu grupo no `meta.xml`. |
| `output.bundle` | não | `true` | Usa bundles de produção para `build`; `false` seleciona a árvore. |
| `output.map` | não | `true` | Gera mapas de posição de código. Apenas `build` escreve o arquivo de mapa. |
| `oop` | não | `false` | Liga a API OOP do MTA e escreve `<oop>true</oop>`. |
| `helpers` | não | `{ }` | Helpers de runtime a copiar mesmo quando nenhum recurso os exige. |
| `serverPath` | não | não definido | Raiz do servidor MTA. Exigido por `ensure` e `dev`. |
| `resourcesDir` | não | `'mods/deathmatch/resources'` | Diretório de resources relativo a `serverPath`. |
| `transport` | não | ausente | Como o `ensure` reinicia o resource. `kind` é obrigatório assim que a tabela é escrita. |
| `development.logs` | não | desligado, limites seguros | Comprimento e limites de taxa do relay usados pelo `dev`. |

Uma tabela campo a campo completa, incluindo cada regra de validação, está em
[Campos de configuração](/pt-br/reference/configuration-fields).

## Segurança de caminhos

`outDir`, `resourcesDir` e cada entrada de `sourceDirs`, `assetDirs` e `loadOrder`
precisam permanecer **dentro do seu diretório base**. Um caminho absoluto ou um
segmento `..` é `config-escaping-path` e a configuração não carrega.

## `loadOrder`

Uma lista ordenada de caminhos relativos à raiz do projeto. Cada entrada é emitida
à frente do seu grupo no `meta.xml` — um script pelo seu caminho `.lua` compilado,
um asset por ele mesmo.

A ordem também importa para assets, já que um shader pode depender de outro. Uma
entrada que nomeia um arquivo que o projeto não produz é
`project-load-order-missing`, então uma renomeação não quebra a ordem em silêncio.

## `oop`

Desligado por padrão. Ligado, o compilador escreve `<oop>true</oop>` acima de
`<info>` e tipa a forma de objeto da API do MTA, então `player:getName()` retorna
`string`. Desligado, a mesma chamada é `check-oop-disabled` e a mensagem nomeia a
função procedural a usar. O Lua emitido é idêntico nos dois casos. Veja
[API OOP](/pt-br/mta/oop).

## `output`

`output.bundle` define o padrão de `build`. `--bundle` e `--no-bundle` o
sobrescrevem. `ensure` usa árvore por padrão a menos que receba `--bundle`,
enquanto `dev` sempre usa árvore.

`output.map` controla a geração do mapa. `build` escreve
`<outDir>/<name>.luam-map.json`; `ensure` e `dev` mantêm mapas em memória e nunca
escrevem esse arquivo. `--no-map` desliga a geração no comando atual. Veja
[Estruturas de saída e mapas de código](/pt-br/reference/output-layouts).

## `helpers`

Nomeia helpers de runtime que o compilador não injetaria por conta própria.

- `threads` é opcional e explícito.
- `env` é injetado automaticamente quando o projeto tem um `.env`, então listá-lo
  só é necessário para publicar a biblioteca sem um.
- Listar um helper automático é inofensivo; listar um nome desconhecido é
  `config-unknown-helper`, e o autocompletar oferece os nomes conhecidos dentro
  das aspas.

`helperDir` foi removido. A saída em árvore escreve helpers em `lib/<ambiente>`;
a saída em bundle os inclui nos bundles de ambiente. Um `.luam.manifest` que ainda
nomeia `helperDir` falha com `config-unknown-field` — apague a linha.

## `transport`

```luam
transport = {
    kind = 'http',
    host = '127.0.0.1',
    port = 22005,
    resource = 'luam-sync',
    username = 'luam',
    passwordEnv = 'LUAM_MTA_PASSWORD',
    refreshFunction = 'refreshResources',
    restartFunction = 'restartResource',
}
```

`kind` é o único membro que a tabela precisa carregar — `transport = { }` é
`config-missing-field`, então um bloco pela metade nunca cai em um padrão
silencioso.

`none` pula o restart e apenas sincroniza arquivos. `http` chama a interface HTTP
do MTA:

```
POST http://<host>:<port>/<resource>/call/<function>
```

A chamada leva autenticação básica HTTP e um array JSON de argumentos.
`refreshFunction` roda primeiro, depois `restartFunction` com o nome do resource.
Os dois precisam ser exportados pelo `resource` nomeado na configuração, e a ACL
precisa conceder acesso HTTP ao usuário configurado.

Prefira `passwordEnv` a um `password` embutido. Veja
[Fronteiras de segurança](/pt-br/mta/security).

## `development.logs`

Usado apenas pelo `luam dev`. `build` e `ensure` nunca escrevem os helpers de
desenvolvimento.

| Chave | Padrão | Significado |
| --- | --- | --- |
| `enabled` | `false` | O `dev` liga a captura mesmo quando esta seção é omitida. |
| `maxMessageLength` | `4096` | Registros retransmitidos maiores são rejeitados. |
| `rateLimit` | `30` | Registros permitidos por cliente por janela. |
| `rateWindowMs` | `1000` | Duração dessa janela. |

## Quando o arquivo está errado

| Problema | Diagnóstico |
| --- | --- |
| Sem `.luam.manifest` no diretório | `config-not-found` |
| `--manifest` nomeia um arquivo que não é um manifesto | `config-unsupported-manifest` |
| O arquivo não pôde ser lido | `config-unreadable-manifest` |
| Uma instrução que o dialeto não permite | `config-invalid-statement` |
| Um valor que a linguagem de expressões não permite | `config-invalid-expression` |
| `name`, ou `transport.kind`, ausente | `config-missing-field` |
| `name` não é um nome de resource válido | `config-invalid-name` |
| Um campo tem o tipo errado | `config-invalid-type` |
| Um nome não é um campo de configuração | `config-unknown-field` |
| Um caminho escapa da sua base | `config-escaping-path` |
| `passwordEnv` nomeia uma variável não definida | `config-missing-secret` |

Todos os códigos estão em [Diagnósticos](/pt-br/reference/diagnostics).

## Migrando do `luam.json`

O `luam.json` não é lido, não é mesclado e não é reportado. Um projeto que ainda
tem um falha com `config-not-found` até ser migrado. Três passos:

1. Renomeie `luam.json` para `.luam.manifest`.
2. Remova as chaves externas, tire as aspas dos nomes dos campos e escreva `=` no
   lugar de `:`. Arrays JSON viram tabelas Luam: `["src"]` é `{ 'src' }`.
3. Renomeie `--config` para `--manifest` em todo script ou job de CI que o passe.

```json
{
    "name": "luam-demo",
    "sourceDirs": ["src"],
    "outDir": "build"
}
```

vira

```luam
name = 'luam-demo'
sourceDirs = { 'src' }
outDir = 'build'
```

Os nomes dos campos, seus padrões e cada regra de validação continuam iguais. Com
o arquivo carregando, `mode` e `env` ficam disponíveis sempre que um valor
precisar variar por ambiente.

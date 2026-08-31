# .luam.manifest

O `.luam.manifest` fica na raiz do projeto. **Apenas `name` é obrigatório.**

```luam
name = 'luam-demo'
author = 'Thigas'
version = '1.0.0'
description = 'A demo resource'

compiler = {
    strict = true,
    oop = false,
    noUnusedLocals = false,
    noUnusedParameters = false,
    warningsAsErrors = false,
}

sources = {
    server = { 'src/server/**/*.luam' },
    client = { 'src/client/**/*.luam' },
    shared = { 'src/shared/**/*.luam' },
}

assets = {
    { from = 'assets/**/*', to = 'assets' },
}

dependencies = { 'scoreboard' }
libraries = { '@luam-example/collections' }

engine = {
    minVersion = '1.6.0',
}

environment = {
    file = '.env',
    localFile = '.env.local',
}

outDir = 'build'
loadOrder = { 'src/server/index.luam', 'assets/shaders/base.fx' }

output = {
    bundle = true,
    map = true,
    minify = true,
}

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

Um `local` que nenhum campo lê é configuração morta, então o manifesto o reporta
como `check-unused-local` — um aviso, não um erro. Isso não depende de
`compiler.noUnusedLocals`, que governa os arquivos de código; o manifesto é
sempre verificado no seu próprio modo estrito. Renomeie o local com `_` inicial
para mantê-lo de propósito.

Um valor é um literal, uma tabela, ou esses combinados com `and`, `or`, `not`,
comparação, aritmética e concatenação:

```luam
outDir = mode == 'production' and 'build' or 'build-dev'
serverPath = env.LUAM_MTA_SERVER or 'C:/MTA Server'
```

Vale a veracidade do Lua, então `a and b or c` se lê como um condicional e o
verificador o tipa com precisão: o ramo acima é uma `string`, que é o que
`serverPath` aceita.

### Por que não há chamadas

A linguagem de expressões não tem chamadas nem valores de função. Esse é
justamente o ponto: avaliar um manifesto é puro e total, então é seguro rodá-lo em
qualquer lugar. O compilador o avalia no próprio processo, e o servidor de
linguagem também, a cada tecla — abrir uma pasta nunca executa código do projeto e
nunca cria um processo.

Não há hooks nem plugins pelo mesmo motivo. Um manifesto declara o que o projeto
é; ele nunca descreve como construí-lo.

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
local root = env.LUAM_MTA_SERVER

serverPath = root or 'C:/MTA Server'
```

Nada mais está em escopo. Não há `print`, `os` nem `require` — um nome que o
manifesto não declarou é `config-unknown-field`, que é também por que um erro de
digitação em um campo é apontado no campo em vez de ignorado em silêncio.

### No editor

Para o servidor de linguagem, o manifesto é um documento comum. Os diagnósticos
aparecem enquanto você digita, o autocompletar oferece os campos válidos no cursor
— com tipo, se são obrigatórios e o padrão — e os conjuntos fechados (`helpers` e
os valores de `mode`) completam dentro das aspas. O hover nomeia o caminho
completo do campo e seu tipo.

Como o servidor lê o arquivo diretamente, mudar `compiler.oop` passa a
valer ao salvar. Não há snapshot para atualizar nem execução da CLI para esperar;
o `.luam/settings.json` deixou de existir.

## Domínios

O manifesto é um conjunto fechado de domínios tipados. Cada um tem um único dono
e um único consumidor implementado, então um campo nunca significa duas coisas em
dois lugares.

| Domínio | Possui |
| --- | --- |
| identidade | `name`, `author`, `version`, `description` |
| `compiler` | Como o verificador lê o projeto. |
| `sources` | Quais arquivos pertencem ao projeto e a qual ambiente. |
| `assets` | Quais arquivos são copiados para o resource e onde eles ficam. |
| `dependencies` | Resources que este exige em tempo de execução. |
| `libraries` | Pacotes de biblioteca Luam compilados dentro deste resource. |
| `engine` | A versão do MTA que o resource exige. |
| `environment` | Quais arquivos `.env` alimentam `env` e `process.env`. |
| saída | `outDir`, `loadOrder`, `output`, `helpers`. |
| implantação | `serverPath`, `resourcesDir`, `development`. |

Uma tabela campo a campo completa, incluindo cada regra de validação, está em
[Campos de configuração](/pt-br/reference/configuration-fields).

## `compiler`

| Chave | Padrão | Significado |
| --- | --- | --- |
| `strict` | `true` | Modo estrito de todo o projeto. Uma diretiva `#!strict` ou `#!nonstrict` no arquivo ainda vence para aquele arquivo. |
| `oop` | `false` | Liga a API OOP do MTA e escreve `<oop>true</oop>`. |
| `noUnusedLocals` | `false` | Reporta um local que nunca é lido como `check-unused-local`. |
| `noUnusedParameters` | `false` | Reporta um parâmetro que nunca é lido como `check-unused-parameter`. |
| `warningsAsErrors` | `false` | Promove todo aviso a erro, então um aviso reprova o build. |

Um nome iniciado por `_` nunca é reportado como não usado, que é a forma de manter
um vínculo de propósito.

## `sources`

Cada lado lista os padrões que pertencem a ele:

```luam
sources = {
    server = { 'src/server/**/*.luam' },
    client = { 'src/client/**/*.luam', 'ui/**/*.luam' },
    shared = { 'src/shared/**/*.luam' },
}
```

Um padrão usa `*` (qualquer coisa dentro de um segmento), `**` (qualquer número de
segmentos) e `?` (um caractere). `/` separa segmentos. Não há regex, negação,
expansão de chaves nem extglob — um valor com essa forma é
`config-invalid-pattern`. `.git`, `.luam`, `node_modules` e `outDir` nunca são
varridos.

O lado de um arquivo é o lado que o casou. Uma diretiva `#!server`, `#!client` ou
`#!shared` no arquivo ainda vence, e a divergência é reportada como
`env-path-directive-conflict`, para ficar visível em vez de silenciosa. Um
arquivo casado por dois lados é `config-source-side-conflict`; um caminho literal
que não nomeia arquivo algum é `config-missing-source`; um projeto onde nada casou
é `config-no-sources`.

Omitir `sources` mantém a estrutura padrão, que são os três padrões acima.

## `assets`

Cada entrada nomeia o que copiar e onde isso fica dentro do resource:

```luam
assets = {
    { from = 'assets/**/*', to = 'assets' },
    { from = 'media/logo.png', to = 'images' },
}
```

Tudo que um mapeamento nomeia é copiado e declarado como `<file>`, para os
clientes baixarem. Nada mais é copiado — um arquivo de dados ao lado do código do
servidor precisa do próprio mapeamento, que é o que torna o conteúdo do resource
previsível.

`to` é um diretório de destino dentro do resource. Duas entradas que resolvem para
o mesmo destino são `config-output-collision`, assim como um destino que
sobrescreveria o `meta.xml` ou o diretório gerado `lib/`. Um `from` literal que não
nomeia arquivo algum é `config-missing-asset`.

## `dependencies`

```luam
dependencies = { 'scoreboard', 'admin' }
```

Cada nome vira `<include resource="..." />` no `meta.xml`, então o MTA inicia o
resource nomeado primeiro. Os nomes são deduplicados e ordenados. Um valor que não
é um nome de resource válido, ou que nomeia este resource, é
`config-invalid-dependency`. Dependências opcionais não são suportadas — o MTA não
tem esse conceito.

## `libraries`

```luam
libraries = { '@luam-example/collections', 'mta-async' }
```

Cada entrada nomeia um pacote npm instalado que publica código Luam, descrito em
[Bibliotecas](/pt-br/tooling/libraries). O compilador lê o pacote em
`node_modules`, compila junto com este projeto e grava o resultado dentro do
resource, sob `libs/`.

A ordem é a ordem de emissão: bibliotecas são escritas depois da biblioteca de
runtime e antes de `config.lua`, das entradas fixadas em `loadOrder` e dos
curingas de código, na ordem que esta lista declara.

Nada é implícito e nada é baixado. Um pacote instalado mas ausente desta lista não
é compilado; um pacote listado mas não instalado é `config-library-missing`, que
nomeia o comando de instalação e não escreve nada. Instalar é passo do
desenvolvedor — `npm install`, `pnpm add`, ou o que o projeto já usa — e um build
com `node_modules` preenchido e sem rede funciona igual.

::: tip `libraries` ou `dependencies`?
Elas respondem perguntas diferentes.

- `libraries` **obtém código**. O pacote é compilado dentro deste resource e
  viaja com ele, então suas funções e classes são globais comuns aqui.
- `dependencies` **nomeia outro resource** que precisa estar rodando. Vira
  `<include>` no `meta.xml`, e o código continua no resource dele, alcançado pelo
  [contrato de exports](/pt-br/language/exports).

Um módulo puro é uma biblioteca. Um serviço com estado é um resource com exports.
:::

Um valor que não é nome de pacote npm é `config-library-invalid`, e o mesmo pacote
listado duas vezes é `config-library-duplicate`.

## `engine`

```luam
engine = {
    minVersion = '1.6.0',
}
```

`minVersion` vira `min_mta_version` no `meta.xml`. O padrão é `'latest'`, que
consulta a lista de releases do MTA no momento do build; `--offline` e
`LUAM_OFFLINE` pulam essa consulta e o build ainda passa. Fixar uma versão
explícita deixa o build sem rede. Um valor que não é uma versão é
`config-invalid-engine-version`.

`mta.minVersion` não é aceito. O domínio é `engine`.

## `environment`

```luam
environment = {
    file = '.env.development',
    localFile = '.env.development.local',
}
```

`file` declara as chaves e seus tipos — é contra ele que `env.X` e `process.env.X`
são tipados, e é dele que o `env.lua` implantado é gerado. `localFile`
sobrescreve os *valores* das chaves que o arquivo base já declara; uma chave só no
arquivo local é ignorada, então um ajuste local da máquina nunca muda a forma do
projeto. Os padrões são `.env` e `.env.local`.

Um arquivo configurado que não existe é `config-missing-env-file`; os padrões são
opcionais, então um projeto sem `.env` não é um erro. O servidor de linguagem
observa os dois arquivos e reanalisa ao salvar.

## Segurança de caminhos

`outDir`, `resourcesDir` e cada entrada de `sources`, `assets` e `loadOrder`
precisam permanecer **dentro do seu diretório base**. Um caminho absoluto ou um
segmento `..` é `config-escaping-path` e a configuração não carrega.

## `loadOrder`

Uma lista ordenada de caminhos relativos à raiz do projeto. Cada entrada é emitida
à frente do seu grupo no `meta.xml` — um script pelo seu caminho `.lua` compilado,
um asset por ele mesmo.

A ordem também importa para assets, já que um shader pode depender de outro. Uma
entrada que nomeia um arquivo que o projeto não produz é
`project-load-order-missing`, então uma renomeação não quebra a ordem em silêncio.

## `output`

`output.bundle` define o padrão de `build`. `--bundle` e `--no-bundle` o
sobrescrevem. `ensure` usa árvore por padrão a menos que receba `--bundle`,
enquanto `dev` sempre usa árvore.

`output.map` controla a geração do mapa. `build` escreve
`<outDir>/<name>.luam-map.json`; `ensure` e `dev` mantêm mapas em memória e nunca
escrevem esse arquivo. `--no-map` desliga a geração no comando atual. Veja
[Estruturas de saída e mapas de código](/pt-br/reference/output-layouts).

`output.minify` controla se o `build` escreve cada script em uma linha. `--minify`
e `--no-minify` o sobrescrevem. O `dev` nunca minifica, então um stack trace
continua legível enquanto você trabalha.

## `helpers`

Nomeia helpers de runtime que o compilador não injetaria por conta própria.

- `threads` é opcional e explícito.
- `env` é injetado automaticamente quando o projeto tem um arquivo de ambiente,
  então listá-lo
  só é necessário para publicar a biblioteca sem um.
- Listar um helper automático é inofensivo; listar um nome desconhecido é
  `config-unknown-helper`, e o autocompletar oferece os nomes conhecidos dentro
  das aspas.

`helperDir` foi removido. A saída em árvore escreve helpers em `lib/<ambiente>`;
a saída em bundle os inclui nos bundles de ambiente. Um `.luam.manifest` que ainda
nomeia `helperDir` falha com `config-unknown-field` — apague a linha.

## `development.logs`

Usado apenas pelo `luam dev`. `build` e `ensure` nunca escrevem os helpers de
desenvolvimento.

| Chave | Padrão | Significado |
| --- | --- | --- |
| `enabled` | `false` | O `dev` liga a captura mesmo quando esta seção é omitida. |
| `maxMessageLength` | `4096` | Registros retransmitidos maiores são rejeitados. |
| `rateLimit` | `30` | Registros permitidos por cliente por janela. |
| `rateWindowMs` | `1000` | Duração dessa janela. |

## `development.server`

`executable` é um caminho opcional relativo a `serverPath` e precisa permanecer
dentro desse diretório. Quando omitido, `luam server` e
`luam dev --start-server` procuram `MTA Server.exe` no Windows, ou
`mta-server64` e depois `mta-server` no Linux.

## Quando o arquivo está errado

| Problema | Diagnóstico |
| --- | --- |
| Sem `.luam.manifest` no diretório | `config-not-found` |
| `--manifest` nomeia um arquivo que não é um manifesto | `config-unsupported-manifest` |
| O arquivo não pôde ser lido | `config-unreadable-manifest` |
| Uma instrução que o dialeto não permite | `config-invalid-statement` |
| Um valor que a linguagem de expressões não permite | `config-invalid-expression` |
| `name`, ou `from` dentro de uma entrada de `assets`, ausente | `config-missing-field` |
| `name` não é um nome de resource válido | `config-invalid-name` |
| Um campo tem o tipo errado | `config-invalid-type` |
| Um nome não é um campo de configuração | `config-unknown-field` |
| Um campo que não existe mais | `config-removed-field` |
| Um caminho escapa da sua base | `config-escaping-path` |
| Um padrão que a gramática de glob não permite | `config-invalid-pattern` |

Todos os códigos estão em [Diagnósticos](/pt-br/reference/diagnostics).

## Campos removidos

Estes nomes são rejeitados em vez de virarem apelidos, então um manifesto
desatualizado falha em alto e bom som em vez de construir algo diferente do que
diz:

| Removido | Substituto |
| --- | --- |
| `oop` | `compiler = { oop = true }` |
| `compilerOptions` | `compiler = { ... }` |
| `sourceDirs` | `sources = { server = { ... }, client = { ... }, shared = { ... } }` |
| `assetDirs` | `assets = { { from = 'assets/**/*', to = 'assets' } }` |
| `mta` | `engine = { minVersion = '1.6.0' }` |
| `helperDir` | Nada. Os helpers vão para `lib/<ambiente>` ou para dentro dos bundles. |
| `transport` | Nada. `ensure` sincroniza arquivos; `dev --start-server` reinicia o servidor que ele mesmo iniciou. |

Cada um reporta `config-removed-field` e nomeia seu substituto na mensagem.

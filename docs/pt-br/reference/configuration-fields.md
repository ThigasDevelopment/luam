# Campos de configuração

Todos os campos que o `.luam.manifest` aceita. A coluna **Obrigatório** é a mesma
que o editor mostra ao lado de cada item de autocompletar. Um nome desconhecido é
`config-unknown-field`, e um campo com o tipo errado é `config-invalid-type`.

Para a versão narrada, veja [.luam.manifest](/pt-br/tooling/luam-manifest).

## Projeto

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `name` | `string` | sim | — | Nome do resource. Nomeia `<outDir>/<name>` e o resource que o `ensure` reinicia. Nunca escrito no `meta.xml`. Valores inválidos são `config-invalid-name`. |
| `author` | `string?` | não | não definido | Atributo de info do `meta.xml`. |
| `version` | `string?` | não | não definido | Atributo de info do `meta.xml`. |
| `description` | `string?` | não | não definido | Atributo de info do `meta.xml`. |

## Opções do compilador

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `compiler.strict` | `boolean` | não | `true` | Modo estrito de todo o projeto. Uma diretiva `#!strict` ou `#!nonstrict` ainda vence para o arquivo que a carrega. |
| `compiler.oop` | `boolean` | não | `false` | Liga a API OOP do MTA e escreve `<oop>true</oop>`. Veja [API OOP](/pt-br/mta/oop). |
| `compiler.noUnusedLocals` | `boolean` | não | `false` | Reporta um local que nunca é lido como `check-unused-local`. |
| `compiler.noImplicitGlobals` | `boolean` | não | `false` | Relata uma atribuição que cria um global que nada declara como `check-implicit-global`. |
| `compiler.noUnusedParameters` | `boolean` | não | `false` | Reporta um parâmetro que nunca é lido como `check-unused-parameter`. |
| `compiler.warningsAsErrors` | `boolean` | não | `false` | Promove todo aviso a erro. |

Um vínculo cujo nome começa com `_` nunca é reportado como não usado.

## Código-fonte

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `sources.server` | `string[]` | não | `{ 'src/server/**/*.luam' }` | Padrões cujos arquivos compilam como servidor. |
| `sources.client` | `string[]` | não | `{ 'src/client/**/*.luam' }` | Padrões cujos arquivos compilam como cliente. |
| `sources.shared` | `string[]` | não | `{ 'src/shared/**/*.luam' }` | Padrões cujos arquivos compilam como compartilhados. |

Um padrão aceita `*`, `**` e `?`, com `/` como separador. Regex, negação, expansão
de chaves e extglob são `config-invalid-pattern`. Um arquivo casado por dois lados
é `config-source-side-conflict`, um caminho literal que não nomeia arquivo algum é
`config-missing-source`, e um projeto onde nenhum padrão casou é
`config-unmatched-source` quando ele tem arquivos `.luam` e `config-no-sources`
quando não tem nenhum. Uma diretiva de ambiente no arquivo vence o mapeamento e
reporta `env-path-directive-conflict`.

Um arquivo `.luam` na raiz do projeto é compilado com ou sem `sources` o
nomeando, com o lado que sua diretiva declara e `shared` sem nenhuma, então
remover o bloco ou manter o do scaffold funcionam igualmente para um resource
plano.

## Assets

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `assets` | `{ from, to }[]` | não | `{ }` | Arquivos a copiar para o resource e declarar como `<file>`. |
| `assets[].from` | `string` | sim | — | Um caminho ou padrão relativo à raiz do projeto. Um caminho literal sem arquivo é `config-missing-asset`. |
| `assets[].to` | `string` | não | `'.'` | Diretório de destino dentro do resource. |

Duas entradas que caem no mesmo destino, ou um destino que sobrescreveria o
`meta.xml` ou `lib/`, são `config-output-collision`. Um mapeamento que não copia
nada é o aviso `config-empty-asset`. Só o que um mapeamento nomeia é copiado.

## Dependências e engine

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `dependencies` | `string[]` | não | `{ }` | Resources escritos como `<include resource="..." />`. Deduplicados e ordenados. Um nome inválido ou que aponta para este resource é `config-invalid-dependency`. |
| `contracts` | `string` | não | `'.luam/contracts'` | Diretório onde o contrato de export é escrito e de onde os contratos das dependências são lidos. Precisa ficar dentro do diretório do projeto. |
| `engine.minVersion` | `string` | não | `'latest'` | Vira `min_mta_version`. `'latest'` consulta a versão no momento do build; uma versão explícita mantém o build sem rede. Um valor malformado é `config-invalid-engine-version`. |

Dependências opcionais não são suportadas. `mta.minVersion` não é aceito.

## Bibliotecas

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `libraries` | `string[]` | não | `{ }` | Pacotes npm instalados que publicam código Luam, compilados dentro deste resource e gravados sob `libs/`. A ordem é a ordem de emissão. Um valor que não é nome de pacote é `config-library-invalid`; uma entrada repetida é `config-library-duplicate`; um pacote não instalado é `config-library-missing`. |

`libraries` obtém código e o compila dentro deste resource; `dependencies` nomeia
outro resource que precisa estar rodando. Veja [Bibliotecas](/pt-br/tooling/libraries).

## Arquivos de ambiente

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `environment.file` | `string` | não | `'.env'` | Declara as chaves e os tipos por trás de `env` e `process.env`, e o `env.lua` implantado. |
| `environment.localFile` | `string` | não | `'.env.local'` | Sobrescreve os valores das chaves que o arquivo base declara. Uma chave só aqui é ignorada. |

Um arquivo configurado que não existe é `config-missing-env-file`. Os padrões são
opcionais, então um projeto sem arquivo de ambiente não é um erro.

## Saída

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `outDir` | `string` | não | `'build'` | Recebe `<outDir>/<name>`. |
| `loadOrder` | `string[]` | não | `{ }` | Caminhos fixados à frente do seu grupo no `meta.xml`. Uma entrada sem arquivo correspondente é `project-load-order-missing`. |
| `output.bundle` | `boolean` | não | `true` | Estrutura padrão de `build`: um bundle por ambiente não vazio quando true, árvore espelhada quando false. `ensure` ainda usa árvore por padrão e `dev` sempre usa árvore. |
| `output.map` | `boolean` | não | `true` | Gera mapas de posição. `build` escreve um ao lado do resource; `ensure` e `dev` o mantêm apenas em memória. |
| `output.minify` | `boolean` | não | `true` | Escreve cada script gerado em uma linha durante o `build`. `dev` e `ensure` nunca minificam. |
| `helpers` | `string[]` | não | `{ }` | Helpers de runtime a copiar mesmo quando nenhum recurso os exige. Só os nomes abaixo são aceitos; qualquer outro é `config-unknown-helper`. |

Todo caminho precisa permanecer dentro do seu diretório base. Um caminho absoluto
ou um segmento `..` é `config-escaping-path`.

`--bundle` e `--no-bundle` sobrescrevem `output.bundle` onde o comando permite
escolher a estrutura. `--no-map` sobrescreve `output.map`, e `--minify` /
`--no-minify` sobrescrevem `output.minify`. Veja
[Estruturas de saída e mapas de código](/pt-br/reference/output-layouts).

Nenhuma estrutura inclui `config.lua`, `env.lua` ou assets em bundles.
`config.lua` e `env.lua` permanecem na raiz do resource, enquanto assets ficam
onde seu mapeamento os coloca. O arquivo de mapa fica fora do resource, dentro de
`outDir`.

Nomes de helper aceitos: `async`, `class`, `math`, `string`, `table`, `threads`.
A maioria é injetada automaticamente quando algum recurso precisa; `threads` é o
que exige escolha explícita. Valores de implantação não são um helper — um
projeto com `.env` recebe um `env.lua` gerado no lugar.

## Sincronização com o servidor

**Substituídos pelo [`.luam.server`](/pt-br/reference/server-file).** Estes campos
continuam funcionando, e se comportam exatamente como sempre se comportaram
quando nenhum `.luam.server` é encontrado acima do projeto. Quando existe um, os
valores dele vencem e o manifesto reporta `config-deployment-moved` uma vez.

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `serverPath` | `string?` | não | não definido | Raiz do servidor MTA. Exigido por `ensure` e `dev`, a menos que um `.luam.server` nomeie uma. |
| `resourcesDir` | `string` | não | `'mods/deathmatch/resources'` | Diretório de resources relativo a `serverPath`. |

## Logs de desenvolvimento

Usados apenas pelo `luam dev`. Um [`.luam.server`](/pt-br/reference/server-file)
fornece o padrão para um workspace inteiro; um valor no manifesto sobrescreve em
silêncio.

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `development.logs.enabled` | `boolean` | não | `false` | O `dev` liga a captura mesmo quando a seção é omitida. |
| `development.logs.maxMessageLength` | `number` | não | `4096` | Registros retransmitidos maiores são rejeitados. |
| `development.logs.rateLimit` | `number` | não | `30` | Registros permitidos por cliente por janela. |
| `development.logs.rateWindowMs` | `number` | não | `1000` | Duração dessa janela, em milissegundos. |

## Servidor de desenvolvimento

**Substituído pelo [`.luam.server`](/pt-br/reference/server-file)**, nos mesmos
termos do `serverPath` acima.

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `development.server.executable` | `string?` | não | busca por plataforma | Executável relativo a `serverPath` e contido nele. Usado apenas por `server` e `dev --start-server`. |

## O arquivo do workspace

Um diretório de resources nomeia a instalação do MTA que compartilha uma vez, no
[`.luam.server`](/pt-br/reference/server-file):

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `serverPath` | `string` | **sim** | — | Raiz do servidor MTA, resolvida contra o diretório que contém o arquivo. |
| `resourcesDir` | `string` | não | `'mods/deathmatch/resources'` | Diretório de resources relativo a `serverPath`. |
| `executable` | `string?` | não | busca por plataforma | Executável relativo a `serverPath` e contido nele. |
| `logs.enabled` | `boolean` | não | `false` | Se a sessão transmite os logs. |
| `logs.maxMessageLength` | `number` | não | `4096` | Registros retransmitidos maiores são rejeitados. |
| `logs.rateLimit` | `number` | não | `30` | Registros permitidos por cliente por janela. |
| `logs.rateWindowMs` | `number` | não | `1000` | Duração dessa janela, em milissegundos. |

## Campos removidos

Um nome removido é rejeitado, nunca virado apelido. Cada um reporta
`config-removed-field` e nomeia seu substituto.

| Campo | Substituto |
| --- | --- |
| `oop` | `compiler = { oop = true }` |
| `compilerOptions` | `compiler = { ... }` |
| `sourceDirs` | `sources = { server = { ... }, client = { ... }, shared = { ... } }` |
| `assetDirs` | `assets = { { from = 'assets/**/*', to = 'assets' } }` |
| `mta` | `engine = { minVersion = '1.6.0' }` |
| `transport` | Nada. `ensure` sincroniza arquivos, e `dev --start-server` reinicia o servidor que ele mesmo iniciou. |
| `helperDir` | Nada. Helpers da árvore usam `lib/<ambiente>`; helpers em bundle ficam dentro dos bundles de ambiente. Reporta `config-unknown-field`. |

Hooks, plugins, expressões regulares e dependências opcionais não são suportados e
não têm substituto.

## Variáveis de ambiente

| Variável | Efeito |
| --- | --- |
| `LUAM_OFFLINE` | Pula a consulta de `min_mta_version`, como `--offline`. |
| `NO_COLOR` | Desliga cor e emoji, como `--no-color`. |

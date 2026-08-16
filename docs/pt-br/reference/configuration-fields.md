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
| `compilerOptions.strict` | `boolean` | não | `true` | Modo estrito de todo o projeto. Uma diretiva `#!strict` ou `#!nonstrict` ainda vence para o arquivo que a carrega. |
| `compilerOptions.oop` | `boolean` | não | `false` | Liga a API OOP do MTA e escreve `<oop>true</oop>`. Veja [API OOP](/pt-br/mta/oop). |
| `compilerOptions.noUnusedLocals` | `boolean` | não | `false` | Reporta um local que nunca é lido como `check-unused-local`. |
| `compilerOptions.noUnusedParameters` | `boolean` | não | `false` | Reporta um parâmetro que nunca é lido como `check-unused-parameter`. |
| `compilerOptions.warningsAsErrors` | `boolean` | não | `false` | Promove todo aviso a erro. |

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
`config-no-sources`. Uma diretiva de ambiente no arquivo vence o mapeamento e
reporta `env-path-directive-conflict`.

## Assets

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `assets` | `{ from, to }[]` | não | `{ }` | Arquivos a copiar para o resource e declarar como `<file>`. |
| `assets[].from` | `string` | sim | — | Um caminho ou padrão relativo à raiz do projeto. Um caminho literal sem arquivo é `config-missing-asset`. |
| `assets[].to` | `string` | não | `'.'` | Diretório de destino dentro do resource. |

Duas entradas que caem no mesmo destino, ou um destino que sobrescreveria o
`meta.xml` ou `lib/`, são `config-output-collision`. Só o que um mapeamento nomeia
é copiado.

## Dependências e engine

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `dependencies` | `string[]` | não | `{ }` | Resources escritos como `<include resource="..." />`. Deduplicados e ordenados. Um nome inválido ou que aponta para este resource é `config-invalid-dependency`. |
| `engine.minVersion` | `string` | não | `'latest'` | Vira `min_mta_version`. `'latest'` consulta a versão no momento do build; uma versão explícita mantém o build sem rede. Um valor malformado é `config-invalid-engine-version`. |

Dependências opcionais não são suportadas. `mta.minVersion` não é aceito.

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

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `serverPath` | `string?` | não | não definido | Raiz do servidor MTA. Exigido por `ensure` e `dev`. |
| `resourcesDir` | `string` | não | `'mods/deathmatch/resources'` | Diretório de resources relativo a `serverPath`. |

## Transporte

A tabela `transport` inteira é opcional; omiti-la equivale a `kind = 'none'`.
Escrever a tabela sem `kind` é `config-missing-field`.

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `transport.kind` | `'none' \| 'http'` | sim | — | `none` sincroniza sem reiniciar. |
| `transport.host` | `string` | não | `'127.0.0.1'` | Um host que não é loopback reporta `config-remote-plaintext-transport`. |
| `transport.port` | `number` | não | `22005` | Porta da interface HTTP do MTA. |
| `transport.resource` | `string` | para `http` | — | Resource que exporta as funções de refresh e restart. |
| `transport.username` | `string` | para `http` | — | Usuário da autenticação básica HTTP. |
| `transport.passwordEnv` | `string` | não | — | Nomeia uma variável de ambiente com a senha. Não definida em tempo de execução é `config-missing-secret`. |
| `transport.password` | `string` | não | — | Senha embutida. Aceita, mas reporta `config-plaintext-password`. |
| `transport.refreshFunction` | `string` | não | `'refreshResources'` | Chamada primeiro. |
| `transport.restartFunction` | `string` | não | `'restartResource'` | Chamada com o nome do resource. |

`host`, `resource`, `refreshFunction` e `restartFunction` viram parte da URL da
requisição e são validados antes de qualquer envio. Um valor com `/`, `?`, `#` ou
`..` é `config-invalid-url-segment`.

Um `kind` que não é `'none'` nem `'http'` é `config-invalid-transport`.

## Logs de desenvolvimento

Usados apenas pelo `luam dev`.

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `development.logs.enabled` | `boolean` | não | `false` | O `dev` liga a captura mesmo quando a seção é omitida. |
| `development.logs.maxMessageLength` | `number` | não | `4096` | Registros retransmitidos maiores são rejeitados. |
| `development.logs.rateLimit` | `number` | não | `30` | Registros permitidos por cliente por janela. |
| `development.logs.rateWindowMs` | `number` | não | `1000` | Duração dessa janela, em milissegundos. |

## Campos removidos

Um nome removido é rejeitado, nunca virado apelido. Cada um reporta
`config-removed-field` e nomeia seu substituto.

| Campo | Substituto |
| --- | --- |
| `oop` | `compilerOptions = { oop = true }` |
| `sourceDirs` | `sources = { server = { ... }, client = { ... }, shared = { ... } }` |
| `assetDirs` | `assets = { { from = 'assets/**/*', to = 'assets' } }` |
| `mta` | `engine = { minVersion = '1.6.0' }` |
| `helperDir` | Nada. Helpers da árvore usam `lib/<ambiente>`; helpers em bundle ficam dentro dos bundles de ambiente. Reporta `config-unknown-field`. |

Hooks, plugins, expressões regulares e dependências opcionais não são suportados e
não têm substituto.

## Variáveis de ambiente

| Variável | Efeito |
| --- | --- |
| `LUAM_OFFLINE` | Pula a consulta de `min_mta_version`, como `--offline`. |
| `NO_COLOR` | Desliga cor e emoji, como `--no-color`. |
| o nome em `transport.passwordEnv` | Fornece a senha do transporte. |

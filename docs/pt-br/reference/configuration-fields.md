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

## Código e saída

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `sourceDirs` | `string[]` | não | `{ 'src' }` | Varridos em busca de `.luam` e `.d.luam`. Outros arquivos aqui são copiados, mas não declarados. Um diretório configurado que não existe é `build-source-dir-missing`. |
| `assetDirs` | `string[]` | não | `{ 'assets' }` | Copiados como estão e declarados como `<file>`, para os clientes baixarem. |
| `outDir` | `string` | não | `'build'` | Recebe `<outDir>/<name>`. |
| `loadOrder` | `string[]` | não | `{ }` | Caminhos fixados à frente do seu grupo no `meta.xml`. Uma entrada sem arquivo correspondente é `project-load-order-missing`. |
| `output.bundle` | `boolean` | não | `true` | Estrutura padrão de `build`: um bundle por ambiente não vazio quando true, árvore espelhada quando false. `ensure` ainda usa árvore por padrão e `dev` sempre usa árvore. |
| `output.map` | `boolean` | não | `true` | Gera mapas de posição. `build` escreve um ao lado do resource; `ensure` e `dev` o mantêm apenas em memória. |

Todo caminho precisa permanecer dentro do seu diretório base. Um caminho absoluto
ou um segmento `..` é `config-escaping-path`.

`--bundle` e `--no-bundle` sobrescrevem `output.bundle` onde o comando permite
escolher a estrutura. `--no-map` sobrescreve `output.map`. Veja
[Estruturas de saída e mapas de código](/pt-br/reference/output-layouts).

Nenhuma estrutura inclui `config.lua`, `.env` ou assets em bundles. `config.lua`
e `.env` permanecem na raiz do resource, enquanto assets mantêm seus caminhos
originais. O arquivo de mapa fica fora do resource, dentro de `outDir`.

## Linguagem e runtime

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `oop` | `boolean` | não | `false` | Liga a API OOP do MTA e escreve `<oop>true</oop>`. Veja [API OOP](/pt-br/mta/oop). |
| `helpers` | `string[]` | não | `{ }` | Helpers de runtime a copiar mesmo quando nenhum recurso os exige. Só os nomes abaixo são aceitos; qualquer outro é `config-unknown-helper`. |

Nomes de helper aceitos: `async`, `class`, `dotenv`, `env`, `math`, `string`,
`table`, `threads`. A maioria é injetada automaticamente quando algum recurso
precisa; `threads` é o que exige escolha explícita, e `env` é automático quando o
projeto tem um `.env`.

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

| Campo | Situação |
| --- | --- |
| `helperDir` | Removido. Helpers da árvore usam `lib/<ambiente>` e helpers em bundle ficam dentro dos bundles de ambiente. Um manifesto que ainda o nomeia falha com `config-unknown-field`. |

## Variáveis de ambiente

| Variável | Efeito |
| --- | --- |
| `LUAM_OFFLINE` | Pula a consulta de `min_mta_version`, como `--offline`. |
| `NO_COLOR` | Desliga cor e emoji, como `--no-color`. |
| o nome em `transport.passwordEnv` | Fornece a senha do transporte. |

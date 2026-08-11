# luam.json

O `luam.json` fica na raiz do projeto. **Apenas `name` é obrigatório.**

```json
{
    "name": "luam-demo",
    "author": "Thigas",
    "version": "1.0.0",
    "description": "A demo resource",
    "sourceDirs": ["src"],
    "assetDirs": ["assets"],
    "outDir": "build",
    "loadOrder": ["src/server/index.luam", "assets/shaders/base.fx"],
    "output": {
        "bundle": true,
        "map": true
    },
    "oop": false,
    "helpers": ["threads"],
    "serverPath": "C:/MTA Server",
    "resourcesDir": "mods/deathmatch/resources",
    "development": {
        "logs": {
            "enabled": false,
            "maxMessageLength": 4096,
            "rateLimit": 30,
            "rateWindowMs": 1000
        }
    },
    "transport": {
        "kind": "http",
        "host": "127.0.0.1",
        "port": 22005,
        "resource": "luam-sync",
        "username": "luam",
        "passwordEnv": "LUAM_MTA_PASSWORD"
    }
}
```

`--config <path>` carrega outro arquivo, que é como um projeto mantém um manifesto
separado para um segundo servidor.

## Campos

| Campo | Padrão | Significado |
| --- | --- | --- |
| `name` | obrigatório | Nomeia `<outDir>/<name>` e o resource que o `ensure` reinicia. Nunca chega ao `meta.xml` — o MTA lê o nome da pasta. |
| `author`, `version`, `description` | não definido | Atributos de info do `meta.xml`. |
| `sourceDirs` | `["src"]` | Varridos em busca de `.luam` e `.d.luam`. Outros arquivos aqui são copiados, mas não declarados. |
| `assetDirs` | `["assets"]` | Copiados como estão e declarados como `<file>`, para os clientes baixarem. |
| `outDir` | `"build"` | Recebe `<outDir>/<name>`. |
| `loadOrder` | `[]` | Caminhos fixados à frente do seu grupo no `meta.xml`. |
| `output.bundle` | `true` | Usa bundles de produção para `build`; `false` seleciona a árvore. |
| `output.map` | `true` | Gera mapas de posição de código. Apenas `build` escreve o arquivo de mapa. |
| `oop` | `false` | Liga a API OOP do MTA e escreve `<oop>true</oop>`. |
| `helpers` | `[]` | Helpers de runtime a copiar mesmo quando nenhum recurso os exige. |
| `serverPath` | não definido | Raiz do servidor MTA. Exigido por `ensure` e `dev`. |
| `resourcesDir` | `"mods/deathmatch/resources"` | Diretório de resources relativo a `serverPath`. |
| `transport` | `{ "kind": "none" }` | Como o `ensure` reinicia o resource. |
| `development.logs` | desligado, limites seguros | Comprimento e limites de taxa do relay usados pelo `dev`. |

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
  `config-unknown-helper`.

`helperDir` foi removido. A saída em árvore escreve helpers em `lib/<ambiente>`;
a saída em bundle os inclui nos bundles de ambiente. Um `luam.json` que ainda nomeia `helperDir` falha com
`config-unknown-field` — apague a linha.

## `transport`

```json
{
    "transport": {
        "kind": "http",
        "host": "127.0.0.1",
        "port": 22005,
        "resource": "luam-sync",
        "username": "luam",
        "passwordEnv": "LUAM_MTA_PASSWORD",
        "refreshFunction": "refreshResources",
        "restartFunction": "restartResource"
    }
}
```

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
| Sem `luam.json` no diretório | `config-not-found` |
| O arquivo não é JSON válido | `config-invalid-json` |
| `name` ausente | `config-missing-field` |
| `name` não é um nome de resource válido | `config-invalid-name` |
| Um campo tem o tipo errado | `config-invalid-type` |
| Um campo não é reconhecido | `config-unknown-field` |
| Um caminho escapa da sua base | `config-escaping-path` |
| `passwordEnv` nomeia uma variável não definida | `config-missing-secret` |

Todos os códigos estão em [Diagnósticos](/pt-br/reference/diagnostics).

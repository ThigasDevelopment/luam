# Solução de problemas

## Lendo um diagnóstico

Todo diagnóstico traz uma localização e um código de regra:

```
src/client/hud.luam:1:1 error check-environment-api: API "kickPlayer" is server-only and is not available in a "client" file.
```

| Parte | Significado |
| --- | --- |
| `src/client/hud.luam` | Arquivo de código, relativo à raiz do projeto. |
| `1:1` | Linha e coluna, ambas começando em 1. |
| `error` | Severidade. Um warning nunca falha o build. |
| `check-environment-api` | A regra. Consulte em [Diagnósticos](/pt-br/reference/diagnostics). |

O prefixo da regra diz qual estágio rejeitou o arquivo: `lex-` ao ler caracteres,
`parse-` ao ler estrutura, `check-` ao verificar tipos, `project-` ao montar o
resource, `build-` ao descobrir fontes e `config-` ao carregar o `.luam.manifest`.

No terminal, a CLI agrupa os diagnósticos sob o arquivo e imprime a linha de
código com um cursor. Quando o fluxo não é um terminal, ela imprime a forma
simples de uma linha acima, então uma transcrição de CI não carrega sequências de
escape.

## `luam: command not found`

O diretório global de binários do npm não está no `PATH`. Veja
[Instalação](/pt-br/guide/installation#luam-command-not-found), ou use
`npx @thigasdevelopment/luam <command>`, que não precisa de entrada no `PATH`.

## O build informa que não há fontes

```
config-no-sources: No ".luam" source files matched "sources".
```

O compilador compila o que `sources` casa, cujo padrão é `src/server/**/*.luam`,
`src/client/**/*.luam` e `src/shared/**/*.luam`. Crie esses diretórios, ou aponte
cada lado de `sources` para os padrões que você realmente usa.

Um caminho literal que nomeia um arquivo que o projeto não tem gera
`config-missing-source`, que nomeia o caminho.

## Uma função do MTA está "not available"

```
check-environment-api: API "dxDrawText" is client-only and is not available in a "server" file.
```

O ambiente do arquivo vem da pasta. Mova o arquivo para `src/client`, ou sobreponha
o ambiente daquele arquivo:

```luam
#!client
```

Um arquivo `shared` pode usar apenas declarações `shared`, porque roda dos dois
lados. Veja [Ambientes](/pt-br/mta/environments).

## Uma função do MTA continua `any`

O catálogo vem de um snapshot fixo do wiki do MTA, então uma função adicionada em
uma versão mais nova pode ainda não ser conhecida. Um nome desconhecido resolve
para `any` em vez de falhar, então uma declaração faltando nunca bloqueia um build
— você apenas perde completação e verificação de argumentos naquela chamada.

## `player:getName()` é rejeitado

```
src/shared/oop.luam:2:18 error check-oop-disabled: "Player.getName" is part of the MTA OOP API, which this project does not enable. Call "getPlayerName" instead. Set "compilerOptions = { oop = true }" in .luam.manifest to enable the MTA OOP API.
```

Defina `compilerOptions = { oop = true }` no `.luam.manifest`. Isso também escreve `<oop>true</oop>` no
`meta.xml`, que é o que faz a forma de objeto existir em tempo de execução. Veja
[API OOP](/pt-br/mta/oop).

## Um valor é `string?` e nada o estreita

O Luam **não faz estreitamento de tipos**: `if value ~= nil then` não refina
`string?` para `string` dentro do bloco, e `tonumber(x) or 0` tem o tipo
`number? | number`. Anote o local que recebe como `any` quando você já garantiu
que o valor está presente:

```luam
local requested: any = tonumber(amount) or MAX_HEALTH
```

Veja [Limitações](/pt-br/reference/limitations).

## A interpolação diz que um nome não está no escopo

```
check-unknown-template-root: Template interpolation "getPlayerName(player)" refers to "getPlayerName(player)", which is not in scope.
```

Uma interpolação aceita um **nome ou um caminho de membro**, não uma expressão.
Calcule o valor antes:

```luam
local name: string = getPlayerName(player)

outputChatBox(`${name} joined.`, root)
```

Veja [Strings de template](/pt-br/language/template-strings).

## O `ensure` constrói mas nunca reinicia

O `ensure` só reinicia através de um transporte. Com apenas `serverPath` ele
espelha os arquivos e para — reinicie o resource você mesmo. Adicione um bloco
`transport` para obter o refresh e o restart. Veja
[Desenvolvimento diário](/pt-br/guide/daily-development).

Se o restart está configurado e mesmo assim falha, confira se o resource do lado
do MTA nomeado em `transport.resource` exporta `refreshResources` e
`restartResource`, e se a ACL concede acesso HTTP ao usuário configurado.

## O servidor MTA local não inicia

O erro do executável lista todos os caminhos tentados. Confira se `serverPath`
aponta para a raiz da instalação, ou defina um
`development.server.executable` relativo e contido nela. Um timeout de prontidão
nomeia o `server.log`; verifique nele erros de inicialização ou uma versão com um
marcador de startup diferente.

## `config-missing-secret`

`passwordEnv` nomeia uma variável de ambiente que não está definida no shell que
roda a CLI. Exporte-a antes de iniciar o laço:

```bash
export LUAM_MTA_PASSWORD=...
```

## `min_mta_version` some com um warning

O valor é resolvido a partir da última versão publicada do MTA e guardado em
`.luam/mta-version.json`. Sem rede e sem cache, o build avisa, omite o elemento e
mesmo assim produz um resource completo. Passe `--offline` (ou defina
`LUAM_OFFLINE`) para pular a consulta de propósito.

## Resolvendo uma posição de execução do MTA

`luam dev` constrói a estrutura em árvore e usa o mapa atual em memória para
substituir um caminho e linha Lua gerados e cobertos pelo caminho e linha `.luam`
do autor. Ele imprime sem alterações um registro que não consegue resolver.
Mantenha `output.map` ligado e não passe `--no-map` quando precisar dessa
resolução.

Para um erro de produção, guarde o `<outDir>/<name>.luam-map.json` escrito ao lado
do resource implantado e rode:

```bash
luam trace "ERROR: [my-resource/src/server.lua:42] failure" --map releases/1.4.0/my-resource.luam-map.json
```

Use o mapa do build exato que foi implantado. Outro mapa suportado pode resolver
para uma linha de código plausível, mas errada, e a CLI não consegue detectar
essa incompatibilidade. Uma versão não suportada ou posição não coberta termina
com código `1` e não imprime resolução para aquela entrada. Veja
[Estruturas de saída e mapas de código](/pt-br/reference/output-layouts#resolvendo-traces-de-produção).

## O editor discorda do `luam check`

O servidor de linguagem não reverifica um arquivo já aberto quando *outro* arquivo
muda, então uma violação entre módulos pode aparecer só no `luam check`. Rode
**Luam: Restart Language Server** para forçar uma nova varredura.

## Cor e progresso em CI

A saída descarta todas as sequências de escape quando o fluxo não é um terminal.
Para forçar isso em qualquer lugar, passe `--no-color` ou defina `NO_COLOR` com um
valor não vazio. O progresso é pintado em stderr e o relatório vai para stdout,
então redirecionar stdout captura apenas o relatório.

## Ainda travado

Abra uma issue em
[github.com/ThigasDevelopment/luam/issues](https://github.com/ThigasDevelopment/luam/issues)
com a saída de `luam doctor` e o diagnóstico que falha. Para um problema de
editor, defina `luam.trace.server` como `"verbose"` e anexe o trace.

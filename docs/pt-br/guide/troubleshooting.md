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

## O build falha com um arquivo de código bem ali

```
config-unmatched-source: No "sources" pattern matched "tools/helper.luam" in "…".
```

O projeto tem arquivos `.luam`; nenhum deles está sob um diretório que `sources`
nomeia. A mensagem lista até cinco deles, conta o resto, e a correção é uma de
três:

- adicione a `sources` um padrão que cubra onde o arquivo já está;
- mova o arquivo para um diretório que o manifesto já nomeia, normalmente
  `src/server`, `src/client` ou `src/shared`;
- mova-o para a raiz do projeto, que é compilada sem padrão — com o lado que sua
  diretiva `#!` declara, e `shared` sem nenhuma.

`config-no-sources` é o caso vizinho: o projeto não tem arquivo `.luam` algum,
então não há o que nomear.

## Um mapeamento de `assets` não copiou nada

```
config-empty-asset: "assets/**/*" is listed in "assets" but "assets" is not a directory in "…".
```

O build passa — isso é um aviso — mas o resource sai sem os arquivos que o
mapeamento declarou. Crie o diretório, ou remova o mapeamento. A segunda redação,
"matched no file under `assets`", significa que o diretório existe e o padrão não
alcançou nada dentro dele; `assets/*` para em um segmento, então um arquivo em
`assets/img/` precisa de `assets/**/*`. A tabela completa está em
[`.luam.manifest`](/pt-br/tooling/luam-manifest#o-que-cada-from-casa).

## Uma função do MTA está "not available"

```
check-environment-api: API "dxDrawText" is client-only and is not available in a "server" file.
```

O ambiente do arquivo vem da pasta. Mova o arquivo para `src/client`, ou sobreponha
o ambiente daquele arquivo:

```luam env=client
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
src/shared/oop.luam:2:18 error check-oop-disabled: "Player.getName" is part of the MTA OOP API, which this project does not enable. Call "getPlayerName" instead. Set "compiler = { oop = true }" in .luam.manifest to enable the MTA OOP API.
```

Defina `compiler = { oop = true }` no `.luam.manifest`. Isso também escreve `<oop>true</oop>` no
`meta.xml`, que é o que faz a forma de objeto existir em tempo de execução. Veja
[API OOP](/pt-br/mta/oop).

## Um valor é `string?` e nada o estreita

Uma guarda estreita um **caminho de acesso estável**: um nome, ou um nome
seguido de campos literais. `if value ~= nil then` refina um local ou um
parâmetro dentro do bloco, `if self.connection ~= nil then` refina o campo, e
`tonumber(amount) or 100` é `number`, porque o `or` descarta o nil do lado
esquerdo:

```luam
local amount = '25'
local requested: number = tonumber(amount) or 100
```

O que mantém o tipo declarado é um caminho que o verificador não consegue nomear
do começo ao fim. Uma chamada ou um índice dinâmico não é um caminho, então teste
o que você consegue nomear:

```luam static
local handle = session.slots[key]

if handle ~= nil then
    local text: string = handle
end
```

Uma condição guardada em uma variável também não é um fato: teste o caminho no
bloco que o usa, e não `local ready = self.connection ~= nil`. Um fato cai assim
que o caminho, um prefixo dele ou a raiz dele recebe outro valor, e tudo que o
corpo de um laço escreve perde o fato no laço inteiro. Veja
[Guardas de tipo](/pt-br/language/types#guardas-de-tipo) para todas as formas que
estreitam, [o que um fato sobrevive](/pt-br/language/types#o-que-um-fato-sobrevive)
para até onde ele vai, e [Limitações](/pt-br/reference/limitations) para o que não
estreita.

## A interpolação diz que um nome não está no escopo

```
check-unknown-template-root: Template interpolation "getPlayerName(player)" is not a name or a member path. Compute the value first, then interpolate the name.
```

Uma interpolação aceita um **nome ou um caminho de membro**, não uma expressão.
Calcule o valor antes:

```luam
local name: string = getPlayerName(player)

outputChatBox(`${name} joined.`, root)
```

Veja [Strings de template](/pt-br/language/template-strings).

## O `ensure` constrói mas nunca reinicia

É isso que ele faz: o `ensure` espelha os arquivos no servidor e para. Digite
`refresh` e `restart <name>` no console do servidor, ou rode
`luam dev --start-server`, que passa a ser dono do processo do MTA e escreve esses
comandos por você. Veja [Desenvolvimento diário](/pt-br/guide/daily-development).

## O servidor MTA local não inicia

O erro do executável lista todos os caminhos tentados. Confira se `serverPath`
aponta para a raiz da instalação, ou defina um
`development.server.executable` relativo e contido nela. Um timeout de prontidão
nomeia o `server.log`; verifique nele erros de inicialização ou uma versão com um
marcador de startup diferente.

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

O servidor de linguagem reanalisa os outros arquivos quando uma edição muda o que
um arquivo **declara**, e ele enxerga arquivos que você nunca abriu — varre o
workspace ao iniciar e a extensão observa `**/*.luam`, `.luam.manifest` e
`.env*`. O que ele não lê é um arquivo fora da raiz do workspace, então abra uma
pasta que contenha o seu `.luam.manifest`, não uma subpasta dele.

Se os dois continuarem discordando, rode **Luam: Restart Language Server** e
relate: o build e o editor compartilham um frontend, então uma diferença real é
um bug.

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

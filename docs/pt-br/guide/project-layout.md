# Estrutura do projeto

## O que você escreve

```
my-resource/
├── .luam.manifest          manifesto do projeto, o único arquivo que luam init escreve
├── .env               chaves de implantação e seus padrões, versionado
├── .env.local         sobrescritas locais, nunca versionado
├── config.lua         Lua puro que pertence ao autor do resource, copiado como está
├── assets/            copiado como está e declarado, para os clientes baixarem
└── src/
    ├── shared/        roda no servidor e em todo cliente
    ├── server/        roda apenas no servidor
    └── client/        roda apenas nos clientes
```

Só `.luam.manifest` e pelo menos um arquivo de código são obrigatórios. Todo o resto é
opcional e aparece na saída apenas quando existe.

### A pasta decide o ambiente

`src/server`, `src/client` e `src/shared` não são uma convenção — o compilador os
lê. O ambiente de um arquivo decide quais APIs e eventos do MTA resolvem, e quais
globais de outros arquivos ele enxerga. Uma diretiva `#!server`, `#!client` ou
`#!shared` na primeira linha sobrepõe a pasta.

Veja [Ambientes](/pt-br/mta/environments) para a regra completa.

### Extensões de arquivo

| Extensão | Significado |
| --- | --- |
| `.luam` | Código. Verificado, compilado e escrito como `.lua`. |
| `.d.luam` | [Arquivo de declaração](/pt-br/language/declaration-files). Verificado, descreve tipos para Lua que o compilador não controla, não emite nada. |
| qualquer coisa que um mapeamento de `assets` nomeia | Copiada e declarada como `<file>`, então os clientes baixam. |

Um arquivo que nenhum padrão de `sources` e nenhum mapeamento de `assets` nomeia
não faz parte do build. Nada é copiado por acidente.

### Um arquivo ao lado do manifesto

Há uma exceção, e ela é a raiz do projeto. Um arquivo `.luam` diretamente ao lado
do `.luam.manifest` é compilado mesmo quando nenhum padrão de `sources` o nomeia,
então o menor resource possível tem dois arquivos:

```
my-resource/
├── .luam.manifest
└── index.luam
```

Um arquivo na raiz não tem pasta de onde ler seu lado, então sua diretiva `#!`
decide, e ele roda como `shared` quando não declara nenhuma. Nada mais muda: um
arquivo `.luam` em um subdiretório que nenhum padrão nomeia continua fora do
build, e o build diz isso com `config-unmatched-source`.

A exceção para na raiz. Um diretório, o que guarda o manifesto, é o único lugar
lido sem um padrão — um arquivo colocado ali foi colocado ali de propósito.

## O que um build escreve

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

`build` usa bundles de produção por padrão. `config.lua`, `env.lua` e assets ficam
fora dos bundles, e o mapa fica fora do resource. `ensure` usa uma árvore
espelhada por padrão e `dev` sempre a usa. Veja
[Estruturas de saída e mapas de código](/pt-br/reference/output-layouts) para as
duas árvores completas, manifestos e sobrescritas.

## Regras de nome e de caminho

- `outDir`, `resourcesDir` e cada entrada de `sources`, `assets` e
  `loadOrder` precisam permanecer dentro do seu diretório base. Um caminho
  absoluto ou um segmento `..` é rejeitado com `config-escaping-path`.
- Dois fontes que produziriam o mesmo caminho de saída falham o build com
  `project-duplicate-output`. Renomeie um deles.
- `name` no `.luam.manifest` nomeia a pasta de saída e o resource que o `ensure`
  reinicia. Ele nunca chega ao `meta.xml` — o MTA lê o nome de um resource a
  partir da pasta.

## Vários resources em uma pasta

Um diretório de resource é um projeto. Coloque vários lado a lado e adicione um
[`.luam.server`](/pt-br/reference/server-file) na raiz, e a pasta vira um
**workspace** — uma instalação do MTA nomeada uma vez, compartilhada por todos:

```
resources/
  .luam.server            nomeia a instalação do MTA
  gamemode-race/
    .luam.manifest
    src/
  scoreboard/
    .luam.manifest
    src/
  notes/                  não é resource: sem manifesto
```

Os resources de um workspace são os **filhos diretos que contêm um
`.luam.manifest`** — um nível, nunca recursivo, então uma árvore de saída de
build ou uma cópia vendorizada não entram por acidente e `node_modules` nunca é
percorrido.

A raiz em si não precisa de manifesto próprio. `luam dev`, `luam server` e
`luam ensure <resource>` rodam ali; dentro de um único diretório de resource todo
comando se comporta como se comporta sozinho.

## O que a CLI escreve ao lado do projeto

O `build` guarda em `.luam/mta-version.json` a última versão do MTA que consultou,
para que um build posterior sem rede ainda tenha sucesso. É a única coisa que a
CLI escreve fora do `outDir`, e ela é gerada — ignore `.luam/` no controle de
versão.

Não há snapshot de configuração. O servidor de linguagem lê o `.luam.manifest`
diretamente, então uma mudança em `compiler` passa a valer assim que o
arquivo é salvo.

## Configurando a estrutura

Cada diretório acima é um padrão que você pode mudar no
[`.luam.manifest`](/pt-br/tooling/luam-manifest):

```luam
name = 'my-resource'

sources = {
    server = { 'src/server/**/*.luam' },
    client = { 'src/client/**/*.luam' },
    shared = { 'src/shared/**/*.luam' },
}

assets = {
    { from = 'assets/**/*', to = 'assets' },
}

outDir = 'build'
```

# Estrutura do projeto

## O que você escreve

```
my-resource/
├── luam.json          manifesto do projeto, o único arquivo que luam init escreve
├── .env               chaves de implantação e seus padrões, versionado
├── .env.local         sobrescritas locais, nunca versionado
├── config.lua         Lua puro que pertence ao autor do resource, copiado como está
├── assets/            copiado como está e declarado, para os clientes baixarem
└── src/
    ├── shared/        roda no servidor e em todo cliente
    ├── server/        roda apenas no servidor
    └── client/        roda apenas nos clientes
```

Só `luam.json` e pelo menos um arquivo de código são obrigatórios. Todo o resto é
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
| qualquer outra em `sourceDirs` | Copiada, mas não declarada no `meta.xml`. |
| qualquer coisa em `assetDirs` | Copiada e declarada como `<file>`, então os clientes baixam. |

## O que um build escreve

```
build/
├── my-resource.luam-map.json
└── my-resource/
    ├── meta.xml
    ├── config.lua
    ├── .env
    ├── assets/
    └── src/
        ├── shared.lua
        ├── server.lua
        └── client.lua
```

`build` usa bundles de produção por padrão. `config.lua`, `.env` e assets ficam
fora dos bundles, e o mapa fica fora do resource. `ensure` usa uma árvore
espelhada por padrão e `dev` sempre a usa. Veja
[Estruturas de saída e mapas de código](/pt-br/reference/output-layouts) para as
duas árvores completas, manifestos e sobrescritas.

## Regras de nome e de caminho

- `outDir`, `resourcesDir` e cada entrada de `sourceDirs`, `assetDirs` e
  `loadOrder` precisam permanecer dentro do seu diretório base. Um caminho
  absoluto ou um segmento `..` é rejeitado com `config-escaping-path`.
- Dois fontes que produziriam o mesmo caminho de saída falham o build com
  `project-duplicate-output`. Renomeie um deles.
- `name` no `luam.json` nomeia a pasta de saída e o resource que o `ensure`
  reinicia. Ele nunca chega ao `meta.xml` — o MTA lê o nome de um resource a
  partir da pasta.

## Configurando a estrutura

Cada diretório acima é um padrão que você pode mudar no
[`luam.json`](/pt-br/tooling/luam-json):

```json
{
    "name": "my-resource",
    "sourceDirs": ["src"],
    "assetDirs": ["assets"],
    "outDir": "build"
}
```

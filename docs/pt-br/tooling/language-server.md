# Servidor de linguagem

`@luam/lsp` é independente de editor. A extensão do VS Code o embute, e qualquer
editor que fale o Language Server Protocol pode iniciá-lo da mesma forma.

## Capacidades

| Capacidade | Comportamento |
| --- | --- |
| Diagnósticos | Publicados ao abrir e a cada mudança, limpos quando o arquivo é corrigido. |
| Completação | Símbolos do escopo, globais do workspace, APIs do MTA no ambiente e palavras-chave. |
| Hover | Tipo declarado ou inferido, assinatura da função, ambiente da API do MTA. |
| Definição | Locais, parâmetros, membros de classe e globais declarados em outro arquivo. |
| Referências | Todo uso de um símbolo, entre arquivos para globais. |
| Renomear | Edita todas as ocorrências, entre arquivos para globais. |

A completação dispara em `.` e `:` para membros: campos e métodos de classe
(incluindo herdados), membros de enum, membros das bibliotecas `math` / `string` /
`table` e as [extensões de objeto](/pt-br/language/extensions) que se aplicam ao
tipo do receptor.

### Palavras reservadas

Toda palavra reservada é completada, cada uma na posição em que é válida:

| O que você digitou | O que aparece |
| --- | --- |
| Um comando | As palavras-chave do Lua 5.1, mais `class`, `continue`, `declare`, `enum`, `export`, `interface`, `new` e `type` |
| O corpo de uma classe | `constructor`, expandido no formato de método |
| O cabeçalho de uma classe ou interface | `extends` e `implements` |
| Uma anotação de tipo | Os tipos primitivos e `fun` |
| Dentro de um método de uma subclasse | `super` |

`self`, `super` e `fun` são contextuais, não reservados, então a completação só
os oferece onde eles significam algo. Veja
[Palavras-chave](/pt-br/reference/keywords).

### Dentro do cabeçalho de uma classe

A completação sabe onde está em uma declaração `class` e oferece apenas o que
pode vir a seguir legalmente:

| Você digitou | Você recebe |
| --- | --- |
| `class Session ` | `extends` e `implements` |
| `class Session extends ` | Toda **classe** declarada, menos a própria `Session` |
| `class Session implements ` | Toda **interface** declarada |
| `class Session extends Base ` | Só `implements` — o `extends` já foi usado |

A posição de interface continua oferecendo depois de cada vírgula, então
`implements Describable, ` também completa a segunda.

### Dentro de uma chamada

A completação ordena os candidatos pelo tipo de parâmetro que a chamada espera,
usando os mesmos tipos do checker. A lista é **ordenada, nunca filtrada** — tudo
continua aparecendo:

| Posição | Candidato |
| --- | --- |
| Primeiro | O tipo dele corresponde ao tipo esperado do parâmetro. |
| Segundo | É uma **função cujo tipo de retorno** corresponde, então chamá-la fornece o valor. |
| Por último | Todo o resto. |

Em `setElementHealth(player, ` o segundo parâmetro é `number`, então locais
numéricos vêm primeiro, depois funções que retornam `number`, depois o resto. Os
tipos de elemento respeitam a hierarquia do MTA, então um `Vehicle` vem primeiro
onde se espera um `Element`.

Quando o parâmetro esperado também é uma função, um callback anônimo herda os
nomes e tipos dos seus parâmetros. A completação pode inserir esses nomes depois
de `function (`, e completação de membros, hover, definição e referências usam os
tipos herdados dentro do corpo. As variantes de callbacks MTA seguem o ambiente
do arquivo atual, então `addCommandHandler` oferece `player, commandName, ...` no
servidor e `commandName, ...` no cliente.

## Ambientes

Todo documento resolve o seu ambiente (`server`, `client` ou `shared`) a partir do
caminho ou de uma diretiva `#!` **antes de qualquer outra coisa acontecer**. Isso
decide quais APIs do MTA o documento enxerga, então `dxDrawText` nunca completa em
um arquivo de servidor e `kickPlayer` nunca completa em um de cliente. Um documento
`shared` enxerga apenas declarações compartilhadas.

Globais declarados por outros arquivos seguem a mesma regra: um arquivo `server`
completa globais de módulos `shared`, nunca de módulos `client`.

## Workspace

No `initialize`, o servidor varre as pastas do workspace em busca de arquivos
`.luam` e os analisa. Documentos abertos sempre vencem a cópia varrida, então
edições não salvas guiam diagnósticos e navegação imediatamente.

## O manifesto

O [`.luam.manifest`](/pt-br/tooling/luam-manifest) é varrido e analisado como
qualquer outro documento. Seus diagnósticos aparecem enquanto você digita, o
autocompletar oferece os campos válidos no cursor — com tipo, se são obrigatórios
e o padrão — e os conjuntos fechados completam dentro das aspas. O hover nomeia o
caminho completo do campo e seu tipo.

O dialeto não tem chamadas nem valores de função, então o próprio servidor avalia
o manifesto. Abrir uma pasta nunca executa código do projeto, e `oop` passa a
valer ao salvar em vez de depois da próxima execução da CLI.

## Executando

```bash
pnpm --filter @luam/lsp bundle    # gera packages/lsp/dist/luam-lsp.mjs
node packages/lsp/dist/luam-lsp.mjs --stdio
```

`--stdio` é o transporte usual. `--node-ipc` está disponível quando o cliente faz
fork do processo.

O bundle é autocontido: ele carrega o frontend do compilador e o catálogo do MTA, e
não precisa de nada além do Node.js 20 ou mais recente.

## Ligando um editor

Qualquer cliente LSP precisa de três coisas:

1. **Comando** — `node /caminho/para/luam-lsp.mjs --stdio`.
2. **Seletor de documento** — arquivos que casam com `**/*.luam`, id de linguagem
   `luam`.
3. **Raiz** — a pasta com o `.luam.manifest`, para que a varredura do workspace encontre
   todos os módulos.

Não há seção de configuração exigida pelo servidor; as configurações listadas em
[Editores](/pt-br/tooling/editors) pertencem à extensão do VS Code, não ao
protocolo.

## Relatando um problema

Ajuste o nível de trace do cliente para `verbose` (`luam.trace.server` no VS Code)
e anexe o trace junto com a saída de `luam doctor`.

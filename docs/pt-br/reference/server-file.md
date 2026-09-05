# Arquivo do servidor

O `.luam.server` nomeia a instalação do MTA que um diretório de resources
compartilha. Um único arquivo responde "para onde isto é publicado" para todo
resource abaixo dele, então nenhum `.luam.manifest` precisa repetir a resposta e
nenhum par deles pode discordar.

Ele é escrito no [dialeto de manifesto](/pt-br/tooling/luam-manifest), então a
sintaxe, a completude e o hover são os que você já conhece:

```luam
serverPath = 'C:/MTA Server'
resourcesDir = 'mods/deathmatch/resources'
```

## Campos

| Campo | Tipo | Obrigatório | Padrão | O que nomeia |
| --- | --- | --- | --- | --- |
| `serverPath` | `string` | **sim** | — | A instalação do servidor MTA. Caminhos relativos resolvem contra o diretório que contém este arquivo; um caminho absoluto é permitido. |
| `resourcesDir` | `string` | não | `'mods/deathmatch/resources'` | O diretório de resources dentro daquela instalação. Precisa ficar dentro de `serverPath`. |
| `executable` | `string?` | não | sondagem por plataforma | O executável do servidor, relativo a e contido em `serverPath`. |
| `logs.enabled` | `booleano` | não | `false` | Se a sessão transmite os logs de servidor e de cliente. |
| `logs.maxMessageLength` | `número` | não | `4096` | Registros repassados mais longos são rejeitados. |
| `logs.rateLimit` | `número` | não | `30` | Registros permitidos por cliente por janela. |
| `logs.rateWindowMs` | `número` | não | `1000` | Duração dessa janela, em milissegundos. |

O `serverPath` é obrigatório aqui, onde é opcional no manifesto: um
`.luam.server` que não nomeia um servidor não descreve nada.

O `development.server.executable` do manifesto vira `executable` e o
`development.logs` vira `logs`. O invólucro `development` existe no manifesto
para separar o comportamento de desenvolvimento do contrato do resource; este
arquivo inteiro é publicação de desenvolvimento, então o invólucro nomearia o
arquivo duas vezes.

## Qual arquivo vale

Vale o `.luam.server` **mais próximo** acima do diretório de trabalho, por
inteiro. A subida para nos segmentos `node_modules` e na raiz do sistema de
arquivos, e não há mesclagem.

Uma única subida serve às duas portas de entrada. Na raiz de uma pasta de
resources o arquivo descreve o diretório; dentro de um resource ele é o servidor
para onde aquele resource é publicado.

## O que torna um filho um resource

Os resources de um workspace são os **filhos diretos que contêm um
`.luam.manifest`** — um nível, nunca recursivo:

```
resources/
  .luam.server
  gamemode-race/
    .luam.manifest
  scoreboard/
    .luam.manifest
  notes/            não é resource: sem manifesto
  node_modules/     nunca percorrido
```

Um nível é o que impede uma árvore de saída de build ou uma cópia vendorizada de
entrar por acidente. A lista é ordenada por nome, e é contra ela que o
`luam ensure` na raiz e os verbos `list` e `ensure` da sessão resolvem um nome.

## Precedência sobre o manifesto

Os campos de publicação continuam funcionando no `.luam.manifest`. Quando um
`.luam.server` é encontrado acima de um resource, os valores dele vencem:

| Campo | Com um `.luam.server` acima | Sem nenhum |
| --- | --- | --- |
| `serverPath` | O workspace vence. O manifesto avisa uma vez. | O manifesto, como antes. |
| `resourcesDir` | O workspace vence. O manifesto avisa uma vez. | O manifesto, como antes. |
| `development.server` | O workspace vence. O manifesto avisa uma vez. | O manifesto, como antes. |
| `development.logs` | O workspace é o **padrão**. O manifesto sobrescreve, em silêncio. | O manifesto, como antes. |

`logs` é a única linha que não é publicação. Ela ajusta um relay injetado no
código gerado de um resource, então um resource tem direito ao valor dele; o
arquivo do workspace só fornece o padrão para os resources que não declaram
nenhum.

Um manifesto que ainda define qualquer um dos três primeiros reporta
`config-deployment-moved` **uma vez**, nomeando todos os campos sobrescritos em
uma mensagem e o `.luam.server` que venceu. É um aviso: nada quebra, e apagar as
linhas é a correção inteira. Um projeto com `compiler.warningsAsErrors` ligado
transforma isso em falha de build, que é o que aquela opção significa.

Um projeto sem nenhum `.luam.server` acima dele se comporta exatamente como se
comportava antes de o arquivo existir.

## Quando está errado

| Código | Quando |
| --- | --- |
| `server-unknown-field` | Um campo que esta tabela não define. A mensagem lista os campos que existem. |
| `server-invalid-value` | Um valor fora do tipo do campo, ou um caminho que sai do limite dele. |
| `server-parse-error` | O arquivo não é lido como o dialeto de manifesto. |
| `config-missing-field` | Sem `serverPath`. A mensagem nomeia este arquivo, não um manifesto. |

Qualquer um deles **interrompe o comando**. `luam dev`, `luam ensure` e
`luam server` saem com `2` na raiz do workspace e não fazem nada. Um workspace
cujo arquivo não é lido não é um workspace, e adivinhar um caminho de servidor é
pior do que recusar.

## No editor

`.luam.server` é uma linguagem própria — `luam-server` — com ícone,
realce, hover e completude próprios, todos guiados pela mesma tabela de campos de
que esta página é derivada. Veja [Editores](/pt-br/tooling/editors).

## Por que é um arquivo próprio

O [ADR-046](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/046-shared-mta-server-workspace-file.md)
registra a decisão. Em resumo: uma instalação do MTA ocupa uma porta, então os
resources que a compartilham são resources que não sabem uns dos outros, e "para
onde isto é publicado" tem uma resposta só para o diretório inteiro que nenhum
manifesto de resource sozinho tem o direito de dar.

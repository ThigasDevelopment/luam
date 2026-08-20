# Comandos da CLI

```bash
luam <command> [options]
```

Comandos de projeto leem o `.luam.manifest` do diretório atual, ou de `--cwd`. `setup`,
`doctor` e `init` não exigem um projeto existente.

Cada opção pertence aos comandos que a leem. Uma opção que o comando não possui é
um erro de uso, não um aviso, então uma flag nunca parece ter surtido efeito sem
ter surtido. Pergunte a qualquer comando o que ele aceita:

```bash
luam --help
luam build --help
luam help trace
```

| Comando | O que faz |
| --- | --- |
| [`init`](#luam-init) | Cria o `.luam.manifest`. |
| [`check`](#luam-check) | Compila e reporta diagnósticos. Não escreve nada. |
| [`build`](#luam-build) | Compila e escreve o resource em `<outDir>/<name>`. |
| [`ensure`](#luam-ensure) | Constrói, sincroniza no servidor MTA, reinicia e observa. |
| [`dev`](#luam-dev) | O laço do `ensure` mais um fluxo ao vivo do log do servidor. |
| [`server`](#luam-server) | Roda um servidor MTA local existente em primeiro plano. |
| [`trace`](#luam-trace) | Resolve posições Lua geradas de volta para o código Luam. |
| [`setup`](#luam-setup) | Detecta editores e instala a extensão, com consentimento. |
| [`doctor`](#luam-doctor) | Informa a CLI, o Node.js, os editores e a extensão. |

## `luam init`

```bash
luam init
luam init --name gamemode-race
```

Escreve **um arquivo**, `.luam.manifest`, e para. Não há framework, não há árvore de
exemplo e não há nada para apagar antes da sua primeira linha de código.

O nome do resource vem de `--name`, ou do diretório do projeto quando ele é um
nome válido de resource do MTA, ou de `luam-resource` como último recurso. Um
`.luam.manifest` existente é mantido e informado; `--force` o sobrescreve.

## `luam check`

```bash
luam check
```

Compila tudo e imprime os diagnósticos. **Não escreve nada.** É o comando para CI
e para um hook de pre-commit.

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
```

## `luam build`

```bash
luam build
```

Compila e escreve o bundle de produção em `<outDir>/<name>`. O padrão também
escreve `<outDir>/<name>.luam-map.json`; veja
[Estruturas de saída e mapas de código](/pt-br/reference/output-layouts) para o
formato exato do resource e as sobrescritas.

**`build` é o único comando que minifica.** Todo arquivo `.lua` que ele escreve —
bundles, a árvore espelhada com `--no-bundle`, os helpers de runtime e o
`config.lua` — é escrito em uma única linha, sem comentários e sem formatação.
Identificadores nunca são renomeados, então um erro em tempo de execução ainda
nomeia a função que você escreveu. `meta.xml`, `env.lua` e os assets são escritos
sem alteração. `ensure` e `dev` mantêm a saída legível de sempre.

```
Discovery: done in 1 ms.
Compile: 3 files in 12 ms.
Assembly: done in 0 ms.
Manifest: done in 1 ms.
Write: 7 files in 2 ms.
Build passed: 3 files, 0 errors, 0 warnings in 16 ms.
Wrote 7 files to "build/my-resource".
```

Um build que reporta qualquer erro não escreve nada, então um resource que
funcionava nunca é substituído por uma saída parcial.

## `luam ensure`

```bash
luam ensure
luam ensure --no-watch
```

Constrói, espelha o resource no seu servidor MTA e repete a cada gravação. Exige
`serverPath`. Ele sincroniza arquivos e nunca reinicia o resource — use
`luam dev --start-server`, ou `refresh` no console do servidor, para carregar a
sincronização. O `ensure`
nunca escreve em `<outDir>/<name>` e usa a estrutura em árvore por padrão,
independentemente de `output.bundle`. Passe `--bundle` para uma sincronização em
bundle.

Veja [Desenvolvimento diário](/pt-br/guide/daily-development) para o laço
completo.

## `luam dev`

```bash
luam dev
luam dev --start-server
```

Roda o fluxo completo do `ensure` e acompanha
`<serverPath>/mods/deathmatch/logs/server.log` a partir do fim atual, tratando
truncamento e rotação.

```
[14:22:07][server][info] Resource started
[14:22:09][client][warn] Missing vehicle model
```

Os helpers de log exclusivos de desenvolvimento que ele adiciona nunca são
escritos por `build` ou `ensure`, e são removidos pela próxima sincronização
normal. `dev` sempre usa a estrutura em árvore e resolve posições geradas
cobertas através do seu mapa em memória, então ele não possui nenhuma flag de
estrutura: `luam dev --bundle` é um erro de uso.

`--start-server` inicia primeiro o processo MTA local e espera a prontidão antes
do build. Depois de uma sincronização com mudanças, escreve `refresh`,
`stop <resource>` e `start <resource>` no console que possui, então também
inicia um resource recém-implantado.
Uma saída antecipada ou inesperada do servidor encerra o laço de desenvolvimento
com código `1`. Sem a flag, `dev` nunca inicia nem encerra um processo MTA.

`luam server` e `luam ensure` em terminais separados são processos separados. O
`ensure` não pode escrever no console possuído pela outra execução, então o
`ensure` isolado apenas sincroniza arquivos.

## `luam server`

```bash
luam server
```

Roda a instalação existente em `serverPath` em primeiro plano com o console
conectado. No Windows procura `MTA Server.exe`; no Linux procura `mta-server64` e
depois `mta-server`. Defina `development.server.executable` para outro layout.
`Ctrl+C` escreve o comando `shutdown` do MTA e usa um fallback de encerramento
com tempo limitado. O comando encerra apenas o processo filho que iniciou.

## `luam trace`

```bash
luam trace src/server.lua:42
luam trace "ERROR: [my-resource/src/server.lua:42] failure"
luam trace --map releases/my-resource.luam-map.json < mta-errors.log
```

Resolve um `arquivo:linha` simples, uma linha de log do MTA entre aspas ou uma
posição por linha da entrada padrão. `--map` seleciona um mapa relativo ou
absoluto; sem ele, o comando tenta o mapa configurado e depois um único mapa
encontrado abaixo do projeto. Imprime `arquivo-fonte:linha (símbolo)` quando há um
símbolo. O código de saída `1` significa que ao menos uma entrada não resolveu ou
o mapa não pôde ser usado; `0` significa que todas resolveram. Veja o
[exemplo de trace de produção](/pt-br/reference/output-layouts#resolvendo-traces-de-produção).

Um script minificado pelo `build` tem uma única linha, então o MTA informa
`line 1` para qualquer erro nele e a linha gerada não carrega informação alguma.
O `trace` reconhece a marca `minified` em um mapa escrito pelo `build` e o recusa
em vez de devolver com confiança uma linha errada. Reproduza o erro sob
`luam dev` ou `luam ensure`, onde a árvore legível resolve a linha e o símbolo
exatos do código-fonte.

## `luam setup`

```bash
luam setup
luam setup --yes
```

Detecta os comandos de editores suportados no `PATH`, pede consentimento e instala
a extensão do Luam. Ele tenta o marketplace do editor primeiro e recorre ao
`.vsix` oficial da release do GitHub que corresponde à versão da CLI.

O comando nunca instala em um editor silenciosamente. Em um terminal não
interativo, passe `--yes` explicitamente.

## `luam doctor`

```bash
luam doctor
```

Informa as versões da CLI e do Node.js em uso, cada editor suportado detectado no
`PATH` e se aquele editor tem a extensão do Luam. Anexe a saída dele ao relatar um
problema.

## Opções

Cada opção lista os comandos que a possuem. Passá-la para qualquer outro comando
retorna `2` e não executa nada.

| Opção | Pertence a | Significado |
| --- | --- | --- |
| `--cwd <path>` | todos os comandos | Diretório do projeto com o `.luam.manifest`. Padrão: o diretório atual. |
| `--no-color` | todos os comandos | Saída simples, sem cor nem emoji. `NO_COLOR` faz o mesmo. |
| `-h`, `--help` | todos os comandos | Imprime o texto de ajuda daquele comando. |
| `-v`, `--version` | apenas a raiz | Imprime a versão da CLI, como `luam --version`. |
| `--manifest <path>` | `build`, `check`, `dev`, `ensure`, `trace` | Carrega este arquivo em vez do `.luam.manifest`. |
| `--bundle` / `--no-bundle` | `build`, `ensure` | Seleciona bundle ou árvore. `dev` não possui nenhuma das duas. |
| `--watch` / `--no-watch` | `dev`, `ensure` | Mantém observando, ou roda uma vez. Ambos observam por padrão. |
| `--no-map` | `build`, `dev`, `ensure` | Desliga a geração do mapa. Para `build`, também remove o mapa padrão existente depois do sucesso. |
| `--offline` | `build`, `dev`, `ensure` | Pula a consulta de `min_mta_version`. `LUAM_OFFLINE` faz o mesmo. |
| `--map <path>` | `trace` | Mapa a ler. Caminhos relativos partem do diretório do projeto. |
| `--name <name>` | `init` | Nome do resource. |
| `--force` | `init` | Sobrescreve um arquivo existente. |
| `-y`, `--yes` | `init`, `setup` | Aceita os padrões, ou instala em todos os editores detectados, sem perguntar. |

## Migrando de uma CLI anterior

Antes desta versão o parser aceitava todas as opções em todos os comandos e
ignorava as que não se aplicavam. Essas invocações agora falham com `2`:

| Invocação | O que mudou |
| --- | --- |
| `luam dev --bundle` | `dev` nunca fez bundle. Antes avisava; agora falha. Use `luam build --bundle` ou `luam ensure --bundle`. |
| `luam check --offline` | `check` não consulta release alguma. Remova a flag, ou defina `LUAM_OFFLINE` se um script precisa de um único ajuste para os dois comandos. |
| `luam build --config luam.json` | `--config` virou `--manifest`, e o arquivo que ele aponta agora é um [`.luam.manifest`](/pt-br/tooling/luam-manifest) escrito no dialeto de manifesto do Luam. |
| `luam doctor --manifest .luam.manifest` | `doctor` e `setup` não carregam projeto. Remova a flag. |
| `luam build --version` | `--version` é uma opção da raiz. Use `luam --version`. |
| `luam trace --name x` | `--name` pertence ao `init`. Remova a flag. |

Scripts que passam apenas opções pertencentes ao comando não são afetados, e todo
código de saída mantém o seu significado.

## Códigos de saída

| Código | Significado |
| --- | --- |
| `0` | O comando teve sucesso. |
| `1` | O comando reportou diagnósticos ou não conseguiu concluir o setup. |
| `2` | A linha de comando ou a configuração é inválida. |

## Fluxos e cor

O progresso é pintado em **stderr** e o relatório vai para **stdout**, então
redirecionar stdout captura apenas o relatório:

```bash
luam check > report.txt
```

A saída descarta todas as sequências de escape quando o fluxo não é um terminal,
então uma transcrição de CI continua legível. `--no-color` ou um `NO_COLOR` não
vazio desliga cor e emoji em qualquer lugar.

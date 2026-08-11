# Comandos da CLI

```bash
luam <command> [options]
```

Comandos de projeto leem o `luam.json` do diretório atual, ou de `--cwd`. `setup`,
`doctor` e `init` não exigem um projeto existente.

| Comando | O que faz |
| --- | --- |
| [`init`](#luam-init) | Cria o `luam.json`. |
| [`check`](#luam-check) | Compila e reporta diagnósticos. Não escreve nada. |
| [`build`](#luam-build) | Compila e escreve o resource em `<outDir>/<name>`. |
| [`ensure`](#luam-ensure) | Constrói, sincroniza no servidor MTA, reinicia e observa. |
| [`dev`](#luam-dev) | O laço do `ensure` mais um fluxo ao vivo do log do servidor. |
| [`trace`](#luam-trace) | Resolve posições Lua geradas de volta para o código Luam. |
| [`setup`](#luam-setup) | Detecta editores e instala a extensão, com consentimento. |
| [`doctor`](#luam-doctor) | Informa a CLI, o Node.js, os editores e a extensão. |

## `luam init`

```bash
luam init
luam init --name gamemode-race
```

Escreve **um arquivo**, `luam.json`, e para. Não há framework, não há árvore de
exemplo e não há nada para apagar antes da sua primeira linha de código.

O nome do resource vem de `--name`, ou do diretório do projeto quando ele é um
nome válido de resource do MTA, ou de `luam-resource` como último recurso. Um
`luam.json` existente é mantido e informado; `--force` o sobrescreve.

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

Constrói, espelha o resource no seu servidor MTA, reinicia e repete a cada
gravação. Exige `serverPath`; o restart também exige um `transport`. O `ensure`
nunca escreve em `<outDir>/<name>` e usa a estrutura em árvore por padrão,
independentemente de `output.bundle`. Passe `--bundle` para uma sincronização em
bundle.

Veja [Desenvolvimento diário](/pt-br/guide/daily-development) para o laço
completo.

## `luam dev`

```bash
luam dev
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
cobertas através do seu mapa em memória.

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

| Opção | Significado |
| --- | --- |
| `--cwd <path>` | Diretório do projeto com o `luam.json`. Padrão: o diretório atual. |
| `--config <path>` | Carrega este arquivo em vez do `luam.json`. |
| `--name <name>` | Nome do resource para o `init`. |
| `--force` | Deixa o `init` sobrescrever um arquivo existente. |
| `-y`, `--yes` | Instala a extensão em todos os editores detectados sem perguntar. |
| `--watch` / `--no-watch` | Mantém `ensure` ou `dev` observando, ou roda uma vez. Ambos observam por padrão. |
| `--bundle` / `--no-bundle` | Seleciona bundle ou árvore para `build` e `ensure`. `dev` sempre usa árvore. |
| `--no-map` | Desliga a geração do mapa. Para `build`, também remove o mapa padrão existente depois do sucesso. |
| `--map <path>` | Mapa usado por `trace`. Caminhos relativos partem do diretório do projeto. |
| `--offline` | Pula a consulta de `min_mta_version`. `LUAM_OFFLINE` faz o mesmo. |
| `--no-color` | Saída simples, sem cor nem emoji. `NO_COLOR` faz o mesmo. |
| `-h`, `--help` | Imprime o texto de uso. |
| `-v`, `--version` | Imprime a versão da CLI. |

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

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
| [`test`](#luam-test) | Roda os arquivos `.test.luam` do projeto em um Lua 5.1 local. |
| [`build`](#luam-build) | Compila e escreve o resource em `<outDir>/<name>`. |
| [`ensure`](#luam-ensure) | Constrói, sincroniza no servidor MTA, reinicia e observa. |
| [`dev`](#luam-dev) | O laço do `ensure` mais um fluxo ao vivo do log do servidor. |
| [`server`](#luam-server) | Roda um servidor MTA local existente em primeiro plano. |
| [`config`](#luam-config) | Deriva um arquivo de declaração a partir dos dados literais do `config.lua`. |
| [`trace`](#luam-trace) | Resolve posições Lua geradas de volta para o código Luam. |
| [`setup`](#luam-setup) | Detecta editores e instala a extensão, com consentimento. |
| [`doctor`](#luam-doctor) | Informa a CLI, o Node.js, o interpretador Lua, os editores e a extensão. |

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
luam check --watch
```

Compila tudo e imprime os diagnósticos. **Não escreve nada.** É o comando para CI
e para um hook de pre-commit.

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
```

O `--watch` mantém o comando rodando e refaz a verificação a cada mudança sob os
`sources` do manifesto, imprimindo entre as execuções o mesmo separador do
`ensure` e reaproveitando o cache incremental. Ele continua sem escrever nada,
não consulta nenhum release e não precisa de rede. Uma mudança no
`.luam.manifest` relê a configuração e recalcula o conjunto observado. Diferente
de `dev` e `ensure`, o `check` **não** observa por padrão. Um watch roda até ser
interrompido, então o código de saída informa o encerramento e não a última
verificação — um script que quer um veredito roda `luam check` sem a flag.

## `luam format`

```bash
luam format
luam format --check
luam format src docs/snippets
```

Reescreve todos os fontes do projeto no estilo que a
[referência de formatação](/pt-br/reference/formatting) registra, de modo que o
editor deixa de ser o único caminho para satisfazê-lo. O comando aplica esse
estilo e nunca o estende; um projeto escolhe as decisões de espaçamento num
[`.luam.formatter`](/pt-br/reference/formatter-file), e uma configuração que não
faz parse interrompe a execução com `2`.

Sem caminho, os arquivos são os que o `luam check` compila — os padrões de
`sources` do manifesto — mais todo arquivo de declaração `.d.luam` do projeto. O
diretório de saída, `node_modules` e as bibliotecas resolvidas dentro dele nunca
são tocados. Com um ou mais caminhos, esses arquivos e diretórios são formatados
no lugar, nenhum manifesto é carregado, e todo arquivo `.luam` abaixo de um
diretório entra. O `.luam.manifest` não é formatado: é configuração no
[dialeto de manifesto](/pt-br/tooling/luam-manifest), não um arquivo de fonte.

`--check` não escreve nada. Imprime o caminho de cada arquivo que difere, um por
linha, e sai com `1` quando algum difere.

```
src/client/hud.luam
Format failed: 12 files scanned, 1 differing in 8 ms.
```

Um arquivo que não faz parse recebe um **aviso e é deixado como está**, e não
reprova a execução — o formatador não tem o que dizer sobre um arquivo que não
consegue ler, e o `luam check` é o comando que explica o porquê. A formatação é
idempotente, então uma segunda execução não muda nada.

## `luam test`

```bash
luam test
luam test --lua /usr/bin/lua5.1
```

Compila o projeto junto com cada arquivo `*.test.luam` e os executa em um
**interpretador Lua 5.1 encontrado no `PATH`** — `lua5.1`, `lua51`, `lua` e então
`luajit`, cada um aceito apenas quando informa `Lua 5.1`. `--lua <path>` ou a
variável `LUAM_LUA` fixa um específico, e o [`luam doctor`](#luam-doctor) diz se o
comando consegue rodar. A CLI não embarca interpretador nenhum.

`test` é o único comando que executa o seu código. `build`, `check`, `ensure` e
`dev` nunca executam. Nenhum arquivo de teste chega ao resource montado nem ao
`meta.xml`: um arquivo `*.test.luam` fica fora de `sources`, e listar um ali é um
erro, não uma inclusão silenciosa.

Um arquivo de teste resolve para um ambiente como qualquer outro arquivo — pelo
padrão de `sources`, sobrescrito por uma diretiva de arquivo, com `shared` como
último recurso. Testes `shared` rodam uma vez sozinhos, e testes de servidor e de
cliente rodam depois que o bundle `shared` carrega.

Seis globais existem dentro de um arquivo de teste e em nenhum outro lugar:

| Global | O que faz |
| --- | --- |
| `describe(name, body)` | Agrupa testes. Os nomes aninham com ` > `. |
| `test(name, body)` | Registra um teste. |
| `beforeEach(body)` | Roda antes de cada teste do escopo. |
| `afterEach(body)` | Roda depois de cada teste do escopo. |
| `expect(value)` | Devolve os matchers abaixo. |
| `mta` | Lê e configura os stubs do MTA. |

| Matcher | Passa quando |
| --- | --- |
| `.toBe(expected)` | `value == expected`. |
| `.toNotBe(expected)` | `value ~= expected`. |
| `.toEqual(expected)` | Os dois valores são profundamente iguais. |
| `.toNotEqual(expected)` | Não são. |
| `.toBeNil()` | O valor é `nil`. |
| `.toBeTruthy()` | Lua trata o valor como verdadeiro. |
| `.toBeFalsy()` | O valor é `false` ou `nil`. |
| `.toContain(entry)` | Uma string contém o trecho, ou uma tabela contém o valor. |
| `.toThrow(message)` | Chamar o valor levanta erro, e o erro contém `message`. `message` é opcional. |

**As APIs do MTA são stubs, não simulações.** Cada função do MTA que o catálogo
declara para o ambiente do arquivo registra os argumentos com que foi chamada e
devolve `nil`. Configure e leia através de `mta`:

| Chamada | O que faz |
| --- | --- |
| `mta.returns(name, value)` | O stub devolve `value`. |
| `mta.stub(name, implementation)` | O stub chama `implementation` e devolve o que ela devolver. |
| `mta.calls(name)` | As chamadas registradas, cada uma uma tabela de argumentos. |
| `mta.reset()` | Esquece as duas coisas. Também roda sozinho antes de cada teste. |

Globais do MTA que não são funções, como `root`, estão ausentes em vez de virarem
stub, então buscar uma falha em vez de entregar um valor que não significa nada.
Um teste consegue provar quais chamadas o seu código fez. Não consegue provar o
que o MTA faz em resposta — isso exige um servidor rodando, e este comando nunca
abre um.

O `luam check` compila o resource, não os testes, então um erro de tipo dentro de
um arquivo de teste aparece no editor e no `luam test`, não no `check`.

Uma falha informa uma posição no código `.luam`, nunca no Lua gerado:

```
  x shared · rankOf > returns gold at one hundred points
      src/shared/scoreboard.test.luam:9:9 expected "silver", got "gold"
Tests failed: 2 tests passed, 1 failed in 63 ms.
```

O comando sai com `1` quando um teste falha, para que a CI possa barrar, e com `2`
quando não há interpretador Lua 5.1 disponível.
[Testando um módulo](/pt-br/recipes/testing-a-module) percorre um projeto completo.

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
luam ensure gamemode-race scoreboard
```

Constrói, espelha o resource no seu servidor MTA e repete a cada gravação. Exige
um caminho de servidor — `serverPath` no manifesto, ou um
[`.luam.server`](/pt-br/reference/server-file) acima dele. Ele sincroniza
arquivos e nunca reinicia o resource — use `luam dev`, ou `refresh` no console do
servidor, para carregar a sincronização. O `ensure`
nunca escreve em `<outDir>/<name>` e usa a estrutura em árvore por padrão,
independentemente de `output.bundle`. Passe `--bundle` para uma sincronização em
bundle.

Rodado na **raiz de um workspace** — um diretório com um `.luam.server` e sem
manifesto — ele recebe um ou mais nomes de resource, constrói e sincroniza cada
um uma vez, e sai. Não há watch nem console possuído ali, então ele sincroniza e
não reinicia nada; `luam dev` é a forma que faz as duas coisas. Sem nome nenhum é
um erro de uso que lista os resources encontrados.

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
`ensure` isolado apenas sincroniza arquivos. A sessão abaixo é o arranjo que não
tem esse problema.

### A sessão do workspace

Rode `luam dev` em um diretório com um
[`.luam.server`](/pt-br/reference/server-file) e ele abre uma **sessão**: um
servidor MTA para o diretório inteiro, e um terminal que fala dois vocabulários.

```bash
luam dev
```

Ele inicia o servidor, espera a prontidão, acompanha o log e não anexa
**nada**. Uma sessão sem resource anexado não compila e não observa nada, então
abrir uma não custa o que o diretório contém. Você nomeia os resources em que
está trabalhando, na hora:

| Verbo | Argumento | O que faz |
| --- | --- | --- |
| `ensure` | um nome de resource | Constrói, sincroniza, inicia no servidor e passa a observar as mudanças. |
| `drop` | um nome anexado | Para de observar e sincronizar. O que está no servidor fica como está. |
| `rebuild` | nome opcional | Força um ciclo para um resource anexado, ou para todos. |
| `list` | — | Os resources anexados, cada um com o resultado e a idade do último build. |
| `help` | — | Os verbos, e o escape abaixo. |

Uma linha cuja **primeira palavra** é um desses cinco é executada pela CLI.
Qualquer outra linha chega ao console do MTA sem alteração, então `refresh`,
`start` e `stop` continuam funcionando exatamente como sob `luam server`. A
correspondência é com a primeira palavra inteira: `ensureing` e `ensure-all` são
repassados.

Comece uma linha com um **espaço** para repassá-la literalmente mesmo quando a
primeira palavra é um verbo — esse é o escape para um comando de servidor que
colide com um deles:

```
 list
```

A lista de verbos está fechada em cinco por esse motivo: cada um tira um nome de
um vocabulário que o MTA possui.

`--start-server` é um erro de uso na raiz de um workspace. A sessão sempre possui
o servidor, então uma flag dizendo "faça também o que você sempre faz" sugeriria
que existe um modo em que ela não faz. `Ctrl+C` encerra o servidor e fecha todos
os watches. Uma saída inesperada do servidor encerra a sessão com código `1`.

`luam dev` dentro de um único diretório de resource continua igual,
`--start-server` incluído.

## `luam server`

```bash
luam server
```

Roda a instalação existente em `serverPath` em primeiro plano com o console
conectado. Na raiz de um workspace a instalação vem do
[`.luam.server`](/pt-br/reference/server-file), então o comando roda em um
diretório que não contém manifesto nenhum. No Windows procura `MTA Server.exe`; no Linux procura `mta-server64` e
depois `mta-server`. Defina `development.server.executable` para outro layout. No
Linux um candidato presente sem permissão de execução é ignorado, e uma procura
que não achou mais nada o aponta junto com o `chmod +x` que resolve.
`Ctrl+C` escreve o comando `shutdown` do MTA e usa um fallback de encerramento
com tempo limitado. O comando encerra apenas o processo filho que iniciou.

## `luam config`

```bash
luam config
luam config --write
luam config --source settings/config.lua --out settings/config.d.luam --write
```

Lê os dados literais de um `config.lua` nativo e escreve um
[arquivo de declaração](/pt-br/language/declaration-files) para ele. Sem
`--write` ele imprime o que escreveria e não muda nada.

O arquivo é **lido, nunca executado e nunca importado**. O que ele entende é uma
atribuição de topo de um literal ou de um construtor de tabela: strings, números,
booleanos, `nil`, tabelas com chave, chaves entre colchetes em string, tabelas
posicionais, e o aninhamento disso. Uma tabela com chaves vira um tipo de objeto,
uma posicional vira um array, uma mista vira `table`, e uma posicional com
elementos de tipos diferentes vira `any[]`. Ele para em 256 KB de fonte, oito
níveis de aninhamento e 512 entradas por tabela.

Qualquer outra coisa — uma chamada, uma concatenação, uma função, um laço — é
reportada com linha e coluna e pulada; os nomes ao redor continuam declarados.
Declare à mão o que ele pulou.

O arquivo gerado carrega um marcador na primeira linha, e o comando se recusa a
sobrescrever um arquivo que não o carrega, então uma declaração escrita à mão
nunca se perde. `--source` e `--out` precisam ficar dentro do diretório do
projeto.

Nada muda no `check` nem no `build`: o `config.lua` continua sendo copiado para o
resource como está e nunca é compilado.

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

Informa as versões da CLI e do Node.js em uso, se há um interpretador Lua 5.1 no
`PATH` para o [`luam test`](#luam-test), cada editor suportado detectado no `PATH`
e se aquele editor tem a extensão do Luam. Anexe a saída dele ao relatar um
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
| `--manifest <path>` | `build`, `check`, `dev`, `ensure`, `format`, `test`, `trace` | Carrega este arquivo em vez do `.luam.manifest`. |
| `--bundle` / `--no-bundle` | `build`, `ensure` | Seleciona bundle ou árvore. `dev` não possui nenhuma das duas. |
| `--watch` / `--no-watch` | `check`, `dev`, `ensure` | Mantém observando, ou roda uma vez. `dev` e `ensure` observam por padrão; o `check` não. |
| `--no-map` | `build`, `dev`, `ensure` | Desliga a geração do mapa. Para `build`, também remove o mapa padrão existente depois do sucesso. |
| `--offline` | `build`, `dev`, `ensure` | Pula a consulta de `min_mta_version`. `LUAM_OFFLINE` faz o mesmo. |
| `--json` | `build`, `check` | Escreve um documento legível por máquina no stdout em vez do relatório humano. |
| `--check` | `format` | Não escreve nada e lista os arquivos que diferem. Sai com `1` quando algum difere. |
| `--source <path>` | `config` | Arquivo Lua nativo a ler. Padrão `config.lua`. |
| `--out <path>` | `config` | Arquivo de declaração a escrever. Padrão `config.d.luam`. |
| `--write` | `config` | Escreve o arquivo de declaração em vez de imprimi-lo. |
| `--lua <path>` | `test` | Interpretador Lua 5.1 que roda os testes. `LUAM_LUA` faz o mesmo. |
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

## Saída legível por máquina

O `luam check --json` e o `luam build --json` escrevem **um documento JSON no
stdout e mais nada ali**. O relatório humano — progresso, tempos de fase, os
trechos de diagnóstico e a linha de resumo — não é impresso, então o fluxo é
parseável com um único `JSON.parse`. Os códigos de saída não mudam: o documento
diz o que aconteceu, o código diz se passou, e nenhum dos dois precisa fazer o
trabalho do outro.

```json
{
    "version": 1,
    "luam": "0.19.5",
    "command": "check",
    "success": false,
    "diagnostics": [
        {
            "path": "src/server/main.luam",
            "line": 2,
            "column": 12,
            "endLine": 2,
            "endColumn": 17,
            "severity": "error",
            "code": "check-type-mismatch",
            "message": "Return value expects \"number\" but received \"string\"."
        }
    ],
    "summary": { "errors": 1, "warnings": 0, "files": 3, "durationMs": 4 }
}
```

Toda chave de um diagnóstico está sempre presente. `path`, `line`, `column`,
`endLine` e `endColumn` são `null` quando o diagnóstico não tem localização — um
problema de manifesto ou de configuração, por exemplo — e `endLine`/`endColumn`
são `null` quando o compilador informa um ponto em vez de um intervalo. O `path`
é relativo ao diretório do projeto, o mesmo caminho que a saída humana imprime,
de modo que os dois se conferem a olho.

### Com o que você pode contar

| Estável | Não estável |
| --- | --- |
| Todo campo acima existe, com o tipo mostrado. | O texto de `message`. Compare pelo `code`. |
| Os valores de `code` e o que significam. | A ordem de `diagnostics` além da ordenação que a saída humana já aplica. |
| `version` está presente e é um número. | `durationMs`, que é uma medição. |
| Os códigos de saída batem com a execução sem `--json`. | Se uma versão futura acrescenta campos. |

Um campo pode ser **acrescentado** sem mudar a versão; um consumidor precisa
ignorar campos que não conhece. Um campo não pode ser removido, nem mudar de tipo
ou de significado, sem elevar o `version`.

### O que não tem

O `--json` pertence ao `check` e ao `build` apenas, e passá-lo a qualquer outro
comando sai com `2`. O `test` reporta execuções de teste, cujo formato de máquina
é um documento diferente deste; emitir só os diagnósticos de compilação seria meio
relatório. O `dev` e o `ensure` são laços de rebuild, e um documento por rebuild é
um fluxo, não o documento único que este esquema descreve. Pela mesma razão,
`--json` junto com `--watch` sai com `2`.

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

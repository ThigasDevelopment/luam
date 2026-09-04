# Desenvolvimento diário

`build` serve para produzir um resource. `ensure` e `dev` são os comandos que você
deixa rodando enquanto trabalha.

## `luam ensure`

Um comando constrói o resource, espelha-o para dentro do seu servidor MTA e
repete as duas coisas a cada gravação.

```bash
luam ensure
```

Quanto ele faz depende do que o `.luam.manifest` fornece:

| Configurado | O que o `ensure` faz |
| --- | --- |
| nada | Reporta um diagnóstico. `serverPath` é obrigatório. |
| `serverPath` | Escreve o resource dentro do servidor. Você reinicia. |

O `ensure` nunca escreve em `<outDir>/<name>`. Use `luam build` quando quiser uma
cópia local do resource gerado.

### Conseguindo o restart

O `ensure` escreve arquivos e para por aí. Existem dois arranjos que fazem o
restart acontecer sozinho, e qual deles você quer depende de quantos resources
você está tocando.

**Um resource.** Rode `luam dev --start-server` no diretório do resource: a CLI
passa a ser dona do processo do MTA e escreve `refresh`, `stop <name>` e
`start <name>` no console dele depois de uma sincronização que mudou algo. Sem a
flag, digite esses comandos você mesmo no console do servidor.

**Uma pasta de resources.** Uma instalação do MTA ocupa uma porta, então dois
laços `luam dev --start-server` não podem rodar contra ela ao mesmo tempo.
Coloque um [`.luam.server`](/pt-br/reference/server-file) na raiz da pasta e rode
`luam dev` **ali** — veja
[Um workspace de resources](#um-workspace-de-resources) abaixo.

### O que acontece a cada gravação

1. **Rebuild.** Apenas os arquivos cujo código mudou são analisados e verificados
   de novo, e apenas os arquivos cujas declarações mudaram invalidam os arquivos
   que as enxergam.
2. **Parar no erro.** Se algo for erro, ele é reportado e nada mais roda. Sem
   sincronização, sem restart, e o resource anterior continua no servidor.
3. **Sincronizar.** Escreve `<serverPath>/<resourcesDir>/<name>`, pulando arquivos
   idênticos e apagando arquivos gerados que o projeto não produz mais.
4. **Reiniciar** — só com `dev --start-server`, e só quando a sincronização
   realmente mudou algum arquivo.

### Lendo a saída

Cada execução é separada por uma régua com horário, e cada fase informa o que fez
e quanto custou. Esta é uma ilustração de um rebuild quente em um projeto de 42
arquivos, não uma captura, porque os números só aparecem depois que a observação
tem algo para reaproveitar:

```
---------------------------------------- rebuild at 14:22:07
Discovery: done in 1 ms.
Compile: 42 files in 2 ms.
Assembly: done in 0 ms.
Manifest: done in 0 ms.
Build passed: 42 files, 41 reused, 0 errors, 0 warnings in 3 ms.
Sync: 18 files in 1 ms.
Synced 1 file to "C:/MTA Server/mods/deathmatch/resources/gamemode-race" (0 removed).
```

`reused` é o cache incremental em ação: 41 de 42 arquivos vieram do cache e só o
arquivo que você salvou foi recompilado. Ele só aparece quando um rebuild tem algo
para reaproveitar, então o primeiro build nunca o mostra.

Um rebuild que falha deixa o servidor intacto:

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
Skipping sync and restart because the build reported errors.
```

## `luam dev`

`dev` roda o fluxo completo do `ensure` e ainda acompanha
`<serverPath>/mods/deathmatch/logs/server.log`. Ele começa no fim do arquivo,
então o histórico existente não é impresso.

```bash
luam dev
luam dev --start-server
```

Use `luam server` em um segundo terminal quando quiser o console interativo do
MTA, ou `luam dev --start-server` para usar um único comando. A forma integrada
espera a prontidão do MTA antes de sincronizar, atualiza e inicia ou reinicia o
resource pelo console possuído e encerra o processo ao receber `Ctrl+C`.

Registros do servidor atribuídos ao resource ativo e chamadas de
`outputDebugString` do cliente retransmitidas compartilham um único fluxo estável:

```
[14:22:07][server][info] Resource started
[14:22:09][client][warn] Missing vehicle model
```

A chamada do cliente continua chegando ao console de debug do MTA. O `dev`
adiciona um relay de evento do MTA validado e com limite de taxa **apenas** ao
resource sincronizado no servidor. `build` e `ensure` nunca incluem esses helpers
de desenvolvimento, e a próxima sincronização normal os remove.

Saídas da engine sem identidade de resource podem aparecer como saída simples do
servidor; registros atribuídos a outros resources são ignorados.

Ajuste o relay no `.luam.manifest`, ou de uma vez para um workspace inteiro no
`.luam.server`:

```luam
development = {
    logs = {
        maxMessageLength = 2048,
        rateLimit = 20,
        rateWindowMs = 1000,
    },
}
```

## Um workspace de resources

Um diretório que contém um [`.luam.server`](/pt-br/reference/server-file) e um
resource por subdiretório é um **workspace**:

```
resources/
  .luam.server
  gamemode-race/
    .luam.manifest
  scoreboard/
    .luam.manifest
```

O arquivo nomeia a instalação uma vez, então nenhum manifesto repete o
`serverPath` e mudar o servidor de lugar é uma edição só. O `luam dev` rodado
nessa raiz inicia **um** servidor MTA, espera a prontidão, acompanha o log e não
anexa nada:

```
Started the MTA server at "C:/MTA Server" and waited for readiness in 4.20 s.
Watching nothing yet. Type "ensure <resource>" to attach one, "help" for the rest.
Resources here: "gamemode-race", "scoreboard".
[14:22:09][server][info] Server started and is ready to accept connections
```

Esse bloco é uma ilustração, não uma captura — os tempos e a linha de log vêm de
um servidor real, que o build da documentação não executa.

De dentro dessa sessão você nomeia o que está tocando. O `ensure gamemode-race`
constrói, sincroniza, inicia e pendura o resource no watch; o `drop` tira do
watch e deixa a cópia publicada como está; o `rebuild` força um ciclo; o `list`
diz o que está anexado e como foi o último build de cada um; o `help` nomeia os
cinco verbos. Qualquer outra linha — `refresh`, `stop`, um comando do seu
gamemode — chega ao console do MTA sem alteração, e uma linha que começa com
espaço é repassada mesmo quando a primeira palavra é um verbo.

O conjunto de resources em desenvolvimento é descoberto na velocidade em que o
trabalho muda e nunca é escrito em lugar nenhum. Veja
[a referência da CLI](/pt-br/tooling/cli#a-sessao-do-workspace) para o
vocabulário inteiro.

## Parando e execuções únicas

`Ctrl+C` encerra a observação. `--no-watch` roda o ciclo inteiro exatamente uma
vez, que é o que uma tarefa do editor ou um script de implantação quer:

```bash
luam ensure --no-watch
```

## A partir do editor

A extensão do VS Code liga **Luam: Ensure Resource** a `Ctrl+Alt+E`
(`Cmd+Alt+E`), que roda `luam ensure` em um terminal dedicado para o projeto
atual. Veja [Editores](/pt-br/tooling/editors).

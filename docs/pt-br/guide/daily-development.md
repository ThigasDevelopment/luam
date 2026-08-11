# Desenvolvimento diário

`build` serve para produzir um resource. `ensure` e `dev` são os comandos que você
deixa rodando enquanto trabalha.

## `luam ensure`

Um comando constrói o resource, espelha-o para dentro do seu servidor MTA,
reinicia-o e repete tudo isso a cada gravação.

```bash
luam ensure
```

Quanto ele faz depende do que o `luam.json` fornece:

| Configurado | O que o `ensure` faz |
| --- | --- |
| nada | Reporta um diagnóstico. `serverPath` é obrigatório. |
| `serverPath` | Escreve o resource dentro do servidor. Você reinicia. |
| `serverPath` + `transport` | Também atualiza e reinicia o resource para você. |

O `ensure` nunca escreve em `<outDir>/<name>`. Use `luam build` quando quiser uma
cópia local do resource gerado.

### Conseguindo o restart

Adicione um transporte `http` apontando para um resource no seu servidor que
exporte `refreshResources` e `restartResource`:

<<< @/snippets/local-development/luam.server.json

```bash
set LUAM_MTA_PASSWORD=...       # Windows
export LUAM_MTA_PASSWORD=...    # macOS e Linux
luam ensure
```

Use `passwordEnv`, que nomeia uma variável de ambiente, em vez de um `password`
embutido: nenhuma linha de log e nenhum diagnóstico jamais imprime o valor. A
interface HTTP do MTA não tem TLS, então mantenha `host` em `127.0.0.1` e faça um
túnel por SSH em vez de expor a porta. Veja
[Fronteiras de segurança](/pt-br/mta/security).

### O que acontece a cada gravação

1. **Rebuild.** Apenas os arquivos cujo código mudou são analisados e verificados
   de novo, e apenas os arquivos cujas declarações mudaram invalidam os arquivos
   que as enxergam.
2. **Parar no erro.** Se algo for erro, ele é reportado e nada mais roda. Sem
   sincronização, sem restart, e o resource anterior continua no servidor.
3. **Sincronizar.** Escreve `<serverPath>/<resourcesDir>/<name>`, pulando arquivos
   idênticos e apagando arquivos gerados que o projeto não produz mais.
4. **Reiniciar** — mas só quando a sincronização realmente mudou algum arquivo.

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
Restart: done in 24 ms.
Restarted "gamemode-race" through the "http" transport.
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
```

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

Ajuste o relay no `luam.json`:

```json
{
    "development": {
        "logs": {
            "maxMessageLength": 2048,
            "rateLimit": 20,
            "rateWindowMs": 1000
        }
    }
}
```

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

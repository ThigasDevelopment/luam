# Desenvolvimento local

O laço que você deixa rodando: construir, sincronizar no servidor, acompanhar o
log, repetir a cada gravação.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).
- Um servidor MTA na mesma máquina.
- Para o restart automático: `luam dev --start-server`, para que a CLI seja dona
  do processo do servidor e possa escrever no console dele.

## Árvore de arquivos

```
luam-docs-local-development/
├── .luam.manifest
└── src/
    └── server/
        └── main.luam
```

## Código

<<< @/snippets/local-development/.luam.manifest{js}

<<< @/snippets/local-development/src/server/main.luam

## Ligando ao servidor

Adicione `serverPath`. Este é o manifesto que o laço realmente usa:

<<< @/snippets/local-development/luam.server.json

## Comandos

```bash
luam ensure            # construir, sincronizar, observar
luam dev               # o mesmo laço, mais um fluxo ao vivo do log do servidor
luam dev --start-server # também é dono do servidor e reinicia o resource
```

## Resultado esperado

Cada gravação imprime uma régua com horário e um relatório por fase:

```
---------------------------------------- rebuild at 14:22:07
Discovery: done in 1 ms.
Compile: 42 files in 2 ms.
Build passed: 42 files, 41 reused, 0 errors, 0 warnings in 3 ms.
Sync: 18 files in 1 ms.
Synced 1 file to "C:/MTA Server/mods/deathmatch/resources/luam-docs-local-development" (0 removed).
```

`reused` é o cache incremental: apenas o arquivo que você salvou foi recompilado.

Com `luam dev`, registros do servidor para este resource e chamadas de
`outputDebugString` do cliente retransmitidas compartilham um fluxo:

```
[14:22:07][server][info] resource started (1)
[14:22:09][client][info] ping answered
```

## Quando um build falha

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
Skipping sync and restart because the build reported errors.
```

Nada é sincronizado e nada é reiniciado, então o jogo em execução mantém a última
versão que compilou.

## Carregando a sincronização

O `ensure` espelha os arquivos e para. Reinicie o resource você mesmo:

```
refresh
restart luam-docs-local-development
```

## Parando

`Ctrl+C` encerra a observação. `--no-watch` roda o ciclo exatamente uma vez, que é
o que uma tarefa do editor ou um script de implantação quer:

```bash
luam ensure --no-watch
```

No VS Code, **Luam: Ensure Resource** (`Ctrl+Alt+E`) roda o mesmo laço em um
terminal.

## Limpeza

O `luam dev` adiciona helpers de log exclusivos de desenvolvimento ao resource
**sincronizado**. Eles nunca são escritos por `build` ou `ensure`, e a próxima
sincronização normal os remove — então rode `luam ensure --no-watch` uma vez antes
de publicar, ou gere um resource novo com `luam build`.

## Nota de segurança

A CLI nunca abre conexão com um servidor em execução: o `ensure` só escreve
arquivos dentro de `serverPath`, e o `dev --start-server` escreve em um console
que ele possui. Nenhuma credencial pertence ao manifesto. Veja
[Fronteiras de segurança](/pt-br/mta/security).

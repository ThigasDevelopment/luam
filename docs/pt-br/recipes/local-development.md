# Desenvolvimento local

O laço que você deixa rodando: construir, sincronizar no servidor, reiniciar,
acompanhar o log, repetir a cada gravação.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).
- Um servidor MTA na mesma máquina, ou alcançável por um túnel.
- Para o restart automático: um resource nesse servidor exportando
  `refreshResources` e `restartResource`, e uma entrada de ACL concedendo acesso
  HTTP ao usuário configurado.

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

Adicione `serverPath` e um transporte. Este é o manifesto que o laço realmente
usa:

<<< @/snippets/local-development/luam.server.json

```bash
set LUAM_MTA_PASSWORD=...       # Windows
export LUAM_MTA_PASSWORD=...    # macOS e Linux
```

`passwordEnv` nomeia uma variável de ambiente em vez de guardar a senha, e nenhuma
linha de log ou diagnóstico imprime o valor.

## Comandos

```bash
luam ensure     # construir, sincronizar, reiniciar, observar
luam dev        # o mesmo laço, mais um fluxo ao vivo do log do servidor
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
Restart: done in 24 ms.
Restarted "luam-docs-local-development" through the "http" transport.
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

## Sem transporte

Com apenas `serverPath`, o `ensure` espelha os arquivos e para. Reinicie o resource
você mesmo:

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

A interface HTTP do MTA não tem TLS, então a autenticação básica trafega em claro.
Mantenha `host` em `127.0.0.1` e faça um túnel da porta por SSH em vez de expô-la.
Um host que não é loopback reporta `config-remote-plaintext-transport`. Veja
[Fronteiras de segurança](/pt-br/mta/security).

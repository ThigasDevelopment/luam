# CI e implantação

## Verificando em CI

`luam check` compila tudo, imprime diagnósticos, não escreve nada e sai com `1`
quando algo é erro. Essa é toda a integração.

```yaml
name: Resource

on:
    push:
    pull_request:

permissions:
    contents: read

jobs:
    check:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: '20'
            - run: npx --yes @thigasdevelopment/luam check
```

`npx` não precisa de instalação global e guarda o download em cache. O `check` não
faz consulta de release alguma, então nunca alcança a rede e não possui a flag
`--offline`. O `build` faz, e o `--offline` dele pula a consulta — um build sem
rede continua funcionando, mas pular a consulta de propósito deixa o log limpo.

A saída descarta todas as sequências de escape quando o fluxo não é um terminal,
então a transcrição de CI não carrega caracteres de controle. `--no-color` força
isso em qualquer lugar.

## Códigos de saída

| Código | Significado | No pipeline |
| --- | --- | --- |
| `0` | Sucesso | O job passa. |
| `1` | Diagnósticos reportados | O job falha. |
| `2` | Linha de comando ou configuração inválida | Corrija o workflow ou o `luam.json`. |

## Produzindo um artefato do resource

```bash
npx --yes @thigasdevelopment/luam build --offline
```

O resource aparece em `<outDir>/<name>` — envie esse diretório como artefato do
build. Um build que reporta qualquer erro não escreve nada, então um artefato ou
está completo ou não existe.

```yaml
            - run: npx --yes @thigasdevelopment/luam build --offline
            - uses: actions/upload-artifact@v4
              with:
                  name: resource
                  path: build/my-resource
                  if-no-files-found: error
```

## Implantando

Duas formas funcionam bem.

**Copiar o artefato.** Extraia `build/<name>` em
`<Servidor MTA>/mods/deathmatch/resources/<name>` com o que a sua hospedagem
oferecer — rsync, SFTP, um script de deploy — e então `refresh` e
`restart <name>` no console do servidor.

**Rodar o laço uma vez.** Em uma máquina que alcança o servidor diretamente,
`ensure --no-watch` executa o ciclo inteiro exatamente uma vez: construir,
sincronizar, reiniciar.

```bash
export LUAM_MTA_PASSWORD=...
npx --yes @thigasdevelopment/luam ensure --no-watch
```

Essa é a forma "script de deploy" do laço de desenvolvimento, e usa as mesmas
regras de transporte — veja
[Fronteiras de segurança](/pt-br/mta/security).

## Segredos

- Nunca versione uma senha. `transport.passwordEnv` nomeia uma variável de
  ambiente, que é o que um cofre de segredos de CI fornece.
- O `.env` é versionado e declara chaves e padrões seguros; o
  `<outDir>/<name>/.env` implantado é escrito uma vez, com chaves de aparência
  sensível esvaziadas, e nunca é sobrescrito por um rebuild.
- A interface HTTP do MTA não tem TLS. Mantenha `host` em `127.0.0.1` e faça um
  túnel por SSH em vez de expor a porta a um runner.

## Um hook de pre-commit

```bash
#!/bin/sh
npx --yes @thigasdevelopment/luam check --no-color || exit 1
```

## Cache

A consulta de `min_mta_version` guarda o resultado em `.luam/mta-version.json`.
Manter esse diretório em cache entre execuções elimina a única requisição de saída
que um build faz; com `--offline` você nem precisa dele.

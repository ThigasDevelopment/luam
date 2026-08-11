# Primeiro resource

O menor resource que inicia, registra logs e para de forma limpa.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).
- Um servidor MTA:SA 1.5+ que você possa reiniciar.

## Árvore de arquivos

```
luam-docs-first-resource/
├── luam.json
└── src/
    └── server/
        └── main.luam
```

## Código

<<< @/snippets/first-resource/luam.json

<<< @/snippets/first-resource/src/server/main.luam

`resourceRoot` limita os dois handlers a este resource, então eles não disparam
para outros resources iniciando no mesmo servidor.

Repare no segundo handler: `${uptime}` interpola um **local**, porque uma
interpolação aceita um nome ou um caminho de membro e nunca uma expressão. Veja
[Strings de template](/pt-br/language/template-strings).

## Comandos

```bash
mkdir luam-docs-first-resource
cd luam-docs-first-resource
luam init --name luam-docs-first-resource
mkdir -p src/server
# crie src/server/main.luam com o código acima
luam check
luam build
```

## Resultado esperado

Todos os blocos abaixo são capturados de uma execução real e reverificados a cada
build da documentação.

<<< @/snippets/output/first-resource.check.txt{text}

O `luam build` informa cada fase e onde escreveu:

<<< @/snippets/output/first-resource.build.txt{text}

Ele produziu exatamente três arquivos:

<<< @/snippets/output/first-resource.tree.txt{text}

O `lib/server/string.lua` está ali por causa das strings de template. O
`string.lua` é o helper por trás da interpolação com `` ` ``, então até este
resource de um arquivo puxa um helper de runtime — e ele fica em `lib/server/`,
não na sua árvore de código.

Não há `.env` na saída, porque o projeto não tem um `.env` de onde declarar
chaves. Adicione um e o build escreve uma cópia implantada; veja
[Configuração de ambiente](/pt-br/recipes/environment-configuration).

O manifesto gerado:

<<< @/snippets/output/first-resource.meta.xml{xml}

Repare no que o compilador fez sozinho: os atributos de `<info>` vêm do
`luam.json`, o helper é listado antes do seu código, e a entrada de servidor não
carrega `type` nem `cache` porque ambos são o padrão do MTA. O `min_mta_version`
está ausente porque esta captura roda com `--offline`.

## Rodando

Copie `build/luam-docs-first-resource` para
`<Servidor MTA>/mods/deathmatch/resources/` e, no console do servidor:

```
refresh
start luam-docs-first-resource
```

O `<Servidor MTA>/mods/deathmatch/logs/server.log` ganha:

```
luam-docs-first-resource started at 1234567
```

## Limpeza

```
stop luam-docs-first-resource
```

Apague a pasta do resource no servidor e apague `build/` localmente.

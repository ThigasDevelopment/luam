# Testando um módulo

Um módulo compartilhado, um módulo de servidor e os dois arquivos de teste que os
cobrem. Os arquivos de teste rodam no `luam test` e nunca chegam ao resource
construído.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).
- Um interpretador **Lua 5.1** no `PATH`. O `luam doctor` diz se você tem um.

```bash
luam doctor
```

## Árvore de arquivos

```
luam-docs-testing-a-module/
├── .luam.manifest
└── src/
    ├── shared/scoreboard.luam
    ├── shared/scoreboard.test.luam
    ├── server/announce.luam
    └── server/announce.test.luam
```

## Código

<<< @/snippets/testing-a-module/.luam.manifest{js}

<<< @/snippets/testing-a-module/src/shared/scoreboard.luam

<<< @/snippets/testing-a-module/src/shared/scoreboard.test.luam

<<< @/snippets/testing-a-module/src/server/announce.luam

<<< @/snippets/testing-a-module/src/server/announce.test.luam

## Por que isso funciona

Um arquivo terminado em `.test.luam` é um arquivo de teste. Ele fica fora de
`sources`, então o `luam build` nunca o vê, e `describe`, `test` e `expect`
existem apenas dentro de um — um arquivo que não é de teste e chama `test`
continua reportando global desconhecida.

O `scoreboard.test.luam` está em `src/shared`, então resolve para o ambiente
`shared` e enxerga tudo que um arquivo compartilhado enxerga. O
`announce.test.luam` está em `src/server` e resolve para `server`, então roda
depois que o bundle `shared` carrega e pode chamar `announceScore`.

`announceScore` chama `outputChatBox`, que não existe fora do MTA. O harness
troca cada função do MTA por um stub que registra com o que foi chamado e devolve
`nil` — é isso que o `mta.calls('outputChatBox')` lê de volta. O stub registra a
chamada; ele não entrega mensagem nenhuma no chat. Para um stub responder alguma
coisa, use `mta.returns(name, value)` ou `mta.stub(name, fn)`.

## Comandos

```bash
luam test
luam check
luam build
```

## Resultado esperado

O `luam test` imprime uma linha por teste e um resumo:

```
  + shared · formatScore > joins the name and the points
  + shared · rankOf > returns gold at one hundred points
  + shared · rankOf > returns bronze below fifty points
  + server · sends one chat message for one score
Tests passed: 4 tests passed, 0 failed in 78 ms.
```

O `luam check` compila o resource, não os testes:

<<< @/snippets/output/testing-a-module.check.txt{text}

E o resource construído não contém arquivo de teste nenhum:

<<< @/snippets/output/testing-a-module.tree.txt{text}

## Um teste falhando

Mude o rank esperado e rode o `luam test` de novo. A posição é no código `.luam`,
não no Lua gerado:

```
  x shared · rankOf > returns gold at one hundred points
      src/shared/scoreboard.test.luam:9:9 expected "silver", got "gold"
Tests failed: 3 tests passed, 1 failed in 74 ms.
```

O comando sai com `1`, então um job de CI falha nele. Veja
[CI e implantação](/pt-br/tooling/ci-and-deployment).

## O que um teste não consegue fazer

Um stub registra as chamadas que o seu código fez. Ele não roda o MTA, então um
teste não consegue mostrar que um jogador realmente recebeu a mensagem, que um
elemento foi criado ou que um evento disparou. Isso exige um servidor rodando — o
`luam test` nunca abre um.

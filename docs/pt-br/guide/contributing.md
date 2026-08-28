# Contribuindo

O Luam é desenvolvido abertamente em
[ThigasDevelopment/luam](https://github.com/ThigasDevelopment/luam). As regras
ficam no repositório, ao lado do código que governam, então esta página aponta
para elas em vez de repeti-las onde ficariam desatualizadas.

| Documento | O que responde |
| --- | --- |
| [CONTRIBUTING.md](https://github.com/ThigasDevelopment/luam/blob/main/CONTRIBUTING.md) | Como preparar o workspace, quais comandos reproduzem cada verificação e o que um revisor cobra. |
| [SECURITY.md](https://github.com/ThigasDevelopment/luam/blob/main/SECURITY.md) | Como relatar uma vulnerabilidade em canal privado, e o que está no escopo. |
| [CODE_OF_CONDUCT.md](https://github.com/ThigasDevelopment/luam/blob/main/CODE_OF_CONDUCT.md) | O padrão de conduta em issues, pull requests e revisões. |

## O que abrir

- **Um bug** — o compilador, a CLI, o language server ou o Lua gerado erra
  alguma coisa. O formulário pede as versões do Luam e do Node, o lado do MTA e
  o menor código que reproduz o problema, porque um relato sem isso custa uma
  ida e volta.
- **Uma proposta** — nova sintaxe, nova semântica ou mudança no Lua que o
  compilador emite. São decididas por escrito primeiro, e "não planejado" é uma
  resposta possível, com o motivo registrado.
- **Um problema de documentação** — uma página errada, desatualizada ou em que
  os dois idiomas se contradizem.
- **Uma vulnerabilidade** — nunca como issue. Use o canal privado descrito em
  [SECURITY.md](https://github.com/ThigasDevelopment/luam/blob/main/SECURITY.md).

## O que o pipeline espera

Quatro verificações precisam passar antes de uma mudança ser integrada: a
checagem de tipos, as suítes de teste no Node 22 e no Node 24, o build com o
teste de fumaça de produção e a verificação do manual. Cada uma é um comando que
você roda localmente, listado no `CONTRIBUTING.md`.

Outros dois jobs rodam e nunca bloqueiam: o benchmark do compilador e a auditoria
de dependências. Um job consultivo vermelho é informação, não rejeição.

Um pull request vindo de um fork espera a aprovação do mantenedor antes de
qualquer coisa começar, a cada push. Isso é proposital — uma execução de fork
roda o código dela nos runners do projeto — e uma execução marcada como
aguardando aprovação não é um pipeline quebrado.

## Duas coisas que surpreendem

**O catálogo do MTA é gerado e versionado.** A checagem de tipos regenera o
catálogo offline e falha se os arquivos versionados diferirem, então uma mudança
no catálogo é commitada junto com o que a produziu. Veja
[APIs e eventos do MTA](/pt-br/mta/apis-and-events).

**O inglês é o idioma de origem.** Toda página existe em `en` e em `pt-br`, e o
build do manual falha quando uma delas está faltando. Uma página que só faz
sentido em um idioma não pertence ao manual.

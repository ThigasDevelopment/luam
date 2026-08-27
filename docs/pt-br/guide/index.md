# Guia

Esta seção leva você de uma pasta vazia até um resource (recurso do MTA) rodando
em um servidor, e depois até o laço que você deixa rodando enquanto trabalha.

| Página | O que cobre |
| --- | --- |
| [Luam em comparação](/pt-br/guide/comparison) | O que muda em relação a Lua 5.1, Luau e TypeScript. |
| [Instalação](/pt-br/guide/installation) | Node.js, a CLI `luam` e a extensão do editor. |
| [Início rápido](/pt-br/guide/quick-start) | Criar, escrever, verificar, construir e iniciar um resource. |
| [Estrutura do projeto](/pt-br/guide/project-layout) | A árvore de código, o que os nomes de pasta significam e o que um build escreve. |
| [Desenvolvimento diário](/pt-br/guide/daily-development) | `luam ensure`, `luam dev`, rebuilds incrementais e logs. |
| [Como o Luam funciona](/pt-br/guide/how-luam-works) | Os cinco estágios entre um arquivo `.luam` e um resource rodando. |
| [Migração](/pt-br/guide/migration) | O que cada release pede que você mude, do mais antigo ao mais novo. |
| [Solução de problemas](/pt-br/guide/troubleshooting) | As falhas que um projeto novo encontra, e como ler um diagnóstico. |

## Antes de começar

Você precisa de duas coisas: [Node.js](https://nodejs.org/) 20 ou mais recente, e
um servidor [MTA:SA](https://multitheftauto.com/) 1.5+ que você possa reiniciar.

Você **não** precisa de um toolchain de Lua. O compilador emite texto Lua; ele
nunca executa Lua e nunca embute um interpretador.

```bash
node --version
```

Se isso imprimir algo abaixo de `v20`, atualize antes de continuar.

## O que você vai ter no final

Um diretório de projeto com os seus fontes `.luam` e um `.luam.manifest`, e um
diretório de build com um resource completo do MTA:

```
my-resource/
├── .luam.manifest
├── src/
│   ├── shared/
│   ├── server/
│   └── client/
└── build/my-resource/     ← copie isto para o seu servidor MTA
```

Nada mais é criado. `luam init` escreve `.luam.manifest` e para, então não existe
framework nem árvore de exemplo para apagar antes da sua primeira linha de
código.

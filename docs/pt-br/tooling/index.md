# Ferramentas

Tudo em volta da linguagem: a CLI que compila e implanta, o manifesto que
configura um projeto e o suporte de editor que roda o mesmo verificador.

| Página | O que cobre |
| --- | --- |
| [Comandos da CLI](/pt-br/tooling/cli) | `init`, `check`, `build`, `ensure`, `dev`, `setup`, `doctor`, todas as opções e códigos de saída. |
| [.luam.manifest](/pt-br/tooling/luam-manifest) | Cada campo de configuração, com padrões e regras de validação. |
| [Editores](/pt-br/tooling/editors) | A extensão do VS Code, forks suportados, comandos e configurações. |
| [O tema Luam](/pt-br/tooling/theme) | O contrato de cores, cada elemento que ele pinta e como instalar por editor. |
| [Servidor de linguagem](/pt-br/tooling/language-server) | Rodando o LSP independente de editor a partir de qualquer cliente. |
| [CI e implantação](/pt-br/tooling/ci-and-deployment) | Verificando em um pipeline e publicando um resource. |

## As peças

| Pacote | O que é |
| --- | --- |
| `@thigasdevelopment/luam` | A CLI publicada. Um comando, `luam`. |
| `@luam/compiler` | Lexer, parser, binder, checker, emitter e montagem do projeto. |
| `@luam/lsp` | O servidor de linguagem, feito sobre o mesmo frontend. |
| `luam` (VS Code) | A extensão: gramática, cliente, comandos. |
| `@luam/mta-types` | O catálogo gerado do MTA. |
| `@luam/runtime` | Os helpers Lua de runtime que um build pode copiar. |
| `@luam/theme` | A tabela de papéis de onde todo tema de editor é gerado. |
| `@luam/template` | O `.luam.manifest` inicial que o `luam init` escreve. |

O editor e o build compartilham o frontend do compilador, e é por isso que eles
nunca discordam sobre um arquivo.

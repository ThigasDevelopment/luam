# Compatibilidade

## Alvo de saída

| Alvo | Versão |
| --- | --- |
| Lua | **5.1** |
| Multi Theft Auto | 1.5 ou mais recente |

O compilador emite apenas texto Lua 5.1. Ele nunca executa Lua, nunca embute um
interpretador e nunca exige um toolchain de Lua na máquina que constrói.

Construções de Lua 5.2 em diante — `goto`, divisão inteira, operadores bit a bit —
não são emitidas, porque o MTA roda 5.1.

## Toolchain

| Requisito | Versão |
| --- | --- |
| Node.js | 20, 22 e 24 são testados na CI |
| npm | Qualquer versão que acompanhe um Node.js suportado |
| pnpm | 9 ou mais recente, para construir a partir do código-fonte |

## Editores

| Editor | Launcher | `luam setup` | Notas |
| --- | --- | --- | --- |
| Visual Studio Code | `code` | sim | Marketplace, depois o `.vsix` da release |
| VS Code Insiders | `code-insiders` | sim | Marketplace, depois o `.vsix` da release |
| Cursor | `cursor` | sim | Marketplace do editor, depois o `.vsix` da release |
| VSCodium | `codium` | sim | Open VSX quando disponível, depois o `.vsix` da release |
| Windsurf | `windsurf` | sim | Marketplace do editor, depois o `.vsix` da release |
| IDEs da JetBrains | — | não | Precisam de um plugin separado. |
| Neovim, Zed, Sublime Text | — | não | Precisam do próprio cliente LSP. Veja [Servidor de linguagem](/pt-br/tooling/language-server). |

Outros forks compatíveis com o VS Code geralmente conseguem instalar o `.vsix` da
release manualmente. O `luam setup` não declara suporte até que o launcher e as
APIs de extensão de um fork estejam estáveis.

## Sistemas operacionais

Windows, macOS e Linux são suportados para a CLI e para a extensão do editor. O
tratamento de caminhos normaliza separadores, então um `.luam.manifest` escrito em uma
plataforma funciona em outra.

`serverPath` aponta para a raiz do servidor MTA na máquina que roda a CLI, então o
`ensure` precisa de um servidor local ou de um caminho montado.

O início de servidor gerenciado por `luam server` e `luam dev --start-server` tem
suporte no Windows e Linux. Os outros comandos da CLI mantêm suporte ao macOS.

## Rede

Um build faz exatamente um tipo de requisição de saída: a consulta de
`min_mta_version` contra a última versão publicada do MTA, guardada em
`.luam/mta-version.json`.

| Situação | Resultado |
| --- | --- |
| Rede disponível | O valor é resolvido e guardado em cache. |
| Sem rede, com cache | O valor do cache é usado. |
| Sem rede e sem cache | Um warning; o elemento é omitido e o build tem sucesso. |
| `--offline` ou `LUAM_OFFLINE` | A consulta é pulada. |

Os pacotes do compilador não fazem nenhuma chamada de rede. Um build sem rede
sempre tem sucesso.

## Lua existente

Lua existente do MTA compila depois de três mudanças mecânicas:

| Lua | Luam |
| --- | --- |
| `-- comentário` | `# comentário` |
| `--[[ bloco ]]` | `#* bloco *#` |
| `a != b` (não padrão) | `a ~= b` |

Adicione `#!nocheck` ao arquivo e o build passa enquanto você anota módulo por
módulo. Veja [Rigor de verificação](/pt-br/language/strictness).

## Versionamento da documentação

Este manual documenta a versão do Luam citada no aviso no topo de cada página.
Mudanças na documentação estão no
[changelog da documentação](/pt-br/changelog); mudanças no compilador estão no
[CHANGELOG](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md) do
repositório.

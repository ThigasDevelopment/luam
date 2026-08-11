# Editores

A extensão **Luam** inicia um servidor de linguagem construído sobre o mesmo
frontend que a CLI usa, então o editor e o build nunca discordam sobre um arquivo.

## O que você ganha

| Recurso | Detalhes |
| --- | --- |
| Realce de sintaxe | Arquivos `.luam`, incluindo anotações de tipo, diretivas `#!` e strings de template. |
| Diagnósticos | Ao abrir e a cada tecla, limpos quando você corrige o arquivo. |
| Completação | Símbolos do escopo, globais do workspace, APIs do MTA no ambiente do arquivo, palavras-chave. |
| Completação de membros | `.` completa campos e métodos estáticos; `:` completa métodos de instância, incluindo membros herdados do MTA. |
| Cabeçalho de classe | Depois de `class Nome `, completa `extends` e `implements`, e então as classes ou interfaces declaradas que podem vir a seguir. |
| Ordenação de argumentos | Dentro de uma chamada, candidatos do tipo esperado do parâmetro vêm primeiro, depois funções que o retornam. |
| Hover | Tipo declarado ou inferido, assinatura da função e o ambiente de uma API do MTA. |
| Navegação | Ir para definição, encontrar referências e renomear — entre arquivos para globais. |

A completação tem exatamente o mesmo escopo do checker: `dxDrawText` nunca aparece
em um arquivo de servidor, `kickPlayer` nunca aparece em um de cliente.

## Instalando pela CLI

O comando detecta todos os editores suportados cujo launcher está no `PATH` e pede
confirmação antes de instalar:

```bash
luam setup
```

| Editor | Launcher | Automático | Distribuição |
| --- | --- | --- | --- |
| Visual Studio Code | `code` | sim | Marketplace, depois o `.vsix` da release |
| VS Code Insiders | `code-insiders` | sim | Marketplace, depois o `.vsix` da release |
| Cursor | `cursor` | sim | Marketplace do editor, depois o `.vsix` da release |
| VSCodium | `codium` | sim | Open VSX quando disponível, depois o `.vsix` da release |
| Windsurf | `windsurf` | sim | Marketplace do editor, depois o `.vsix` da release |

Outros forks compatíveis com o VS Code geralmente conseguem instalar o `.vsix` da
release manualmente, mas o `luam setup` não declara suporte até que o launcher e
as APIs de extensão do fork estejam estáveis. IDEs da JetBrains precisam de um
plugin separado. Neovim, Zed e Sublime Text precisam do próprio cliente LSP — veja
[Servidor de linguagem](/pt-br/tooling/language-server).

## Instalando a partir de uma release

Baixe `luam-<version>.vsix` da
[página de Releases](https://github.com/ThigasDevelopment/luam/releases) e então:

```bash
code --install-extension luam-0.1.1.vsix
cursor --install-extension luam-0.1.1.vsix
codium --install-extension luam-0.1.1.vsix
windsurf --install-extension luam-0.1.1.vsix
```

Em um editor compatível você também pode abrir **Extensions**, escolher **Install
from VSIX** e selecionar o arquivo baixado. Recarregue a janela quando for pedido.

## Instalando a partir do código-fonte

```bash
git clone https://github.com/ThigasDevelopment/luam.git
cd luam
pnpm install
pnpm --filter luam bundle
npx --yes @vscode/vsce package --no-dependencies --skip-license --out luam.vsix
code --install-extension luam.vsix
```

Para trabalhar na própria extensão, pule o empacotamento e abra um host de
desenvolvimento — ele recarrega a cada rebuild:

```bash
pnpm --filter luam bundle
code --extensionDevelopmentPath=packages/vscode
```

## Ativação

A extensão ativa quando o workspace contém um `luam.json` ou qualquer arquivo
`.luam`, então **abra a pasta do seu resource como raiz do workspace**. Ela observa
`**/*.luam`, então arquivos alterados fora do editor também chegam ao servidor.

## Comandos

| Comando | Atalho | O que faz |
| --- | --- | --- |
| **Luam: Ensure Resource** | `Ctrl+Alt+E` (`Cmd+Alt+E`) | Roda `luam ensure` em um terminal para o projeto atual. |
| **Luam: Restart Language Server** | — | Reinicia o servidor quando ele se perde. |

## Configurações

| Configuração | Padrão | Significado |
| --- | --- | --- |
| `luam.cliPath` | `"luam"` | Comando usado para rodar a CLI. Aponte para um bundle para testar uma build não publicada. |
| `luam.ensureWatch` | `true` | Passa `--watch` quando o comando ensure roda. |
| `luam.trace.server` | `"off"` | Registra o tráfego LSP. Use `"verbose"` ao relatar um bug. |

## Uma limitação conhecida

O servidor não reverifica um arquivo já aberto quando **outro** arquivo muda,
então uma violação entre módulos pode aparecer só no `luam check`. Rode
**Luam: Restart Language Server** para forçar uma nova varredura.

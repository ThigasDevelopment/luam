# Editores

A extensão **Luam** inicia um servidor de linguagem construído sobre o mesmo
frontend que a CLI usa, então o editor e o build nunca discordam sobre um arquivo.

## O que você ganha

| Recurso | Detalhes |
| --- | --- |
| Realce de sintaxe | Arquivos `.luam`, incluindo anotações de tipo, diretivas `#!` e strings de template. |
| Realce semântico | Uma nativa do MTA, uma chamada da biblioteca Lua, um método e uma função sua leem diferente, e uma nativa carrega o ambiente a que pertence. |
| Temas | `Luam Dark` e `Luam Light`, gerados de uma tabela de papéis compartilhada com os exports para Zed, Neovim e TextMate. |
| Diagnósticos | Ao abrir e a cada tecla, limpos quando você corrige o arquivo. |
| Completação | Símbolos do escopo, globais do workspace, APIs do MTA no ambiente do arquivo, palavras-chave. |
| Completação de membros | `.` completa campos e métodos estáticos; `:` completa métodos de instância, incluindo membros herdados do MTA. |
| Diretivas | Depois de `#!`, completa as diretivas de ambiente e de rigor, cada uma com o que faz. |
| Cabeçalho de classe | Depois de `class Nome `, completa `extends` e `implements`, e então as classes ou interfaces declaradas que podem vir a seguir. |
| Ordenação de argumentos | Dentro de uma chamada, candidatos do tipo esperado do parâmetro vêm primeiro, depois funções que o retornam. |
| Eventos | Dentro das aspas, completa os eventos alcançáveis da chamada; o handler e o payload de um evento conhecido carregam os parâmetros tipados. |
| Hover | Tipo declarado ou inferido, assinatura da função, o ambiente de uma API do MTA e o contrato de um evento. |
| Hover de documentação | As linhas de comentário `#` logo acima de qualquer declaração — função, método, classe, interface, enum, alias de tipo, evento declarado, campo, local ou global — aparecem sob a assinatura dela, na declaração e em cada uso. Decorators entre o comentário e a declaração não quebram o par. |
| Hover de palavra-chave | `self` carrega a classe a que está vinculado e a forma dessa classe; `super(...)` carrega como a implementação do pai é escolhida. |
| Hover de classe do MTA | Um nome de classe — `Player`, `Element`, `Vehicle` — carrega o que a classe é, a cadeia que ela herda, quanta superfície tem naquele ambiente e se é chamável. Ele descreve a classe em vez de listar os membros dela. |
| Hover de decorator | Os membros exatos que o decorator gera naquele ponto, onde ele pode ficar e os diagnósticos que pode emitir. |
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
code --install-extension luam-%LUAM_VERSION%.vsix
cursor --install-extension luam-%LUAM_VERSION%.vsix
codium --install-extension luam-%LUAM_VERSION%.vsix
windsurf --install-extension luam-%LUAM_VERSION%.vsix
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

A extensão ativa quando o workspace contém um `.luam.manifest` ou qualquer arquivo
`.luam`, então **abra a pasta do seu resource como raiz do workspace**. Ela observa
`**/*.luam`, `.luam.manifest` e `.env*`, então arquivos alterados fora do editor
também chegam ao servidor.

## Comandos

| Comando | Atalho | O que faz |
| --- | --- | --- |
| **Luam: Ensure Resource** | `Ctrl+Alt+E` (`Cmd+Alt+E`) | Roda `luam ensure` em um terminal para o projeto atual. |
| **Luam: Restart Language Server** | — | Reinicia o servidor quando ele se perde. |
| **Luam: Rescan Workspace** | — | Reconstrói o índice a partir do disco depois de mudanças feitas fora do editor. |

## Configurações

| Configuração | Padrão | Significado |
| --- | --- | --- |
| `luam.cliPath` | `"luam"` | Comando usado para rodar a CLI. Aponte para um bundle para testar uma build não publicada. |
| `luam.ensureWatch` | `true` | Passa `--watch` quando o comando ensure roda. |
| `luam.semanticHighlighting` | `true` | Colore Luam com os tokens semânticos do servidor. Desligue para manter só a camada da gramática. |
| `luam.trace.server` | `"off"` | Registra o tráfego LSP. Use `"verbose"` ao relatar um bug. |

## Cores

A extensão traz `Luam Dark` e `Luam Light`, gerados a partir de uma única
tabela de papéis, para que todo editor leia Luam do mesmo jeito. Instalar a
extensão não muda as suas cores — escolha o tema em **File → Preferences →
Theme → Color Theme**. A regra que o tema ensina, e cada elemento que ele
pinta, estão em [O tema Luam](/pt-br/tooling/theme).

| Editor | Como instalar o tema | O que ele colore |
| --- | --- | --- |
| VS Code e seus forks | Vem com a extensão; escolha no seletor de temas. | Tudo: a camada da gramática e a camada semântica. |
| Zed | Copie `packages/theme/dist-themes/luam-zed.json` para `~/.config/zed/themes/`. | A camada base; registre o servidor de linguagem antes. |
| Neovim | Copie `packages/theme/dist-themes/luam.lua` para o runtime path e chame `require('luam').setup()`. | Tudo que o servidor reporta, inclusive o ambiente de uma nativa. |
| Sublime Text e TextMate | Instale `packages/theme/dist-themes/luam-dark.tmTheme` ou `luam-light.tmTheme` junto das gramáticas `.tmLanguage.json`. | Somente a camada da gramática. |

O formato TextMate não tem tokens semânticos, então nessa família uma nativa do
MTA e uma função sua compartilham a cor, assim como um parâmetro e um local.
Esse é o limite do formato, não um defeito do tema.

Zed e Neovim precisam do servidor de linguagem configurado antes de qualquer
coisa — veja [Servidor de linguagem](/pt-br/tooling/language-server).

### JetBrains

Não há esquema de cores Luam para as IDEs JetBrains. O formato delas é `.icls`,
o realce vem de um plugin de linguagem em vez de uma gramática, e as IDEs da
comunidade não mapeiam tokens semânticos LSP para um esquema de cores sem esse
plugin. Publicar um `.icls` que não colorisse nada específico de Luam seria uma
promessa pior do que não publicar nada. A questão reabre se um plugin Luam for
construído.

## O que uma mudança reverifica

Editar um arquivo republica diagnóstico daquele arquivo. Os outros só são
reanalisados quando a edição muda o que o arquivo **declara** — uma classe, uma
interface, um enum ou um global, incluindo o tipo de qualquer membro. Uma edição
de corpo custa um arquivo.

Uma edição de declaração custa os arquivos que alcançam aquela declaração, e só
eles. O servidor segue cada nome até o arquivo que o declara e depois pelas
superclasses, interfaces e tipos de membro daquele arquivo, então um pai
indireto ainda invalida. Um arquivo que nunca nomeia o que mudou fica intacto,
por mais arquivos que dividam o ambiente dele.

Nada disso espera um arquivo ser aberto. O servidor varre o workspace ao iniciar
e a extensão observa os padrões de arquivo acima, então um arquivo criado, movido
ou apagado fora do editor chega até ele sem reinício. **Luam: Rescan Workspace**
reconstrói o índice a partir do disco se alguma mudança escapou do observador, e
**Luam: Restart Language Server** é a saída se o servidor e o projeto ainda
discordarem.

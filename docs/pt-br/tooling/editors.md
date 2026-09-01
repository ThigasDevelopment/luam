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
| Completação de tabela literal | Onde cabe uma chave dentro de um literal anotado com um tipo de registro, a lista são as chaves que aquele tipo ainda permite e nada mais: as chaves já escritas saem da lista, e um discriminante escrito estreita uma união para os membros que ainda combinam. Onde cabe um valor, o escopo aparece inteiro. |
| Diretivas | Depois de `#!`, completa as diretivas de ambiente e de rigor, cada uma com o que faz. |
| Cabeçalho de classe | Depois de `class Nome `, completa `extends` e `implements`, e então as classes ou interfaces declaradas que podem vir a seguir. |
| Corpo de classe | Dentro do corpo de uma classe, completa `static` e — enquanto a classe não tiver um — um snippet de `constructor`. Nenhum dos dois aparece no topo do arquivo nem dentro de um método. |
| Ordenação de argumentos | Dentro de uma chamada, candidatos do tipo esperado do parâmetro vêm primeiro, depois funções que o retornam. |
| Eventos | Dentro das aspas, completa os eventos alcançáveis da chamada; o handler e o payload de um evento conhecido carregam os parâmetros tipados. |
| Hover | Tipo declarado ou inferido, assinatura da função, o ambiente de uma API do MTA e o contrato de um evento. |
| Hover de documentação | As linhas de comentário `#` logo acima de qualquer declaração — função, método, classe, interface, enum, alias de tipo, evento declarado, campo, local ou global — aparecem sob a assinatura dela, na declaração e em cada uso. Decorators entre o comentário e a declaração não quebram o par. |
| Hover de palavra-chave | `self` carrega a classe a que está vinculado e a forma dessa classe; `super(...)` carrega como a implementação do pai é escolhida; `static` carrega o que ele coloca no valor da classe e os diagnósticos que relatam uma leitura entre os dois espaços. |
| Hover de classe do MTA | Um nome de classe — `Player`, `Element`, `Vehicle` — carrega o que a classe é, a cadeia que ela herda, quanta superfície tem naquele ambiente e se é chamável. Ele descreve a classe em vez de listar os membros dela. |
| Hover de decorator | Os membros exatos que o decorator gera naquele ponto, onde ele pode ficar e os diagnósticos que pode emitir. |
| Navegação | Ir para definição, encontrar referências e renomear — entre arquivos para globais. |
| Símbolos do workspace | `Ctrl+T` encontra uma classe, uma interface, um enum, um alias de tipo, uma função ou um evento declarado em qualquer lugar do projeto, inclusive em arquivos que você nunca abriu. Cada resultado carrega o ambiente do arquivo em que vive. |
| Quick fixes | Um diagnóstico com exatamente um reparo correto oferece ele na lâmpada. Veja [a lista](#quick-fixes). |
| Formatação | Formata o documento ou a seleção, com formatar ao salvar. O estilo é [Formatação](/pt-br/reference/formatting). |
| Inlay hints | O que o checker inferiu, mostrado inline: o tipo de um local, o retorno de uma função e o tipo que um parâmetro de callback ganhou da chamada que o recebeu. Veja [os tipos](#inlay-hints). |

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

A extensão ativa quando o workspace contém um `.luam.manifest`, um
[`.luam.formatter`](/pt-br/reference/formatter-file) ou qualquer arquivo `.luam`,
então **abra a pasta do seu resource como raiz do workspace**. Ela observa
`**/*.luam`, `.luam.manifest`, `.luam.formatter` e `.env*`, então arquivos
alterados fora do editor também chegam ao servidor.

Cada um dos três tem ícone de arquivo e linguagem próprios: os fontes `.luam`, o
manifesto e o arquivo do formatador. O manifesto e o arquivo do formatador
compartilham o mesmo dialeto e o mesmo destaque; são linguagens separadas para que
a árvore de arquivos os distinga de relance.

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
| `luam.formatting` | `true` | Formata `.luam` com o language server. Desligue para deixar a formatação com outra ferramenta, ou com nenhuma — o servidor deixa de ser consultado, então `Shift+Alt+F` e formatar ao salvar ficam os dois quietos. |
| `luam.inlayHints.localTypes` | `true` | Mostra o tipo inferido de um local declarado sem anotação. |
| `luam.inlayHints.returnTypes` | `true` | Mostra o tipo de retorno inferido de uma função declarada sem anotação de retorno. |
| `luam.inlayHints.callbackParameterTypes` | `true` | Mostra o tipo que um parâmetro de callback ganhou da chamada que o recebeu. |
| `luam.inlayHints.parameterNames` | `false` | Mostra o nome do parâmetro na frente de um argumento literal em uma chamada. |
| `luam.semanticHighlighting` | `true` | Colore Luam com os tokens semânticos do servidor. Desligue para manter só a camada da gramática. |
| `luam.trace.server` | `"off"` | Registra o tráfego LSP. Use `"verbose"` ao relatar um bug. |

Mudar qualquer interruptor `luam.inlayHints.*` reinicia o language server, porque
o servidor os lê uma vez quando o cliente conecta. O reinício é o mesmo que
**Luam: Restart Language Server** faz, e custa uma varredura do workspace.

## Formatação

O servidor formata um documento inteiro e uma seleção. A extensão já se declara
o formatador padrão de `.luam`, então ligar formatar ao salvar é uma
configuração só:

```json
{
    "[luam]": {
        "editor.formatOnSave": true
    }
}
```

Um arquivo que não parseia devolve nenhuma edição, então salvar no meio da edição
nunca estraga o arquivo. [Formatação](/pt-br/reference/formatting) é o estilo que
ele escreve.

## Inlay hints

Luam apaga toda anotação, então nada do que o checker inferiu sobrevive na saída.
Os inlay hints devolvem isso à tela: o tipo aparece onde ele teria sido escrito,
esmaecido, e não faz parte do arquivo.

| Tipo | Onde aparece | Você vê |
| --- | --- | --- |
| Tipo do local | Um `local` com inicializador e sem anotação | `local count` vira `local count: number` |
| Tipo de retorno | Uma função, método ou callback sem anotação de retorno | `function total()` vira `function total(): number` |
| Parâmetro de callback | Um parâmetro tipado pela chamada que recebeu o callback | `function (player)` vira `function (player: Player)` |
| Nome do parâmetro | Um argumento **literal** em uma chamada | `setTimer(tick, 1000, 0)` vira `setTimer(tick, timeInterval: 1000, timesToExecute: 0)` |

Três regras os mantêm fora do caminho:

- Uma declaração anotada não mostra nada. O hint só preenche uma lacuna.
- Um hint nunca diz `any`. Ocupar espaço para informar que o checker não sabe
  nada é pior do que ficar quieto.
- Um arquivo que não parseia não gera hint nenhum, a mesma regra da formatação.

Um hint e um hover sobre o mesmo nome sempre mostram o mesmo tipo: os dois passam
pelo renderizador do próprio checker.

Os nomes de parâmetro são o único tipo **desligado por padrão**. Os outros três
mostram o que foi inferido; esse repete o que você já pode consultar, e em código
denso custa mais do que entrega.

## Quick fixes

Um quick fix só é oferecido onde exatamente um reparo está certo. Um reparo que
seria um chute — qual chave declarada você quis dizer, a qual ambiente um arquivo
pertence — fica com você, porque aceitar uma edição plausível e errada é pior do
que digitar a certa.

| Diagnóstico | O reparo |
| --- | --- |
| `parse-optional-position` | Move o `?` do tipo para o nome. |
| `parse-redundant-optional` | Apaga o `?` depois do tipo, mantendo o do nome. |
| `check-invalid-super` | Reescreve `self:super(...)` como `super(...)`. |
| `check-static-receiver` | Lê o membro estático com ponto em vez de dois-pontos. |
| `check-native-constructor` | Reescreve `Name.new(...)` como `new Name(...)`. |
| `check-explicit-self-parameter` | Remove o parâmetro `self` do método. |

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

Nada disso alcança uma mudança no próprio servidor. O editor roda o servidor
embutido na extensão que ele tem instalada, então uma correção em hover,
completação ou diagnóstico só chega depois de reinstalar a extensão e recarregar
a janela — **Developer: Reload Window**. Até lá o editor continua respondendo do
jeito que o build instalado responde, por mais atual que o checkout esteja.

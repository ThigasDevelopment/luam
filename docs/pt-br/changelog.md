# Changelog da documentação

Mudanças neste manual. Mudanças no compilador e na CLI ficam no
[CHANGELOG](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md) do
repositório.

O aviso no topo de cada página nomeia a versão do Luam que o manual documenta.
Quando essa versão muda, a entrada abaixo diz o que mudou de lugar.

## Não lançado

### Alterado

- [Comandos da CLI](/pt-br/tooling/cli) documenta `luam server` e
  `luam dev --start-server`; as páginas do manifesto e de solução de problemas
  cobrem descoberta do executável, prontidão, encerramento e suporte de sistemas.

- [Palavras-chave](/pt-br/reference/keywords) ganha uma seção sobre `self` e
  `super`, os dois nomes contextuais, e diz que `constructor` é o único nome de
  membro que uma classe precisa declarar como método.
- [Servidor de linguagem](/pt-br/tooling/language-server) lista onde cada palavra
  reservada é completada, incluindo `fun` em uma anotação de tipo e `super`
  depois de `self:`.
- [Diagnósticos](/pt-br/reference/diagnostics) lista o `check-invalid-self` e o
  `check-invalid-constructor`.
- [Layouts de saída](/pt-br/reference/output-layouts) deixa de descrever os
  blocos `do ... end` do bundle. Um bundle agora é a concatenação pura dos seus
  helpers e módulos, então a página diz o que o escopo de chunk compartilhado
  significa para um `local` de nível de arquivo e para o limite de 200 locals
  ativos do Lua 5.1.
- [Diagnósticos](/pt-br/reference/diagnostics) lista o `parse-class-method-form`,
  o erro levantado quando um membro de classe é escrito como `name(...) { ... }`
  em vez de `name = function (...) ... end`.
- O `luam.json` virou o [`.luam.manifest`](/pt-br/tooling/luam-manifest), um
  dialeto restrito do Luam que o compilador analisa, verifica e avalia. A página
  foi reescrita em torno das duas instruções permitidas, da linguagem de
  expressões, dos valores injetados `mode`, `env` e `root`, e do porquê de o
  dialeto não ter chamadas. Cada campo, padrão e regra de validação continua
  igual; `--config` virou `--manifest`; e o `luam.json` não é mais lido. A página
  termina com a migração em três passos.
- Todo exemplo de configuração do manual é escrito no dialeto em vez de JSON, e a
  referência de diagnósticos lista os códigos de manifesto que substituíram
  `config-invalid-json` e `config-unreadable`.
- [Campos de configuração](/pt-br/reference/configuration-fields) marca cada campo
  como obrigatório ou opcional, igual ao que o autocompletar do editor mostra.
- [Estrutura do projeto](/pt-br/guide/project-layout) não descreve mais um
  snapshot de configuração. O editor lê o próprio manifesto, então `oop` passa a
  valer ao salvar.

## Documenta o Luam 0.1.1

O primeiro manual publicado.

### Adicionado

- Um site bilíngue em **en-US** e **pt-BR**, com seletor de idioma na raiz e busca
  local nos dois idiomas.
- **Guia** — instalação, início rápido, estrutura do projeto, desenvolvimento
  diário e solução de problemas.
- **Linguagem** — fundamentos de Lua, tipos, funções, strings de template, enums e
  interfaces, classes, decoradores, extensões de objeto, exports, arquivos de
  declaração e rigor de verificação.
- **MTA** — ambientes, APIs e eventos, a API OOP, resources e `meta.xml`,
  `config.lua` e `.env`, e fronteiras de segurança.
- **Ferramentas** — comandos da CLI, `luam.json`, editores, o servidor de
  linguagem, e CI e implantação.
- **Receitas** — dez projetos completos, cada um verificado com `luam check` a
  cada build da documentação.
- **Referência** — palavras-chave, operadores, diretivas, campos de configuração,
  diagnósticos, limitações e compatibilidade.

### Notas para quem vem do README

O README do repositório continua sendo a página de entrada concisa. O material que
antes vivia lá em detalhe agora tem um lugar canônico:

| Estava no README | Agora em |
| --- | --- |
| Instalação e problemas de PATH | [Instalação](/pt-br/guide/installation) |
| O início rápido | [Início rápido](/pt-br/guide/quick-start) |
| Cada comando e opção da CLI | [Comandos da CLI](/pt-br/tooling/cli) |
| A tabela do `luam.json` | [.luam.manifest](/pt-br/tooling/luam-manifest) e [Campos de configuração](/pt-br/reference/configuration-fields) |
| A tabela de recursos | [A linguagem](/pt-br/language/) |
| Suporte a editores | [Editores](/pt-br/tooling/editors) |
| Limitações conhecidas | [Limitações](/pt-br/reference/limitations) |

## Convenções

- **O inglês é o idioma de origem.** Uma página é escrita em inglês primeiro e
  depois traduzida. Código, nomes de API, diagnósticos, comandos da CLI, chaves de
  configuração, caminhos de arquivo e palavras-chave da linguagem nunca são
  traduzidos.
- **Os idiomas permanecem pareados.** Cada página existe nos dois, e um build da
  documentação falha quando um lado está faltando. Um idioma só pode omitir uma
  página enquanto ela exibir um aviso visível de *Tradução em andamento* e a lista
  de exceções de paridade a nomear.
- **Os snippets são compartilhados.** Os dois idiomas renderizam os mesmos arquivos
  de código, então um exemplo não pode divergir entre idiomas nem se afastar do
  compilador.

## Relatando um problema na documentação

Abra uma issue em
[github.com/ThigasDevelopment/luam/issues](https://github.com/ThigasDevelopment/luam/issues),
ou use o link **Editar esta página no GitHub** no fim de qualquer página.

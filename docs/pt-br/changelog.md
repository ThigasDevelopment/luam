# Changelog da documentação

Mudanças neste manual. Mudanças no compilador e na CLI ficam no
[CHANGELOG](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md) do
repositório.

O aviso no topo de cada página nomeia a versão do Luam que o manual documenta.
Cada título abaixo é uma versão lançada e a data em que ela saiu, da mais nova
para a mais antiga. `Não lançado` guarda as mudanças do manual que chegam depois
da versão atual.

## Não lançado

### Alterado

- [CLI](/pt-br/tooling/cli) registra como o `luam server` trata um executável
  Linux sem permissão de execução.

## 1.0.3 - 2026-09-03

### Adicionado

- [Estrutura do projeto](/pt-br/guide/project-layout) documenta a estrutura
  plana: um arquivo `.luam` ao lado do manifesto é compilado sem um padrão de
  `sources`, e roda como `shared` a menos que sua diretiva `#!` diga outra coisa.
  [Ambientes](/pt-br/mta/environments) ganha a linha correspondente.
- [`.luam.manifest`](/pt-br/tooling/luam-manifest) explica os padrões de `assets`
  por exemplo, incluindo o que separa `assets/*` de `assets/**/*`, e registra que
  o bloco do scaffold sai comentado com `#`.
- [Diagnósticos](/pt-br/reference/diagnostics) ganha `config-unmatched-source` e
  o aviso `config-empty-asset`, e restringe `config-no-sources` a um projeto sem
  arquivo `.luam` algum.
- [Solução de problemas](/pt-br/guide/troubleshooting) responde a um build que
  falha com um arquivo de código bem ali, e a um mapeamento de `assets` que não
  copiou nada.

## 1.0.2 - 2026-09-03

### Adicionado

- [Language server](/pt-br/tooling/language-server) ganha **Blocos**: os
  fechadores que escrevem `then .. end`, `do .. end` e `until condition` em um
  bloco aberto, os esqueletos que escrevem o bloco inteiro a partir da palavra
  que o abre, a regra que pré-seleciona um fechador apenas enquanto o bloco está
  aberto e o bloco em texto puro que um cliente sem suporte a snippets recebe.

## 1.0.1 - 2026-09-03

### Adicionado

- [Funções](/pt-br/language/functions) ganha **Funções async**: o que uma
  `async function` devolve, por que a anotação é o tipo interno, como uma
  rejeição é levantada no ponto do `await` e as duas fronteiras — nada de
  `await` através de uma fronteira C como `pcall`, e o piso de 50ms dos timers
  do MTA.
- [Resources MTA](/pt-br/mta/resources) documenta o runtime de promises membro a
  membro e responde quando usar uma promise e quando usar um pool, com a
  aritmética de orçamento de frames por trás da resposta.
- [Palavras-chave](/pt-br/reference/keywords) registra que `async` e `await` são
  contextuais, e que `sleep` é válido dentro de uma função async e dentro de um
  job de `Threads`, e em nenhum outro lugar.
- [Diagnósticos](/pt-br/reference/diagnostics) ganha `check-await-outside-async`,
  `check-await-non-promise`, `check-async-return-annotation` e
  `check-sleep-outside-async`.

## 1.0.0 - 2026-09-02

### Adicionado

- [Portando um resource Lua](/pt-br/guide/porting) é a lista ordenada de decisões
  que converter um resource MTA existente impõe: a ordem de trabalho e o porquê,
  o que traduz mecanicamente em forma de tabela, o que precisa ser reestruturado,
  o que o Luam recusa e o que escrever no lugar, e o que o port encontra —
  dezessete defeitos genuínos em um resource que estava rodando.
- [Limitações](/pt-br/reference/limitations) registra as duas formas que o marco
  45 deixou sem equivalente: instanciar uma classe que o código nomeia em tempo
  de execução, e a aridade fixa de uma assinatura de múltiplos retornos escrita à
  mão.
- [Diagnósticos](/pt-br/reference/diagnostics) ganha `check-duplicate-type`,
  `check-duplicate-global`, `check-global-annotation-scope`,
  `check-incomplete-record`, `check-tuple-position`, `check-class-receiver`,
  `parse-reserved-name`, `check-shadowed-api`, `check-shadowed-helper` e
  `check-implicit-global`, e registra que um argumento final espalhado não é
  verificado.
- [Campos de configuração](/pt-br/reference/configuration-fields) e
  [.luam.manifest](/pt-br/tooling/luam-manifest) registram
  `compiler.noImplicitGlobals`, desligado por padrão.

### Alterado

- [Ambientes](/pt-br/mta/environments) registra que um arquivo `shared` enxerga
  os dois lados e não emite nada para um nome exclusivo de um lado, em vez de só
  as APIs compartilhadas, com a classe de rede que decide seu lado em tempo de
  execução como exemplo trabalhado. Afirma com todas as letras que o compilador
  não verifica a ramificação em tempo de execução, e que os rótulos do editor são
  onde o lado agora aparece. Os imports não mudam.
- [Language server](/pt-br/tooling/language-server) registra que o hover de uma
  propriedade informa o tipo que o checker deu ao acesso — estreitado onde uma
  guarda estreitou, e nunca uma declaração de mesmo nome em outro ponto do
  arquivo — e que o hover sobre um valor lista os campos do tipo dele, um nível
  de profundidade e com corte no limite de membros.
- [Editores](/pt-br/tooling/editors) registra que uma correção no servidor de
  linguagem só chega ao editor depois de reinstalar a extensão e recarregar a
  janela.
- [Editores](/pt-br/tooling/editors) e
  [Language server](/pt-br/tooling/language-server) registram o que um `local`
  que desestrutura uma chamada de múltiplos retornos mostra no editor: um inlay
  hint e uma resposta de hover por nome, um nome sozinho ficando com o primeiro
  valor em vez da tupla, uma chamada fora da última posição contribuindo só com
  o primeiro valor dela, e o texto do inicializador carregado no primeiro nome
  que a chamada cobre. A regra que
  [funções](/pt-br/language/functions#multiplos-retornos) já enunciava agora é a
  regra que o editor segue. Um editor ainda rodando a extensão 0.19.12 mantém os
  hints antigos até ser reinstalada e a janela recarregada.

## 0.19.12 - 2026-08-31

### Alterado

- [APIs e eventos](/pt-br/mta/apis-and-events) e [MTA](/pt-br/mta/) informam 221
  eventos no catálogo, contra 203.

## 0.19.11 - 2026-08-31

### Alterado

- [Layouts de saída](/pt-br/reference/output-layouts) separa as duas
  granularidades de lowering: `new`, template e extension nativa são rebaixados
  como expressão, preservando o layout escrito ao redor, enquanto uma atribuição
  composta ainda rebaixa o statement inteiro e mantém o ponto e vírgula final. A
  linha do campo de classe sem padrão já descrevia `name = nil`, e o build de
  desenvolvimento agora o produz.
- [Language server](/pt-br/tooling/language-server) registra que o hover responde
  sobre uma expressão de membro, lendo a propriedade sob o cursor, e que a
  forma de uma classe ou `interface` vem junto, de qualquer arquivo que o ambiente
  possa referenciar.

## 0.19.10 - 2026-08-31

### Adicionado

- [Editores](/pt-br/tooling/editors) registra que um literal de tabela tipado
  completa pelas chaves que o tipo ainda permite, incluindo como uma chave
  compartilhada numa união é tipada e quando todos os valores discriminantes são
  oferecidos.

## 0.19.9 - 2026-08-31

### Adicionado

- [Editores](/pt-br/tooling/editors) e
  [Language server](/pt-br/tooling/language-server) documentam as inlay hints:
  os três tipos, o que cada um mostra, e a configuração que desliga cada um.

## 0.19.8 - 2026-08-31

### Adicionado

- [Comandos da CLI](/pt-br/tooling/cli) documenta o `luam format` e seu modo de
  verificação, os diagnósticos legíveis por máquina que uma build pode emitir, e
  o modo watch do `luam check`.
- [Arquivo do formatador](/pt-br/reference/formatter-file) é nova: cada campo
  que o `.luam.formatter` aceita, o que cada um muda, e como o editor e o
  comando concordam num único layout.

## 0.19.7 - 2026-08-31

### Adicionado

- [Bibliotecas](/pt-br/tooling/libraries) descreve o modelo inteiro: instalar e
  listar um pacote, o campo `luam` que uma biblioteca declara, a visibilidade de
  mão única, o namespace plano em que todo nome de biblioteca cai e onde a saída
  embutida vai parar nos dois layouts.
- [Usando uma biblioteca](/pt-br/recipes/using-a-library) monta um projeto com a
  biblioteca de exemplo de ponta a ponta.
- [.luam.manifest](/pt-br/tooling/luam-manifest#libraries) e
  [Campos de configuração](/pt-br/reference/configuration-fields) documentam o
  domínio `libraries`, e os dois dizem como ele difere de `dependencies`.
- [Diagnósticos](/pt-br/reference/diagnostics) lista os códigos de biblioteca, e
  [Limitações](/pt-br/reference/limitations) registra três fronteiras: requisitos
  são nomeados e não resolvidos, colisões são reportadas e não resolvidas, e uma
  biblioteca publica código e não assets.

## 0.19.6 - 2026-08-31

### Adicionado

- [Funções](/pt-br/language/functions#funcoes-genericas) descreve funções
  genéricas: a sintaxe, a inferência na chamada, os argumentos explícitos e as
  restrições. [Tipos](/pt-br/language/types#aliases) e
  [Classes](/pt-br/language/classes#parametros-de-tipo) agora fazem referência
  cruzada, então as três formas se leem como um recurso só.
- [Limitações](/pt-br/reference/limitations) ganha duas entradas: `error(...)`
  não encerra um caminho, e um parâmetro de tipo que só aparece na posição de
  retorno é `any`.

### Alterado

- [Funções](/pt-br/language/functions#tipos-de-retorno) afirma que um tipo de
  retorno declarado precisa ser produzido em todo caminho, e que uma anotação
  opcional é como uma função pode terminar sem valor.
  [Diagnósticos](/pt-br/reference/diagnostics) lista `check-missing-return`.
- [Tipos](/pt-br/language/types#aliases) não diz mais que classes genéricas não
  são suportadas. Elas são suportadas desde a 0.13.0.
- [Layouts de saída](/pt-br/reference/output-layouts) separa as duas
  granularidades de lowering: `new`, template e extension nativa são rebaixados
  como expressão, preservando o layout escrito ao redor, enquanto uma atribuição
  composta ainda rebaixa o statement inteiro e mantém o ponto e vírgula final. A
  linha do campo de classe sem padrão já descrevia `name = nil`, e o build de
  desenvolvimento agora o produz.
- [Language server](/pt-br/tooling/language-server) registra que o hover responde
  sobre uma expressão de membro, lendo a propriedade sob o cursor, e que a
  forma de uma classe ou `interface` vem junto, de qualquer arquivo que o ambiente
  possa referenciar.

## 0.19.5 - 2026-08-28

### Adicionado

- [Contribuindo](/pt-br/guide/contributing) é nova: o que o portão de merge
  verifica e o que apenas aconselha, como uma mudança vinda de um fork é
  tratada, e para onde vai uma vulnerabilidade em vez de uma issue.

## 0.19.4 - 2026-08-28

### Alterado

- [Limitações](/pt-br/reference/limitations) registra que o Luam não entrega um
  depurador como uma fronteira de projeto própria, em vez de deixar isso como o
  comentário final da entrada sobre logs de desenvolvimento. A página agora diz
  que a decisão está tomada, não pendente, e aponta o que o `luam dev` já
  oferece.

## 0.19.3 - 2026-08-28

### Adicionado

- [Comandos da CLI](/pt-br/tooling/cli) documenta o `luam test`: o interpretador
  que ele procura, as seis globais que um arquivo de teste ganha, cada matcher, os
  stubs do MTA e o que eles não conseguem provar.
  [Testando um módulo](/pt-br/recipes/testing-a-module) é uma receita nova com um
  projeto completo, e [CI e implantação](/pt-br/tooling/ci-and-deployment) mostra o
  job que instala o Lua e barra no resultado.

## 0.19.2 - 2026-08-28

### Adicionado

- [Comandos da CLI](/pt-br/tooling/cli) documenta o `luam test`: o interpretador
  que ele procura, as seis globais que um arquivo de teste ganha, cada matcher, os
  stubs do MTA e o que eles não conseguem provar.
  [Testando um módulo](/pt-br/recipes/testing-a-module) é uma receita nova com um
  projeto completo, e [CI e implantação](/pt-br/tooling/ci-and-deployment) mostra o
  job que instala o Lua e barra no resultado.
- [Editores](/pt-br/tooling/editors) e [Formatação](/pt-br/reference/formatting)
  registram o `luam.formatting`, a configuração que desliga o formatador.
- [Editores](/pt-br/tooling/editors) registra o hover da palavra-chave `static` e
  a completação no corpo da classe, que oferece `static` ao lado do snippet de
  `constructor`.
- [Diagnósticos](/pt-br/reference/diagnostics) e [Editores](/pt-br/tooling/editors)
  listam `parse-redundant-optional`, reportado quando o nome e o tipo carregam um
  `?` cada, e o quick fix que apaga o do tipo.
- [Enums e interfaces](/pt-br/language/enums-and-interfaces) registra a regra por
  trás do verificador: uma interface é satisfeita pelo formato, uma classe pela
  identidade, e um nome que o verificador nunca resolveu continua permissivo.
- [Formatação](/pt-br/reference/formatting) é uma página de referência nova: o
  estilo que o language server escreve, o que ele nunca toca e o que acontece com
  um arquivo que não parseia. [Editores](/pt-br/tooling/editors) registra formatar
  ao salvar, os cinco quick fixes e os símbolos do workspace, e
  [Diagnósticos](/pt-br/reference/diagnostics) aponta para a lista de quick fixes.
- [Tipos de objeto](/pt-br/language/types#tipos-de-objeto) registra que uma chave
  tipada como função é verificada quando é chamada com `:`, e como um primeiro
  parâmetro chamado `self` é contado.
  [Limitações](/pt-br/reference/limitations) registra o que continua sem ser
  reportado: um método que o tipo do receptor não declara.
- [Como o Luam funciona](/pt-br/guide/how-luam-works) segue um build pelos cinco
  estágios dele, com um diagrama e os mesmos estágios em palavras, e explica por
  que a CLI, o editor e o playground concordam: existe um parser, um checador e
  um emissor atrás dos três.
- [Luam em comparação](/pt-br/guide/comparison) coloca o Luam ao lado de Lua
  5.1, Luau e TypeScript — alvo, apagamento, comentários, opcionais, classes,
  reuso entre arquivos e conhecimento da plataforma — com uma versão mais curta
  na página inicial.
- [Migração](/pt-br/guide/migration) registra o que cada release desde a `0.2.0`
  pede que o autor mude, da mais antiga para a mais nova, com a forma removida
  ao lado da forma a escrever e um link para a página de referência de cada uma.
- Toda página do manual termina com um link de relato que abre uma issue no
  GitHub preenchida com a página, o idioma dela e a versão documentada. Nada é
  enviado até o leitor publicar, e nenhuma página envia nada em segundo plano.

### Corrigido

- [Luam em comparação](/pt-br/guide/comparison) dizia que classes genéricas não
  são suportadas e apontava para uma página que não fala disso. Classes recebem
  parâmetros de tipo; a página agora aponta para
  [Parâmetros de tipo](/pt-br/language/classes#parametros-de-tipo).
- O playground diz o que fazer quando o JavaScript não está disponível, nos dois
  idiomas, em vez de deixar essa linha em branco.

## 0.19.1 - 2026-08-27

### Adicionado

- [API OOP](/pt-br/mta/oop) e [Editores](/pt-br/tooling/editors) registram o
  hover de classe do MTA: um nome de classe explica a classe, a cadeia que ela
  herda, a superfície que alcança naquele ambiente e se é chamável, em vez de
  listar os membros dela.
- [Classes](/pt-br/language/classes#membros-estaticos) documenta `static`: o que
  pertence ao valor da classe em vez de uma instância, como os dois espaços
  ficam separados e os diagnósticos que relatam uma leitura entre eles.
  [Palavras-chave](/pt-br/reference/keywords) registra `static` como contextual,
  e [Diagnósticos](/pt-br/reference/diagnostics) lista
  `check-duplicate-class-member` e `check-static-receiver`.

### Alterado

- [Limitações](/pt-br/reference/limitations) não afirma mais que uma classe não
  tem campos nem métodos estáticos. A entrada agora é "Sem metamétodos nem
  classes genéricas", e aponta para [Classes](/pt-br/language/classes) quanto a
  `static`.

## 0.19.0 - 2026-08-27

### Alterado

- [Limitações](/pt-br/reference/limitations) troca "O estreitamento alcança
  nomes, não campos" por duas entradas: o estreitamento segue um caminho mas não
  um apelido, que é uma decisão de projeto, e o estreitamento não atravessa um
  ramo nem um laço, que é planejado.
  [Tipos](/pt-br/language/types#guardas-de-tipo) e
  [Solução de problemas](/pt-br/guide/troubleshooting) descrevem uma guarda como
  refinando um caminho, e largam a solução de copiar o campo para um local.
- [Strings de template](/pt-br/language/template-strings) documenta o padrão
  como a forma de marcar um nome interpolado como opcional, e afirma que uma
  chamada ou um operador dentro de `${...}` continua erro com padrão ou sem. A
  regra de escopo foi reescrita para cobrir os dois casos.
- [Diagnósticos](/pt-br/reference/diagnostics) e
  [Solução de problemas](/pt-br/guide/troubleshooting) descrevem
  `check-unknown-template-root` como dois casos: uma interpolação que não é um
  nome nem um caminho de membro, e um nome fora do escopo e sem padrão.

## 0.18.2 - 2026-08-27

### Alterado

- [Formatos de saída](/pt-br/reference/output-layouts) nomeia a forma gerada de
  um campo de classe sem padrão: `name = nil`, na linha em que o campo foi
  escrito.

## 0.18.1 - 2026-08-27

### Alterado

- [O tema Luam](/pt-br/tooling/theme) move as nativas do MTA da linha violeta
  para a linha azul: uma nativa agora lê como código que roda, em itálico
  porque você não a escreveu, e o violeta fica só com as palavras-chave e a
  stdlib do Lua. As tabelas geradas de elementos e contraste seguem a tabela
  de papéis.

## 0.18.0 - 2026-08-25

### Alterado

- [O manifesto](/pt-br/tooling/luam-manifest) e
  [Campos de configuração](/pt-br/reference/configuration-fields) renomeiam a
  tabela `compilerOptions` para `compiler`, com os mesmos membros e padrões, e
  listam `compilerOptions` entre os campos removidos que reportam
  `config-removed-field`. [API OOP](/pt-br/mta/oop),
  [Layout do projeto](/pt-br/guide/project-layout),
  [Solução de problemas](/pt-br/guide/troubleshooting) e
  [Diagnósticos](/pt-br/reference/diagnostics) usam o novo nome em todo lugar.
- [Classes](/pt-br/language/classes) documenta a ordem de declaração como duas
  regras em vez de um aviso: uma classe é um tipo em todo o arquivo e um valor a
  partir da linha em que a declaração roda. O `extends` pode nomear uma pai
  escrita mais abaixo; um `new` de topo de uma classe declarada abaixo é
  `check-class-before-declaration`.

- [Limitações](/pt-br/reference/limitations) rotula cada entrada como planejado,
  decisão de projeto, restrição da fonte ou restrição da plataforma, diz o que
  nunca volta — `__index`, `__newindex` e `__call`, verificações implícitas em
  execução, um build que lê o `config.lua` — e nomeia a versão que descreve.
- [Editores](/pt-br/tooling/editors) lista o hover de palavra-chave e o de
  decorator em linhas próprias: `self` carrega sua classe e a forma dessa classe,
  e um decorator carrega os membros que gera naquele ponto.
  [Decorators](/pt-br/language/decorators) descreve o que o hover de decorator
  mostra, incluindo os três que não geram nada.
- [Diagnósticos](/pt-br/reference/diagnostics) deixa de dizer que os únicos
  decoradores são `@Getter` e `@Setter` e lista os quatro códigos que faltavam:
  `check-lazy-initializer`, `check-readonly-assignment`, `check-deprecated-use` e
  `check-invalid-override`.

### Corrigido

- [Solução de problemas](/pt-br/guide/troubleshooting) dizia que o Luam não faz
  estreitamento. Uma guarda estreita um nome, um `or` descarta o nil do lado
  esquerdo, e quem mantém o tipo declarado é um **campo**. A página mostra os
  dois casos agora.
- [Editores](/pt-br/tooling/editors) e
  [Solução de problemas](/pt-br/guide/troubleshooting) diziam que o servidor
  nunca reverifica um arquivo aberto quando outro muda, e mandavam reiniciá-lo
  para enxergar arquivos. Ele reanalisa quando uma declaração muda, varre o
  workspace e observa `**/*.luam`, `.luam.manifest` e `.env*`.
- As receitas de [comando de servidor](/pt-br/recipes/server-command) e de
  [função exportada](/pt-br/recipes/exported-function) anotavam um local como
  `any` por causa de uma limitação que não existe. Os dois locais são `number`.

## 0.17.0 - 2026-08-25

### Alterado

- [APIs e eventos](/pt-br/mta/apis-and-events) e a
  [visão geral do MTA](/pt-br/mta/) informam o novo tamanho do catálogo: 1413
  declarações de API e 58 tipos de elemento, geradas a partir de um snapshot do
  wiki do MTA versionado no repositório, cobrindo o MTA 1.7.0.
- [Enums e interfaces](/pt-br/language/enums-and-interfaces) informa que um
  membro opcional de interface é opcional para a classe que a implementa.

## 0.16.0 - 2026-08-25

### Removido

- A referência de `transport` e todas as páginas que descreviam configurar um. O
  campo não existe mais: o `ensure` sincroniza arquivos, e o
  `dev --start-server` reinicia o resource pelo console que ele possui.

### Adicionado

- [Estruturas de saída e mapas de código](/pt-br/reference/output-layouts)
  documenta o contrato da saída de desenvolvimento: quais comandos escrevem Lua
  legível, o que é reescrito, o que é copiado byte a byte e o que o contrato não
  promete. Traz um exemplo trabalhado de um laço com `continue` e de uma
  declaração apagada.

### Alterado

- [Enums e interfaces](/pt-br/language/enums-and-interfaces) registra o que o
  alcance de um enum enxerga e o que não enxerga: o apagamento é silencioso, o
  alcance é casado por nome de identificador, então uma leitura dinâmica ou de
  outro recurso é invisível ao build, um enum que sobrevive é um global e por
  isso a ordem de declaração importa no carregamento, e os nomes dos membros
  continuam entre aspas porque o helper de execução usa cada elemento como chave
  de tabela.
- [Limitações](/pt-br/reference/limitations) informa que o Lua gerado é o código,
  não uma reescrita, e aponta para o contrato de saída e para a resolução de uma
  posição de execução do MTA.
- [Extensões de objeto](/pt-br/language/extensions) nomeia `check-extension-form`
  como o erro de usar a forma errada, e
  [Diagnósticos](/pt-br/reference/diagnostics) o lista ao lado de
  `check-not-callable`.
- [Enums e interfaces](/pt-br/language/enums-and-interfaces) informa que o
  apagamento olha o recurso inteiro, então um enum declarado em um arquivo
  shared e lido de um arquivo server ou client é mantido.
- [O manifesto](/pt-br/tooling/luam-manifest) explica que um `local` que nenhum
  campo lê é reportado como `check-unused-local`, e
  [Diagnósticos](/pt-br/reference/diagnostics) registra que o código também surge
  no manifesto, independente de `compilerOptions.noUnusedLocals`.
- Este changelog passa a usar títulos de versão com data. Toda entrada escrita
  desde o primeiro manual publicado foi para baixo da versão que a lançou, e
  `Não lançado` guarda apenas o trabalho posterior à versão atual.
- [Instalação](/pt-br/guide/installation) e [Editores](/pt-br/tooling/editors)
  não nomeiam mais uma versão à mão. O comando de instalação fixada e o nome do
  arquivo `.vsix` são gerados a partir da versão que o aviso mostra, então não
  ficam desatualizados.

## 0.15.6 - 2026-08-17

### Alterado

- [APIs e eventos](/pt-br/mta/apis-and-events) documenta handlers de evento
  tipados, a verificação do payload em cada trigger e o contrato `declare event`
  para eventos personalizados, com os diagnósticos de cada erro.
- [Arquivos de declaração](/pt-br/language/declaration-files) cobre
  `declare event`, e [Palavras-chave](/pt-br/reference/keywords) registra `event`
  como o segundo termo contextual ao lado de `fun`.
- [Servidor de linguagem](/pt-br/tooling/language-server) e
  [Editores](/pt-br/tooling/editors) descrevem completação, hover e ajuda de
  assinatura para nomes de evento.
- [Diagnósticos](/pt-br/reference/diagnostics) lista os códigos de contrato de
  evento.

## 0.15.5 - 2026-08-16

### Alterado

- [Servidor de linguagem](/pt-br/tooling/language-server) usa os tipos esperados
  de callbacks para completar parâmetros e membros, hover, navegação e ajuda de
  assinatura, inclusive em callbacks MTA específicos de cada ambiente.
- [Layouts de saída](/pt-br/reference/output-layouts) explica como o Lua legível
  mantém as linhas dos statements para debug direto no MTA, enquanto mapas
  cobrem transformações expansivas e a minificação remove o preenchimento.

## 0.15.4 - 2026-08-16

### Alterado

- [Comandos da CLI](/pt-br/tooling/cli) documenta `luam server` e
  `luam dev --start-server`; as páginas do manifesto e de solução de problemas
  cobrem descoberta do executável, prontidão, encerramento e suporte de sistemas.

## 0.8.0 - 2026-08-12

### Alterado

- [Palavras-chave](/pt-br/reference/keywords) ganha uma seção sobre `self` e
  `super`, os dois nomes contextuais, e diz que `constructor` é o único nome de
  membro que uma classe precisa declarar como método.
- [Servidor de linguagem](/pt-br/tooling/language-server) lista onde cada palavra
  reservada é completada, incluindo `fun` em uma anotação de tipo e `super`
  depois de `self:`.
- [Diagnósticos](/pt-br/reference/diagnostics) lista o `check-invalid-self` e o
  `check-invalid-constructor`.

## 0.7.0 - 2026-08-12

### Alterado

- [Layouts de saída](/pt-br/reference/output-layouts) deixa de descrever os
  blocos `do ... end` do bundle. Um bundle agora é a concatenação pura dos seus
  helpers e módulos, então a página diz o que o escopo de chunk compartilhado
  significa para um `local` de nível de arquivo e para o limite de 200 locals
  ativos do Lua 5.1.
- [Diagnósticos](/pt-br/reference/diagnostics) lista o `parse-class-method-form`,
  o erro levantado quando um membro de classe é escrito como `name(...) { ... }`
  em vez de `name = function (...) ... end`.

## 0.6.0 - 2026-08-12

### Alterado

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

## 0.1.1 - 2026-08-11

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

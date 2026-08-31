# Limitações

O que o Luam não faz, e o que escrever no lugar. Esta página descreve o Luam
%LUAM_VERSION%.

Cada entrada abre com um rótulo, para você separar o que vai mudar do que não
vai:

| Rótulo | O que significa |
| --- | --- |
| **Planejado** | Uma lacuna de implementação com dono. Ela vai sair do lugar. |
| **Decisão de projeto** | Uma decisão que o Luam mantém. Um recurso futuro pode deixar você optar por outra coisa; o padrão fica. |
| **Restrição da fonte** | Imposta por uma fonte que o Luam lê em vez de possuir. |
| **Restrição da plataforma** | Imposta pelo MTA ou pelo Lua 5.1. Ela não sai do lugar. |

## O estreitamento segue um caminho, não um apelido

**Decisão de projeto.** Registrada na
[ADR-025](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/025-access-path-narrowing.md).

Uma [guarda de tipo](/pt-br/language/types#guardas-de-tipo) refina um **caminho
de acesso estável**: um nome, ou um nome seguido de campos literais.
`if self.connection ~= nil then` refina o campo dentro do bloco que a guarda
protege, e o mesmo vale para um caminho aninhado como `self.socket.handle`. Um
[discriminante](/pt-br/language/types#unioes-discriminadas) também trabalha
sobre um caminho, então `self.state.kind == 'ready'` escolhe o membro da união.

O fato é descartado assim que o verificador vê uma escrita que pode alcançá-lo:
uma atribuição ao caminho, a um prefixo dele, a um caminho abaixo dele, à sua
raiz, uma dentro do corpo de um laço, ou uma dentro de uma função declarada no
mesmo bloco. O caminho também precisa ser nomeável do começo ao fim, então uma
chamada ou um índice dinâmico não produz fato nenhum e `session.slots[key]`
mantém o tipo declarado.

O que o verificador não enxerga é uma segunda referência à mesma tabela. Uma
tabela Lua é uma referência, então um campo limpo por outro nome deixa o
refinamento de pé:

```luam static
local alias = self

if self.connection ~= nil then
    release(alias)

    local handle: userdata = self.connection
end
```

`release` pode colocar `nil` em `alias.connection`, e `self.connection` continua
`userdata` na linha de baixo. Rastrear isso é uma análise de apontamentos que
atravessa funções, e a alternativa — descartar todo fato de campo em qualquer
chamada — apagaria o refinamento sempre que um único `outputDebugString`
estivesse entre a guarda e o uso. O Luam não faz nem uma coisa nem outra.

## Uma condição guardada em variável não é uma guarda

**Decisão de projeto.** Registrada na
[ADR-031](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/031-flow-narrowing.md).

Um fato fica preso ao caminho que a condição testou. Guardar a condição em uma
variável não prende nada, porque a variável não é o teste:

<<< @/snippets/errors/flow-narrowing/src/server/adapter.luam{luam}

<<< @/snippets/output/errors/flow-narrowing.txt{text}

Teste o próprio caminho, no bloco que o usa:

```luam static
if self.connection ~= nil then
    local handle: userdata = self.connection
end
```

Todo o resto do fluxo vale. Um ramo que sai com `return`, `break` ou `continue`
entrega o outro lado ao resto do bloco; um caminho refinado do mesmo jeito em
todos os ramos mantém aquele tipo depois da junção; uma atribuição refina uma
união ou um opcional para o membro que escreveu; e um `while` deixa a negação da
condição para trás. Veja
[o que um fato sobrevive](/pt-br/language/types#o-que-um-fato-sobrevive).

Um laço continua conservador de propósito: todo caminho que o corpo atribui
perde o fato dele no laço inteiro, mesmo onde a escrita não pode rodar. O corpo é
analisado uma vez, contra o estado que veria em qualquer iteração.

Uma operação ainda precisa ser válida para a união inteira: `key + 1` em
`string | number` é `check-invalid-operand`, porque um dos membros não soma. A
concatenação é a exceção, já que todo membro de `string | number` concatena.

## Um método que o receptor não declara não é reportado

**Decisão de projeto.** Registrada na
[32.01](https://github.com/ThigasDevelopment/luam/blob/main/.claude/plans/32.01-method-call-checking.md).

`counter:bump(1)` é verificada contra a assinatura que o tipo do receptor declara
para `bump` — quantidade de argumentos, tipo de cada um e o retorno que ela
produz. `counter:missing(1)` não é. O receptor não resolve membro nenhum, a
chamada continua devolvendo `any` e nada é reportado. Ler o mesmo nome com ponto
é `check-unknown-record-key`.

A assimetria é proposital. Uma chamada com `:` é como o Lua alcança um método que
uma metatable ou uma biblioteca anexou em tempo de execução, e um receptor que o
verificador nunca viu anotado não tem lista de membros contra a qual reportar.
Anote o receptor e a chamada passa a ser verificada; a verificação segue a
anotação, nunca a sintaxe da chamada.

## Uma classe é um tipo em todo lugar, e um valor a partir da declaração

**Restrição da plataforma.** Uma declaração passa a valer quando ela roda, que é
o que o Lua faz com qualquer outra instrução.

`extends` e `new` resolvem nas duas direções: uma classe filha pode ficar acima
da pai, e uma função pode instanciar uma classe declarada mais abaixo. O que não
muda é a execução. Uma declaração de classe é uma instrução, então a classe só
existe como valor depois que a linha dela roda, e instanciar antes disso é
`check-class-before-declaration`:

```luam static
local early = new Player()

class Player {
    name: string = ''
}
```

Dentro do corpo de uma função — um método, um construtor, qualquer handler — o
`new` de uma classe declarada mais abaixo funciona, porque o corpo roda depois da
declaração.

Uma referência que aparece antes da declaração enxerga a classe, mas ainda não os
membros dela: ler um membro dá `any`, e a aridade do construtor não é verificada.
Mova a referência para baixo da declaração para ter as duas coisas checadas.

## Três metamétodos continuam bloqueados

**Decisão de projeto.** Registrada na
[ADR-035](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/035-safe-class-metamethods.md).

Uma classe declara um metamétodo pelo nome dele em Lua — `__tostring`, `__eq`,
`__lt`, `__le`, `__len`, `__concat`, `__unm` e os operadores aritméticos. Veja
[classes](/pt-br/language/classes#metametodos).

O que continua bloqueado, independentemente do que for exposto:

- `__index` substitui a busca de membro, que o helper de classe controla.
- `__newindex` engole uma escrita de campo, que o helper de classe controla.
- `__call` torna uma instância chamável, o que esconde a construção.
- `__gc` não roda para uma tabela em Lua 5.1.
- `__metatable` e `__mode` escondem ou enfraquecem a metatable que o helper usa.

O `__eq` segue o Lua 5.1: ele só é chamado quando os dois operandos são tabelas
que compartilham o mesmo metamétodo, então comparar instâncias de duas classes
diferentes cai em identidade, seja lá o que cada classe declare. E o checker não
verifica se os operandos de um operador declaram o metamétodo correspondente —
um `__add` ausente aparece quando o código roda, não quando compila.

## O catálogo do MTA pode ficar atrás de uma versão

**Restrição da fonte.** O catálogo descreve o wiki do MTA, que o Luam lê e não
possui.

O catálogo é um snapshot fixo gerado a partir do wiki do MTA. Uma função adicionada
em uma versão mais nova continua sendo `any` em vez de gerar erro — a chamada
compila e você perde apenas completação e verificação de argumentos. Isso é
deliberado: uma função nova do MTA nunca deve bloquear um build.

Um job agendado relê o wiki e propõe a atualização como um pull request. Ele
nunca faz o merge, então a versão do MTA que uma versão do Luam descreve é sempre
uma decisão revisada.

## Só uma chamada que o build consegue nomear é verificada

**Decisão de projeto.** Registrada na
[ADR-033](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/033-resource-export-abi.md).

Um build escreve um [contrato de export](/pt-br/language/exports#o-contrato-de-export),
e uma chamada para uma dependência declarada é checada contra ele quando o nome
do resource e o nome do export são literais. Todo o resto compila e passa
intacto:

- Uma chamada cujo nome de resource ou de export é calculado em execução. Não há
  o que um compilador resolva, e recusar quebraria código que funciona.
- Uma chamada para um resource sem contrato em disco — um escrito em Lua puro,
  um que ainda não foi buildado, ou um cujo contrato nunca foi compartilhado.
- A própria execução. O contrato é um artefato de compilação; o MTA não o lê, e
  nada verifica em execução que o resource chamado é o que o contrato descreveu.

Um contrato desatualizado é checado como está escrito. O build lê o arquivo que
encontra; ele não compila o provedor para confirmar que o arquivo ainda bate.

## O `config.lua` nunca é analisado

**Decisão de projeto.** Um build nunca lê o Lua do projeto em busca de
significado.

Ele é copiado como está, então o compilador não sabe nada sobre o seu conteúdo.
Descreva-o com um
[arquivo de declaração](/pt-br/language/declaration-files) para obter tipos, ou
gere um com [`luam config`](/pt-br/tooling/cli#luam-config) — um comando que você
roda e um arquivo que você commita, nunca uma etapa dentro do build. Esse comando
lê os dados literais e nada mais: uma chamada, uma concatenação ou uma função no
`config.lua` é reportada e pulada, e você a declara à mão.

Executá-lo para ler os valores faria um build rodar código do projeto, que é
justamente o que o compilador se recusa a fazer, então o extrator lê o arquivo em
vez de carregá-lo. Um valor que ele produz é tão verdadeiro quanto o arquivo que
leu: mude o `config.lua` e a declaração fica velha até você rodar o comando de
novo.

## O Lua gerado é o código, não uma reescrita

**Decisão de projeto.** Um build legível representa o que você escreveu; ele não
reconstrói o que apagou.

Um build legível mantém uma linha de Lua para cada linha de Luam e copia tudo que
o Lua 5.1 já aceita. O que ele não faz é restaurar o que apagou: uma `interface`
vira um comentário, não uma tabela de execução. Leia
[o contrato da saída de desenvolvimento](/pt-br/reference/output-layouts#o-contrato-da-saida-de-desenvolvimento)
para o que é reescrito, e
[Resolvendo uma posição de execução do MTA](/pt-br/guide/troubleshooting#resolvendo-uma-posicao-de-execucao-do-mta)
para transformar uma posição gerada de volta em uma posição escrita.

## Anotações de tipo são apagadas

**Decisão de projeto.** Elas são um contrato entre você e o verificador, e o
compilador não adiciona nenhuma guarda de execução por elas.

Elas são um **contrato de compilação**, não uma guarda de execução. Um handler de
um evento que um cliente pode disparar recebe o que aquele cliente enviou,
independentemente das anotações nos seus parâmetros. Valide tudo que atravessa a
rede. Veja [Fronteiras de segurança](/pt-br/mta/security).

Nada vai passar a gerar essas verificações por você por padrão. Um recurso futuro
pode gerá-las onde você marcar uma fronteira, e uma função não marcada vai emitir
exatamente o que emite hoje.

## Um ambiente por arquivo

**Restrição da plataforma.** O MTA atribui um lado a cada entrada `<script>`,
então o arquivo é a unidade que tem um.

Um arquivo é `server`, `client` ou `shared` por inteiro. Não há ambiente por bloco;
divida o arquivo.

Um bloco `client do ... end` dentro de um arquivo de servidor não tem como
funcionar: as duas metades carregariam como chunks separados em processos
separados, então um `local` compartilhado por elas teria que virar global, uma
closure sobre um local ao redor não poderia ser movida de jeito nenhum, e a ordem
dos efeitos de topo deixaria de existir.

## Os logs de desenvolvimento saem do disco, nunca de um servidor

**Decisão de projeto.** A CLI não abre conexão com um servidor MTA.

O `luam dev` lê o log **local** do servidor MTA. O `luam dev --start-server` sobe
o servidor no seu terminal e acompanha
`<serverPath>/mods/deathmatch/logs/server.log` a partir dali, que é o que faz os
registros estruturados e as posições no código-fonte funcionarem.

Não existe modo remoto. Coletar log de um servidor que você não consegue ler do
disco exigiria a CLI se conectar a ele, e o produto andou no sentido oposto: o
campo `transport` do manifest, que configurava uma conexão com o servidor, foi
removido, e o `ensure` sincronizando arquivos com o `dev --start-server`
reiniciando o servidor que ele mesmo sobe é o que ficou no lugar. Monte o
diretório de log remoto, ou leia onde ele está.

Duas bordas menores: linhas nativas de outros resources nomeados são ignoradas, e
linhas da engine sem atribuição podem aparecer como saída simples do servidor
porque a origem delas não pode ser classificada com segurança.

Avaliar uma expressão em um servidor rodando não faz parte de nada disso. Isso é
um depurador, e o Luam não traz um — veja
[O Luam não traz depurador](/pt-br/reference/limitations#o-luam-nao-traz-depurador).

## O Luam não traz depurador

**Decisão de projeto.** Registrada na
[ADR-039](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/039-no-debugger.md).

Não há breakpoints, não há execução passo a passo, não há painel de variáveis, e
não há como pausar um resource nem avaliar uma expressão dentro de um servidor
MTA em execução. Isso está decidido, não pendente: nada no roadmap adiciona isso.

O que cobre o mesmo terreno:

- O [`luam dev`](/pt-br/tooling/cli#luam-dev) acompanha o `server.log` local e
  imprime os registros do servidor e as chamadas `outputDebugString` do cliente
  repassadas em um único fluxo, com posições no código-fonte.
- O [`luam trace`](/pt-br/tooling/cli#luam-trace) e o mapa do resource devolvem
  uma posição gerada — ou um log de erro inteiro — para a linha `.luam` que você
  escreveu. Veja
  [Resolvendo uma posição de execução do MTA](/pt-br/guide/troubleshooting#resolvendo-uma-posicao-de-execucao-do-mta).
- O [`luam test`](/pt-br/tooling/cli#luam-test) roda o seu código em um
  interpretador Lua 5.1 local, com as chamadas do MTA substituídas por stubs que
  gravam o que foi chamado, então você executa uma função e afirma o que ela fez
  sem precisar de servidor.
- O verificador aponta a maior parte do que um depurador é usado para descobrir
  em Lua sem tipos — um campo nulo, um membro escrito errado, um argumento
  trocado — antes de qualquer coisa rodar.

Duas coisas descartam a metade viva. Um depurador se conecta a um servidor em
execução, e a CLI não abre conexão com nenhum: o campo `transport` do manifest,
que configurava uma conexão com o servidor, foi removido, e o `ensure`
sincronizando arquivos com o `dev --start-server` conduzindo o servidor que ele
mesmo sobe é o que ficou no lugar. E um canal que avalia expressões dentro de um
servidor vivo é execução remota de código contra uma máquina com jogadores
conectados, uma superfície de segurança que o projeto recusa em vez de planejar
proteger.

O próprio MTA não tem nada com que interoperar aqui: ele não publica protocolo de
depuração, e um hook de debug do Lua que para em uma linha para a thread em que o
servidor inteiro roda, o que congela o jogo para todo mundo nele.

## `error(...)` não encerra um caminho

**Decisão de projeto.** Registrada em
[37.01](https://github.com/ThigasDevelopment/luam/blob/main/.claude/plans/37.01-missing-return.md).

Uma função que declara um tipo de retorno concreto precisa produzir um em todo
caminho, e um corpo que consegue alcançar o `end` final sem retornar é
[`check-missing-return`](/pt-br/language/functions#tipos-de-retorno). O
verificador lê uma coisa só para decidir isso: se o controle ainda consegue
chegar ao fim. Um `return`, um `break` e um `continue` encerram um caminho, e um
laço que não consegue cair fora também.

Uma chamada não encerra, mesmo quando ela nunca volta:

```luam static
function mustFind(id: number): string
    local found = lookup(id)

    if found ~= nil then
        return found
    end

    error('sem entrada para ' .. tostring(id))
end
```

O `error` levanta um erro, então a última linha é inalcançável de fato — mas nada
no sistema de tipos diz isso. Marcar uma chamada como terminadora exige um tipo
de retorno que nunca retorna, que o Luam não tem, e adivinhar pelo nome `error`
seria uma regra sobre um identificador, não sobre tipos.

O reparo é a anotação. Declare `: string?` e a assinatura passa a dizer a verdade
sobre uma função que pode não produzir valor, ou retorne um valor de reserva em
vez de levantar o erro.

## Um parâmetro de tipo só na posição de retorno é `any`

**Decisão de projeto.** Registrada na
[ADR-032](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/032-erased-generic-classes.md).

Os argumentos de tipo são inferidos em uma passada única sobre os argumentos que
a chamada de fato passa. Cada parâmetro é casado com o argumento na mesma
posição, e o que sobrar sem ligação vira `any`:

```luam static
function make<T>(): T
    return decode()
end

local value = make()
```

`T` não aparece na lista de parâmetros, então nada o liga e `value` é `any` em
vez de um erro. O mesmo vale para um parâmetro que só um argumento posterior
poderia ter decidido; a inferência não volta a uma posição anterior depois de
passar dela.

Escreva o argumento quando precisar do tipo: `make<string>()` liga `T` e o
resultado é `string`. É a mesma inferência que as
[classes genéricas](/pt-br/language/classes#parametros-de-tipo) e as
[funções genéricas](/pt-br/language/functions#funcoes-genericas) compartilham, e
é a regra que a ADR-032 registrou, não uma que isto acrescenta.

## Requisitos de biblioteca são nomeados, nunca resolvidos

**Decisão de projeto.** Registrada na
[ADR-038](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/038-library-distribution.md).

O Luam compila os pacotes que `libraries` nomeia e para por aí. Uma biblioteca
declara o que precisa na própria lista `requires`, e um requisito que o consumidor
não listou é `config-library-requirement-missing`, nomeando o pacote e o comando
de instalação — ele nunca é instalado, e os requisitos dele não são percorridos.

A razão é o namespace plano do Lua. Duas versões de uma mesma biblioteca não
coexistem em um resource, então um resolvedor gastaria toda a sua superfície
produzindo conflitos que não teria como resolver. O gerenciador de pacotes segue
instalando o grafo inteiro; o Luam apenas se recusa a adivinhar que partes dele
entram no build.

Uma biblioteca com três requisitos faz o consumidor listar quatro pacotes, um
diagnóstico de cada vez.

## Uma colisão de biblioteca é reportada, não resolvida

**Decisão de projeto.** Registrada na
[ADR-038](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/038-library-distribution.md).

Todo nome de nível superior que uma biblioteca declara vira uma global no resource
consumidor. Duas bibliotecas que declaram um nome no mesmo lado, ou uma biblioteca
e um arquivo do projeto que façam isso, são `project-library-collision`.

O Luam não cria namespace, alias nem renomeia para as duas caberem. O Lua 5.1 tem
uma única tabela global por lado, e renomear mudaria o significado dos arquivos da
própria biblioteca. O reparo é do consumidor: parar de usar uma das duas, ou pedir
ao autor da biblioteca que qualifique os nomes dela.

Uma biblioteca que declara um nome que a API do MTA define é
`project-library-shadows-api`, um warning e não um erro, porque envolver uma
função do MTA é algo legítimo para uma biblioteca fazer.

## Uma biblioteca publica código, não assets

**Decisão de projeto.** Registrada na
[38.04](https://github.com/ThigasDevelopment/luam/blob/main/.claude/plans/38.04-library-vendoring.md).

O campo `luam` de uma biblioteca nomeia padrões de código, e o build grava o que
eles casam: `.luam` compilado, `.lua` copiado, `.d.luam` apagado. Uma imagem, uma
fonte ou um `.fx` dentro do pacote não é copiado para o resource, e não existe um
mapeamento no estilo `assets` do lado da biblioteca.

Um projeto que precisa de um asset da biblioteca o copia pelo próprio domínio
`assets`, onde o destino é revisável no manifesto que é dono do build.

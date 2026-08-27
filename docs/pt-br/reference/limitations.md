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

## O estreitamento não atravessa um ramo nem um laço

**Planejado.** Um grafo de fluxo de controle é o que resolve isso.

Um fato vive dentro do bloco que a condição protege. Guardar a condição em uma
variável não leva o fato adiante, porque a variável não é o teste:

<<< @/snippets/errors/flow-narrowing/src/server/adapter.luam{luam}

<<< @/snippets/output/errors/flow-narrowing.txt{text}

Teste o próprio caminho, no bloco que o usa:

```luam static
if self.connection ~= nil then
    local handle: userdata = self.connection
end
```

Uma guarda com saída antecipada vale: quando o bloco sempre sai com `return` ou
`break`, a condição negada refina o resto do bloco que a contém. O que não vale
é qualquer coisa mais sutil — um campo refinado nos dois ramos de um `if` e lido
depois dele, um `while` que só às vezes dá `break`, uma flag definida em um ramo
e lida em outro.

Uma operação ainda precisa ser válida para a união inteira: `key + 1` em
`string | number` é `check-invalid-operand`, porque um dos membros não soma. A
concatenação é a exceção, já que todo membro de `string | number` concatena.

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

## Sem metamétodos ou classes genéricas

**Planejado.** Classes genéricas são uma lacuna, e um subconjunto revisado de
metamétodos vem depois delas.

- Metamétodos não podem ser declarados em uma classe.
- Classes não recebem parâmetros de tipo.

Membros estáticos saíram desta lista: `static` declara um campo ou um método no
valor da classe, e [classes](../language/classes.md) cobre o assunto.

**Aliases** de tipo genéricos funcionam:

```luam
type Nullable<T> = T | nil
```

Nem tudo volta. `__index`, `__newindex` e `__call` continuam bloqueados
independentemente do que for exposto, porque cada um deles pode substituir a
busca de membro, engolir uma escrita ou tornar uma instância chamável — e o
helper de classe constrói identidade, herança e construção em cima dos três.

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

## Exports são nomeados, nunca verificados

**Planejado.** Um contrato de export versionado vai verificar as chamadas que um
build consegue identificar.

`export` escreve uma entrada `<export>` no `meta.xml`, e `export http` marca
`http="true"` nela. O que ele não faz é verificar o lado que chama: um
`call(resource, 'name', ...)` de outro resource nunca é checado contra a
assinatura que você exportou.

Uma chamada cujo nome de resource ou de função é calculado em execução continua
sem verificação mesmo depois disso. Não há o que um compilador resolva ali.

## O editor reverifica por declaração, não por edição

**Planejado.** Um grafo de dependências vai estreitar o que uma mudança de
declaração reverifica.

Editar um arquivo reanalisa os outros só quando muda o que aquele arquivo
**declara** — uma classe, uma interface, um enum ou um global, incluindo o tipo
de qualquer membro. Editar o corpo de uma função republica diagnóstico só
daquele arquivo, que é o que mantém a digitação barata em projeto grande.

Quando uma declaração muda, todo arquivo que enxerga aquela declaração é
reanalisado, não só os que a usam. Em projeto grande isso é mais trabalho do que
a mudança exige.

Nada disso depende de o arquivo estar aberto. O servidor varre o workspace ao
iniciar, e a extensão observa `**/*.luam`, `.luam.manifest` e `.env*`, então um
arquivo criado, movido ou apagado fora do editor chega até ele sem reinício. Um
cliente LSP que não registra observadores de arquivo enxerga só o que você abre —
essa é a metade do protocolo que cabe ao cliente, não uma configuração do Luam.

## O `config.lua` nunca é analisado

**Decisão de projeto.** Um build nunca lê o Lua do projeto em busca de
significado.

Ele é copiado como está, então o compilador não sabe nada sobre o seu conteúdo.
Descreva-o com um
[arquivo de declaração](/pt-br/language/declaration-files) para obter tipos.

Executá-lo para ler os valores faria um build rodar código do projeto, que é
justamente o que o compilador se recusa a fazer. Um extrator futuro pode escrever
o arquivo de declaração para você a partir de dados literais — como um comando
que você roda e um arquivo que você commita, nunca como uma etapa dentro do
build.

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

## Escopo dos logs de desenvolvimento

**Planejado.** Uma ponte autenticada vai cobrir um servidor de desenvolvimento
remoto.

O `luam dev` lê apenas o log **local** do servidor MTA. Ele não coleta logs
remotos, não avalia expressões e não observa valores em execução. Linhas nativas de
outros resources nomeados são ignoradas, e linhas da engine sem atribuição podem
aparecer como saída simples do servidor porque a origem delas não pode ser
classificada com segurança.

Avaliar uma expressão em um servidor rodando continua fora dessa ponte. Isso é um
depurador, e precisa do próprio protocolo e da própria decisão de segurança.

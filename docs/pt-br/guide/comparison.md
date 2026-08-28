# Luam em comparação

O Luam é uma linguagem tipada que compila para Lua 5.1 para o Multi Theft Auto.
Se você já escreve Lua, Luau ou TypeScript, quase toda esta página é sobre o
punhado de decisões que diferem — o que esperar, e o que não esperar.

## De relance

| | Luam | Lua 5.1 | Luau | TypeScript |
| --- | --- | --- | --- | --- |
| Roda em | o Lua 5.1 do MTA | qualquer host Lua 5.1 | a VM do Luau | um runtime JavaScript |
| O que é publicado | Lua 5.1 legível e depurável | o próprio código | o próprio código | JavaScript |
| Tipos | verificados no build, apagados | nenhum | verificados, graduais | verificados no build, apagados |
| Blocos | `end` | `end` | `end` | chaves |
| Desigualdade | `~=` | `~=` | `~=` | `!==` |
| Comentário de linha | `#` | `--` | `--` | `//` |
| Valor opcional | `name?: T` | — | `T?` | `name?: T` |
| Classes | `class`, rebaixado para metatables | metatables na mão | metatables na mão | `class` |
| Reuso entre arquivos | escopo de ambiente e ordem de carga | `require` | `require` | `import` |
| Conhecimento da API da plataforma | o catálogo fixado do MTA, por ambiente | nenhum | tipos do Roblox | declarações de DOM e bibliotecas |

## Vindo de Lua

As fundações não mudam. Blocos fecham com `end`, a desigualdade é `~=`, tabelas
começam em 1, `nil` e `false` são os únicos valores falsos, e a biblioteca padrão
se comporta como no seu servidor hoje. Veja [Fundamentos de
Lua](/pt-br/language/syntax).

Três coisas mudaram, e cada uma comprou algo:

- **Comentários são `#`.** O Luam adiciona `--` como statement de decremento,
  então os dois colidiriam. `#items` continua sendo o operador de comprimento.
- **Um `:` depois de um nome introduz um tipo.** `local health: number = 100` é
  verificado no build e emitido como `local health = 100`.
- **A pasta decide o ambiente.** `src/server`, `src/client` e `src/shared` são
  lidos pelo compilador, não só por você, e é isso que faz uma API só de cliente
  ser um erro em um arquivo de servidor.

O que você ganha sobre Lua puro em um resource do MTA é um build que se recusa a
publicar uma native escrita errado, uma chamada do lado errado ou um argumento de
tipo errado, mais um `meta.xml` gerado a partir dos arquivos que você escreveu.

## Vindo de Luau

As duas linguagens adicionam tipos graduais ao Lua e os apagam antes de qualquer
execução, e as duas mantêm `end`, `~=` e a biblioteca padrão de Lua. As
diferenças são sobre o alvo:

- O Luam emite **código Lua 5.1** para um host que ele não controla — um servidor
  MTA rodando um interpretador sem modificações. O Luau é uma linguagem e uma VM
  próprias.
- O Luam escreve o marcador de opcional no nome — `name?: string` — e não no
  tipo.
- Comentários no Luam são `#`; o Luau mantém o `--` de Lua.
- O Luam tem `class`, com herança, interfaces e acessores, rebaixado para
  metatables no build. O Luau não tem sintaxe de classe.
- O Luam não tem `require`. Os arquivos se alcançam pelo escopo do ambiente e
  pela ordem de carga declarada no manifesto, que é como o MTA carrega um
  resource.

`continue`, atribuição composta e interpolação de string existem nas duas, com a
interpolação do Luam escrita `` `texto ${name}` ``. Veja [Strings de
template](/pt-br/language/template-strings).

## Vindo de TypeScript

O sistema de tipos vai parecer familiar: anotações, uniões, interseções, tipos
literais, interfaces, aliases com parâmetros de tipo, narrowing e apagamento no
build. Classes também recebem parâmetros de tipo, inferidos a partir do argumento
do construtor e apagados na emissão — veja
[Parâmetros de tipo](/pt-br/language/classes#parametros-de-tipo). A sintaxe por
baixo é Lua, não JavaScript:

- Blocos fecham com `end`, não com `}`, e a desigualdade é `~=`, não `!==`.
- Não existe `import` nem `export` de nomes entre arquivos. `export` no Luam
  significa outra coisa: publica uma função para **outros resources do MTA**
  através do `meta.xml`. Veja [Exports](/pt-br/language/exports).
- A veracidade é a de Lua: `0` e `''` são verdadeiros, e só `nil` e `false` são
  falsos.
- Arrays são tabelas e começam no índice 1.
- Não existe um `undefined` estrutural. Um valor ausente é `nil`, e um opcional
  se escreve `name?: T`.

O trabalho do compilador também é mais estreito que o do `tsc`: existe um alvo,
Lua 5.1, e nenhuma configuração que mude o dialeto emitido.

## O que o Luam deliberadamente não faz

- Não verifica tipos em execução. Uma anotação não gera guarda, então dados que
  atravessam um evento de rede ainda precisam de uma validação escrita por você.
  Veja [Fronteiras de segurança](/pt-br/mta/security).
- Não substitui o modelo do MTA. Um resource continua sendo `meta.xml`, scripts
  por lado e a API do MTA — o Luam gera o primeiro e verifica a terceira.
- Não adiciona gerenciador de pacotes, bundler para código de terceiros nem
  framework de runtime.

## Referências

- [Manual de referência de Lua 5.1](https://www.lua.org/manual/5.1/)
- [Documentação do Luau](https://luau.org/)
- [Handbook do TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Wiki de scripting do Multi Theft Auto](https://wiki.multitheftauto.com/wiki/Scripting_Introduction)

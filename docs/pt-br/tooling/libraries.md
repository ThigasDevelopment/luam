# Bibliotecas

Uma biblioteca Luam é um pacote npm que publica código Luam. O gerenciador de
pacotes baixa; o compilador lê do disco e compila dentro do resource que a usa.

Nada disso é hospedado pelo Luam. Não há registro, não há índice e não há
`luam add`: a primitiva é o comando de instalação que o projeto já roda, e o
campo do manifesto que nomeia o que o build pode ler.

## Consumindo uma

Instale o pacote e nomeie em `libraries`:

```bash
npm install @luam-example/collections
```

```luam
libraries = { '@luam-example/collections' }
```

O build então lê o pacote em `node_modules`, verifica junto com o projeto e grava
a saída dentro do resource. Estar em `node_modules` nunca basta sozinho — um
pacote que o manifesto não nomeia não é compilado, porque um build é função dos
arquivos revisados, não do estado da instalação.

Veja [`libraries`](/pt-br/tooling/luam-manifest#libraries) para o campo, a regra
de ordem e a diferença para `dependencies`.

## Escrevendo uma

Uma biblioteca é um pacote npm comum cujo `package.json` traz um campo `luam`:

```json
{
    "name": "@luam-example/collections",
    "version": "0.1.0",
    "keywords": ["luam"],
    "luam": {
        "sources": {
            "shared": ["src/**/*.luam", "src/**/*.lua"]
        },
        "requires": []
    }
}
```

`sources` aceita os mesmos três lados do manifesto do projeto — `server`,
`client`, `shared` — e os mesmos padrões `*`, `**`, `?`. Os padrões são relativos
à raiz do pacote e não podem sair dela: um que resolva para fora é
`config-library-escape`, então uma biblioteca nunca alcança a árvore do projeto
que a consome.

Os arquivos são emitidos na ordem que o campo declara: lado a lado na ordem
`shared`, `server`, `client`, os padrões de cada lado na ordem listada, e os
caminhos ordenados dentro de um padrão. É a mesma ordem que o checker usa, então
o que foi verificado e o que o resource carrega concordam.

### O que uma biblioteca pode publicar

- `.luam` compilado a partir do código. Os tipos dela são o código dela; não há
  resumo para publicar nem nada que possa divergir.
- `.lua` copiado literalmente, para código que o compilador não escreve.
- Arquivos de declaração `.d.luam` que dão tipos a esse Lua literal. Um arquivo
  de declaração não emite nada, exatamente como em um projeto.

### A biblioteca é dona do ambiente dela

O lado em que um arquivo roda vem do campo `luam`, por padrão. O consumidor não
pode reatribuir, e uma diretiva `#!` dentro de um arquivo de biblioteca que
discorde da declaração é `env-library-directive`. Depois de resolvido, um arquivo
de biblioteca é um arquivo comum daquele lado: um símbolo `server` usado de um
arquivo client é o mesmo [erro de ambiente](/pt-br/mta/environments) que qualquer
arquivo do projeto receberia.

### Todo nome de nível superior vira uma global

O MTA tem um único namespace global por lado, então todo nome de nível superior
que uma biblioteca declara é uma global em todo resource que a usa. É o fato a
saber antes de escolher nomes.

- Duas bibliotecas que declaram um nome no mesmo lado são
  `project-library-collision`, e o mesmo vale para uma biblioteca que declara um
  nome que um arquivo do projeto declara. O compilador reporta a colisão; ele não
  resolve, e o reparo do consumidor é parar de usar uma das duas.
- Uma biblioteca que declara um nome que a API do MTA define é
  `project-library-shadows-api`, um warning e não um erro, porque envolver uma
  função do MTA de propósito é algo legítimo para uma biblioteca fazer.

Prefixe ou qualifique de outra forma os nomes que uma biblioteca expõe.

### Uma biblioteca enxerga só a si mesma

A visibilidade é de mão única. Um arquivo do projeto enxerga as globais de toda
biblioteca listada; um arquivo de biblioteca enxerga só o próprio pacote e as
bibliotecas que ele exige. Uma biblioteca que lê uma global do consumidor é
`project-library-project-reference` — nesse ponto ela não é uma biblioteca, é um
pedaço de um projeto.

### Requisitos são declarados, nunca percorridos

Uma biblioteca que precisa de outra nomeia:

```json
{
    "luam": {
        "sources": { "shared": ["src/**/*.luam"] },
        "requires": ["mta-async"]
    }
}
```

O Luam lê os pacotes que o manifesto nomeia e para. Um requisito que o consumidor
não listou é `config-library-requirement-missing`, nomeando o pacote e o comando
de instalação; o desenvolvedor adiciona e builda de novo. Não existe resolução
transitiva, de propósito: duas versões de uma mesma biblioteca não coexistem em um
namespace Lua plano, então um resolvedor só produziria conflitos que não poderia
resolver.

## Onde o código cai

No layout em árvore uma biblioteca compila para `libs/<pacote>/<ambiente>/`,
espelhando a árvore de código dela por baixo, ao lado dos helpers de runtime em
`lib/<ambiente>/`. Um nome com escopo é achatado — `@escopo/nome` vira
`escopo-nome` — então nenhum `@` e nenhum diretório aninhado chega a um caminho do
MTA. No layout em bundle os módulos dela são concatenados no bundle do ambiente
antes dos do próprio projeto.

Scripts de biblioteca são entradas `<script>` enumeradas no `meta.xml`, nunca
curingas, depois da biblioteca de runtime e antes de `config.lua`, das entradas
fixadas em `loadOrder` e dos curingas de código. Uma entrada de `loadOrder` que
nomeia um arquivo de biblioteca é `project-load-order-library`: a ordem de emissão
é a que `libraries` declara.

Um helper de que a biblioteca precisa — o runtime de classes, as extensões de
string — é emitido uma vez e primeiro, do mesmo conjunto de requisitos que o
código do projeto alimenta.

## Bibliotecas e exports

As duas respostas existem e são ortogonais.

| | Biblioteca | [Contrato de exports](/pt-br/language/exports) |
| --- | --- | --- |
| O que atravessa | Código, em tempo de compilação | Uma chamada, em tempo de execução |
| Onde o código roda | Dentro do resource consumidor | Dentro do resource provedor |
| Campo do manifesto | `libraries` | `dependencies` |
| Serve para | Um módulo puro — uma fila, um formatador, um utilitário de matemática | Um serviço com estado — um banco, um registro de veículos |

Um projeto costuma fazer as duas coisas.

## Fronteiras

- Uma biblioteca publica código. Copiar imagens ou outros assets de uma
  biblioteca para o resource não faz parte do modelo.
- Uma biblioteca é embutida, então cada resource consumidor carrega a própria
  cópia. Dois resources que usam uma biblioteca a enviam duas vezes; quando isso
  importa, o contrato de exports é a resposta.
- Scripts de instalação do npm rodam com os privilégios do desenvolvedor antes de
  o compilador entrar. Essa é a fronteira do gerenciador de pacotes, não do
  compilador — o compilador compila o código da biblioteca e nunca o executa.

# .luam.manifest

O `.luam.manifest` fica na raiz do projeto e **é um único construtor de tabela**.
O arquivo é um valor, não um programa: não há nenhuma instrução nele, nada antes
do `{` de abertura e nada depois do `}` de fechamento.

O recurso recebe o nome da pasta que guarda o manifesto. Não existe campo `name`,
porque o MTA já resolve um recurso pelo diretório dele e duas respostas para uma
pergunta podem discordar.

```luam manifest
{
    info = {
        author = { name = 'dracoN*', discord = 'draconzx' },

        version = '1.0.0',
        description = 'Heaven Roleplay.',

        dependencies = {
            'hr_core',

            'hr_admin',
        },
    },

    environment = {
        oop = false,
        strict = true,

        version = {
            server = '1.6.0',
            client = '1.6.0',
        },
    },

    scripts = {
        { path = 'config.lua', type = 'shared' },
        { path = 'items.lua', type = 'shared' },

        { path = 'src/utils/lib/*.luam', type = 'shared' },

        { path = 'src/utils/format.luam', type = 'shared' },
        { path = 'src/utils/render.luam', type = 'client' },

        { path = 'src/services/**/*.server.luam', type = 'server' },
        { path = 'src/services/**/*.client.luam', type = 'client' },

        { path = 'src/index.luam', type = 'server' },
        { path = 'src/interface.luam', type = 'client' },
    },

    files = {
        'list.xml',

        'assets/images/**/*.png',
    },

    build = {
        output = 'build',

        details = {
            bundle = false,
            minify = false,
            map = false,
        },
    },
}
```

Esse manifesto, em uma pasta chamada `heaven-roleplay`, gera este `meta.xml`:

```xml
<heaven-roleplay>
    <!-- INFO -->
    <info author="dracoN*" type="script" version="1.0.0" description="Heaven Roleplay." discord="draconzx" />
    <include resource="hr_core" />

    <include resource="hr_admin" />
    <!-- ENVIRONMENT -->
    <oop>false</oop>
    <min_mta_version server="1.6.0" client="1.6.0" />
    <!-- SCRIPTS -->
    <script src="config.lua" type="shared" cache="false" />
    <script src="items.lua" type="shared" cache="false" />

    <script src="src/utils/lib/*.lua" type="shared" cache="false" />

    <script src="src/utils/format.lua" type="shared" cache="false" />
    <script src="src/utils/render.lua" type="client" cache="false" />

    <script src="src/services/**/*.server.lua" />
    <script src="src/services/**/*.client.lua" type="client" cache="false" />

    <script src="src/index.lua" />
    <script src="src/interface.lua" type="client" cache="false" />
    <!-- FILES -->
    <file src="list.xml" />

    <file src="assets/images/**/*.png" />
</heaven-roleplay>
```

Leia os dois lado a lado e a regra fica visível: **ordem é posição**, e uma linha
em branco entre duas entradas é uma linha em branco entre os elementos delas.

## As cinco seções

| Seção | O que ela responde |
| --- | --- |
| `info` | O que o recurso é, quem o escreveu e o que precisa estar ao lado dele |
| `environment` | O ambiente em que o recurso roda e contra o qual é checado |
| `scripts` | Quais scripts carregam, em que ordem e em que lado |
| `files` | Quais arquivos o recurso entrega |
| `build` | Onde o build escreve e o que ele escreve lá |

Cada campo de cada seção está em
[campos de configuração](/pt-br/reference/configuration-fields).

## Ordem é posição

`scripts`, `files`, `environment.libraries` e `info.dependencies` são listas
ordenadas. A ordem na tabela é a ordem no arquivo gerado, então mover uma entrada
para cima move o elemento dela para cima e não muda mais nada.

Não existe uma ordem de carregamento separada para manter em dia com uma lista de
fontes separada, porque não existe lista separada: um caminho é escrito uma vez,
onde ele carrega.

## Uma linha em branco é um limite de grupo

Uma linha em branco entre duas entradas de uma lista ordenada chega ao arquivo
gerado no mesmo lugar. Esta é a única construção do manifesto cujo espaço em
branco carrega significado.

- Uma ou mais linhas em branco são um limite, e o arquivo gerado recebe uma.
- Uma linha em branco antes da primeira entrada, ou depois da última, não é um
  limite.
- Uma linha de comentário entre duas entradas não é um limite e não é levada.

O `luam format` preserva uma sequência em branco entre entradas, reduz uma
sequência maior a uma linha e nunca introduz uma. A regra não lê `maxBlankLines`
do [.luam.formatter](/pt-br/reference/formatter-file): um manifesto cujo layout
dependesse de uma opção do formatador geraria um arquivo diferente em duas
máquinas.

## `scripts`

Uma entrada é `{ path, type }`. `path` é um arquivo ou um padrão com `*`, `**` ou
`?`; `type` é `'server'`, `'client'` ou `'shared'`.

O lado é declarado onde o caminho é declarado, então o projeto é livre para se
organizar como quiser — `src/utils/` recebe o tipo da entrada dele, não do
diretório em que está. Uma diretiva `#!server`, `#!client` ou `#!shared` continua
sendo uma sobrescrita por arquivo e ainda avisa quando discorda da entrada.

Um `<script src>` carrega o texto da própria entrada com `.luam` reescrito para
`.lua`, então um diretório de scripts é uma linha no manifesto e uma linha no
`meta.xml`. O MTA expande o curinga sozinho.

Um caminho `.lua` é válido: um script nativo é copiado literalmente e carrega na
posição que a lista lhe dá, à frente ou atrás dos compilados.

Um arquivo alcançado por duas entradas é `config-script-side-conflict`, quaisquer
que sejam os lados: o arquivo seria escrito uma vez e carregado duas. Estreite os
padrões para que cada arquivo pertença a uma entrada.

Um caminho literal que não nomeia arquivo nenhum é `config-missing-script` e falha
o build. Um padrão cujo diretório existe e que mesmo assim não alcançou nada é
`config-empty-script-entry`, um aviso — uma entrada que nomeia um diretório que o
projeto ainda não escreveu não diz nada.

## `files`

Uma entrada é um caminho simples. Origem e destino são o mesmo, então o caminho
chega a `<file src>` exatamente como foi escrito e a lista gerada pode ser lida
contra a árvore.

```luam manifest
{
    files = {
        'list.xml',

        'assets/images/**/*.png',
        'assets/shader/**/*.fx',
    },
}
```

Adicionar uma imagem em `assets/images/` não muda nenhuma linha do `meta.xml`.
Renomear um arquivo no caminho para dentro do recurso não é possível: mova o
arquivo no projeto.

Uma entrada que não alcança nada é `config-empty-file-entry` e falha o build. Duas
entradas reivindicando um arquivo são `config-output-collision`. Uma entrada que
alcançaria o `.env` é `config-environment-file-entry`: um cliente que pode baixar
o arquivo de ambiente é um recurso que vaza os segredos dele.

## `info`

`author` é um registro. `name` é obrigatório e é o atributo que o próprio MTA usa.
O catálogo também nomeia `discord`, `github` e `email`, então o editor os oferece,
mas o registro é **aberto**: qualquer outra chave que você escrever também é
aceita.

```luam manifest
{
    info = {
        author = { name = 'dracoN*', discord = 'draconzx', twitch = 'draconzx' },

        version = '1.0.0',
        description = 'Heaven Roleplay.',
    },
}
```

Toda chave menos `name` é escrita como um atributo de info, na ordem em que você a
escreveu, e cada uma pode ser lida em execução pelo próprio nome:

```lua
getResourceInfo(getThisResource(), 'discord')   --> 'draconzx'
getResourceInfo(getThisResource(), 'twitch')    --> 'draconzx'
getResourceInfo(getThisResource(), 'nada')      --> false
```

O `getResourceInfo` lê um atributo por vez e devolve `false` para um que não
existe, então um registro aberto não custa nada: uma chave que o catálogo não
nomeia chega ao recurso exatamente como uma que ele nomeia.

`dependencies` nomeia outros recursos do MTA e emite um `<include>` para cada um,
na ordem em que foram escritos. Uma entrada repetida é
`config-duplicate-dependency` em vez de um descarte silencioso, e nomear este
recurso é `config-invalid-dependency`.

## `environment`

`environment` descreve o ambiente em que o recurso executa, e guarda quatro
perguntas de propósito: se ele é orientado a objetos, se é checado no modo
estrito, de qual versão do MTA precisa e com quais bibliotecas é construído.

```luam manifest
{
    environment = {
        secret = '.env',

        oop = false,
        strict = true,

        version = {
            server = '1.6.0',
            client = 'latest',
        },

        libraries = {
            '@luam-example/collections',
        },
    },
}
```

`secret` nomeia o único arquivo que declara as chaves de ambiente. Veja
[configuração de ambiente](/pt-br/recipes/environment-configuration).

`oop` chega ao arquivo gerado sempre que é escrito: `true` emite
`<oop>true</oop>` e `false` emite `<oop>false</oop>`, porque um recurso que diz
`false` está declarando uma decisão. Um `oop` ausente não emite nada.

`version.server` e `version.client` são resolvidos por lado. `'latest'` segue a
versão publicada mais recente do MTA, com cache de um dia; um build offline sem
cache deixa o elemento de fora e avisa.

`libraries` nomeia pacotes npm instalados que entregam fontes Luam. Veja
[bibliotecas](/pt-br/tooling/libraries).

A identidade de cache é por campo, não por seção: editar `secret` não recompila,
editar `strict` recompila, e editar `version` muda apenas o arquivo gerado.

## `build`

```luam manifest
{
    build = {
        output = 'build',

        details = {
            bundle = true,
            minify = true,
            map = true,
        },
    },
}
```

`output` nomeia o diretório sob o qual o artefato é escrito, e o recurso vai parar
em `<output>/<pasta>`. Ele pode ser absoluto e pode sair do projeto: um build
escrito em outro disco é uma coisa legítima de querer.

A proteção fica do outro lado. O build escreve um marcador `.luam-build` quando
cria um diretório de recurso, poda apenas dentro de um diretório que carregue esse
marcador, e diz isso e não remove nada em qualquer outro lugar. Uma limpeza de
arquivos antigos apontada para um diretório que o build não criou é como um
caminho de saída vira perda de dados.

`details.bundle` escreve um arquivo Lua por lado em vez de espelhar a árvore, e a
lista ordenada `scripts` passa a decidir a ordem dos membros dentro de cada pacote
em vez da ordem dos elementos `<script>`. As duas formas são ordenadas por
posição; só muda o artefato que a posição ordena. Veja
[layouts de saída](/pt-br/reference/output-layouts).

`details.obfuscate` está declarado e ainda não é honrado. Defini-lo como `true`
reporta `config-unimplemented-option` nomeando o marco que vai compilar o Lua
gerado para bytecode, então o campo nunca fica em silêncio sem fazer nada.

## O dialeto

Um valor de manifesto é um literal, uma tabela, ou esses combinados com `and`,
`or`, `not`, comparação, aritmética e concatenação. Não há chamadas, laços nem
expressões de função, então o arquivo não pode divergir, não pode ler um arquivo e
não pode observar nada além dos valores que recebeu. É isso que permite ao editor
avaliá-lo em processo a cada tecla.

### Valores injetados

Três nomes estão em escopo dentro da tabela:

| Nome | Tipo | O que é |
| --- | --- | --- |
| `mode` | `string` | `'production'` no `luam build`, `'development'` no `luam dev`, `'check'` no `luam check` |
| `env` | `Env` | O ambiente do processo, cada chave uma string opcional |
| `root` | `string` | O diretório absoluto do projeto |

```luam manifest
{
    build = { output = mode == 'production' and 'build' or 'build-dev' },
}
```

Não existe `local`. Um valor intermediário é escrito onde é usado, então
`env.SOME_KEY` pode aparecer uma vez por uso.

### No editor

O servidor de linguagem completa as seções no nível de cima, os campos de uma
seção dentro dela, e os três lados em `type =`. O hover nomeia o caminho completo
do campo, o tipo, o padrão e a regra. Uma chave escrita errado põe o cursor sobre
a chave, não sobre o valor.

## Quando o arquivo está errado

| Código | Significado |
| --- | --- |
| `config-manifest-not-a-table` | O arquivo não é um único construtor de tabela |
| `config-trailing-content` | Há algo escrito depois da tabela |
| `config-unexpected-statement` | O arquivo começa com uma instrução, `local` incluído |
| `config-unknown-field` | Uma chave que nenhuma seção declara, com o cursor sobre a chave |
| `config-duplicate-field` | Uma chave escrita duas vezes, em vez de a última vencer |
| `config-missing-field` | Um campo obrigatório de um registro está ausente |
| `config-invalid-type` | Um valor do tipo errado |
| `config-removed-field` | Um campo que este manifesto não tem mais, nomeando para onde foi |
| `config-manifest-form` | O arquivo ainda é uma lista de atribuições |

## A forma de atribuições

Um manifesto escrito como lista de atribuições ainda carrega por um minor, é
convertido internamente e reporta `config-manifest-form` uma vez. Rode
[`luam migrate`](/pt-br/guide/migration) para reescrevê-lo, ou aceite a mesma
reescrita como uma ação de código do editor. O conversor é removido no próximo
major.

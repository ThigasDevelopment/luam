# Usando uma biblioteca

Um projeto que lista uma biblioteca Luam instalada, estende uma classe que ela
declara e envia a biblioteca dentro do próprio resource.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).
- Node e um gerenciador de pacotes, que a CLI já exigia.

## Árvore de arquivos

```
luam-docs-using-a-library/
├── .luam.manifest
├── package.json
├── node_modules/
│   └── @luam-example/collections/   instalado pelo gerenciador de pacotes
└── src/
    └── shared/lobby.luam
```

## Instale a biblioteca

```bash
npm install @luam-example/collections
```

Instalar é passo do desenvolvedor. `build`, `check`, `ensure`, `dev` e `test` só
leem `node_modules` do disco, então uma máquina sem rede e com `node_modules`
preenchido gera exatamente a mesma saída.

## Código

<<< @/snippets/using-a-library/.luam.manifest{js}

<<< @/snippets/using-a-library/src/shared/lobby.luam

A biblioteca em si é um pacote npm comum. O `package.json` dela declara o layout
que o compilador lê:

<<< @/../examples/library/package.json{json}

<<< @/../examples/library/src/queue.luam

Ela também publica um arquivo Lua literal com um arquivo de declaração ao lado,
para o consumidor ter tipos de um código que o compilador não escreve:

<<< @/../examples/library/src/format.lua{lua}

<<< @/../examples/library/src/format.d.luam

## Por que funciona

`libraries` nomeia o que o build pode ler. O compilador resolve o pacote em
`node_modules`, compila o código dele junto com o do projeto e coloca os nomes de
nível superior no mesmo namespace plano, então `Queue` e `formatCount` estão
visíveis para `lobby.luam` sem import. Os tipos da biblioteca são o código dela,
então `self.size()` é verificado, e uma biblioteca que não passa na checagem
quebra este build.

A visibilidade é de mão única: o projeto enxerga a biblioteca, a biblioteca nunca
enxerga o projeto.

## Comandos

```bash
luam check
luam build
```

## Resultado esperado

<<< @/snippets/output/using-a-library.check.txt{text}

Três arquivos compilados: dois da biblioteca, um do projeto.

No layout em bundle, que é o padrão, os módulos da biblioteca são concatenados no
bundle do ambiente antes dos do projeto. No layout em árvore — `--no-bundle`, ou
`output = { bundle = false }` — eles são gravados sob `libs/`, com o nome com
escopo achatado:

```
lib/class.lua
lib/string.lua
libs/luam-example-collections/shared/src/queue.lua
libs/luam-example-collections/shared/src/format.lua
src/shared/lobby.lua
```

e o `meta.xml` enumera cada um, depois da biblioteca de runtime e antes dos
curingas de código:

```xml
<!-- Runtime library -->
<script src="lib/class.lua" type="shared" cache="false" />
<script src="lib/string.lua" type="shared" cache="false" />
<!-- Libraries -->
<script src="libs/luam-example-collections/shared/src/queue.lua" type="shared" cache="false" />
<script src="libs/luam-example-collections/shared/src/format.lua" type="shared" cache="false" />
<!-- Source scripts -->
<script src="src/shared/**/*.lua" type="shared" cache="false" />
```

O runtime de classes é emitido porque a biblioteca precisa dele, mesmo que o
arquivo do projeto sozinho não fosse pedir.

## Um erro comum

Listar um pacote que não está instalado interrompe o build antes de escrever
qualquer coisa:

```
error config-library-missing: "@luam-example/collections" is listed in "libraries" but is not installed. Install it with "npm install @luam-example/collections" and build again.
```

O compilador nunca baixa nada. Rode o comando de instalação e builde de novo.

## Próximos passos

- [Bibliotecas](/pt-br/tooling/libraries) — como escrever uma, e as regras que o
  autor precisa conhecer.
- [Exports](/pt-br/language/exports) — a outra resposta, para código que deve
  continuar rodando no resource dele.

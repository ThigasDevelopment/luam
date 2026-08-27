# Como o Luam funciona

Um build pega os arquivos que você escreve e escreve uma pasta de resource que o
MTA consegue iniciar. Entre essas duas pontas existe um compilador só, e é o
mesmo compilador que responde ao seu editor e ao playground. Esta página segue o
caminho uma vez, para que um resultado visto em uma ferramenta nunca seja
surpresa em outra.

## O caminho de um build

<div class="luam-diagram">
<svg viewBox="0 0 760 132" role="img" aria-labelledby="pipeline-title pipeline-description">
<title id="pipeline-title">O pipeline de build do Luam</title>
<desc id="pipeline-description">Cinco estágios em ordem: ler o projeto, resolver o ambiente de cada arquivo, analisar e verificar, emitir Lua 5.1, montar o resource. A lista abaixo do diagrama repete os mesmos estágios.</desc>
<rect class="luam-diagram-box" x="4" y="30" width="132" height="72" rx="8" />
<text class="luam-diagram-stage" x="20" y="55">1. Ler</text>
<text class="luam-diagram-detail" x="20" y="73">.luam.manifest</text>
<text class="luam-diagram-detail" x="20" y="88">src/**/*.luam</text>
<path class="luam-diagram-flow" d="M136 66 h20" />
<path class="luam-diagram-head" d="M156 61 l10 5 -10 5 z" />
<rect class="luam-diagram-box" x="168" y="30" width="132" height="72" rx="8" />
<text class="luam-diagram-stage" x="184" y="55">2. Ambiente</text>
<text class="luam-diagram-detail" x="184" y="73">server / client</text>
<text class="luam-diagram-detail" x="184" y="88">shared</text>
<path class="luam-diagram-flow" d="M300 66 h20" />
<path class="luam-diagram-head" d="M320 61 l10 5 -10 5 z" />
<rect class="luam-diagram-box" x="332" y="30" width="132" height="72" rx="8" />
<text class="luam-diagram-stage" x="348" y="55">3. Verificar</text>
<text class="luam-diagram-detail" x="348" y="73">tipos, classes</text>
<text class="luam-diagram-detail" x="348" y="88">catálogo do MTA</text>
<path class="luam-diagram-flow" d="M464 66 h20" />
<path class="luam-diagram-head" d="M484 61 l10 5 -10 5 z" />
<rect class="luam-diagram-box" x="496" y="30" width="132" height="72" rx="8" />
<text class="luam-diagram-stage" x="512" y="55">4. Emitir</text>
<text class="luam-diagram-detail" x="512" y="73">Lua 5.1</text>
<text class="luam-diagram-detail" x="512" y="88">helpers</text>
<path class="luam-diagram-flow" d="M628 66 h20" />
<path class="luam-diagram-head" d="M648 61 l10 5 -10 5 z" />
<rect class="luam-diagram-box" x="660" y="30" width="96" height="72" rx="8" />
<text class="luam-diagram-stage" x="676" y="55">5. Montar</text>
<text class="luam-diagram-detail" x="676" y="73">meta.xml</text>
<text class="luam-diagram-detail" x="676" y="88">assets</text>
</svg>
</div>

Os mesmos cinco estágios, em palavras:

1. **Ler.** O [`.luam.manifest`](/pt-br/tooling/luam-manifest) é analisado e
   verificado como qualquer outro arquivo Luam. Os padrões em `sources` decidem
   quais arquivos fazem parte do build, e os mapeamentos em `assets` decidem o
   que é copiado. Um `.lua` gerado nunca é entrada.
2. **Ambiente.** Todo arquivo resolve para `server`, `client` ou `shared` antes
   de qualquer verificação — pelo caminho dele, ou por uma diretiva `#!` na
   primeira linha. Veja [Ambientes](/pt-br/mta/environments).
3. **Verificar.** A análise e a checagem de tipos rodam contra os globais que
   aquele ambiente declara: os seus próprios módulos nos lados compatíveis, mais
   o catálogo fixado do MTA restrito àquele lado. Um nome que o catálogo não
   conhece fica `any` em vez de falhar.
4. **Emitir.** Cada módulo vira Lua 5.1, as anotações e a sintaxe exclusiva do
   Luam são apagadas, e o emissor registra quais [helpers de
   runtime](/pt-br/reference/output-layouts) a saída exige.
5. **Montar.** Os helpers, os módulos, o `config.lua`, o `env.lua` e os assets
   declarados são escritos no diretório de saída, e o `meta.xml` é gerado a
   partir do que o build realmente produziu — entradas de script por ambiente,
   entradas `<export>` e entradas `<file>` para os assets baixados.

## O ambiente é decidido primeiro

Resolver o ambiente não é uma verificação tardia — vem antes de o checador de
tipos olhar para uma única chamada. É essa ordem que faz `dxDrawText` em um
arquivo de servidor ser um erro em vez de uma surpresa em execução, e que impede
um módulo `server` de enxergar um global declarado por um módulo `client`.

## Um erro não escreve nada

Um build que reporta um erro não escreve arquivo nenhum. Não existe resource
parcial, então o diretório do servidor nunca fica com metade de uma mudança. É
por isso que `luam check` e `luam build` reportam os mesmos diagnósticos: o
primeiro é o segundo sem a escrita.

## Anotações nunca chegam ao servidor

Tipos, classes, enums, interfaces e diretivas são construções de tempo de
compilação. O Lua gerado não carrega anotação nenhuma nem uma guarda implícita
derivada delas — o que é verificado no build não é reverificado em execução:

```lua
local health = 100

function heal(player, amount)
    health = health + amount
end
```

Veja [Tipos](/pt-br/language/types) para a regra, e
[Limitações](/pt-br/reference/limitations) para o que o apagamento
deliberadamente não entrega.

## Um compilador atrás de três ferramentas

| Onde | O que roda | O que você recebe |
| --- | --- | --- |
| `luam check` e `luam build` | O compilador, no Node | Diagnósticos, e o resource quando passa |
| O seu editor | O [servidor de linguagem](/pt-br/tooling/language-server), que chama o compilador | Os mesmos diagnósticos enquanto você digita, mais completação, hover e rename |
| O [playground](/pt-br/playground) | O compilador e o servidor de linguagem, em um worker do navegador | Os mesmos diagnósticos e o mesmo Lua emitido, para um arquivo |

Existe um parser, um checador e um emissor. É por isso que um código de
diagnóstico lido no terminal é o código que o seu editor sublinha e o código que
o playground lista, e por que o Lua do playground é o Lua que um build escreve
para o mesmo código.

## O que o pipeline nunca faz

- Não executa o seu código. O `config.lua` é copiado como está e nunca é
  analisado nem avaliado por um build.
- Não roda o Lua gerado no navegador. O playground compila; o MTA executa.
- Não precisa de rede. A única requisição de saída que um build pode fazer é a
  consulta de `min_mta_version`, e um build sem rede continua funcionando.
- Não envia o seu código para lugar nenhum. O playground compila em um worker na
  sua máquina.

## Para quem contribui

Esta página descreve o que o pipeline significa para quem escreve um resource.
Os limites entre pacotes, o cache incremental e as internas do emissor estão no
[documento de
arquitetura](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/architecture.md)
do repositório.

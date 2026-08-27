# Estruturas de saída e mapas de código

O Luam usa uma estrutura compacta de bundles para um resource publicado e uma
estrutura em árvore para desenvolvimento. O bundle reduz o resource a no máximo
um script por ambiente; a minificação então remove a formatação do que o
`luam build` escreve. Ambos são exclusivos de produção, e nenhum dos dois
renomeia um identificador.

## Padrões dos comandos e sobrescritas

| Comando | Estrutura padrão | Sobrescrita da estrutura | Mapa de código |
| --- | --- | --- | --- |
| `luam build` | Bundle quando `output.bundle` é `true` (o padrão); árvore quando é `false`. Minificado nos dois casos. | `--bundle` ou `--no-bundle` sobrescreve a configuração. | Escreve `<outDir>/<name>.luam-map.json` quando `output.map` é `true` (o padrão), marcado como `minified`. `--no-map` desliga e remove esse mapa. |
| `luam ensure` | Árvore, independentemente de `output.bundle`. | `--bundle` seleciona bundle; `--no-bundle` seleciona árvore. | Mantém um mapa apenas em memória. Nunca escreve o arquivo de mapa. `--no-map` o desliga. |
| `luam dev` | Árvore, independentemente da configuração ou das flags de bundle. | Nenhuma. O `dev` sempre mantém os arquivos gerados individualmente acessíveis. | Mantém um mapa em memória para resolver os logs acompanhados. Nunca escreve o arquivo. `output.map: false` ou `--no-map` desliga a resolução. |

`ensure` e `dev` escrevem diretamente em
`<serverPath>/<resourcesDir>/<name>`, nunca em `<outDir>/<name>`.

## Estrutura de bundle

A saída padrão de `luam build` está pronta para implantação:

```text
build/
├── my-resource.luam-map.json     mantido fora do resource
└── my-resource/
    ├── meta.xml
    ├── config.lua                quando escrito pelo autor
    ├── env.lua                   quando há chaves declaradas; escrito uma vez
    ├── assets/                   caminhos originais preservados
    └── src/
        ├── shared.lua            quando há código ou helpers shared
        ├── server.lua            quando há código ou helpers de servidor
        └── client.lua            quando há código ou helpers de cliente
```

O diretório literal `src/` dos bundles não segue `sources`. Um ambiente vazio
não tem bundle nem entrada `<script>`. Não existe diretório `lib/` nem árvore de
módulos espelhada. Helpers de runtime e módulos são concatenados literalmente em
um chunk por ambiente, sem bloco em volta; helpers vêm antes dos módulos, e
`loadOrder` ainda controla a ordem dos módulos. Todo módulo compartilha o escopo
do chunk do bundle, então um `local` de nível de arquivo fica visível para todos
os módulos seguintes e o limite de 200 locals ativos do Lua 5.1 vale para o
bundle inteiro.

O manifesto lista `config.lua` primeiro quando presente, seguido pelos bundles
não vazios na ordem shared, server, client:

```xml
<script src="config.lua" type="shared" cache="false" />
<script src="src/shared.lua" type="shared" cache="false" />
<script src="src/server.lua" />
<script src="src/client.lua" type="client" cache="false" />
```

`config.lua`, `env.lua` e assets nunca entram em um bundle. `config.lua` permanece
na raiz do resource e continua sendo um script shared. `env.lua` permanece na raiz
como script de servidor, porque pertence ao administrador e é escrito uma vez em
vez de regerado. Assets mantêm os caminhos originais e suas entradas `<file>`
normais. Veja [config.lua e .env](/pt-br/mta/configuration) para as regras de
propriedade e segurança.

## Estrutura em árvore

A estrutura em árvore mantém cada módulo gerado e helper de runtime separado:

```text
my-resource/
├── meta.xml
├── config.lua
├── env.lua
├── assets/
├── lib/
│   ├── class.lua
│   └── string.lua
└── src/
    ├── shared/labels.lua
    ├── server/greet.lua
    └── client/hud.lua
```

O manifesto lista helpers, `config.lua`, entradas fixadas por `loadOrder` e então
os grupos de código. Este é o formato normal do `ensure` e fixo do `dev`, pois um
resource em execução permanece fácil de inspecionar. Use
`luam build --no-bundle` quando um build local também precisar desse formato.

Trocar de estrutura remove arquivos gerados pela estrutura anterior. Arquivos
cujos bytes não mudaram não são reescritos, e `env.lua` nunca é sobrescrito.

## O contrato da saída de desenvolvimento

Todo comando que escreve Lua legível emite o arquivo de código com as construções
exclusivas do Luam removidas ou transformadas, e nada mais alterado. Não existe
campo no manifesto para isso: desligar a minificação é o que pede saída legível.

| Comando | Saída legível |
| --- | --- |
| `luam dev` | Sempre. Ele nunca minifica. |
| `luam ensure` | Sempre. Ele nunca minifica. |
| `luam build` | Quando `output.minify` é `false`, ou com `--no-minify`. |

O contrato tem uma forma mensurável: **uma linha de Lua para cada linha de
Luam**. Uma construção reescrita ocupa as linhas que a construção substituída
ocupava, então uma posição que o MTA informa sobre o arquivo gerado nomeia a
mesma linha no código.

O que é reescrito:

| Escrito | Gerado |
| --- | --- |
| Uma anotação de tipo ou tipo de retorno | Apagada, para a assinatura ler como Lua puro |
| `interface`, `type`, `declare`, `declare event` | Um comentário de bloco Lua sobre as mesmas linhas, ponto e vírgula final incluído |
| `enum Name { A, B }` | `Name = enum { 'A', 'B' }` nas linhas em que foi escrito |
| `class Name extends Base` | `class 'Name' :extends 'Base'`, com o parâmetro `self` implícito e os separadores de membro acrescentados no lugar |
| Um campo de classe sem padrão | `name = nil`, na linha em que o campo foi escrito, para a forma declarada ler a partir da classe gerada |
| `implements` | Apagado, porque é um contrato de compilação |
| Uma atribuição composta, `new`, um template, uma extension nativa | Lua canônico apenas para aquele statement, não para o statement que o contém |
| `continue` | `break` dentro de um `repeat ... until true` cujas palavras-chave viajam na primeira e na última linha do corpo do laço |
| Um comentário Luam | O comentário Lua equivalente |
| Uma diretiva de build como `#!client` | `--!client`, um comentário na mesma linha, porque ela orienta o compilador e não a execução |

Todo o resto é copiado byte a byte: indentação, linhas em branco, o espaço antes
de um parêntese, as aspas e os pontos e vírgulas que você escreveu.

```luam
type CustomType = string;

class Example {
    label = 'a';

    greet = function (value: CustomType): void
        print(value)
    end
}
```

```lua
--[[type CustomType = string;]]

class 'Example' {
    label = 'a';

    greet = function (self, value)
        print(value)
    end
}
```

O `continue` é a única construção que precisa de andaime em vez de substituição.
O andaime é colocado nas linhas do próprio corpo, então o `for ... do` e o seu
`end` permanecem idênticos byte a byte ao que você escreveu:

```luam
for index = 1, 10 do
    if (index == 2) then
        continue;
    end

    print (index);
end
```

```lua
for index = 1, 10 do
    repeat if (index == 2) then
        break;
    end

    print (index); until true
end
```

### O que o contrato não promete

- Um comentário não é uma construção de execução. Uma declaração apagada continua
  apagada: o comentário mostra o contrato, não o restaura.
- Um laço com um `continue` carrega o andaime na primeira e na última linha do
  seu corpo, o que deixa essas duas linhas mais densas do que o escrito. Esse é
  o custo aceito para não acrescentar linha, e é o que faz a abertura e o `end`
  do laço sobreviverem intactos.
- O emissor canônico continua sendo o recurso final sempre que uma construção não
  tem forma cirúrgica — uma classe decorada, uma classe com membros gerados, um
  builder. Quando essa construção não cabe nas linhas em que foi escrita, o
  arquivo inteiro recorre à emissão canônica em vez de deslocar cada linha
  abaixo dela.
- Um `luam build` minificado entrega a forma de produção: nenhum espaço escrito e
  nenhum comentário carregando texto do código.

## Minificação de produção

O `luam build` escreve cada arquivo `.lua` gerado em uma única linha. Isso vale
para os bundles, para a árvore espelhada com `--no-bundle`, para os helpers de
runtime em `lib/` e para o `config.lua`. `meta.xml`, `env.lua` e os assets copiados
são escritos byte a byte como estavam — o `env.lua` é editado por um
administrador, então continua legível.

A transformação analisa tokens de Lua 5.1 em vez de casar texto, então é segura
para todas as construções que o emissor produz:

- comentários, de linha e de colchete longo, são removidos;
- strings curtas, strings de colchete longo e literais numéricos mantêm os bytes
  exatos, inclusive um `--` ou `]]` que apareça dentro de um deles;
- um único espaço é inserido apenas onde dois tokens se fundiriam, então
  `a - -b` nunca vira um comentário e `1 .. 2` nunca vira um número inválido;
- **nenhum identificador é renomeado.** Um erro em produção continua nomeando a
  função, o método ou a classe que você escreveu.

```lua
-- código escrito
local total = 0

for index = 1, 3 do -- acumula
    total = total + index
end
```

```lua
local total=0 for index=1,3 do total=total+index end
```

A minificação roda sobre todo o conjunto de arquivos em memória antes da primeira
escrita. Um arquivo que não é Lua 5.1 válido aborta o comando informando o arquivo
e a linha, e o resource de produção anterior fica intacto — nada é escrito e nada
é removido.

`luam ensure` e `luam dev` nunca minificam. Use-os sempre que precisar ler o Lua
gerado.

## Arquivo de mapa do resource

`luam build` escreve `<outDir>/<name>.luam-map.json` ao lado do diretório do
resource, nunca dentro dele. A versão atual do formato é `1`. Ele registra:

- `version`, `resource` e `layout` do build, mais `minified: true` em um mapa
  escrito pelo `luam build`;
- cada `path` Lua gerado;
- cada segmento de módulo ou helper e seu intervalo de linhas geradas;
- mapeamentos esparsos e baseados em 1 entre linhas geradas e de código, além do
  símbolo de função, método ou classe quando disponível.

O mapa é metadado de release específico de um build. Guarde-o enquanto logs
daquela release puderem precisar de investigação e arquive-o com a release, sem
copiá-lo para o resource do MTA. Um mapa de outro build pode apontar para a linha
autoral errada mesmo quando o nome do resource e o caminho gerado coincidem.
`luam trace` detecta versões de mapa não suportadas e arquivos ou linhas não
cobertos, mas não consegue provar que um mapa suportado veio do mesmo build.
Considere não confiável uma resolução feita com o mapa do build errado.

`--no-map` deixa o resource gerado idêntico byte a byte e remove um mapa existente
no caminho padrão depois de um build bem-sucedido. `output.map: false` torna esse
o padrão do projeto.

## Resolvendo traces de produção

::: warning Um build minificado não tem linha para resolver
Todo script que o `luam build` escreve tem uma única linha, então o MTA informa
`line 1` para qualquer erro nele. Esse número não identifica nada, e nenhum mapa
recupera a linha autoral a partir dele sem uma coluna gerada, que esta versão não
registra.

O `luam trace` lê a marca `minified` e recusa esse mapa com uma mensagem
acionável em vez de devolver com confiança uma linha errada. Reproduza o erro sob
`luam dev` ou `luam ensure`: ambos mantêm a árvore legível e resolvem a linha e o
símbolo exatos do código-fonte.
:::

Contra um build legível, passe uma posição gerada simples ou uma linha de log do
MTA entre aspas:

```bash
luam trace src/server.lua:42
luam trace "ERROR: [my-resource/src/server.lua:42] attempt to index a nil value"
```

O comando tenta primeiro o `<outDir>/<name>.luam-map.json` configurado. Se ele não
existir, procura abaixo do diretório do projeto e usa o mapa apenas quando encontra
exatamente um. A busca ignora `node_modules` e diretórios cujo nome começa com
ponto, então um mapa guardado em um deles só é alcançável por `--map`. Selecione
outro caminho relativo ou absoluto explicitamente:

```bash
luam trace src/server.lua:42 --map releases/1.4.0/my-resource.luam-map.json
```

Sem operando, `trace` lê uma posição ou linha completa de log por linha não vazia
da entrada padrão:

```bash
luam trace --map releases/1.4.0/my-resource.luam-map.json < mta-errors.log
```

Uma linha resolvida é impressa como `arquivo-fonte:linha`, seguida do símbolo
quando disponível:

```text
src/server/orders.luam:18 (createOrder)
```

`trace` não precisa de compilação nem servidor. Ele retorna `0` apenas quando
todas as linhas de entrada resolvem. Retorna `1` para entrada vazia, mapa ilegível
ou inválido, versão não suportada, entrada sem posição ou qualquer posição não
coberta; linhas válidas em uma entrada mista ainda são impressas. Erros de uso da
linha de comando retornam `2`.

## Diagnósticos de bundle

| Diagnóstico | Causa | Correção |
| --- | --- | --- |
| `project-bundle-toplevel-return` | Um módulo termina com `return` no nível superior, cujo comportamento de chunk separado não pode ser preservado no bundle. | Remova o return superior ou use a estrutura em árvore com `--no-bundle`. |
| `project-bundle-output-collision` | Um fonte ou asset produziria um caminho reservado de bundle como `src/server.lua`. | Renomeie a saída do fonte ou o asset, ou use a estrutura em árvore. |

Qualquer um desses diagnósticos falha o build antes da escrita da saída.

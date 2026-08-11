# Estruturas de saída e mapas de código

O Luam usa uma estrutura compacta de bundles para um resource publicado e uma
estrutura em árvore para desenvolvimento. O bundle é o formato de produção, não
uma opção de minificação: ele preserva nomes e Lua legível enquanto reduz o
resource a no máximo um script por ambiente.

## Padrões dos comandos e sobrescritas

| Comando | Estrutura padrão | Sobrescrita da estrutura | Mapa de código |
| --- | --- | --- | --- |
| `luam build` | Bundle quando `output.bundle` é `true` (o padrão); árvore quando é `false`. | `--bundle` ou `--no-bundle` sobrescreve a configuração. | Escreve `<outDir>/<name>.luam-map.json` quando `output.map` é `true` (o padrão). `--no-map` desliga e remove esse mapa. |
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
    ├── .env                      quando declarado; escrito uma vez
    ├── assets/                   caminhos originais preservados
    └── src/
        ├── shared.lua            quando há código ou helpers shared
        ├── server.lua            quando há código ou helpers de servidor
        └── client.lua            quando há código ou helpers de cliente
```

O diretório literal `src/` dos bundles não segue `sourceDirs`. Um ambiente vazio
não tem bundle nem entrada `<script>`. Não existe diretório `lib/` nem árvore de
módulos espelhada. Helpers de runtime e módulos ficam isolados em blocos
`do ... end`; helpers vêm antes dos módulos, e `loadOrder` ainda controla a ordem
dos módulos.

O manifesto lista `config.lua` primeiro quando presente, seguido pelos bundles
não vazios na ordem shared, server, client:

```xml
<script src="config.lua" type="shared" cache="false" />
<script src="src/shared.lua" type="shared" cache="false" />
<script src="src/server.lua" />
<script src="src/client.lua" type="client" cache="false" />
```

`config.lua`, `.env` e assets nunca entram em um bundle. `config.lua` permanece
na raiz do resource e continua sendo um script shared. `.env` permanece na raiz
para o helper de ambiente exclusivo do servidor e nunca recebe uma entrada
`<file>`. Assets mantêm os caminhos originais e suas entradas `<file>` normais.
Veja [config.lua e .env](/pt-br/mta/configuration) para as regras de propriedade e
segurança.

## Estrutura em árvore

A estrutura em árvore mantém cada módulo gerado e helper de runtime separado:

```text
my-resource/
├── meta.xml
├── config.lua
├── .env
├── assets/
├── lib/
│   ├── shared/class.lua
│   └── server/env.lua
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
cujos bytes não mudaram não são reescritos, e `.env` nunca é sobrescrito.

## Arquivo de mapa do resource

`luam build` escreve `<outDir>/<name>.luam-map.json` ao lado do diretório do
resource, nunca dentro dele. A versão atual do formato é `1`. Ele registra:

- `version`, `resource` e `layout` do build;
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

Passe uma posição gerada simples ou uma linha de log do MTA entre aspas:

```bash
luam trace src/server.lua:42
luam trace "ERROR: [my-resource/src/server.lua:42] attempt to index a nil value"
```

O comando tenta primeiro o `<outDir>/<name>.luam-map.json` configurado. Se ele não
existir, procura abaixo do diretório do projeto e usa o mapa apenas quando encontra
exatamente um. Selecione outro caminho relativo ou absoluto explicitamente:

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

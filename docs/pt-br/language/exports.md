# Exports

`export` marca uma função de nível superior como chamável por **outros resources
do MTA**. A palavra é apagada do Lua gerado; o que ela produz é uma entrada no
`meta.xml`.

```luam
export function getScore(player: Player): number
    return getElementHealth(player)
end
```

```xml
<export function="getScore" type="server" http="false" />
```

::: tip Compartilhar código, não chamadas
Um export é uma fronteira de execução entre dois resources implantados: o código
fica onde está e uma chamada atravessa até ele. Para *obter* código e enviá-lo
dentro deste resource, a resposta é uma [biblioteca](/pt-br/tooling/libraries).
Um serviço com estado é um resource com exports; um módulo puro é uma biblioteca.
:::

## Chamando um export

De outro resource, em Lua puro:

```lua
local score = exports['luam-docs-exported-function']:getScore(player)
```

O `type` do export segue o ambiente do arquivo, então uma função em `src/server` é
exportada para o lado do servidor e uma em `src/client` para o lado do cliente.

## Acesso HTTP

Adicione o modificador contextual `http` para permitir que o servidor HTTP do
MTA chame a função:

```luam
export http function getPlayerCount(): number
    return getPlayerCount()
end
```

```xml
<export function="getPlayerCount" type="server" http="true" />
```

Sem o modificador, o compilador sempre gera `http="false"`. Fora de uma diretiva
`export`, `http` continua sendo um identificador comum. O acesso remoto também
depende da ACL `resource.<nome>.http` e da autenticação configurada no servidor.

## Regras

| Regra | Diagnóstico quando quebrada |
| --- | --- |
| `export` só se aplica a uma função de nível superior. | `check-export-not-top-level` |
| A função precisa ser um nome global simples, não um membro de tabela. | `check-export-member` |
| Um arquivo `.d.luam` não emite código, então não pode exportar. | `check-export-in-declaration-file` |
| Dois arquivos não podem exportar o mesmo nome. | `project-duplicate-export` |
| `export` não pode ser aplicado a uma `local function`. | `parse-export-local` |

```luam static
export function api.getScore(): number   # check-export-member
```

## `export` é reservada

`export` é uma palavra reservada, então não pode nomear uma variável. Migrar Lua
que a usa como identificador exige renomear. Ela continua permitida como nome de
propriedade:

```luam
local settings: table = { export = true }

print(settings.export)
```

Veja [Palavras-chave](/pt-br/reference/keywords).

## O contrato de export

Um build que exporta alguma coisa escreve um contrato ao lado do resource — um
arquivo JSON por resource, no diretório que
[`contracts`](/pt-br/reference/configuration-fields) nomeia, por padrão
`.luam/contracts`. Ele registra nome, lado, flag HTTP, nomes e tipos dos
parâmetros, quantidade mínima de argumentos e tipo de retorno de cada export.
Ele não faz parte do resource executável; nada é copiado para `build/<nome>`.

```json
{
    "abi": 1,
    "resource": "core",
    "exports": [
        {
            "name": "getBalance",
            "side": "server",
            "http": false,
            "parameters": [{ "name": "id", "type": "string" }],
            "minimumArguments": 1,
            "variadic": false,
            "returns": "number"
        }
    ]
}
```

Um projeto que declara `core` em `dependencies` e encontra `core.abi.json`
naquele diretório tem as chamadas checadas — argumentos, quantidade, tipo de
retorno e o lado em que o export roda:

```luam static
local balance: number = call(getResourceFromName('core'), 'getBalance', 'thigas')
local same: number = exports.core:getBalance('thigas')
```

Passar um `number` onde o contrato diz `string` é `check-type-mismatch`, nomear
um export que o contrato não declara é `check-unknown-resource-export`, e chamar
um export só de cliente de um arquivo de servidor é
`check-resource-export-side`.

Aponte vários projetos para um diretório compartilhado e o workspace inteiro
passa a ser checado entre resources. Um contrato ausente, ilegível ou que nomeia
outro resource é ignorado com `build-invalid-contract`; o build segue e aquelas
chamadas ficam sem verificação.

## O que não é verificado

Uma chamada cujo nome de resource ou de export é calculado em execução nunca é
checada, com ou sem contrato — não há o que resolver. Uma chamada para um
resource sem contrato em disco também não. Veja
[Limitações](/pt-br/reference/limitations).

## Um exemplo completo

<<< @/snippets/language/src/server/exports.luam

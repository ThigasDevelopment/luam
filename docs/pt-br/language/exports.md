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
<export function="getScore" type="server" />
```

## Chamando um export

De outro resource, em Lua puro:

```lua
local score = exports['luam-docs-exported-function']:getScore(player)
```

O `type` do export segue o ambiente do arquivo, então uma função em `src/server` é
exportada para o lado do servidor e uma em `src/client` para o lado do cliente.

## Regras

| Regra | Diagnóstico quando quebrada |
| --- | --- |
| `export` só se aplica a uma função de nível superior. | `check-export-not-top-level` |
| A função precisa ser um nome global simples, não um membro de tabela. | `check-export-member` |
| Um arquivo `.d.luam` não emite código, então não pode exportar. | `check-export-in-declaration-file` |
| Dois arquivos não podem exportar o mesmo nome. | `project-duplicate-export` |
| `export` não pode ser aplicado a uma `local function`. | `parse-export-local` |

```luam
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

## O que não é verificado

Um export é **nomeado, nunca verificado** contra o lado que chama, e não pode
carregar um atributo extra como `http="true"`. Se você precisar de um, adicione a
entrada à mão em um resource que tenha o próprio `meta.xml` — o manifesto gerado
não aceita atributos extras de export. Veja
[Limitações](/pt-br/reference/limitations).

## Um exemplo completo

<<< @/snippets/language/src/server/exports.luam

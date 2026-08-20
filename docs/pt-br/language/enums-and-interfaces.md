# Enums e interfaces

Os dois dão nome a uma forma. Um enum chega ao Lua gerado como uma tabela; uma
interface nunca chega.

## Enums

```luam
enum MatchState {
    LOBBY,
    PLAYING,
    FINISHED,
}
```

- Os membros começam em **zero**: `MatchState.LOBBY` é `0` e `PLAYING` é `1`.
- Uma vírgula final é permitida.
- Os membros são verificados. `MatchState.PAUSED` é `check-unknown-enum-member`, e
  a mensagem lista os membros existentes.
- Um enum que nenhum arquivo do recurso lê é **apagado**, então um enum sem uso
  não custa nada. Um enum declarado em um arquivo shared e lido de um arquivo
  server ou client é mantido, porque o build olha o recurso inteiro.

```luam
local state: number = MatchState.PLAYING

if state == MatchState.LOBBY then
    outputDebugString('waiting for players')
end
```

O tipo de um membro é `number`, que é o que torna um valor de enum utilizável em
qualquer lugar que espere um número — inclusive como argumento do MTA.

Declarar o mesmo nome de enum duas vezes em um arquivo é `check-duplicate-enum`.

## Interfaces

Uma interface é um **contrato só de compilação**. Ela é verificada pelo checker e
nunca chega ao Lua gerado.

```luam
interface Describable {
    label: string
    describe(): string
}
```

Uma interface pode declarar campos e métodos. Uma classe declara que a satisfaz
com `implements`:

```luam expect-error
class Round implements Describable {
    label: string = 'round'

    describe = function (): string
        return self.label
    end
}
```

Uma interface pode estender uma ou mais interfaces. A interface filha herda todos
os campos e métodos, e as classes que a implementam devem satisfazer o contrato
completo:

```luam
interface Named {
    name: string
}

interface Identified {
    id: number
}

interface Entity extends Named, Identified {
    describe(): string
}
```

Declarações herdadas compatíveis são combinadas. Declarações incompatíveis geram
`check-conflicting-interface-member`; pais repetidos e ciclos de herança também
são rejeitados.

Um membro faltando é `check-unimplemented-interface`, e a mensagem o nomeia.
Referir-se a uma interface inexistente em `implements` ou `extends` é `check-unknown-interface`; declarar a
mesma duas vezes é `check-duplicate-interface`.

Uma interface também é utilizável como tipo:

```luam static
local target: Describable = new Round()
```

## Qual dos dois eu quero?

| Você quer | Use |
| --- | --- |
| Um conjunto fixo de números nomeados | `enum` |
| Um contrato que várias classes devem satisfazer | `interface` |
| Um nome para um tipo existente | [alias `type`](/pt-br/language/types) |
| Comportamento em tempo de execução | [`class`](/pt-br/language/classes) |

## Um exemplo completo

<<< @/snippets/language/src/shared/enums-and-interfaces.luam

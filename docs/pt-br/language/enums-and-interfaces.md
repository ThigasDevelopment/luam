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
- O hover do enum lista cada membro com o número que ele carrega, então você
  nunca precisa contar as linhas para saber quanto vale `FINISHED`.

### O que o alcance enxerga, e o que não enxerga

O apagamento é **silencioso**. Nenhum diagnóstico o informa e nenhuma opção do
compilador pede um, porque um enum declara um global de módulo e o relato de
declarações sem uso cobre apenas locais e parâmetros.

O alcance é casado por **nome de identificador** entre as fontes do recurso. Um
enum alcançado apenas de forma dinâmica, por `_G['MatchState']` ou a partir de um
`config.lua` escrito à mão, ou ainda de outro recurso, não é visto pelo build e
desaparece. Leia-o ao menos uma vez de uma fonte compilada quando algo fora do
build depender dele.

Um enum que sobrevive é um **global**, não um local, então a ordem de declaração
entre arquivos importa no carregamento. Coloque-o em um arquivo shared e fixe
esse arquivo com `loadOrder` quando um arquivo server ou client o ler durante a
carga.

Os nomes dos membros continuam entre aspas no Lua gerado:

```lua
MatchState = enum { 'LOBBY', 'PLAYING', 'FINISHED' }
```

O helper de execução usa cada elemento como chave de tabela. Um `LOBBY` sem aspas
seria um global não declarado avaliado como `nil`, o que deixa a tabela vazia e
produz um enum sem membros que falha em silêncio a cada leitura.

Um [build de desenvolvimento](/pt-br/reference/output-layouts#o-contrato-da-saida-de-desenvolvimento)
mantém o enum nas linhas em que você o escreveu; um build minificado o coloca em
uma só.

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
Um membro opcional, escrito `name?: Tipo`, não é obrigatório: a classe pode
omiti-lo, mas um membro que ela declare ainda precisa corresponder ao tipo declarado.
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

# Decoradores

Decoradores geram APIs tipadas de classe. Eles não recebem argumentos e só podem
ser usados na classe, campo ou método indicado abaixo.

```luam
@Getter
class Profile {
    @Setter
    nickname: string = 'Luam'

    @Getter
    @Setter
    banned: boolean = false

    level: number = 1
}
```

## Onde um decorador pode ficar

| Posição | Efeito |
| --- | --- |
| Em uma **classe** | Aplica-se a todos os campos da classe. |
| Em um **campo** | Aplica-se apenas àquele campo. |

Um decorador de classe e um de campo se combinam, então o exemplo acima gera um
getter para cada campo e um setter para `nickname` e `banned`.

## API confirmada

| Decorador | Alvo | Comportamento gerado |
| --- | --- | --- |
| `@Getter` | classe, campo | `getField()` ou `isField()` |
| `@Setter` | classe, campo | `setField(value)` |
| `@FluentSetter` | campo | `withField(value)` retornando `self` |
| `@Lazy` | campo | Getter com cache; o campo exige inicializador |
| `@Observable` | campo | Setter e `onFieldChanged(listener)` |
| `@ReadOnly` | campo | Rejeita escrita fora dos métodos da própria classe |
| `@Deprecated` | campo, método | Aviso ao usar o membro |
| `@Override` | método | Exige assinatura idêntica no método da superclasse |
| `@ToString` | classe | `toString()` superficial |
| `@Equals` | classe | `equals(other)` superficial |
| `@Clone` | classe | `clone()` superficial |
| `@Serializable` | classe | `toTable()` com valores superficiais dos campos |
| `@Deserialize` | classe | `fromTable(values)` atribuindo valores superficiais |
| `@Validated` | classe | `validate(value)` e `matches(value)` estáticos, checando os tipos declarados dos campos em execução |
| `@Builder` | classe | `ClassNameBuilder`, `withField(value)` e `build()` |

Um decorador em qualquer outra coisa — um método, um comando, uma função — é
`check-decorator-target`. Um nome desconhecido é `check-unknown-decorator`, o
mesmo decorador duas vezes em um alvo é `check-duplicate-decorator`, e uma
combinação impossível é `check-decorator-conflict`. Decoradores não recebem
argumentos; `@Getter(1)` é `parse-decorator-arguments`.

## Nomes gerados

| Campo | Tipo | Getter | Setter |
| --- | --- | --- | --- |
| `nickname` | `string` | `getNickname()` | `setNickname(value)` |
| `level` | `number` | `getLevel()` | `setLevel(value)` |
| `banned` | `boolean` | `isBanned()` | `setBanned(value)` |
| `isReady` | `boolean` | `isReady()` | `setReady(value)` |

Um getter booleano recebe o prefixo `is` em vez de `get`. Um campo booleano cujo
nome já começa com `is` seguido de maiúscula mantém o próprio nome como getter,
então `isReady` não vira `isIsReady`.

## Os tipos são preservados

Os acessores são tipados a partir do campo, então o checker verifica os dois
sentidos:

```luam
local nickname: string = profile:getNickname()   # string
local banned: boolean = profile:isBanned()       # boolean

profile:setNickname('Thigas')                    # espera string
```

Passar o tipo errado para um setter gerado é `check-type-mismatch`, exatamente
como em um método escrito à mão.

## Campos reativos e configuração fluente

`@FluentSetter` retorna a própria instância, `@Lazy` calcula o campo no primeiro
acesso e `@Observable` notifica cada listener registrado:

```luam
class Session {
    @FluentSetter
    timeout: number = 30

    @Lazy
    token: string = tostring(getTickCount())

    @Observable
    connected: boolean = false
}

local session = new Session()
session:withTimeout(60):withTimeout(90)

local token: string = session:getToken()

session:onConnectedChanged(function (connected: boolean)
    print('connected', connected)
end)
session:setConnected(true)
```

O inicializador de um campo `@Lazy` não é emitido como valor inicial da classe.
O getter o executa uma vez quando o campo ainda é `nil` e reutiliza o resultado
nos próximos acessos.

## Utilitários de objeto

Os decorators de classe podem ser combinados. Todos operam superficialmente: uma
tabela armazenada em um campo continua sendo a mesma tabela no clone e na tabela
serializada.

```luam
@ToString
@Equals
@Clone
@Serializable
@Deserialize
class Point {
    x: number = 0
    y: number = 0
}

local point = new Point()
point:fromTable({ x = 10, y = 20 })

local text: string = point:toString()
local copy: Point = point:clone()
local same: boolean = point:equals(copy)
local values: table = point:toTable()
```

## Builder tipado

`@Builder` cria uma classe companheira com um método `withCampo` para cada campo
e um `build()` que retorna a classe original:

```luam
@Builder
class Account {
    name: string = ''
    balance: number = 0
}

local account: Account = new AccountBuilder()
    :withName('Thigas')
    :withBalance(100)
    :build()
```

## Validações estáticas

`@ReadOnly`, `@Deprecated` e `@Override` não precisam adicionar comportamento ao
Lua gerado. Eles fazem o checker validar como o código usa a classe:

```luam
class Entity {
    describe = function (): string
        return 'entity'
    end
}

class Player extends Entity {
    @ReadOnly
    id: number = 1

    @Deprecated
    oldName = function (): string
        return 'player'
    end

    @Override
    describe = function (): string
        return 'player'
    end
}
```

Usar `player:oldName()` produz o aviso `check-deprecated-use`. Atribuir
`player.id = 2` fora de um método de `Player` é `check-readonly-assignment`. Um
método `@Override` ausente na superclasse ou com assinatura diferente é
`check-invalid-override`.

## Validação em execução numa fronteira

Anotações de tipo são apagadas, então um payload que atravessou a rede é o que
quem enviou colocou lá. O `@Validated` é o único decorador que pede ao
compilador para checar um formato em execução, e só onde você escreve:

```luam env=server
@Validated
class JoinPayload {
    id: string
    score: number
    tag?: string
}

function handleJoin(payload: table): void
    local checked: JoinPayload = JoinPayload.validate(payload)

    outputChatBox(checked.id, root)
end
```

Os dois membros gerados são **estáticos**, então são chamados na classe:

- `ClassName.validate(value)` devolve o valor, ou levanta um erro Lua nomeando o
  caminho e o tipo esperado — `luam-validate: "score" expected "number"`. O
  valor em si nunca entra na mensagem, então um payload recusado não vaza um
  token para um log.
- `ClassName.matches(value)` roda a mesma checagem e responde `true` ou `false`.

A checagem percorre os tipos declarados dos campos: primitivos, literais,
opcionais, uniões, arrays, mapas, tipos de objeto, interfaces expandidas nos
membros delas, e um campo de classe como verificação de instância. Ela para em
limites fixos — 16 níveis de aninhamento, 4096 entradas em uma tabela, 65536
caracteres em uma string — então um payload feito para exaurir o servidor é
recusado em vez de percorrido.

Um campo cujo tipo não tem forma em execução, como `any` ou `unknown`, é
`check-unreifiable-type`, reportado antes de qualquer emissão. Nada é gerado
para uma classe sem o decorador, e um projeto que nunca escreve `@Validated` não
publica código de validação nenhum.

## Um exemplo completo

<<< @/snippets/language/src/shared/decorators.luam

## No editor

Membros gerados são membros comuns: a completação após `:` os lista, o hover
mostra a assinatura e ir-para-definição leva ao campo ou classe que os gerou.
Digitar `@` também sugere todos os decorators conhecidos.

O hover do próprio decorator responde o que ele faz *ali*: o primeiro bloco é a
API exata produzida naquele ponto — `isAdmin(): boolean` para um `@Getter` em um
campo booleano, a classe `AccountBuilder` inteira para um `@Builder`, o próprio
membro decorado para `@ReadOnly`, `@Deprecated` e `@Override`, que não geram
nada. Abaixo vêm a regra de posicionamento, a forma gerada em abstrato, as notas
de comportamento e os diagnósticos que o decorator pode emitir.

# Classes

Uma classe declara campos, um construtor e métodos. O corpo da classe usa chaves.
Construtores e métodos usam `nome = function (...) ... end`; o Luam injeta o
parâmetro tipado `self` automaticamente.

```luam
class Account {
    name: string
    balance: number = 0

    constructor = function (name: string)
        self.name = name
    end

    deposit = function (amount: number): void
        self.balance += amount
    end

    describe = function (): string
        return self.name .. ': ' .. tostring(self.balance)
    end
}
```

## Campos

Um campo é um nome, um tipo e um valor padrão opcional:

```luam static
name: string          # sem padrão; defina no construtor
balance: number = 0   # padrão aplicado a toda instância
```

Um campo sem padrão e sem atribuição no construtor continua declarado — ele
simplesmente começa como `nil`.

## Instâncias

`new` chama o construtor:

```luam expect-error
local account = new Account('Thigas')

account:deposit(50)

print(account.balance)
```

Campos são lidos com `.` e métodos são chamados com `:` — a regra de Lua,
inalterada. Um membro desconhecido é `check-unknown-member`; `new` sobre um nome
que não é classe é `check-unknown-class`.

## Herança

```luam expect-error
class PremiumAccount extends Account {
    tier: number = 1

    constructor = function (name: string, tier: number)
        super(name)
        self.tier = tier
    end

    deposit = function (amount: number): void
        super(amount * 2)
    end
}
```

- `super(...)` no **construtor** chama o construtor da classe pai.
- `super(...)` em um **método** chama o método de mesmo nome na classe pai.
- `super()` fora de uma classe é `check-invalid-super`; nomear um método
  inexistente na classe pai é `check-unknown-super-method`.
- `self:super(...)` não é válido; chame `super(...)` diretamente.

## Membros estáticos

O `static` coloca um campo ou um método na **classe** em vez de nas instâncias
dela:

```luam
class Counter {
    static total: number = 0

    static bump = function (amount: number): number
        Counter.total = Counter.total + amount

        return Counter.total
    end

    label: string = 'counter'
}
```

Alcance um estático nomeando a classe, e um membro de instância através de um
valor:

| Escrito | Resolve para | Forma errada |
| --- | --- | --- |
| `Counter.total` | o campo estático | `counter.total` é `check-static-receiver` |
| `Counter.bump(1)` | o método estático | `Counter:bump(1)` é `check-static-receiver` |
| `counter.label` | o campo de instância | `Counter.label` é `check-unknown-member` |

As regras que saem dessa separação:

- Um método estático não tem `self` — escrever um é `check-invalid-self` — nem
  `super(...)`, que é `check-invalid-super`.
- Um nome não pode ser estático e de instância na mesma classe; isso é
  `check-duplicate-class-member`.
- Estáticos são **herdados e compartilhados**: `Child.origin` lê o espaço que
  `Base.origin` guarda, e escrever por qualquer um dos nomes aparece nos dois.
  Um estático que sombreia um herdado precisa carregar o mesmo tipo, ou é
  `check-invalid-override`.
- O valor inicial de um campo estático roda uma vez, quando a declaração da
  classe roda.

O `static` só é modificador quando um nome de membro vem depois dele na mesma
linha, então um campo chamado `static` e um local chamado `static` continuam
funcionando.

## Ordem de declaração

Uma classe é um **tipo em todo o arquivo** e um **valor a partir da linha em que
a declaração roda**. O `extends` pode nomear uma classe pai escrita mais abaixo,
e uma função pode instanciar uma classe declarada depois dela:

```luam static
class VIPAccount extends Account {
    tier: number = 1
}

class Account {
    balance: number = 0
}
```

Da segunda metade saem duas regras:

- Instanciar uma classe antes de a declaração dela rodar é
  `check-class-before-declaration`, e isso só acontece onde o código é um efeito
  de topo — uma instrução de topo ou o valor inicial de um campo. Dentro do corpo
  de uma função, o `new` de uma classe declarada mais abaixo funciona.
- Uma referência escrita acima da declaração enxerga a classe, mas ainda não os
  membros dela: um membro lê como `any` e a aridade do construtor não é
  verificada.

Um ciclo de herança — `A extends B` com `B extends A`, ou uma classe que estende
a si mesma — é `check-class-cycle`.

## Interfaces

`implements` pede ao checker que verifique se cada membro de uma interface existe:

```luam static
class Round implements Describable {
    label: string = 'round'

    describe = function (): string
        return self.label
    end
}
```

Veja [Enums e interfaces](/pt-br/language/enums-and-interfaces).

## Parâmetros de tipo

Uma classe recebe parâmetros de tipo como um
[alias de tipo](/pt-br/language/types#aliases) recebe. Todo uso do parâmetro
dentro da classe — um campo, um parâmetro, um tipo de retorno — é trocado pelo
argumento no ponto de uso:

```luam
class Box<T> {
    value: T

    constructor = function (value: T)
        self.value = value
    end

    read = function (): T
        return self.value
    end
}

local text: Box<string> = new Box<string>('ready')
local value: string = text:read()
```

`new Box('ready')` infere `Box<string>` a partir do argumento do construtor,
então vale escrever os argumentos de tipo só quando a inferência não tem de onde
partir. A quantidade errada é `check-generic-arity`, e duas especializações
diferentes da mesma classe não se atribuem entre si.

`extends` também recebe argumentos, repassando um parâmetro ou fixando um:

```luam static
class Labelled<T> extends Box<T> {
    label: string = ''
}

class Tag extends Box<string> {
    prefix: string = ''
}
```

Um parâmetro pode carregar uma restrição, que todo argumento precisa satisfazer
— uma classe que a estende, que a implementa ou que a atende estruturalmente.
Qualquer outra coisa é `check-generic-constraint`:

```luam static
class Holder<T extends Shape> {
    item: T
}
```

Nada disso chega na saída. Uma classe emite uma implementação, seja qual for a
especialização; os parâmetros e os argumentos são apagados junto com as outras
anotações. Aninhar uma especialização dentro de outra além de oito níveis é
`check-generic-depth` — nomeie o tipo interno com um alias.

## Metamétodos

Uma classe responde a um operador de Lua declarando o metamétodo com o nome dele:

```luam
class Money {
    amount: number = 0

    constructor = function (amount: number)
        self.amount = amount
    end

    __tostring = function (): string
        return tostring(self.amount)
    end

    __eq = function (other: Money): boolean
        return self.amount == other.amount
    end

    __add = function (other: Money): Money
        return new Money(self.amount + other.amount)
    end
}
```

| Metamétodo | Além de `self` | Retorna | Responde |
| --- | --- | --- | --- |
| `__tostring` | — | `string` | `tostring` e coerção para string |
| `__eq` | um | `boolean` | `==` |
| `__lt`, `__le` | um | `boolean` | `<`, `>`, `<=`, `>=` |
| `__len` | — | `number` | `#` |
| `__concat` | um | qualquer | `..` |
| `__unm` | — | qualquer | `-` unário |
| `__add`, `__sub`, `__mul`, `__div`, `__mod`, `__pow` | um | qualquer | o operador correspondente |

A quantidade errada de parâmetros ou o retorno errado é
`check-invalid-metamethod`. Um método cujo nome começa com `__` e não está na
lista — bloqueado ou escrito errado — é `check-blocked-metamethod`. Um **campo**
com o mesmo prefixo fica intacto.

Um metamétodo é herdado como qualquer outro membro, e um filho que declara o
mesmo sobrescreve. Ele não faz parte da superfície de membros: a completação não
o oferece, e `tostring(instance)` é como se chega nele, não
`instance:__tostring()`. Veja [Limitações](/pt-br/reference/limitations) para o
que continua bloqueado.

## O que é emitido

Uma classe compila para uma chamada ao helper de runtime `class`, incluído apenas
quando o resource de fato declara uma classe. A saída em bundle o coloca dentro
do bundle do ambiente; a saída em árvore escreve `lib/<ambiente>/class.lua`.
Interfaces e anotações não contribuem com nada.

## Classes nativas

`Threads` e `Async` são classes de runtime que o Luam fornece. Elas usam
o mesmo `new`:

```luam
local tasks = new Async(100)
```

O helper por trás de uma classe nativa é injetado apenas quando a classe é
nomeada. Uma classe de projeto não pode estender uma classe nativa — isso é
`check-native-class-inheritance`.

As próprias classes OOP do MTA (`Player`, `File`, `Vehicle` …) são uma superfície
separada, liberada por `"oop": true`. Veja [API OOP](/pt-br/mta/oop).

## Não suportado

- Os três metamétodos que a [Limitações](/pt-br/reference/limitations) lista.

## Um exemplo completo

<<< @/snippets/language/src/shared/classes.luam

## Erros comuns

| Você escreveu | Diagnóstico |
| --- | --- |
| `new Missing()` | `check-unknown-class` |
| `account.deposit(1)` sendo `deposit` um método | `check-unknown-member` |
| `super()` em uma função comum | `check-invalid-super` |
| duas classes com um mesmo nome em um arquivo | `check-duplicate-class` |

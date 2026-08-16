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

```luam
name: string          # sem padrão; defina no construtor
balance: number = 0   # padrão aplicado a toda instância
```

Um campo sem padrão e sem atribuição no construtor continua declarado — ele
simplesmente começa como `nil`.

## Instâncias

`new` chama o construtor:

```luam
local account = new Account('Thigas')

account:deposit(50)

print(account.balance)
```

Campos são lidos com `.` e métodos são chamados com `:` — a regra de Lua,
inalterada. Um membro desconhecido é `check-unknown-member`; `new` sobre um nome
que não é classe é `check-unknown-class`.

## Herança

```luam
class PremiumAccount extends Account {
    tier: number = 1

    constructor = function (name: string, tier: number)
        self:super(name)
        self.tier = tier
    end

    deposit = function (amount: number): void
        self:super(amount * 2)
    end
}
```

- `self:super(...)` no **construtor** chama o construtor da classe pai.
- `self:super(...)` em um **método** chama o método de mesmo nome na classe pai.
- `self:super()` fora de uma classe é `check-invalid-super`; nomear um método
  inexistente na classe pai é `check-unknown-super-method`.

::: warning A ordem de declaração importa
`extends` e `new` resolvem contra classes declaradas **antes, no mesmo arquivo**.
Declare a classe pai antes das filhas.
:::

## Interfaces

`implements` pede ao checker que verifique se cada membro de uma interface existe:

```luam
class Round implements Describable {
    label: string = 'round'

    describe = function (): string
        return self.label
    end
}
```

Veja [Enums e interfaces](/pt-br/language/enums-and-interfaces).

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

- Membros estáticos.
- Metamétodos declarados.
- Classes genéricas. (**Aliases** de tipo genéricos funcionam — veja
  [Tipos](/pt-br/language/types).)

## Um exemplo completo

<<< @/snippets/language/src/shared/classes.luam

## Erros comuns

| Você escreveu | Diagnóstico |
| --- | --- |
| `new Missing()` | `check-unknown-class` |
| `account.deposit(1)` sendo `deposit` um método | `check-unknown-member` |
| `self:super()` em uma função comum | `check-invalid-super` |
| duas classes com um mesmo nome em um arquivo | `check-duplicate-class` |

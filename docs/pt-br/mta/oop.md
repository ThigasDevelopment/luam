# API OOP

O MTA pode expor sua API na forma de objeto: `player:getName()` em vez de
`getPlayerName(player)`. O Luam tipa essa superfície e a libera atrás de uma única
opção de configuração.

## Ligando

```luam
name = 'my-resource'
compilerOptions = { oop = true }
```

`compilerOptions.oop` é `false` por padrão. Com ele ligado, o compilador:

- escreve `<oop>true</oop>` no `meta.xml`, acima de `<info>` — que é o que faz a
  forma de objeto existir em tempo de execução;
- tipa a superfície de objeto, então `player:getName()` retorna `string` e um erro
  de digitação vira erro de build.

Com ele desligado, a mesma chamada é `check-oop-disabled`, e a mensagem nomeia a
função procedural a usar no lugar.

::: tip O Lua emitido é idêntico nos dois casos
O compilador nunca reescreve uma chamada OOP para a forma procedural. A opção decide
o que o checker aceita e o que o manifesto declara, nada mais.
:::

## A superfície

| Tipo | Quantidade |
| --- | --- |
| Classes | 57 |
| Métodos de instância | 652 |
| Métodos estáticos | 118 |
| Construtores | 46 |

```luam env=server oop
function describePlayer(player: Player): string
    local name: string = player:getName()
    local money: number = player:getMoney()

    return `${name} ${money}`
end
```

A herança funciona como o MTA define: um método de instância declarado em
`Element` está disponível em um `Vehicle`, e a completação após `:` também lista os
membros herdados.

## Métodos estáticos e construtores

```luam env=server oop
local player = Player.getRandom()
local exists: boolean = File.exists('data.json')
local handle = File('data.json')
```

Uma classe que o MTA torna chamável pode ser usada diretamente como construtor —
`File(path)`. Chamar uma classe que não é chamável é `check-not-callable-class`;
passar argumentos errados a uma chamável é `check-native-constructor`.

::: warning `File(path)` e `File.new(path)` não são a mesma coisa
`File(path)` abre um arquivo existente para leitura e escrita e o cria quando não
existe. `File.new(path)` **trunca** um arquivo existente, então use-o apenas quando
a criação destrutiva for o que você quer. Use `fileOpen(path, true)` quando
precisar de acesso somente leitura.
:::

## Qual forma usar?

As duas compilam para o mesmo Lua. A forma de objeto é mais curta e dá melhor
completação; a procedural funciona com `compilerOptions.oop` desligado e combina com a maior parte
do código MTA existente. Escolha uma por projeto e mantenha — misturar é legal, mas
deixa a base de código mais difícil de ler.

## Um exemplo completo

<<< @/snippets/oop-api/.luam.manifest{js}

<<< @/snippets/oop-api/src/server/admin.luam

## Erros comuns

| Você escreveu | Diagnóstico |
| --- | --- |
| `player:getName()` com `compilerOptions.oop` desligado | `check-oop-disabled` |
| `player:getNmae()` | `check-unknown-member` |
| `class Mine extends Player` | `check-native-class-inheritance` |
| `Player('x')` sendo `Player` não chamável | `check-not-callable-class` |

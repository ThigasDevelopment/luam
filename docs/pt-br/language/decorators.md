# Decoradores

`@Getter` e `@Setter` geram acessores tipados no estilo Java, para que uma classe
mantenha seus campos atrás de métodos sem que você escreva os métodos.

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

## Um exemplo completo

<<< @/snippets/language/src/shared/decorators.luam

## No editor

Acessores gerados são membros comuns: a completação após `:` os lista, o hover
mostra a assinatura e ir-para-definição leva ao campo que os gerou.

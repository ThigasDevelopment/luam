# Comando no servidor

Um comando de chat com um argumento numérico opcional, limitado por faixa e
informado de volta ao jogador.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).

## Árvore de arquivos

```
luam-docs-server-command/
├── .luam.manifest
└── src/
    └── server/
        └── heal-command.luam
```

## Código

<<< @/snippets/server-command/.luam.manifest{js}

<<< @/snippets/server-command/src/server/heal-command.luam

## O que observar

- **Argumentos de comando chegam como strings.** O MTA passa o nome do comando
  como segundo parâmetro e cada argumento seguinte como texto, por isso `amount` é
  `string?`.
- **`tonumber(amount) or MAX_HEALTH` é uma união.** O tipo é `number? | number`, e
  o Luam não faz estreitamento, então o local é anotado como `any`. Essa é a forma
  idiomática para um padrão com `or`. Veja
  [Limitações](/pt-br/reference/limitations).
- **`target.clamp(0, MAX_HEALTH)`** é uma
  [extensão de número](/pt-br/language/extensions) que compila para `math.clamp`,
  o que traz `lib/shared/math.lua` para o build.

## Comandos

```bash
luam check
luam build
```

## Resultado esperado

<<< @/snippets/output/server-command.check.txt{text}

O build escreve o helper `math` porque `clamp` é usado:

```
build/luam-docs-server-command/
├── meta.xml
├── lib/shared/math.lua
└── src/server/heal-command.lua
```

No jogo:

```
/heal 40
Healed from 60 to 100 HP.
```

## Um erro comum

Escrever o argumento como `number` falha, porque o MTA entrega uma string ao
handler:

```
src/server/heal-command.luam:3:44 error check-type-mismatch: ...
```

Mantenha o parâmetro como `string?` e converta dentro da função.

## Nota de segurança

`addCommandHandler` dá ao jogador o controle sobre o argumento. Valide a faixa no
**servidor**, como esta receita faz com `clamp` — uma verificação no cliente seria
apenas consultiva. Restrinja quem pode rodar um comando com a ACL do MTA, não com
uma comparação de nome.

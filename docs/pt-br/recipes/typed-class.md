# Classe tipada

Uma classe com construtor, interface, herança, chamada a `super` e acessores
gerados.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).

## Árvore de arquivos

```
luam-docs-typed-class/
├── .luam.manifest
└── src/
    └── shared/
        └── vehicle-slot.luam
```

## Código

<<< @/snippets/typed-class/.luam.manifest{js}

<<< @/snippets/typed-class/src/shared/vehicle-slot.luam

## O que observar

- **`implements Describable`** faz o checker verificar se `describe()` existe. Um
  membro faltando é `check-unimplemented-interface`.
- **`@Getter` na classe, `@Setter` em um campo.** O decorador de classe gera um
  getter para cada campo; o de campo adiciona um setter apenas para `model`. Veja
  [Decoradores](/pt-br/language/decorators).
- **`self:super(owner, model)`** no construtor chama o construtor da classe pai;
  **`self:super()`** dentro de `describe` chama o método de mesmo nome na classe
  pai.
- **A ordem de declaração importa.** `VehicleSlot` é declarada antes de
  `ReservedSlot`, porque `extends` resolve contra classes declaradas antes no mesmo
  arquivo.

## Comandos

```bash
luam check
luam build
```

## Resultado esperado

<<< @/snippets/output/typed-class.check.txt{text}

O build copia o helper de runtime de classe, porque o resource declara uma classe:

```
build/luam-docs-typed-class/
├── meta.xml
├── lib/shared/class.lua
└── src/shared/vehicle-slot.lua
```

`describeSlots()` retorna:

```
Thigas drives 541 | Admin drives 520 (event) | 541
```

## Um erro comum

Declarar a classe filha antes da pai:

```
src/shared/vehicle-slot.luam:1:1 error check-unknown-class: Class "ReservedSlot" extends "VehicleSlot", which is not defined.
```

Mova a declaração da classe pai para cima.

## O que é emitido

A interface desaparece por completo. As classes viram chamadas a
`lib/shared/class.lua`, e os acessores viram métodos reais — então
`slot:setModel(541)` em tempo de execução é uma chamada de método comum, não um
truque de metatabela.

# Limitações

O que o Luam deliberadamente não faz, e o que escrever no lugar.

## Sem estreitamento de tipos

`if value ~= nil then` **não** refina `string?` para `string` dentro do bloco, e um
padrão com `or` produz uma união:

```luam
local requested: number = tonumber(amount) or 100
# check-type-mismatch: ... received "number? | number".
```

Anote o local que recebe como `any` quando você já garantiu que o valor está
presente:

```luam
local requested: any = tonumber(amount) or 100
local total: number = current + requested
```

O mesmo vale para uniões: uma operação precisa ser válida para a união inteira,
porque nada a estreita.

## A ordem de declaração importa para classes

`extends` e `new` resolvem contra classes declaradas **antes, no mesmo arquivo**.
Uma classe filha declarada acima da pai é `check-unknown-class`. Ordene as
declarações; não há hoisting.

## Sem membros estáticos, metamétodos ou classes genéricas

- Uma classe não tem campos nem métodos estáticos.
- Metamétodos não podem ser declarados em uma classe.
- Classes não recebem parâmetros de tipo.

**Aliases** de tipo genéricos funcionam:

```luam
type Nullable<T> = T | nil
```

## O catálogo do MTA pode ficar atrás de uma versão

O catálogo é um snapshot fixo gerado a partir do wiki do MTA. Uma função adicionada
em uma versão mais nova continua sendo `any` em vez de gerar erro — a chamada
compila e você perde apenas completação e verificação de argumentos. Isso é
deliberado: uma função nova do MTA nunca deve bloquear um build.

## Exports são nomeados, nunca verificados

`export` escreve uma entrada `<export>` no `meta.xml`. Ele não verifica o lado que
chama e não pode carregar um atributo extra como `http="true"`.

## O editor não reverifica em mudanças entre arquivos

O servidor de linguagem não reanalisa um arquivo já aberto quando **outro** arquivo
muda, então uma violação entre módulos pode aparecer só no `luam check`. Rode
**Luam: Restart Language Server** para forçar uma nova varredura.

## O `config.lua` nunca é analisado

Ele é copiado como está, então o compilador não sabe nada sobre o seu conteúdo.
Descreva-o com um
[arquivo de declaração](/pt-br/language/declaration-files) para obter tipos.

## Anotações de tipo são apagadas

Elas são um **contrato de compilação**, não uma guarda de execução. Um handler de
um evento que um cliente pode disparar recebe o que aquele cliente enviou,
independentemente das anotações nos seus parâmetros. Valide tudo que atravessa a
rede. Veja [Fronteiras de segurança](/pt-br/mta/security).

## Um ambiente por arquivo

Um arquivo é `server`, `client` ou `shared` por inteiro. Não há ambiente por bloco;
divida o arquivo.

## Escopo dos logs de desenvolvimento

O `luam dev` lê apenas o log **local** do servidor MTA. Ele não coleta logs
remotos, não avalia expressões e não observa valores em execução. Linhas nativas de
outros resources nomeados são ignoradas, e linhas da engine sem atribuição podem
aparecer como saída simples do servidor porque a origem delas não pode ser
classificada com segurança.

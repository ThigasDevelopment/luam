# Limitações

O que o Luam deliberadamente não faz, e o que escrever no lugar.

## O estreitamento alcança nomes, não campos

Uma [guarda de tipo](/pt-br/language/types#guardas-de-tipo) refina um **nome**
dentro do bloco que ela protege. Um campo mantém o tipo declarado, não importa
como você testa:

```luam
if self.connection ~= nil then
    local handle: userdata = self.connection
    # check-type-mismatch: o campo continua "userdata?".
end
```

Copie o campo para um local antes:

```luam
local connection = self.connection

if connection ~= nil then
    local handle: userdata = connection
end
```

Uma guarda com saída antecipada vale: quando o bloco sempre sai com `return` ou
`break`, a condição negada estreita o resto do bloco que a contém. O que não vale
é qualquer coisa mais sutil — um `while` que só às vezes dá `break`, uma flag
definida em um ramo e lida em outro. Não há análise de fluxo além da guarda.

Uma operação ainda precisa ser válida para a união inteira: `key + 1` em
`string | number` é `check-invalid-operand`, porque um dos membros não soma. A
concatenação é a exceção, já que todo membro de `string | number` concatena.

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

`export` escreve uma entrada `<export>` no `meta.xml`, e `export http` marca
`http="true"` nela. O que ele não faz é verificar o lado que chama: um
`call(resource, 'name', ...)` de outro resource nunca é checado contra a
assinatura que você exportou.

## O editor reverifica por declaração, não por edição

Editar um arquivo reanalisa os outros só quando muda o que aquele arquivo
**declara** — uma classe, uma interface, um enum ou um global, incluindo o tipo
de qualquer membro. Editar o corpo de uma função republica diagnóstico só
daquele arquivo, que é o que mantém a digitação barata em projeto grande.

Um arquivo que o workspace nunca varreu continua invisível até ser salvo ou
aberto. Rode **Luam: Restart Language Server** depois de mover arquivos fora do
editor.

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

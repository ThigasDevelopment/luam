# Formatação

O language server formata um arquivo `.luam`, então formatar ao salvar funciona
em todo editor que a extensão suporta. Esta página é o estilo que ele produz — um
contrato, não uma descrição do que a implementação por acaso faz.

O formatador reescreve **apenas espaços em branco**. Ele nunca move um construto,
nunca reordena nada e nunca requebra uma linha. Onde você quebrou a linha é
decisão sua; onde ficam a indentação e os espaços é decisão do formatador.

## Indentação

Quatro espaços, um nível por linha que abre alguma coisa:

```luam
class Wallet {
    balance: number = 0

    deposit = function (amount: number): void
        if amount > 0 then
            self.balance += amount
        end
    end
}
```

Uma linha que abre mais de uma coisa ainda ganha um nível só. É isso que mantém
um callback passado como argumento na profundidade que o leitor espera:

```luam env=server
addEventHandler('onPlayerJoin', root, function ()
    outputChatBox('welcome', root)
end)
```

Uma linha que começa fechando alguma coisa perde um nível, então `end`, `until`,
`}`, `)`, `]`, `else` e `elseif` alinham com a linha que abriu o bloco.

## Quebras de linha e linhas em branco

As quebras de linha são preservadas. Uma sequência de linhas em branco vira uma
só, um arquivo nunca começa com linha em branco e todo arquivo termina com
exatamente uma quebra. Espaço no fim da linha é removido. O fim de linha que o
arquivo já usava — `LF` ou `CRLF` — é mantido.

## Espaçamento

| Regra | Escrito |
| --- | --- |
| Uma palavra-chave é seguida de espaço | `function (amount: number)`, `not visible` |
| Um nome cola no parêntese | `draw()`, `new Wallet()`, `type(value)`, `fun(string): void` |
| Sem espaço antes de `,` `;` `)` `]` | `dxDrawText(caption, margin, margin)` |
| Uma tabela literal respira, uma vazia não | `{ x = 0, y = 0 }`, `{}` |
| O `:` de anotação leva espaço depois, nenhum antes | `local health: number = 100` |
| O `:` de chamada de método não leva espaço nenhum | `slot:describe()` |
| O marcador de opcional cola no nome | `local tag?: string = nil` |
| Argumentos de tipo colam, comparação não | `Nullable<string>`, `a < b` |
| Um operador binário leva espaço dos dois lados | `self.balance += amount`, `base .. name` |
| Um operador unário não leva espaço depois | `-count`, `#items` |
| Membros e decorators colam | `self.balance`, `@Getter` |

## Comentários

Um comentário fica na linha em que foi escrito. Um comentário em linha própria é
indentado junto com o bloco que o contém; um comentário no fim da linha continua
na linha que ele documenta, um espaço depois do código. O interior de um
comentário de bloco nunca é tocado, porque o conteúdo é seu:

```luam
# como um slot é escolhido
local slot = pick()    # o primeiro livre
```

Uma diretiva `#!` é um comentário, então ela mantém o lugar no topo do arquivo.

## O que nunca é tocado

- O interior de uma string, de uma string de template ou de um comentário de
  bloco.
- Onde você quebrou a linha. Uma lista longa de argumentos fica como você
  escreveu.
- A ordem de qualquer coisa.

## Quando nada é formatado

Um arquivo que não parseia devolve **nenhuma edição**. Formatar ao salvar não tem
como estragar um arquivo que você está no meio de digitar.

O formatador também relê o que produziu e compara com o que leu. Se um único
token ou comentário diferir, ele devolve nenhuma edição em vez de um resultado
pelo qual não pode responder.

## Formatar uma seleção

A formatação de intervalo reformata as linhas inteiras que a seleção toca e deixa
todas as outras em paz. Ela roda as mesmas regras com a indentação que as linhas
anteriores à seleção estabeleceram.

## Como ligar

No VS Code, com [a extensão](/pt-br/tooling/editors) instalada:

```json
{
    "[luam]": {
        "editor.defaultFormatter": "luam.luam",
        "editor.formatOnSave": true
    }
}
```

Nem todo mundo quer um formatador. O `luam.formatting` desliga ele por inteiro — o
language server deixa de ser consultado, então `Shift+Alt+F` e formatar ao salvar
ficam os dois quietos, e outra ferramenta pode assumir o layout.

Fora de um editor, o [`luam format`](/pt-br/tooling/cli#luam-format) aplica esse
mesmo estilo sobre um projeto, e o `luam format --check` informa o que difere sem
escrever. Os dois chamam o formatador do language server, então as duas
superfícies concordam byte a byte.

## O que um projeto pode mudar

Esta página descreve o estilo **padrão**, que é o que você tem sem configuração.
Um projeto pode escolher cinco dessas decisões num arquivo
[`.luam.formatter`](/pt-br/reference/formatter-file): o caractere de indentação, a
largura da indentação, o espaço do `function (`, a sequência de linhas em branco
e o fim de linha.

Todo o resto desta página é fixo e não tem opção — estilo de aspas, ponto e
vírgula, capitalização de nomes, inserção de parênteses e onde uma linha quebra.
Isso não é uma lacuna esperando ser preenchida: o formatador verifica a própria
saída contra o fluxo de tokens original, então uma opção que mexesse em qualquer
um deles produziria nenhuma saída em vez de uma saída diferente. Veja
[limitações](/pt-br/reference/limitations).

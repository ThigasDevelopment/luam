# O tema Luam

`Luam Dark` e `Luam Light` acompanham a extensão. Eles existem porque Luam
acrescenta ao Lua coisas para as quais um tema de Lua não tem nome: uma camada
de tipos apagada, ambientes de arquivo, decoradores e a superfície do MTA.

## A regra única

**Ciano é o que o compilador apaga.**

Um token ciano não tem contrapartida no Lua emitido — uma anotação de tipo, um
`interface`, um alias `type`, um decorador, uma diretiva de estritude. Aprenda
isso e você lê a camada apagada de um arquivo de relance.

O resto da paleta nomeia o que a coisa é, não se ela sobrevive:

| Matiz | O que nomeia |
| --- | --- |
| Azul | Código que roda pelo nome: locais, funções e métodos — e as nativas do MTA, em itálico porque você não as escreveu. |
| Violeta | Vocabulário que te deram: palavras-chave e a stdlib do Lua. |
| Dourado | O nome que uma classe, interface, enum ou alias introduz. |
| Salmão | Membros alcançados por ponto, parâmetros, `self` e `super`. |
| Verde | Strings. |
| Laranja | Números, booleanos, `nil` e escapes. |
| Ciano | A camada apagada. |
| Cinza | Pontuação, operadores e comentários. |

## Como os eixos funcionam

| Eixo | O que carrega |
| --- | --- |
| Matiz | O que a coisa é. |
| Passo de valor | Especificidade — forte, base, atenuado, tênue. |
| Estilo | Ênfase. Negrito marca os poucos marcos de uma página; itálico marca algo que você não escreveu. |

Uma palavra que introduz um nome sempre recua e o nome sempre fica, então
`local ok`, `class Round` e `interface Describable` leem a mesma forma. A matiz
só diz o que a palavra ao lado não diz: em `class Round` a palavra-chave já te
informa o que `Round` é, mas em `: Round` nada informa, então a anotação fica
ciano.

## A tinta de ambiente

A diretiva da primeira linha é a única exceção deliberada. `#!server`,
`#!client` e `#!shared` recebem o violeta mais forte, em negrito.

## Amostra

<!--@include: ../../generated/theme-sample.md-->

## Todos os elementos

A tabela é gerada a partir da tabela de papéis de onde os temas são construídos,
então não pode divergir do que o editor pinta.

<!--@include: ../../generated/theme-elements.pt-br.md-->

## Legibilidade

O texto de corpo fica em 4.5:1 ou acima contra o fundo do editor nos dois modos,
e os papéis ambientes — comentários, pontuação, pontuação de tipo — em 3:1 ou
acima. Dois elementos que podem aparecer na mesma posição e diferem apenas em
peso ficam a pelo menos 1.6:1 um do outro. Todo piso é verificado por um teste.

<!--@include: ../../generated/theme-contrast.pt-br.md-->

## Escolhendo o tema

No VS Code e nos seus forks: **File → Preferences → Theme → Color Theme**, então
`Luam Dark` ou `Luam Light`. Instalar a extensão não muda as suas cores; você
escolhe o tema.

Para Zed, Neovim e a família TextMate, veja
[Editores](/pt-br/tooling/editors).

## Desligando a cor semântica

Metade do que o tema diferencia — uma nativa do MTA contra a sua própria função,
um parâmetro contra um local — vem do servidor de linguagem, não da gramática.
Para voltar apenas à camada da gramática:

```json
{
    "luam.semanticHighlighting": false
}
```

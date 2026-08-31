# Arquivo do formatador

O `.luam.formatter` escolhe as decisões de espaçamento do formatador para tudo
abaixo dele. Sem ele, o formatador se comporta exatamente como
[a referência de formatação](/pt-br/reference/formatting) descreve — todo campo
abaixo tem esse comportamento como padrão, então criar o arquivo não muda nada
até você mudar um campo.

Ele é escrito no [dialeto de manifesto](/pt-br/tooling/luam-manifest), então a
sintaxe, a completude e o hover são os que você já conhece:

```luam
indent = 'space'
indentWidth = 4
keywordParenSpace = true
maxBlankLines = 1
lineEnding = 'infer'
```

## Campos

| Campo | Tipo | Padrão | O que controla |
| --- | --- | --- | --- |
| `indent` | `'space'` ou `'tab'` | `'space'` | O caractere de indentação. |
| `indentWidth` | número, 1 a 8 | `4` | Espaços por nível de indentação. Ignorado quando `indent` é `'tab'`. |
| `keywordParenSpace` | booleano | `true` | Se um `(` depois de uma palavra-chave leva espaço — `function (` contra `function(`. Uma chamada continua colada nos dois casos. |
| `maxBlankLines` | número, 0 a 4 | `1` | Linhas em branco consecutivas mantidas. `0` remove as sequências de linhas em branco. |
| `lineEnding` | `'infer'`, `'lf'` ou `'crlf'` | `'infer'` | `'infer'` segue o arquivo; os outros fixam. |

O que não está nesta tabela não é configurável. O formatador reimprime o fluxo de
tokens e verifica o resultado contra o original, então uma opção que mudasse uma
aspa, um nome ou uma construção produziria **nenhuma saída** em vez de uma saída
errada — veja [limitações](/pt-br/reference/limitations).

## Qual arquivo vale

O `.luam.formatter` **mais próximo** acima do arquivo formatado vence, por
inteiro. Não há mesclagem: um arquivo mais acima não tem efeito algum quando
existe um mais próximo, então o estilo em vigor é algo que você lê e não algo que
você calcula.

A busca não precisa de um projeto. Um arquivo `.luam` aberto fora de qualquer
diretório de projeto ainda encontra o `.luam.formatter` acima dele, e é por isso
que a configuração é um arquivo próprio e não um campo do manifesto — veja a
[ADR-042](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/042-formatter-configuration-file.md).

Um `.luam.formatter` dentro de uma [biblioteca](/pt-br/tooling/libraries)
instalada nunca é lido. Os fontes de biblioteca nunca são formatados, então o
estilo dela não é assunto do seu projeto.

## Quando está errado

| Código | Quando |
| --- | --- |
| `formatter-unknown-field` | Um campo que esta tabela não define. |
| `formatter-invalid-value` | Um valor fora do tipo ou da faixa do campo. |
| `formatter-parse-error` | O arquivo não faz parse no dialeto de manifesto. |

Qualquer um deles **interrompe a execução**. O `luam format` sai com `2` e não
escreve nada, e o editor não oferece edições. Cair de volta nos padrões formataria
o seu projeto contra um estilo que ele rejeitou de forma explícita, o que é pior
do que recusar.

## As duas superfícies concordam

O [`luam format`](/pt-br/tooling/cli#luam-format) e o language server leem o mesmo
arquivo e chamam o mesmo formatador, então um projeto é formatado do mesmo jeito
vindo do terminal ou de salvar no editor. Toda configuração é idempotente: uma
segunda execução não muda nada.

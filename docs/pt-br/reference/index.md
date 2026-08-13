# Referência

Material de consulta. Toda tabela aqui é derivada do comportamento do compilador,
não de prosa, então é o lugar certo para resolver uma dúvida sobre o que a
linguagem realmente aceita.

| Página | O que lista |
| --- | --- |
| [Palavras-chave](/pt-br/reference/keywords) | As 21 palavras-chave reservadas de Lua e as 10 que o Luam adiciona. |
| [Operadores](/pt-br/reference/operators) | Cada operador e cada pontuação de tipo, com precedência. |
| [Diretivas](/pt-br/reference/directives) | `#!strict`, `#!nonstrict`, `#!nocheck`, `#!server`, `#!client`, `#!shared`. |
| [Campos de configuração](/pt-br/reference/configuration-fields) | Cada campo do `.luam.manifest`, seu padrão e sua validação. |
| [Estruturas de saída e mapas de código](/pt-br/reference/output-layouts) | Bundles de produção, árvores de desenvolvimento, mapas e resolução de traces. |
| [Diagnósticos](/pt-br/reference/diagnostics) | Cada código de diagnóstico, agrupado pelo estágio que o produz. |
| [Limitações](/pt-br/reference/limitations) | O que o compilador deliberadamente não faz. |
| [Compatibilidade](/pt-br/reference/compatibility) | Lua 5.1, MTA, Node.js e suporte de editores. |

## Qual versão isto descreve?

O aviso no topo de cada página nomeia a versão do Luam que este manual documenta.
Mudanças na própria documentação estão no
[changelog da documentação](/pt-br/changelog); mudanças no compilador estão no
[CHANGELOG](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md) do
repositório.

## Lendo um código de diagnóstico

O prefixo nomeia o estágio que rejeitou o arquivo:

| Prefixo | Estágio |
| --- | --- |
| `lex-` | Leitura de caracteres. |
| `parse-` | Leitura de estrutura. |
| `check-` | Verificação de tipos. |
| `project-` | Montagem do resource a partir de vários módulos. |
| `build-` | Descoberta de fontes e leitura de arquivos. |
| `config-` | Carregamento do `.luam.manifest`. |

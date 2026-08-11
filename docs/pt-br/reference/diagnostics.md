# Diagnósticos

Todo diagnóstico traz uma localização, uma severidade e um código:

```
src/client/hud.luam:1:1 error check-environment-api: API "kickPlayer" is server-only and is not available in a "client" file.
```

O prefixo nomeia o estágio que o produziu.

| Prefixo | Estágio |
| --- | --- |
| `lex-` | Leitura de caracteres. |
| `parse-` | Leitura de estrutura. |
| `env-` | Resolução do ambiente do arquivo. |
| `check-` | Verificação de tipos. |
| `project-` | Montagem do resource a partir de vários módulos. |
| `build-` | Descoberta de fontes e leitura de arquivos. |
| `config-` | Carregamento do `luam.json`. |

Um **warning** nunca falha um build. Um **error** falha, e um build com qualquer
erro não escreve nada.

## Lexer

| Código | Significado |
| --- | --- |
| `lex-foreign-comment` | Um comentário `--` ou `//`. Use `#` ou `#* ... *#`. |
| `lex-foreign-operator` | `!=` foi usado. Diferente é `~=`. |
| `lex-unexpected-character` | Um caractere que não inicia nenhum token. |
| `lex-unterminated-comment` | Comentário de bloco sem `*#` de fechamento. |
| `lex-unterminated-string` | Literal de string sem aspas de fechamento. |
| `lex-unterminated-template` | String de template sem crase de fechamento. |
| `lex-unterminated-interpolation` | Um `${` sem `}` de fechamento. |

## Parser

| Código | Significado |
| --- | --- |
| `parse-error` | O arquivo não pôde ser analisado neste ponto. |
| `parse-unexpected-token` | Um token que a gramática não permite aqui. |
| `parse-invalid-statement` | A construção não é um comando. |
| `parse-invalid-type` | A anotação de tipo não pôde ser analisada. |
| `parse-invalid-increment` | `++` ou `--` usados como expressão. Ambos são comandos. |
| `parse-export-local` | `export` aplicado a uma `local function`. |
| `parse-invalid-optional` | Um `?` em um nome sem anotação de tipo depois. |
| `parse-optional-position` | O `?` foi escrito no tipo. Ele gruda no nome. |
| `parse-duplicate-key` | Um tipo de objeto declara a mesma chave mais de uma vez. |
| `parse-unexpected-decorator` | Um decorador onde nenhum pode aparecer. |
| `parse-decorator-arguments` | Um decorador recebeu argumentos. Ele não aceita nenhum. |

## Ambiente

| Código | Severidade | Significado |
| --- | --- | --- |
| `env-conflicting-directive` | error | Duas diretivas `#!` de ambiente diferentes em um arquivo. |
| `env-path-directive-conflict` | warning | A diretiva discorda do caminho. A diretiva vence. |

## Checker — tipos

| Código | Significado |
| --- | --- |
| `check-type-mismatch` | Um valor não corresponde ao tipo declarado. |
| `check-return-mismatch` | Um `return` não corresponde ao tipo de retorno declarado. |
| `check-argument-count` | Argumentos de menos ou de mais. |
| `check-invalid-operand` | Um operador não pode ser aplicado a esse tipo. |
| `check-unknown-member` | O membro não existe no receptor. |
| `check-unknown-record-key` | A chave não é declarada pelo tipo de objeto. Também usado por `process.env`. |

## Checker — fluxo de controle

| Código | Significado |
| --- | --- |
| `check-invalid-break` | Um `break` fora de um laço, ou que não é o último do bloco. |
| `check-invalid-continue` | Um `continue` fora de um laço, que não é o último do bloco, ou que pularia sobre um local lido pela condição do `until`. |

## Checker — declarações

| Código | Significado |
| --- | --- |
| `check-unknown-class` | `new` ou `extends` nomeia uma classe não declarada. |
| `check-duplicate-class` | Duas classes com o mesmo nome em um arquivo. |
| `check-unknown-interface` | `implements` nomeia uma interface não declarada. |
| `check-duplicate-interface` | Duas interfaces com o mesmo nome em um arquivo. |
| `check-unimplemented-interface` | Um membro exigido pela interface está faltando. |
| `check-duplicate-enum` | Dois enums com o mesmo nome em um arquivo. |
| `check-unknown-enum-member` | O enum não tem esse membro. |
| `check-invalid-super` | `self:super(...)` fora de uma classe. |
| `check-unknown-super-method` | A classe pai não tem método com esse nome. |
| `check-declare-outside-declaration-file` | `declare` fora de um arquivo `.d.luam`. |
| `check-declaration-file-statement` | Um arquivo `.d.luam` contém um comando. |

## Checker — decoradores

| Código | Significado |
| --- | --- |
| `check-unknown-decorator` | O nome do decorador não é `@Getter` nem `@Setter`. |
| `check-decorator-target` | Um decorador em algo que não pode recebê-lo. |
| `check-duplicate-decorator` | O mesmo decorador duas vezes em um alvo. |
| `check-decorator-conflict` | A combinação não pode ser satisfeita. |

## Checker — MTA

| Código | Significado |
| --- | --- |
| `check-environment-api` | A API pertence a outro ambiente. |
| `check-environment-event` | O evento pertence a outro ambiente. |
| `check-oop-disabled` | Uma chamada OOP com `"oop": false`. |
| `check-not-callable-class` | Uma classe usada como construtor que o MTA não torna chamável. |
| `check-native-constructor` | Argumentos errados para um construtor nativo. |
| `check-native-class-inheritance` | Uma classe de projeto tentou estender uma classe nativa. |

## Checker — templates e exports

| Código | Significado |
| --- | --- |
| `check-unknown-template-root` | Uma interpolação se refere a um nome fora do escopo. Ela aceita um nome ou um caminho de membro, nunca uma expressão. |
| `check-empty-interpolation` | `${}` sem nada dentro. |
| `check-export-not-top-level` | `export` em uma função que não é de nível superior. |
| `check-export-member` | `export` em uma função declarada em uma tabela. |
| `check-export-in-declaration-file` | `export` em um arquivo `.d.luam`, que não emite nada. |

## Projeto

| Código | Significado |
| --- | --- |
| `project-environment-import` | Um global de um ambiente incompatível foi usado. |
| `project-duplicate-export` | Dois arquivos exportam o mesmo nome. |
| `project-duplicate-output` | Dois fontes produziriam o mesmo caminho de saída. |
| `project-load-order-missing` | Uma entrada de `loadOrder` não corresponde a nenhum arquivo ou asset. |
| `project-bundle-toplevel-return` | Um módulo em bundle termina com `return` no nível superior. Remova-o ou selecione a árvore. |
| `project-bundle-output-collision` | Um fonte ou asset produz um caminho reservado de bundle. Renomeie-o ou selecione a árvore. |

## Build

| Código | Significado |
| --- | --- |
| `build-no-sources` | Nenhum arquivo `.luam` foi encontrado em `sourceDirs`. |
| `build-source-dir-missing` | Um diretório de código configurado não existe. |
| `build-source-dir-outside-root` | Um diretório de código resolve fora da raiz do projeto. |
| `build-source-unreadable` | Um arquivo de código não pôde ser lido. |
| `build-asset-unreadable` | Um asset não pôde ser lido. |
| `build-env-malformed` | O `.env` não pôde ser interpretado. |
| `build-empty-configuration` | A configuração não produziu nada para construir. |

## Configuração

| Código | Significado |
| --- | --- |
| `config-not-found` | Nenhum `luam.json` no diretório. |
| `config-unreadable` | O arquivo existe, mas não pôde ser lido. |
| `config-invalid-json` | O arquivo não é JSON válido. |
| `config-missing-field` | Um campo obrigatório — `name` — está ausente. |
| `config-invalid-name` | `name` não é um nome válido de resource do MTA. |
| `config-invalid-type` | Um campo tem o tipo errado. |
| `config-unknown-field` | Um campo não é reconhecido. Inclui o removido `helperDir`. |
| `config-invalid-root` | A raiz do projeto não pôde ser resolvida. |
| `config-escaping-path` | Um caminho é absoluto ou contém um segmento `..`. |
| `config-unknown-helper` | `helpers` nomeia um helper inexistente. |
| `config-invalid-transport` | O bloco de transporte tem formato inválido. |
| `config-invalid-url-segment` | Um valor de transporte contém `/`, `?`, `#` ou `..`. |
| `config-missing-secret` | `passwordEnv` nomeia uma variável de ambiente não definida. |
| `config-plaintext-password` | Um `password` embutido foi usado. Prefira `passwordEnv`. |
| `config-remote-plaintext-transport` | `host` não é loopback, e a interface não tem TLS. |

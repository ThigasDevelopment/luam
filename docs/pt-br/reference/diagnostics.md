# Diagnósticos

Todo diagnóstico traz uma localização, uma severidade e um código:

```
src/client/hud.luam:1:1 error check-environment-api: API "kickPlayer" is server-only and is not available in a "client" file.
```

O prefixo nomeia o estágio que o produziu. Seis códigos têm exatamente um reparo
correto, e o editor oferece esse reparo como quick fix — veja
[Quick fixes](/pt-br/tooling/editors#quick-fixes).

| Prefixo | Estágio |
| --- | --- |
| `lex-` | Leitura de caracteres. |
| `parse-` | Leitura de estrutura. |
| `env-` | Resolução do ambiente do arquivo. |
| `check-` | Verificação de tipos. |
| `project-` | Montagem do resource a partir de vários módulos. |
| `build-` | Descoberta de fontes e leitura de arquivos. |
| `config-` | Carregamento do `.luam.manifest`. |

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
| `parse-redundant-optional` | O nome e o tipo carregam um `?` cada. Um marcador basta. |
| `parse-duplicate-key` | Um tipo de objeto declara a mesma chave mais de uma vez. |
| `parse-unexpected-decorator` | Um decorador onde nenhum pode aparecer. |
| `parse-decorator-arguments` | Um decorador recebeu argumentos. Ele não aceita nenhum. |
| `parse-class-method-form` | Um membro de classe foi escrito como `name(...) { ... }`. A forma é `name = function (...) ... end`. |

## Ambiente

| Código | Severidade | Significado |
| --- | --- | --- |
| `env-conflicting-directive` | error | Duas diretivas `#!` de ambiente diferentes em um arquivo. |
| `env-path-directive-conflict` | warning | A diretiva discorda do caminho. A diretiva vence. |
| `env-library-directive` | error | Uma diretiva `#!` dentro de um arquivo de biblioteca discorda do lado que a biblioteca declara. |

## Checker — tipos

| Código | Severidade | Significado |
| --- | --- | --- |
| `check-type-mismatch` | error | Um valor não corresponde ao tipo declarado. |
| `check-return-mismatch` | error | Um `return` não corresponde ao tipo de retorno declarado. |
| `check-missing-return` | error | Uma função que declara um tipo de retorno pode terminar sem retornar um valor. |
| `check-argument-count` | error | Argumentos de menos ou de mais. |
| `check-invalid-operand` | error | Um operador não pode ser aplicado a esse tipo. |
| `check-unknown-member` | error | O membro não existe no receptor. |
| `check-not-callable` | error | Uma chamada em um valor que não é função. |
| `check-extension-form` | error | Uma extensão de objeto usada na outra forma: uma extensão de propriedade chamada, ou uma extensão de chamada apenas lida. |
| `check-unknown-record-key` | error | A chave não é declarada pelo tipo de objeto. Também usado por `process.env`. |
| `check-unknown-union-key` | error | A chave falta em pelo menos um membro da união. |
| `check-invalid-intersection` | error | Uma parte da interseção não é um tipo objeto, uma interface ou uma classe. |
| `check-conflicting-intersection-member` | error | Duas partes da interseção declaram a mesma chave com tipos diferentes. |
| `check-generic-arity` | error | Um alias de tipo ou uma classe recebeu a quantidade errada de argumentos de tipo. |
| `check-generic-constraint` | error | Um argumento de tipo não satisfaz a restrição declarada pelo parâmetro. |
| `check-generic-depth` | error | Uma especialização está aninhada além da profundidade que o checker expande. |
| `check-unknown-type` | warning | O nome de tipo não é declarado em nenhum lugar que o arquivo alcance. |

## Checker — fluxo de controle

| Código | Significado |
| --- | --- |
| `check-invalid-break` | Um `break` fora de um laço, ou que não é o último do bloco. |
| `check-invalid-continue` | Um `continue` fora de um laço, que não é o último do bloco, ou que pularia sobre um local lido pela condição do `until`. |

## Checker — declarações

| Código | Significado |
| --- | --- |
| `check-unknown-resource-export` | Uma chamada literal nomeia um export que o contrato da dependência não declara. |
| `check-resource-export-side` | Um export é chamado de um lado em que ele não roda. |
| `check-unknown-class` | `new` ou `extends` nomeia uma classe não declarada. |
| `check-duplicate-class` | Duas classes com o mesmo nome em um arquivo. |
| `check-class-cycle` | Uma classe estende a si mesma, direta ou indiretamente. |
| `check-class-before-declaration` | Um efeito de topo instancia uma classe declarada mais abaixo no arquivo. |
| `check-duplicate-class-member` | Um nome é declarado como membro estático e de instância. |
| `check-static-receiver` | Um estático lido por uma instância, ou chamado com dois-pontos. |
| `check-unknown-interface` | `implements` ou `extends` de interface nomeia uma interface não declarada. |
| `check-duplicate-interface` | Duas interfaces com o mesmo nome em um arquivo. |
| `check-duplicate-interface-parent` | Uma interface estende a mesma interface pai mais de uma vez. |
| `check-duplicate-interface-member` | Uma interface declara o mesmo membro mais de uma vez. |
| `check-conflicting-interface-member` | Interfaces pai declaram um membro de formas incompatíveis. |
| `check-interface-cycle` | Um ciclo de herança entre interfaces foi declarado. |
| `check-unimplemented-interface` | Um membro exigido pela interface está faltando. |
| `check-explicit-self-parameter` | Um método declara explicitamente o `self` que já é injetado automaticamente. |
| `check-invalid-self` | `self` fora de um método de classe ou de uma declaração `function Nome:metodo()`. |
| `check-invalid-constructor` | Uma classe declara `constructor` como campo em vez de método. |
| `check-duplicate-enum` | Dois enums com o mesmo nome em um arquivo. |
| `check-unknown-enum-member` | O enum não tem esse membro. |
| `check-invalid-super` | `super(...)` fora de uma classe ou a sintaxe inválida `self:super(...)`. |
| `check-unknown-super-method` | A classe pai não tem método com esse nome. |
| `check-declare-outside-declaration-file` | `declare` fora de um arquivo `.d.luam`. |
| `check-declaration-file-statement` | Um arquivo `.d.luam` contém um comando. |
| `check-unused-local` | Um local nunca é lido, com `compiler.noUnusedLocals` ligado, ou em qualquer ponto do manifesto. |
| `check-unused-parameter` | Um parâmetro nunca é lido, com `compiler.noUnusedParameters` ligado. |

## Checker — decoradores

| Código | Significado |
| --- | --- |
| `check-blocked-metamethod` | Um método de classe nomeia um metamétodo que o Luam não expõe. |
| `check-invalid-metamethod` | Um metamétodo declara a quantidade errada de parâmetros ou o retorno errado. |
| `check-unreifiable-type` | O `@Validated` nomeia um tipo de campo que não tem forma em execução. |
| `check-unknown-decorator` | O nome não é um dos decoradores conhecidos. |
| `check-decorator-target` | Um decorador em algo que não pode recebê-lo. |
| `check-duplicate-decorator` | O mesmo decorador duas vezes em um alvo. |
| `check-decorator-conflict` | A combinação não pode ser satisfeita. |
| `check-lazy-initializer` | Um campo `@Lazy` sem inicializador. |
| `check-readonly-assignment` | Uma escrita em campo `@ReadOnly` fora da classe que o declara. |
| `check-deprecated-use` | Um uso de um membro `@Deprecated`. |
| `check-invalid-override` | Um método `@Override` que a superclasse não declara com a mesma assinatura. |

## Checker — MTA

| Código | Significado |
| --- | --- |
| `check-environment-api` | A API pertence a outro ambiente. |
| `check-environment-event` | O evento pertence a outro ambiente. |
| `check-oop-disabled` | Uma chamada OOP com `compiler.oop` desligado. |
| `check-not-callable-class` | Uma classe usada como construtor que o MTA não torna chamável. |
| `check-native-constructor` | Argumentos errados para um construtor nativo. |
| `check-native-class-inheritance` | Uma classe de projeto tentou estender uma classe nativa. |

## Checker — contratos de evento

| Código | Significado |
| --- | --- |
| `check-duplicate-event` | Duas declarações `declare event` para um nome. |
| `check-invalid-event-name` | `declare event ''`, com nome vazio. |
| `check-duplicate-event-parameter` | Dois parâmetros de um evento com o mesmo nome. |
| `check-invalid-event-parameter` | O parâmetro variádico do evento não é o último. |
| `check-event-return-type` | Um evento declarou um retorno diferente de `void`. |

## Checker — templates e exports

| Código | Significado |
| --- | --- |
| `check-unknown-template-root` | Uma interpolação não é um nome nem um caminho de membro, ou se refere a um nome fora do escopo e sem padrão. |
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
| `project-load-order-library` | Uma entrada de `loadOrder` nomeia um arquivo de biblioteca. Scripts de biblioteca carregam na ordem que `libraries` declara. |
| `project-library-collision` | Duas bibliotecas, ou uma biblioteca e um arquivo do projeto, declaram uma global no mesmo lado. |
| `project-library-shadows-api` | Uma biblioteca declara um nome que a API do MTA define. Reportado como warning. |
| `project-library-project-reference` | Um arquivo de biblioteca usa uma global que o projeto declara. Uma biblioteca enxerga só os arquivos dela. |
| `project-bundle-toplevel-return` | Um módulo em bundle termina com `return` no nível superior. Remova-o ou selecione a árvore. |
| `project-bundle-output-collision` | Um fonte ou asset produz um caminho reservado de bundle. Renomeie-o ou selecione a árvore. |

## Build

| Código | Significado |
| --- | --- |
| `build-source-unreadable` | Um arquivo de código não pôde ser lido. |
| `build-asset-unreadable` | Um asset não pôde ser lido. |
| `build-env-malformed` | O `.env` não pôde ser interpretado. |
| `build-invalid-contract` | Um contrato de export de dependência estava ilegível ou nomeava outro resource, e foi ignorado. |
| `build-empty-configuration` | A configuração não produziu nada para construir. |

## Configuração

| Código | Significado |
| --- | --- |
| `config-not-found` | Nenhum `.luam.manifest` no diretório. |
| `config-unsupported-manifest` | O arquivo selecionado não é um `.luam.manifest`. |
| `config-unreadable-manifest` | O arquivo não pôde ser lido. |
| `config-invalid-statement` | Uma instrução que o dialeto do manifesto não permite. Apenas declarações `local` e atribuições a campos de configuração. |
| `config-invalid-expression` | Um valor que a linguagem de expressões do manifesto não permite — uma chamada, uma função, um índice por algo que não seja um nome. |
| `config-missing-field` | Um campo obrigatório — `name`, ou `from` dentro de uma entrada de `assets` — está ausente. |
| `config-invalid-name` | `name` não é um nome válido de resource do MTA. |
| `config-invalid-type` | Um campo tem o tipo errado. |
| `config-unknown-field` | Um nome não é um campo de configuração. Inclui o removido `helperDir`. |
| `config-removed-field` | Um nome que já foi um campo. A mensagem nomeia seu substituto. |
| `config-escaping-path` | Um caminho é absoluto ou contém um segmento `..`. |
| `config-invalid-pattern` | Um padrão usa algo que a gramática de glob não permite. |
| `config-missing-source` | Uma entrada literal de `sources` nomeia um arquivo que não existe. |
| `config-no-sources` | Nenhum arquivo `.luam` casou com `sources`. |
| `config-source-side-conflict` | Um arquivo é casado por mais de um lado de `sources`. |
| `config-missing-asset` | Uma entrada literal de `assets` nomeia um arquivo que não existe. |
| `config-output-collision` | Dois assets caem no mesmo destino, ou um sobrescreveria um caminho gerado. |
| `config-invalid-dependency` | Uma entrada de `dependencies` não é um nome de resource válido, ou nomeia este resource. |
| `config-library-missing` | Uma entrada de `libraries` nomeia um pacote que não está instalado. A mensagem nomeia o comando de instalação. |
| `config-library-invalid` | Uma entrada de `libraries` não é um nome de pacote, ou o pacote não declara um campo `luam` utilizável. |
| `config-library-duplicate` | O mesmo pacote está listado duas vezes em `libraries`. |
| `config-library-escape` | Um padrão de código da biblioteca resolve fora do diretório do pacote. |
| `config-library-requirement-missing` | Uma biblioteca resolvida exige um pacote que `libraries` não lista. |
| `config-invalid-engine-version` | `engine.minVersion` não é `'latest'` nem uma versão. |
| `config-missing-env-file` | Um arquivo configurado em `environment` não existe. |
| `config-unknown-helper` | `helpers` nomeia um helper inexistente. |

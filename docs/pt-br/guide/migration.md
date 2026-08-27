# Migração

Toda release que exige uma mudança sua tem uma seção abaixo, da mais antiga para
a mais nova. Encontre a versão em que você está e aplique, em ordem, cada seção
abaixo dela. Uma release que não está listada não pede nada: instale e
reconstrua.

`0.2.0` é a release publicada mais antiga, então o caminho começa na primeira
mudança depois dela. Cada entrada aponta para a página de referência que
documenta a forma atual, e o histórico completo está no
[changelog](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md).

| Release | O que ela pede |
| --- | --- |
| `0.6.0` | Reescrever o arquivo de projeto como manifesto, e renomear uma opção da CLI |
| `0.7.0` | Escrever métodos de classe em uma única forma; ler a nota sobre escopo de bundle |
| `0.11.1` | Renomear quatro campos do manifesto |
| `0.12.0` | Remover o helper `env` e a classe `Dotenv` |
| `0.13.0` | Ler `env` em vez de `process.env` |
| `0.14.0` | Chamar `super(...)` diretamente |
| `0.16.0` | Remover a tabela `transport` e recarregar o resource você mesmo |
| `0.18.0` | Renomear `compilerOptions` para `compiler` |
| `0.19.0` | Reler um comportamento de string de template; nenhuma mudança de código |

## 0.6.0 - 2026-08-12

**O arquivo de projeto virou um manifesto.** O arquivo de projeto em JSON não é
mais lido, mesclado nem reportado, mesmo quando está ao lado de um
`.luam.manifest`. Renomeie o arquivo para `.luam.manifest`, tire as chaves
externas e as aspas dos nomes dos campos, e escreva `=` no lugar de `:`.

Antes, em `luam.json`:

```json
{
    "name": "my-resource",
    "compilerOptions": { "oop": false }
}
```

Depois, em `.luam.manifest`:

```luam static
name = 'my-resource'

compiler = {
    oop = false,
}
```

O manifesto é Luam, restrito a uma declaração local e a uma atribuição de campo,
e é analisado e verificado pelo mesmo compilador — um erro reporta com arquivo,
linha e caret. Veja [`.luam.manifest`](/pt-br/tooling/luam-manifest).

**`--config` virou `--manifest`** em `build`, `check`, `dev`, `ensure` e `trace`.
O caminho precisa terminar em `.luam.manifest`.

**Toda opção agora pertence aos comandos que a leem.** Uma opção fora desse
conjunto sai com `2` em vez de ser ignorada, então `luam dev --bundle` e
`luam check --offline` falham em vez de fingir que funcionaram. A tabela de
migração na [referência da CLI](/pt-br/tooling/cli) lista cada uma.

**O snapshot de configurações do editor acabou.** Não existe arquivo de snapshot
nem processo filho que avalie o manifesto; o servidor de linguagem lê o manifesto
direto, então uma mudança em `compiler.oop` vale ao salvar.

## 0.7.0 - 2026-08-12

**Uma forma só de método de classe.** Um membro escrito `name(...) { ... }`
reporta `parse-class-method-form`. Escreva a forma que o manual documenta:

```luam static
class Round {
    start = function (self): void
        print('start')
    end
}
```

Métodos de interface não mudaram: não têm corpo e mantêm
`name(parameters): type`. Veja [Classes](/pt-br/language/classes).

**Um bundle é plano.** Cada membro era emitido dentro de `do ... end`; agora o
bundle é a concatenação, na ordem de carga, dos helpers e dos módulos, sem
invólucro. Nada a reescrever, mas duas consequências valem a leitura: todo módulo
de um bundle divide o mesmo escopo de chunk, então um `local` de nível de arquivo
fica visível para todo módulo depois dele no mesmo ambiente, e o limite de 200
locais ativos do Lua 5.1 passa a valer para o bundle e não para cada módulo.
Nenhum dos dois é verificado pelo compilador. Um resource que depende de escopo
por arquivo continua correto com `--no-bundle` ou com o layout `tree` — veja
[Layouts de saída](/pt-br/reference/output-layouts).

## 0.11.1 - 2026-08-15

**Quatro campos do manifesto foram substituídos.** Cada um é rejeitado com
`config-removed-field` nomeando o substituto, em vez de virar um apelido
silencioso, para que um manifesto desatualizado falhe em vez de construir algo
diferente do que ele diz:

| Removido | Escreva no lugar |
| --- | --- |
| `oop` | `compiler = { oop = true }` |
| `sourceDirs` | `sources = { server = { ... }, client = { ... }, shared = { ... } }`, listando caminhos ou padrões por lado |
| `assetDirs` | `assets = { { from = 'assets/**/*', to = 'assets' } }`, nomeando um destino para cada entrada |
| `mta` | `engine = { minVersion = '1.6.0' }` |

Três diagnósticos foram junto, porque o manifesto é onde está o erro:
`build-no-sources` agora é `config-no-sources`, `build-source-dir-missing` é
`config-missing-source`, e `build-source-dir-outside-root` é
`config-escaping-path`. Veja [Campos de
configuração](/pt-br/reference/configuration-fields).

## 0.12.0 - 2026-08-15

**Os helpers de runtime `env` e `dotenv` foram removidos.** `helpers = { 'env' }`
em um manifesto agora é `config-unknown-helper`. Remova a entrada: os valores são
publicados pelo `env.lua` gerado, e os tipos deles continuam vindo do `.env` pelo
checador, então uma chave que o arquivo não declara continua sendo
`check-unknown-record-key`.

**A classe nativa `Dotenv` foi removida**, com o construtor e os membros dela.
Ler um segundo arquivo de ambiente em execução não faz mais parte da linguagem.

**Um resource não publica mais um `.env`.** Os valores vivem no `env.lua`, e um
`.env` já implantado continua protegido da limpeza. Veja [config.lua e
.env](/pt-br/mta/configuration).

## 0.13.0 - 2026-08-15

**`process` e `process.env` foram removidos.** Leia `env` no lugar:

```luam static
local port: number = env.SERVER_PORT
```

Um arquivo que ainda nomeia `process` compila — um global não declarado é Lua
legal — mas lê `nil` em execução, então este não falha alto. Procure o nome nos
seus arquivos.

O `env.lua` é regerado a cada build, então uma chave adicionada ao projeto nunca
deixa um leitor desatualizado no servidor.

## 0.14.0 - 2026-08-15

**`super` é chamado diretamente.** A grafia antiga, que o chamava através de
`self`, reporta `check-invalid-super`:

```luam static
class Timed extends Round {
    constructor = function (self, seconds: number): void
        super(seconds)
    end
}
```

O mesmo vale para um método sobrescrito: chame `super:method(...)` no corpo do
método que o sobrescreve. Veja [Classes](/pt-br/language/classes).

## 0.16.0 - 2026-08-25

**A tabela `transport` foi removida**, junto com o transporte `http` e todo
campo, diagnóstico e variável de ambiente que a servia. Um manifesto que ainda
escreve `transport` reporta `config-removed-field`. Apague a tabela.

Os diagnósticos removidos são `config-invalid-transport`,
`config-invalid-url-segment`, `config-missing-secret`,
`config-plaintext-password` e `config-remote-plaintext-transport`.

**Recarregar voltou a ser seu.** O `luam ensure` constrói e sincroniza o
resource, e para por aí; carregue a sincronização com `refresh` e
`restart <name>` no console do servidor. O `luam dev --start-server` é o único
caminho que reinicia um resource para você, porque ele é dono do processo em cujo
console escreve esses comandos. A CLI não abre mais conexão com um servidor MTA.
Veja [Desenvolvimento diário](/pt-br/guide/daily-development).

## 0.18.0 - 2026-08-25

**`compilerOptions` agora é `compiler`.** Os membros e os padrões deles não
mudaram — `strict`, `oop`, `noUnusedLocals`, `noUnusedParameters` e
`warningsAsErrors`. O nome antigo não virou apelido: ele reporta
`config-removed-field` e nomeia `compiler` como substituto, para que um manifesto
desatualizado falhe alto em vez de construir com os padrões.

```luam static
compiler = {
    strict = true,
    oop = false,
}
```

## 0.19.0 - 2026-08-27

**Nenhuma mudança de código, um comportamento para conhecer.** Um caminho mais
profundo de `self` dentro de uma string de template agora é lido no ponto da
chamada. Um segmento `nil` no meio levanta `attempt to index a nil value` onde o
helper de runtime parava e devolvia o fallback. Se você contava com o fallback
para absorver um campo intermediário ausente, proteja o caminho. Veja [Strings de
template](/pt-br/language/template-strings).

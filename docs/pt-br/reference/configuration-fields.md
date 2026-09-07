# Campos de configuração

Todos os campos que o `.luam.manifest` aceita. A tabela abaixo é gerada do mesmo
catálogo que o checador, o editor e o build leem, então ela não pode divergir do
que a ferramenta exige. A coluna **Obrigatório** é a que o editor mostra ao lado
de cada item de autocompletar. Um nome desconhecido é `config-unknown-field`, e um
campo com o tipo errado é `config-invalid-type`.

Para a versão narrativa, veja [.luam.manifest](/pt-br/tooling/luam-manifest).

## As cinco seções

Um manifesto é um único construtor de tabela cujas chaves de nível de cima são
`info`, `environment`, `scripts`, `files` e `build`. Nada além disso é uma seção.

<!--@include: ../../generated/manifest-fields.pt-br.md-->

Uma entrada de `scripts` declara o próprio lado, então um arquivo recebe o tipo da
entrada que o alcançou e não do diretório em que está. Uma entrada de `files` é um
caminho simples que chega a `<file src>` exatamente como foi escrito.

Um padrão aceita `*`, `**` e `?`, com `/` como separador. Regex, negação, expansão
de chaves e extglobs são `config-invalid-pattern`. Um caminho que escapa do projeto
é `config-escaping-path` — exceto `build.output`, que pode ser absoluto e pode sair
do projeto.

## O arquivo de workspace

Um diretório de recursos nomeia a instalação do MTA que eles compartilham uma vez
no [`.luam.server`](/pt-br/reference/server-file):

| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `serverPath` | `string` | **sim** | — | Raiz do servidor MTA, resolvida contra o diretório que guarda o arquivo. |
| `resourcesDir` | `string` | não | `'mods/deathmatch/resources'` | Diretório de recursos relativo a `serverPath`. |
| `executable` | `string?` | não | sondagem por plataforma | Executável relativo a e contido em `serverPath`. |

## Campos removidos

Um nome removido é rejeitado, nunca apelidado. Cada um reporta
`config-removed-field` e nomeia o substituto. A segunda tabela acima lista todos
eles.

Hooks, plugins, expressões regulares e dependências opcionais não são suportados e
não têm substituto.

## Variáveis de ambiente

| Variável | Efeito |
| --- | --- |
| `LUAM_OFFLINE` | Pula a consulta de `min_mta_version`, como `--offline`. |
| `NO_COLOR` | Desliga cor e emoji, como `--no-color`. |

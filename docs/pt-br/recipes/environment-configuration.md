# Configuração de ambiente

Valores de implantação declarados no `.env`, tipados a partir dos seus literais e
lidos no servidor através de `process.env`.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).

## Árvore de arquivos

```
luam-docs-environment-configuration/
├── .luam.manifest
├── .env
└── src/
    └── server/
        └── startup.luam
```

## Código

<<< @/snippets/environment-configuration/.luam.manifest{js}

<<< @/snippets/environment-configuration/.env{ini}

<<< @/snippets/environment-configuration/src/server/startup.luam

## O que observar

- **O `.env` é a fonte de verdade dos tipos.** `MAX_PLAYERS=32` é `number`,
  `DEBUG=false` é `boolean` e o `SERVER_NAME` entre aspas é `string`. As anotações
  no arquivo Luam são verificadas contra isso.
- **O `.env` é versionado.** Ele declara chaves e padrões seguros, não segredos. A
  nomenclatura é invertida em relação a Vite e Next: aqui o ignorado é o
  `.env.local`.
- **`process` é só de servidor.** Ler `process.env` de um arquivo de cliente ou
  compartilhado é `check-environment-api`.
- **Uma chave não declarada é erro.** `process.env.MISSING` é
  `check-unknown-record-key`, e a mensagem lista as chaves declaradas.

## Comandos

```bash
luam check
luam build
```

## Resultado esperado

<<< @/snippets/output/environment-configuration.check.txt{text}

O build transforma as chaves declaradas em um script de servidor:

```
build/luam-docs-environment-configuration/
├── meta.xml
├── env.lua                   ← escrito uma vez, nunca sobrescrito
└── src/server/startup.lua
```

O `env.lua` guarda os valores como uma tabela Lua e os publica como `env` e
`process.env`. Ele é declarado script de servidor, então um cliente nunca o
baixa. Não há parser em runtime nem `.env` dentro do resource — o compilador lê
seu `.env` em tempo de build e escreve a tabela.

O arquivo gerado é de posse do administrador do servidor: o build escreve uma vez
e nunca sobrescreve, e o `ensure` não encosta nele. É isso que impede um deploy
de substituir os valores de produção pelos da sua máquina. Chaves com nome de
aparência sensível — `password`, `secret`, `token`, `key`, `credential`, `dsn`,
`private` — são escritas em branco para o administrador preencher:

```lua
local values = {
    DEBUG = false,
    MAX_PLAYERS = 32,
    SERVER_NAME = 'Luam Docs Server',
    WEBHOOK_TOKEN = '',
}
```

Ler uma chave que o arquivo não declara levanta um erro nomeando a chave, e a
tabela é somente leitura.

Na inicialização, o `server.log` ganha:

```
Luam Docs Server accepts 32 players
```

## Sobrescrevendo em uma máquina

Crie um `.env.local`, que nunca é versionado:

```ini
SERVER_NAME="Thigas dev"
DEBUG=true
```

Os tipos continuam vindo do `.env`, então uma chave que só existe no `.env.local`
continua desconhecida para o checker.

## Nota de segurança

O `<outDir>/<name>/env.lua` gerado **esvazia** qualquer chave cujo nome pareça
sensível — `password`, `secret`, `token`, `key`, `credential`, `dsn`, `private` —
e é por isso que `WEBHOOK_TOKEN` é publicado vazio. O administrador o preenche no
servidor, e nenhum rebuild sobrescreve aquele arquivo. Apague-o para regenerar o
esqueleto.

Nunca coloque um segredo no `config.lua`: ele é um script compartilhado e todo
jogador o baixa. Veja [Fronteiras de segurança](/pt-br/mta/security).

# Fronteiras de segurança

O MTA roda parte do seu resource em máquinas que você não controla. O Luam cobra
parte dessa fronteira no build; o resto é uma decisão de projeto que continua
sendo sua.

## O que o cliente recebe

Tudo declarado como `client` ou `shared` no `meta.xml` é **baixado para a máquina
do jogador** e pode ser lido lá:

| Arquivo | Baixado |
| --- | --- |
| `src/client/**` | sim |
| `src/shared/**` | sim |
| `config.lua` | **sim** — é um script compartilhado |
| `assets/**` | sim |
| `src/server/**` | não |
| `lib/server/**` | não |
| `.env` | não — ele nunca recebe uma entrada `<file>` |

Considere público tudo que é baixado. Ofuscação não é fronteira.

## O que o compilador cobra

- Uma API só de servidor em um arquivo de cliente ou compartilhado é
  `check-environment-api`.
- Um global de servidor é invisível para arquivos de cliente, e vice-versa, por
  `project-environment-import`.
- `process` é declarado `server`, então valores do `.env` não podem ser lidos de um
  arquivo de cliente ou compartilhado.
- Helpers de runtime só de servidor são escritos em `lib/server/`, nunca em um
  local que clientes baixam.

## O que continua sendo decisão sua

O compilador não tem como saber quais dos seus valores são sensíveis.

- **Nunca coloque um segredo no `config.lua`.** Ele é um script compartilhado;
  todo jogador o tem.
- **Valide todo argumento que chega de um cliente.** Um handler de
  `triggerServerEvent` recebe o que o cliente escolheu enviar, e a anotação de
  tipo no handler é apagada no build — ela é um contrato de compilação, não uma
  guarda de execução.
- **Mantenha a autoridade no servidor.** Uma verificação no cliente é uma
  conveniência para o jogador honesto, nunca uma imposição.

## Segredos no `.env`

O `.env` é versionado, então ele declara chaves e padrões seguros em vez de
guardar segredos. O primeiro build escreve `<outDir>/<name>/.env` e **esvazia**
qualquer chave cujo nome pareça sensível: `password`, `secret`, `token`, `key`,
`credential`, `dsn`, `private`. O administrador preenche no servidor, e nenhum
rebuild sobrescreve aquele arquivo.

## O transporte do `ensure`

O `ensure` reinicia um resource pela interface HTTP do MTA, que **não tem TLS**. A
autenticação básica, portanto, trafega em claro.

```json
{
    "transport": {
        "kind": "http",
        "host": "127.0.0.1",
        "port": 22005,
        "resource": "luam-sync",
        "username": "luam",
        "passwordEnv": "LUAM_MTA_PASSWORD"
    }
}
```

- Use `passwordEnv`, que nomeia uma variável de ambiente. Um `password` embutido é
  aceito, mas reporta `config-plaintext-password`. Nenhuma linha de log ou
  diagnóstico imprime o valor de qualquer forma.
- Mantenha `host` em um endereço de loopback e faça um túnel da porta por SSH. Um
  host que não é loopback reporta `config-remote-plaintext-transport`.
- `resource`, `refreshFunction`, `restartFunction` e `host` viram parte da URL da
  requisição, então são validados antes de qualquer envio. Um valor com `/`, `?`,
  `#` ou `..` é `config-invalid-url-segment` e a configuração não carrega.

## Acesso à rede

Um build faz exatamente um tipo de requisição de saída: a consulta de
`min_mta_version`, que é cacheada e opcional. `--offline` ou `LUAM_OFFLINE` a
pula, e um build sem rede continua funcionando. Os pacotes do compilador não fazem
nenhuma chamada de rede.

## Logs de desenvolvimento

O `luam dev` adiciona um relay de log do cliente para o servidor **apenas** ao
resource que ele sincroniza. O helper de servidor valida tipos e comprimento e
limita cada cliente a `rateLimit` registros por `rateWindowMs`. Esses helpers nunca
são escritos por `build` ou `ensure`, não podem ser selecionados por `helpers` e
são removidos pela próxima sincronização normal — então nunca chegam à produção.

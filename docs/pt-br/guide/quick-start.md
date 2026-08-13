# Início rápido

Cinco passos, de uma pasta vazia até um resource (recurso do MTA) rodando no seu
servidor. Todos os comandos abaixo assumem que a CLI está instalada — veja
[Instalação](/pt-br/guide/installation).

## 1. Criar o projeto

```bash
mkdir my-resource
cd my-resource
luam init
```

`init` escreve exatamente um arquivo, `.luam.manifest`. Sem framework, sem árvore de
exemplo, nada para apagar.

```luam
name = 'my-resource'
```

Um `.luam.manifest` existente é mantido e informado; passe `--force` para
sobrescrevê-lo.

## 2. Escrever um pouco de Luam

Crie a árvore de código você mesmo. **A pasta decide o ambiente**: `src/server`
roda no servidor, `src/client` roda no cliente e `src/shared` roda nos dois.

```
my-resource/
├── .luam.manifest
└── src/
    ├── shared/labels.luam
    ├── server/greet.luam
    └── client/greet.luam
```

<<< @/snippets/shared-function/src/shared/labels.luam

<<< @/snippets/shared-function/src/server/greet.luam

<<< @/snippets/shared-function/src/client/greet.luam

O compilador já sabe que `formatPlayerLabel` é compartilhada, então os dois
arquivos podem chamá-la — e sabe que `dxDrawText` a partir de `src/server` seria
um erro.

## 3. Verificar e construir

```bash
luam check   # apenas diagnósticos, não escreve nada
luam build   # escreve build/my-resource
```

Um build bem-sucedido informa cada fase:

<<< @/snippets/output/shared-function.build.txt{text}

Um erro nomeia o arquivo, a linha, a coluna e a regra:

```
src/server/greet.luam:4:5 error check-environment-api: API "dxDrawText" is client-only and is not available in a "server" file.
```

Um build que reporta qualquer erro não escreve nada, então um resource que
funcionava nunca é substituído por uma saída parcial.

## 4. Rodar

Copie `build/my-resource` para `<Servidor MTA>/mods/deathmatch/resources/` e, no
console do servidor:

```
refresh
start my-resource
```

## 5. Iterar

Aponte o `.luam.manifest` para o seu servidor e deixe o `ensure` construir, sincronizar
e reiniciar a cada gravação:

```luam
name = 'my-resource'
serverPath = 'C:/MTA Server'
```

```bash
luam ensure
```

Com um transporte configurado, o `ensure` também reinicia o resource para você, e
`luam dev` acrescenta um fluxo ao vivo do log do servidor. Veja
[Desenvolvimento diário](/pt-br/guide/daily-development).

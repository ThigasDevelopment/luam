# HUD no cliente

Texto desenhado a cada quadro, alternado por uma tecla e limpo quando o resource
para.

## Pré-requisitos

- A CLI `luam` ([Instalação](/pt-br/guide/installation)).
- Um servidor MTA rodando e um cliente para entrar.

## Árvore de arquivos

```
luam-docs-client-hud/
├── luam.json
└── src/
    └── client/
        └── hud.luam
```

## Código

<<< @/snippets/client-hud/luam.json

<<< @/snippets/client-hud/src/client/hud.luam

## O que observar

- **`draw` é um local nomeado.** `onClientRender` dispara a cada quadro, então o
  handler precisa ser removível — `removeEventHandler` precisa do mesmo valor de
  função que foi adicionado. Uma função anônima não pode ser removida.
- **A legenda é uma string de template.** `${name}` e `${health}` são locais, então
  o checker validou os dois nomes antes de a string existir.
- **`localPlayer` é só de cliente.** Usá-lo em `src/server` é
  `check-environment-api`; `dxDrawText` também.
- **Limpeza no `onClientResourceStop`.** Sem ela, um resource reiniciado deixa o
  handler de render antigo pendurado.

## Comandos

```bash
luam check
luam build
```

## Resultado esperado

<<< @/snippets/output/client-hud.check.txt{text}

O `meta.xml` declara o curinga de cliente, com cache desligado:

```xml
<script src="src/client/**/*.lua" type="client" cache="false" />
```

No jogo, o canto superior esquerdo mostra `Thigas — 100 HP`, e `F7` alterna a
exibição.

## Um erro comum

Mover este arquivo para `src/server` produz um erro por nome só de cliente — seis
para este arquivo, não um para o arquivo inteiro:

```
src/server/hud.luam:9:45 error check-environment-api: API "localPlayer" is client-only and is not available in a "server" file.
src/server/hud.luam:10:40 error check-environment-api: API "localPlayer" is client-only and is not available in a "server" file.
src/server/hud.luam:13:5 error check-environment-api: API "dxDrawText" is client-only and is not available in a "server" file.
src/server/hud.luam:16:16 error check-environment-event: Event "onClientRender" is client-only and cannot be used in a "server" file.
src/server/hud.luam:18:16 error check-environment-event: Event "onClientResourceStop" is client-only and cannot be used in a "server" file.
src/server/hud.luam:19:23 error check-environment-event: Event "onClientRender" is client-only and cannot be used in a "server" file.
```

Dois nomes estão **ausentes** dessa lista: `getElementHealth` e `getPlayerName`
são compartilhados, então resolvem nos dois lados. `bindKey` também está ausente —
ele é compartilhado no catálogo. Só os nomes realmente exclusivos de cliente
falham, e é por isso que mover um arquivo nunca produz um único erro genérico. A
correção é a pasta, ou uma diretiva `#!client` na primeira linha.

## Nota de segurança

Scripts de cliente são baixados para a máquina de todo jogador e podem ser lidos
lá. Um HUD é aceitável; um limiar que decide se uma ação é permitida, não — mantenha
essa decisão no servidor. Veja
[Fronteiras de segurança](/pt-br/mta/security).

# Instalação

## Requisitos

| Requisito | Versão | Por quê |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 20 ou mais recente | Roda o compilador e a CLI. |
| [Servidor MTA:SA](https://multitheftauto.com/) | 1.5 ou mais recente | Roda o resource que o compilador escreve. |
| Toolchain de Lua | não é necessário | O compilador emite texto Lua e nunca o executa. |

```bash
node --version
```

## Instalar a CLI

```bash
npm install --global @thigasdevelopment/luam
```

Isso instala um comando, `luam`:

```bash
luam --version
```

| Tarefa | Comando |
| --- | --- |
| Instalar | `npm install --global @thigasdevelopment/luam` |
| Atualizar para a última versão | `npm update --global @thigasdevelopment/luam` |
| Instalar uma versão específica | `npm install --global @thigasdevelopment/luam@%LUAM_VERSION%` |
| Desinstalar | `npm uninstall --global @thigasdevelopment/luam` |
| Rodar uma vez, sem instalar | `npx @thigasdevelopment/luam <command>` |

`npx @thigasdevelopment/luam build` funciona em qualquer lugar e guarda o
download em cache, o que serve bem para CI e para qualquer máquina em que você
prefira não instalar nada.

## `luam: command not found`

O npm colocou o binário no diretório global de binários e esse diretório não está
no seu `PATH`. Encontre-o:

```bash
npm config get prefix
```

- **Windows** — adicione essa pasta ao `PATH` do usuário
  (*Configurações → Sistema → Sobre → Configurações avançadas do sistema →
  Variáveis de Ambiente*) e abra um **novo** terminal.
- **macOS e Linux** — adicione `<prefix>/bin` ao `PATH` no `~/.zshrc` ou no
  `~/.bashrc` e rode `source ~/.zshrc`.

`npx @thigasdevelopment/luam <command>` não precisa de nenhuma entrada no `PATH`.

## Instalar a extensão do editor

A extensão oferece completação, hover e diagnósticos vindos do mesmo verificador
que a CLI roda, então o editor e o build nunca discordam. Deixe a CLI detectar os
editores suportados e pedir confirmação antes de mexer em cada um:

```bash
luam setup
```

Para uma máquina de desenvolvimento sem interação, aprove todos os editores
detectados:

```bash
luam setup --yes
```

O comando nunca instala em um editor silenciosamente. Em CI, ou em qualquer outro
terminal não interativo, passe `--yes` explicitamente.

Veja [Editores](/pt-br/tooling/editors) para a matriz de compatibilidade, o
caminho manual com `.vsix` e as configurações que a extensão adiciona.

## Verificar a instalação

```bash
luam doctor
```

`doctor` informa as versões da CLI e do Node.js em uso, cada editor suportado
encontrado no `PATH` e se aquele editor tem a extensão do Luam.

## Instalar a partir do código-fonte

Para contribuir, ou para rodar uma mudança que ainda não foi publicada. Precisa
de [pnpm](https://pnpm.io/) 9 ou mais recente.

```bash
git clone https://github.com/ThigasDevelopment/luam.git
cd luam
pnpm install
pnpm install:cli
```

`install:cli` empacota o compilador em um único arquivo autocontido, escreve um
manifesto publicável ao lado dele e roda `npm install --global` no resultado. Ao
final, executa `luam --version` e diz o que corrigir quando o diretório de
binários do npm não está no seu `PATH`.

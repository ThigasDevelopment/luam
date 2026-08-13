# Receitas

Exemplos completos, orientados a tarefas. Todo arquivo de código destas páginas é
um arquivo real deste repositório, e todo projeto é verificado com `luam check` a
cada build da documentação — então nada aqui pode se afastar do compilador.

| Receita | O que você obtém |
| --- | --- |
| [Primeiro resource](/pt-br/recipes/first-resource) | O menor resource que inicia e registra logs. |
| [Função compartilhada](/pt-br/recipes/shared-function) | Uma função que o servidor e o cliente chamam. |
| [HUD no cliente](/pt-br/recipes/client-hud) | Texto desenhado a cada quadro, com tecla de alternância. |
| [Comando no servidor](/pt-br/recipes/server-command) | Um comando de chat com argumento. |
| [Tratador de evento](/pt-br/recipes/event-handler) | Handlers de servidor e de cliente para eventos nativos. |
| [Classe tipada](/pt-br/recipes/typed-class) | Uma classe com herança, interface e acessores. |
| [API OOP](/pt-br/recipes/oop-api) | `player:getName()` atrás da opção `oop`. |
| [Função exportada](/pt-br/recipes/exported-function) | Uma função que outro resource pode chamar. |
| [Configuração de ambiente](/pt-br/recipes/environment-configuration) | Valores do `.env` tipados e lidos no servidor. |
| [Desenvolvimento local](/pt-br/recipes/local-development) | O laço de build, sincronização, restart e logs. |

## Como usar uma receita

Cada página traz os pré-requisitos, a árvore de arquivos, o código completo, os
comandos a rodar e o resultado esperado. Crie a árvore, cole os arquivos e rode os
comandos — nada é omitido.

Os pré-requisitos são os mesmos em todas, salvo indicação em contrário:

```bash
node --version   # v20 ou mais recente
luam --version
```

Veja [Instalação](/pt-br/guide/installation) se algum dos comandos falhar.

## Nomes

Os projetos das receitas se chamam `luam-docs-<receita>` para nunca colidirem com
um resource que você já roda. Renomeie `name` no `.luam.manifest`, e a pasta de saída
acompanha.

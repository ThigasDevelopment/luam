---
layout: home
title: Manual do Luam
titleTemplate: Lua tipado para Multi Theft Auto
hero:
    name: Luam
    text: Lua tipado para Multi Theft Auto
    tagline: Escreva .luam com tipos, classes e strings de template. Publique Lua 5.1 puro e um meta.xml gerado que o seu servidor inicia como está.
    image:
        src: /luam-mark.svg
        alt: Luam
    actions:
        - theme: brand
          text: Início rápido
          link: /pt-br/guide/quick-start
        - theme: alt
          text: Instalação
          link: /pt-br/guide/installation
        - theme: alt
          text: Referência da linguagem
          link: /pt-br/reference/keywords
features:
    - title: Erros antes de o servidor iniciar
      details: Uma API só de servidor em um arquivo de cliente, um erro de digitação no nome de uma função do MTA, uma string onde cabia um número — tudo vira erro de build. Um build com qualquer erro não escreve nada.
      link: /pt-br/mta/environments
      linkText: Ambientes
    - title: Lua tipado, não TypeScript
      details: Blocos continuam terminando com end e a desigualdade continua sendo ~=. Anotações, classes, enums e interfaces são apagadas no build.
      link: /pt-br/language/
      linkText: A linguagem
    - title: Um resource pronto para iniciar
      details: Builds de produção emitem um bundle Lua legível por ambiente não vazio e um mapa separado para resolver erros do MTA.
      link: /pt-br/reference/output-layouts
      linkText: Estruturas de saída
    - title: O editor nunca discorda
      details: O servidor de linguagem roda o mesmo verificador que a CLI roda, então completação, hover e diagnósticos batem exatamente com o build.
      link: /pt-br/tooling/editors
      linkText: Editores
---

## O que é o Luam

Luam é uma linguagem tipada para o [Multi Theft Auto](https://multitheftauto.com/).
Você escreve arquivos `.luam`, o compilador os verifica e emite **Lua 5.1**
legível mais um `meta.xml` gerado — um resource (recurso do MTA) que o seu
servidor inicia sem nenhum passo adicional.

```luam
local health: number = 100

function heal(player: Player, amount: number): void
    health += amount

    outputChatBox(`${getPlayerName(player)} healed`, player)
end
```

É *Lua tipado*, não TypeScript. Comentários usam `#` e `#* ... *#` para nunca
colidirem com o operador de decremento `--`, e toda anotação de tipo desaparece
do Lua gerado.

## Por onde começar

| Você quer | Leia |
| --- | --- |
| Instalar as ferramentas | [Instalação](/pt-br/guide/installation) |
| Construir o primeiro resource | [Início rápido](/pt-br/guide/quick-start) |
| Entender o sistema de tipos | [Tipos](/pt-br/language/types) |
| Saber qual API do MTA um arquivo pode chamar | [Ambientes](/pt-br/mta/environments) |
| Configurar um projeto | [luam.json](/pt-br/tooling/luam-json) |
| Copiar um exemplo que funciona | [Receitas](/pt-br/recipes/) |
| Consultar uma palavra-chave ou um diagnóstico | [Referência](/pt-br/reference/) |

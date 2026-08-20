---
layout: home
title: Manual do Luam
titleTemplate: Lua tipado para Multi Theft Auto
hero:
    name: Luam
    text: Lua tipado para Multi Theft Auto
    tagline: Escreva .luam com tipos e classes. Publique Lua 5.1 puro e um meta.xml gerado que o seu servidor inicia como está.
    actions:
        - theme: brand
          text: Início rápido
          link: /pt-br/guide/quick-start
        - theme: alt
          text: Instalar a CLI
          link: /pt-br/guide/installation
---

## Experimente

Nada para instalar. O compilador e o servidor de linguagem rodam no seu
navegador: completação, hover, ir para a definição, renomear e diagnósticos, do
mesmo código que o seu editor roda.

<div class="luam-cta">
<a href="/pt-br/playground">Abrir o playground</a>
<span>ou <a href="/pt-br/guide/installation">instale a CLI</a> para construir um resource de verdade.</span>
</div>

## O que o compilador se recusa a publicar

<div class="luam-split">
<div>

### Lado errado

`dxDrawText` em um arquivo de servidor é erro, não surpresa em tempo de execução.
Cada arquivo resolve para `server`, `client` ou `shared`, e o catálogo do MTA é
limitado a ele.

</div>
<div>

### Nome errado

Um erro de digitação em uma função do MTA é conferido contra o catálogo fixado,
então falha no `luam check` em vez de retornar `nil` às três da manhã.

</div>
<div>

### Tipo errado

Uma `string` onde cabia um `number`, um campo que não existe na classe, um nome
escrito errado dentro de `` `${...}` `` — tudo vira erro de build.

</div>
</div>

Um build com qualquer erro não escreve absolutamente nada, então um resource
quebrado nunca chega ao diretório do servidor.

## Continua sendo Lua

Blocos fecham com `end`. A desigualdade é `~=`. Comentários usam `#` para nunca
colidirem com o operador de decremento `--`. Anotações, classes, enums e
interfaces são apagadas no build, e o que chega ao seu resource é Lua 5.1
legível, que você depura direto no servidor.

## Por onde seguir

<ul class="luam-next">
<li><a href="/pt-br/guide/installation"><strong>Instalação</strong><span>Instale a CLI e a extensão do editor.</span></a></li>
<li><a href="/pt-br/guide/quick-start"><strong>Início rápido</strong><span>Construa e rode o seu primeiro resource.</span></a></li>
<li><a href="/pt-br/language/types"><strong>Tipos</strong><span>O sistema de tipos, de ponta a ponta.</span></a></li>
<li><a href="/pt-br/mta/environments"><strong>Ambientes</strong><span>Qual API do MTA cada arquivo pode chamar.</span></a></li>
<li><a href="/pt-br/recipes/"><strong>Receitas</strong><span>Projetos completos, verificados a cada build.</span></a></li>
<li><a href="/pt-br/reference/"><strong>Referência</strong><span>Palavras-chave, diagnósticos, campos de configuração.</span></a></li>
</ul>

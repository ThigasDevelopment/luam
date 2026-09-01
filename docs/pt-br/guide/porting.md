# Portando um resource Lua

Esta página é a lista ordenada de decisões que converter um resource MTA
existente impõe. Ela descreve o Luam %LUAM_VERSION%.

A maior parte de um resource traduz mecanicamente. Uma parte menor precisa ser
reestruturada, porque o Lua expressa algo que o Luam expressa de outro jeito. Uma
lista curta é recusada, e esta página diz o que escrever no lugar.

## A ordem de trabalho

Porte nesta ordem, rodando `luam check` depois de cada passo:

1. **O manifesto e os arquivos de declaração.** Escreva o `.luam.manifest`, e
   depois um `.d.luam` para cada `config.lua` e script de terceiros que o
   resource lê.
2. **`src/shared`.** Tipos, interfaces, aliases e enums moram aqui, e todo passo
   posterior os lê.
3. **`src/server`.**
4. **`src/client`.**

A ordem importa porque um tipo que o checker ainda não viu **avisa em vez de
resolver**: um nome que não resolve para nada é `check-unknown-type`, um warning,
e a anotação continua parecendo que faz trabalho sem fazer. Portar as declarações
compartilhadas primeiro faz cada arquivo posterior ser verificado contra tipos
reais em vez de contra `any`.

## O que traduz mecanicamente

| Lua | Luam |
| --- | --- |
| `-- comentário` | `# comentário` |
| `--[[ bloco ]]` | `#* bloco *#` |
| `---@param x T` | `x: T` na lista de parâmetros |
| `---@return T` | `): T` depois da lista de parâmetros |
| `---@class X` só com campos | `interface X { ... }` |
| `---@field f fun(self: X, a: T)` | um método de classe, sem `self` explícito |
| `---@alias X 'a' \| 'b'` | `type X = 'a' \| 'b'` |
| `class "X" { }` | `class X { }` |
| `class "X" : extends "Y" { }` | `class X extends Y { }` |
| `self:super(...)` | `super(...)` |
| `X = new "X"` no fim de um arquivo | nada; cada chamada vira `new X(...)` |

Os marcadores de opcional vão para o **nome**, em todo lugar onde um nome é
declarado: `name?: string`, nunca `name: string?`. `Type?` continua correto em
uma posição que não declara nome — um tipo de retorno, o corpo de um alias, um
argumento de tipo.

```luam
class Account {
    owner: string
    note?: string

    constructor = function (owner: string)
        self.owner = owner
    end

    find = function (id: number): Account?
        return nil
    end
}
```

## O que precisa ser reestruturado

**Um módulo que decide seu lado em tempo de execução.** Um arquivo `shared`
enxerga a superfície MTA compartilhada mais os dois lados, e não reporta nada
para um nome restrito a um lado — o autor é dono do desvio em tempo de execução.
Mantenha o módulo em `src/shared` e deixe o desvio como está; veja
[Ambientes](/pt-br/mta/environments).

**Uma classe e seu singleton compartilhando um nome global.**
`Adapter = new "Adapter"` dá à classe e à sua única instância o mesmo nome. No
Luam o nome de uma classe é um tipo, e chamar um membro de instância por ele é
`check-class-receiver`. Dê à instância o nome dela:

```luam
class RedisAdapter {
    connect = function (): boolean
        return true
    end
}

redis?: RedisAdapter = nil

redis = new RedisAdapter()
```

Essa segunda linha é a outra metade dessa forma: um global que a fonte atribui
depois carrega seu tipo na declaração, e o marcador de opcional é como se diz que
ele começa vazio.

**Uma tabela com chave que o código calcula.** Uma chave que um identificador não
soletra é escrita entre aspas, para que o conjunto de chaves, a lista de
completação e a checagem de erro de digitação sobrevivam:

```luam
interface ClientFonts {
    ['medium:20']: string
    ['bold:15']: string
}
```

Leia pela forma de índice — `fonts['medium:20']` — porque `.` aceita um
identificador.

**Uma função que retorna vários valores.** Declare o retorno como uma lista entre
parênteses, e cada chamador desestrutura com os três nomes tipados:

```luam
local function positions(): (number, number, number)
    return 1, 2, 3
end

local x, y, z = positions()

print(x, y, z)
```

**Uma palavra reservada usada como nome de parâmetro.** `type`, `class`, `new`,
`enum`, `export` e as demais não podem nomear um parâmetro nem um local. Renomeie
o parâmetro; uma **propriedade** de mesmo nome continua legal, então
`marker.type` na linha seguinte continua funcionando.

## O que o Luam recusa

**Instanciar uma classe que o código nomeia em tempo de execução.** Não existe
valor que represente uma classe nem `new` sobre um nome calculado. Escreva um
registro — uma tabela listando as classes, cada entrada criada com `new` — e
itere por ele; a aridade do construtor, os tipos dos argumentos e o tipo do valor
do registro passam todos a ser verificados. `getClass(name)` e `getClasses()`
permanecem como a saída sem tipos, e tudo que produzem é `any`. A decisão, as
opções rejeitadas e o limite estão registrados na
[ADR-045](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/045-runtime-named-instantiation.md).

**Auto-carregamento varrendo `_G`.** A mesma decisão cobre isso. O registro é a
ordem de carga, escrita.

## O que o port encontra

O port que produziu esta página revelou **dezessete defeitos genuínos** em um
resource que estava rodando em produção: um campo opcional retornado onde um
chamador esperava um obrigatório, uma chave de config que nunca existiu, um
handler que validava cada argumento e depois não fazia nada com o resultado, uma
aritmética sobre um valor que podia ser `nil`.

Nenhum deles era visível para o language server de Lua, porque nenhum deles é
sintaxe. Eles são o retorno do port, e chegam como diagnósticos no primeiro
`luam check`.

## Onde as formas ficam guardadas

Cada forma desta página está versionada como um corpus do compilador, para que
uma regressão em qualquer uma delas quebre a suíte em vez do próximo port. Veja
[Limitações](/pt-br/reference/limitations) para o que ainda não tem equivalente.

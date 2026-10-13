# Sorteio de Nomes

## Contexto do projeto

Este projeto é uma aplicação web simples para realizar sorteios de nomes e organizar as pessoas sorteadas em grupos. O programa roda nativamente no navegador, sem necessidade de servidor, banco de dados ou instalação de dependências.

A aplicação foi criada a partir de uma referência visual enviada como imagem. O layout original pedia uma área lateral para adicionar nomes e configurar a quantidade máxima de pessoas por grupo, além de uma área principal para exibir os grupos sorteados.

Depois da primeira versão, o visual foi modernizado com uma aparência inspirada em redes sociais, usando cards, bordas suaves, avatares circulares e gradientes. O ícone semelhante ao Instagram foi removido posteriormente para evitar associação com marca registrada, sendo substituído por um símbolo original de pessoas/grupos.

## Objetivo

Permitir que o usuário:

- Digite nomes em uma caixa de texto.
- Adicione os nomes a uma lista.
- Informe a quantidade máxima de pessoas por grupo.
- Sorteie os nomes de forma aleatória.
- Visualize os nomes organizados em grupos.
- Selecione um ou mais grupos.
- Re-sorteie apenas os grupos selecionados.
- Renomeie grupos sorteados.
- Exclua grupos sorteados, devolvendo os nomes para a lista.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro no frontend
- Node.js com Express no backend
- SQLite para persistência

O frontend é servido pelo backend Express, e a comunicação ocorre por uma API HTTP/JSON.

## Estrutura dos arquivos

```text
Curso_IA/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── styles/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── database/
│   ├── repositories/
│   └── services/
├── package.json
├── package-lock.json
├── data/
│   └── sorteio.sqlite
└── README.md
```

### `frontend/`

Contém a aplicação React com Vite. A interface foi organizada por responsabilidade:

- `src/components/`: cabeçalho, painel de pessoas e quadro de grupos.
- `src/hooks/`: estado e atualização dos dados do sorteio.
- `src/services/`: cliente HTTP para a API.
- `src/styles/`: estilos globais da aplicação.

### `backend/`

Contém o Express e a regra de negócio, também separados por responsabilidade:

- `database/`: conexão SQLite, schema e seed de dados iniciais.
- `repositories/`: acesso encapsulado às tabelas.
- `services/`: operações transacionais de pessoas, sorteios e grupos.
- `routes/`: ponto previsto para rotas por domínio; as rotas atuais são expostas pelo `server.js`.
- `server.js`: inicializa a API e serve o build React em produção.

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Digite um nome no campo **Nome do indivíduo**.
3. Clique em **Adicionar a lista**.
4. Repita o processo para todos os nomes desejados.
5. No campo **Quantidade máxima de pessoas por grupo**, informe um número maior ou igual a `1`.
6. Clique em **Sortear**.
7. Os grupos serão exibidos na área **Grupos sorteados** e os nomes sairão da lista.
8. Se ainda existirem nomes na lista, um novo clique em **Sortear** cria grupos extras sem apagar os anteriores.
9. Ao excluir um grupo, os nomes daquele grupo voltam para a lista.
10. Marque os grupos desejados e use **Re-sortear selecionados** ou **Excluir selecionados**.

## Funcionalidades

### Lista inicial

Ao abrir o programa, a lista de pessoas já começa com os seguintes nomes:

Ellon, Dude, Sofia, Marcio, Zebra, Wilson, Caique, Luiz, Ana, Pedro, Kauan e Samuel.

### Adicionar nomes

O usuário pode digitar um nome e clicar em **Adicionar a lista**. O nome será exibido na lista lateral com um avatar contendo suas iniciais.

### Evitar nomes duplicados

O sistema impede que o mesmo nome seja adicionado mais de uma vez, ignorando diferenças entre letras maiúsculas e minúsculas.

### Remover nomes da lista

Cada nome adicionado possui um botão **Remover**, permitindo excluir o nome antes do sorteio.

### Definir quantidade máxima por grupo

O campo de quantidade máxima aceita apenas números inteiros maiores ou iguais a `1`. Caso o valor seja inválido, uma mensagem de erro é exibida.

### Sortear grupos

Ao clicar em **Sortear**, os nomes da lista são embaralhados aleatoriamente e divididos em grupos respeitando a quantidade máxima definida pelo usuário. Depois do sorteio, esses nomes saem da lista.

Se já existirem grupos na tela, um novo sorteio não substitui os grupos anteriores. O botão apenas cria grupos extras com os nomes que ainda estão na lista.

### Renomear grupos

Cada grupo sorteado possui um botão com ícone de lápis. Ao clicar nele, o nome do grupo vira um campo editável. O usuário pode digitar o novo nome e pressionar `Enter` para salvar.

Também é possível clicar fora do campo para salvar automaticamente.

### Selecionar grupos

Cada grupo possui uma caixa de seleção. Ao marcar um ou mais grupos, os botões **Re-sortear selecionados** e **Excluir selecionados** são habilitados.

### Re-sortear grupos selecionados

O botão **Re-sortear selecionados** usa apenas os nomes dos grupos marcados. Esses grupos são substituídos por novos grupos sorteados, respeitando a quantidade máxima de pessoas por grupo. Os grupos não selecionados permanecem inalterados.

### Excluir grupos

Cada grupo possui um botão com ícone de lixeira. Ao clicar nele, o sistema pede confirmação antes de excluir o grupo da tela. Os nomes que estavam no grupo voltam automaticamente para a lista de pessoas.

Também é possível excluir vários grupos de uma vez com o botão **Excluir selecionados**. Nesse caso, os nomes de todos os grupos marcados voltam para a lista.

## Regras de validação

- A quantidade máxima de pessoas por grupo não pode ser menor que `1`.
- O sorteio só acontece se existir pelo menos um nome na lista.
- Nomes vazios não são adicionados.
- Nomes duplicados não são adicionados.
- Um nome já presente em algum grupo também não pode ser adicionado novamente à lista.
- Ao renomear um grupo, se o novo nome estiver vazio, o nome anterior é mantido.
- Após o sorteio, os nomes usados saem da lista.
- Se já existirem grupos, o sorteio apenas adiciona novos grupos.
- Ao excluir um grupo, os nomes voltam para a lista.
- O re-sorteio de selecionados usa somente os nomes dos grupos marcados.
- Os grupos não selecionados não são alterados no re-sorteio.

## Prompts usados para criar o projeto

### Prompt inicial

> Crie um programa que faça sorteio de nomes, siga a imagem anexada como exemplo de onde items ficarão, o programa deve rodar nativamente no navegador. Utilização do programa -> em uma caixa de texto um nome podera ser digitado, após clickar em um botão 'Adicionar a lista' esse nome será adicionado há uma lista de nomes. em uma caixa de texto diferente á quantidade máxima de nomes por lista será colocada, essa quantidade não pode ser menor que 1. deve haver um botão 'sortear' que, ao ter um click, deve selecionar os nomes na lista de nomes de forma aleatória, esses nomes serão colocados em um grupo e esse grupo deve ser mostrado na tela.

### Prompt para melhoria visual e novas ações

> melhore o visual do html deixando ele mais proximo do instagram. adicione a opção de excluir os grupos. ao lado do nome do grupo deve haver uma opção para renomear o grupo.

### Prompt para remover associação com marca

> remova o logo do instagram, pois isso pode dar processo

### Prompt para documentação

> Faça um documento markdown explicando o projeto. este markdown deve conter o contexto e prompts usados para criar o projeto

### Prompt para fluxo de sorteio e exclusão

> após clickar em sortear os nomes da lista de nomes devem ser removidos. ao excluir um grupo os nomes que estão no grupo devem voltar á lista. caso já existam grupos, o botão de sorteio deve apenas adicionar mais grupos utilizando os nomes na lista de nomes.

### Prompt para seleção, re-sorteio e exclusão em lote

> adicione a opção de selecionar um grupo. um botão para re-sortear e um botão e excluir grupos selecionardos. o botão de re-sortear deve os nomes apenas dos grupos selecionados

### Prompt para lista inicial

> a lista de nomes de iniciar com os seguintes nomes: Ellon, Dude, Sofia, Marcio, Zebra, Wilson, Caique, Luiz, Ana, Pedro, Kauan

### Prompt para incluir Samuel na lista inicial

> adicione o nome Samuel á lista de nomes iniciais

## Observação sobre identidade visual

A versão atual não usa logotipo oficial ou marca registrada de nenhuma rede social. O visual utiliza apenas conceitos genéricos de interface moderna, como cards, gradientes, botões arredondados e avatares circulares.

## Execução

Instale as dependências da raiz, frontend e backend:

```bash
npm install
npm run install:all
```

Para desenvolvimento, execute frontend e backend juntos:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173` e usará proxy para a API em `http://localhost:3000`.

Para produção, compile o React e inicie o Express:

```bash
npm start
```

Depois abra `http://localhost:3000`. O banco SQLite é criado automaticamente em `data/sorteio.sqlite`.

## API principal

- `GET /api/state`: retorna nomes disponíveis e grupos ativos.
- `POST /api/people`: adiciona um nome.
- `DELETE /api/people/:id`: remove um nome disponível.
- `GET /api/draws`: lista o histórico de sorteios.
- `POST /api/draws`: cria um novo sorteio com nomes disponíveis.
- `POST /api/groups/reroll`: re-sorteia grupos selecionados.
- `PATCH /api/groups/:id`: renomeia um grupo.
- `DELETE /api/groups/:id`: exclui um grupo.
- `POST /api/groups/bulk-delete`: exclui vários grupos selecionados.

## Modelo de dados SQLite

- `people`: nomes cadastrados e status atual (`available` ou `assigned`).
- `draws`: histórico imutável das execuções de sorteio.
- `draw_groups`: grupos gerados em cada execução.
- `draw_group_members`: relação entre grupos e pessoas.
- `draw_group_events`: eventos de rename, exclusão e re-sorteio.

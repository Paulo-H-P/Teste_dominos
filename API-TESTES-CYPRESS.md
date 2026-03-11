## Testes de API com Cypress (`cypress/e2e/api.cy.js`)

Este arquivo explica **o que foi feito** nos testes de API com Cypress, **como foi feito** e **como rodar / ajustar manualmente**.

Ele complementa o guia principal `POSTMAN-NEWMAN-TESTES-API.md`, focando apenas na parte de `cy.request`.

---

### 1. Objetivo dos testes de API no Cypress

- **Validar saúde básica da API** (status, tempo de resposta, formato).
- **Cobrir fluxos simples de autenticação** (`/login`) com cenários positivos/negativos leves.
- Ser um **complemento leve** aos testes mais completos feitos no **Postman/Newman**.

A ideia é: se você rodar só o `api.cy.js`, já ter uma noção rápida se a API está **respondendo**, **rápido o suficiente** e com um **contrato mínimo aceitável**.

---

### 2. Como a URL da API é configurada

- A URL base vem de `Cypress.env('apiUrl')`, definida em `cypress.config.js`.
- No `cypress.config.js` foi configurado assim (resumindo):

```js
env: {
  apiUrl: (() => {
    const projectApiUrl = 'https://site-n1.prd-d.ws01.mobi/api'
    const envUrl = process.env.CYPRESS_API_URL
    if (!envUrl || envUrl.includes('api.exemplo.com')) return projectApiUrl
    return envUrl
  })()
}
```

- **Regra importante**: nunca usar `api.exemplo.com`.  
  Se `CYPRESS_API_URL` vier vazio ou apontar para `api.exemplo.com`, o Cypress força a URL real do projeto.

Se você quiser apontar para outro ambiente (ex.: homolog, dev), basta:

1. Criar/editar o `.env` na raiz.
2. Adicionar:

```bash
CYPRESS_API_URL=https://sua-api-de-homolog.com/api
```

3. Rodar o Cypress normalmente (`npx cypress run` ou `npx cypress open`).

---

### 3. Estrutura do `api.cy.js`

Arquivo: `cypress/e2e/api.cy.js`

Principais constantes usadas:

```js
const API_URL = Cypress.env('apiUrl')

const headers = {
  'Content-Type': 'application/json',
  'Accept-Language': 'pt'
}

const requestTimeout = 15000
const maxDurationMs = 4000
```

- **API_URL**: base da API (já vem pronta do `cypress.config.js` / `.env`).
- **headers**: cabeçalhos padrão de JSON.
- **requestTimeout**: timeout por request (15 s).
- **maxDurationMs**: tempo máximo considerado "razoável" para uma resposta (usado para log).

O arquivo está dividido em dois blocos:

1. `describe('API - saúde e contratos básicos', ...)`
2. `describe('API - autenticação (/login)', ...)`

---

### 4. Cenários implementados

#### 4.1. Saúde da API: `GET /recurso`

Trecho principal:

```js
it('GET /recurso retorna 200 ou 500, dentro de tempo razoável e com estrutura mínima', () => {
  cy.request({
    method: 'GET',
    url: `${API_URL}/recurso`,
    qs: { lingua: 'pt' },
    headers,
    failOnStatusCode: false,
    timeout: requestTimeout
  }).then((res) => {
    expect(res.status).to.be.oneOf([200, 500])

    cy.log(`⏱ Duração: ${res.duration} ms`)
    if (res.duration > maxDurationMs) {
      cy.log(`⚠️ Resposta demorou mais que ${maxDurationMs} ms`)
    }

    if (res.status === 200) {
      expect(res.headers['content-type']).to.match(/application\/json|text\/json/i)
      expect(res.body).to.be.an('object')
      expect(res.body).to.have.property('status')
    } else if (res.status === 500) {
      expect(res.body).to.exist
    }
  })
})
```

**O que está sendo validado:**

- **Status**: aceita `200` ou `500` (mantendo o comportamento original que você já tinha).
- **Performance**: loga a duração (`res.duration`) e avisa se passou de `maxDurationMs` (4 s).
- **Contrato quando 200**:
  - `Content-Type` compatível com JSON.
  - Corpo é um objeto.
  - Possui pelo menos a propriedade `status`.
- **Contrato quando 500**: garante apenas que existe algum corpo (para debug).

#### 4.2. Autenticação: `POST /login` com credenciais inválidas

```js
it('POST /login com credenciais inválidas retorna erro com corpo JSON', () => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/login`,
    headers,
    body: { email: 'naoexiste@teste.com', senha: 'errada' },
    failOnStatusCode: false,
    timeout: requestTimeout
  }).then((res) => {
    expect(res.status).to.be.oneOf([200, 400, 401, 404])

    expect(res.body).to.be.an('object')

    if (res.status === 200) {
      if (Object.prototype.hasOwnProperty.call(res.body, 'success')) {
        expect(res.body.success).to.be.false
      }
      if (Object.prototype.hasOwnProperty.call(res.body, 'erro')) {
        expect(res.body.erro).to.be.a('string')
      }
    }
  })
})
```

**Ideia aqui:**

- Permitir tanto o modelo "clássico" (400/401/404) quanto o modelo onde a API devolve `200` com `success=false`.
- Garante sempre:
  - corpo JSON (`res.body` objeto).
  - quando for 200, valida que está sinalizando erro (`success=false`, `erro` string, se esses campos existirem).

#### 4.3. Autenticação: `POST /login` sem corpo (erro de validação)

```js
it('POST /login sem corpo retorna erro de validação (status diferente de 200)', () => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/login`,
    headers,
    body: {},
    failOnStatusCode: false,
    timeout: requestTimeout
  }).then((res) => {
    expect(res.status).to.not.equal(200)
    expect(res.status).to.be.oneOf([400, 401, 422, 500])
    expect(res.body).to.be.an('object')
  })
})
```

**Objetivo:**

- Garantir que requisições sem `email`/`senha` não passam como sucesso silencioso.
- Aceita como erro qualquer um dos status comuns de validação/autenticação (`400`, `401`, `422`, `500`).

---

### 5. Como rodar os testes de API (Cypress)

Você pode rodar **só** o arquivo de API, sem E2E de front.

#### 5.1. Linha de comando (modo headless)

Na raiz do projeto:

```bash
npx cypress run --spec "cypress/e2e/api.cy.js"
```

Isso vai:

- Abrir o Cypress em modo headless.
- Rodar apenas o arquivo `api.cy.js`.
- Usar a URL configurada em `CYPRESS_API_URL` (ou o padrão do projeto).

#### 5.2. Cypress aberto (modo interativo)

Na raiz do projeto:

```bash
npx cypress open
```

Depois:

1. Escolha o tipo de teste **E2E**.
2. Selecione o navegador.
3. Clique no teste `api.cy.js` na lista.

---

### 6. Como ajustar manualmente (se a API mudar)

Se os endpoints ou comportamento da API mudarem, você pode adaptar o arquivo `api.cy.js` seguindo estas ideias:

- **Mudou a rota**:
  - Ex.: `GET /recurso` virou `GET /clientes`.
  - Altere `url: \`${API_URL}/recurso\`` para `url: \`${API_URL}/clientes\``.

- **Mudou o status esperado**:
  - Ex.: agora `/login` inválido **sempre** retorna `401`.
  - Troque:
    ```js
    expect(res.status).to.be.oneOf([200, 400, 401, 404])
    ```
    por:
    ```js
    expect(res.status).to.equal(401)
    ```

- **Mudou o formato do corpo**:
  - Ex.: API passou a devolver `{ ok: false, message: '...' }` em vez de `{ success: false, erro: '...' }`.
  - Adapte os expects para refletir a nova estrutura:
    ```js
    expect(res.body).to.have.property('ok', false)
    expect(res.body).to.have.property('message').that.is.a('string')
    ```

- **Quer adicionar um novo teste**:
  - Copie um dos `it(...)` existentes.
  - Troque método/URL/body/status/contrato conforme o novo endpoint.

---

### 7. Relação com Postman/Newman e Qase

- Os **testes mais completos de API** continuam sendo os das coleções Postman (`postman/*.postman_collection.json`), rodados via **Newman** no CI (workflow `teste-dominos.yml`).
- O `api.cy.js` é pensado como:
  - Um **check rápido** de saúde/contrato.
  - Útil para rodar localmente antes de abrir o Postman ou depender do CI.

Em resumo:

- **Postman/Newman**: cobertura profunda, contratos detalhados, envio de resultados + relatório HTML para o Qase.
- **Cypress `api.cy.js`**: smoke tests de API, focados em status, tempo de resposta e contrato mínimo.

---

### 8. Comandos úteis (resumo)

- **Rodar só testes de API (Cypress):**

```bash
npx cypress run --spec "cypress/e2e/api.cy.js"
```

- **Rodar testes de API (Postman/Newman) localmente (coleção específica do projeto):**

```bash
npm run test:api:postman
```

- **Rodar testes de API (Postman/Newman) localmente (coleção genérica CRUD):**

```bash
npm run test:api:geral
```

- **Rodar testes de API (Postman/Newman) no padrão do CI (gera JSON + HTML + envia para Qase):**

```bash
npm run test:api:ci
```

Assim você tem um "guia de bolso" para lembrar rapidamente:

- O que os testes de API do Cypress fazem.
- Como eles se conectam com a URL configurada.
- Quais comandos usar no dia a dia.


# Guia: Postman, Newman e Testes de API

Instruções e configurações para reutilizar em outros projetos: coleção Postman com testes, execução via Newman (CLI) e testes de API no Cypress.

---

## Neste projeto (Domino's Acompanhamento)

| Item | Caminho / Comando |
|------|-------------------|
| Coleção Postman (Domino's) | `postman/Dominos-Acompanhamento-API.postman_collection.json` |
| Coleção **Teste Geral API** | `postman/Teste-Geral-API.postman_collection.json` |
| Variáveis da coleção | `baseUrl`, `jwt` (edite no Postman ou via `-g`/`-e` no Newman) |
| Rodar testes API (Newman) | `npm run test:api:postman` |
| Rodar **teste geral** de API (Newman) | `npm run test:api:geral` |
| **CI + Qase** (report JSON + HTML + envio ao Qase) | `npm run test:api:ci` |
| Testes API no Cypress | `cypress/e2e/api.cy.js` |
| Rodar só API no Cypress | `npx cypress run --spec "cypress/e2e/api.cy.js"` |
| URL da API (Cypress) | `CYPRESS_API_URL` no `.env` ou `env.apiUrl` no `cypress.config.js` |

**Ajuste a variável `baseUrl`** na coleção (ou crie um environment no Postman) para a URL real da sua API antes de rodar os testes.

### Relatórios no workflow e no Qase

- **GitHub Actions:** O job **API Tests (Newman)** roda na mesma workflow dos testes E2E (`teste-dominos.yml`). Gera relatório HTML (Newman HTMLExtra) e envia resultados ao Qase.
- **Artifact:** O relatório de API fica disponível no artifact `newman-report` (download na execução do workflow).
- **Qase:** O script `scripts/newman-to-qase.js` cria um run no projeto (ex.: DOMINOS) e envia cada request da coleção como resultado (passed/failed). Requer `QASE_API_TOKEN` e `QASE_PROJECT_CODE`.
- **E-mail:** O e-mail de resultado do workflow menciona o relatório de API e o artifact.

---

## 1. Estrutura de pastas

```
seu-projeto/
├── postman/
│   └── Minha-API.postman_collection.json   # Coleção com requests e scripts de teste
├── cypress/
│   └── e2e/
│       └── api.cy.js                        # Testes de API com cy.request (opcional)
└── package.json
```

---

## 2. Coleção Postman (formato v2.1)

### 2.1 Schema e variáveis da coleção

Use o schema **Collection v2.1**. Variáveis permitem trocar base URL e guardar token entre requests.

```json
{
  "info": {
    "name": "Minha API",
    "description": "Coleção com testes automatizados.",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "https://api.seudominio.com/v1" },
    { "key": "jwt", "value": "" }
  ],
  "item": [ ]
}
```

- **baseUrl**: URL base da API (troque por ambiente).
- **jwt**: token de autenticação; pode ser preenchido automaticamente pelo script de teste do Login.

### 2.2 Request GET com query params

```json
{
  "name": "GET Recurso",
  "request": {
    "method": "GET",
    "header": [
      { "key": "Accept-Language", "value": "pt" }
    ],
    "url": {
      "raw": "{{baseUrl}}/recurso?lingua=pt",
      "host": ["{{baseUrl}}"],
      "path": ["recurso"],
      "query": [
        { "key": "lingua", "value": "pt" }
      ]
    }
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "pm.test('Status code is 200', function () {",
          "    pm.response.to.have.status(200);",
          "});",
          "pm.test('Response has status property', function () {",
          "    const json = pm.response.json();",
          "    pm.expect(json).to.have.property('status');",
          "});"
        ],
        "type": "text/javascript"
      }
    }
  ]
}
```

### 2.3 Request POST com body JSON

```json
{
  "name": "POST Login",
  "request": {
    "method": "POST",
    "header": [
      { "key": "Content-Type", "value": "application/json" }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"email\": \"teste@exemplo.com\",\n  \"senha\": \"123456\"\n}"
    },
    "url": "{{baseUrl}}/login"
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "pm.test('Status is 200, 400 or 401', function () {",
          "    pm.expect(pm.response.code).to.be.oneOf([200, 400, 401]);",
          "});",
          "const json = pm.response.json();",
          "if (pm.response.code === 200 && json.data && json.data.jwt) {",
          "    pm.collectionVariables.set('jwt', json.data.jwt);",
          "    pm.test('JWT salvo na variável jwt', function () {",
          "        pm.expect(json.data.jwt).to.be.a('string');",
          "    });",
          "}"
        ],
        "type": "text/javascript"
      }
    }
  ]
}
```

- **pm.response.code**: código HTTP.
- **pm.response.json()**: corpo da resposta.
- **pm.collectionVariables.set('jwt', valor)**: salva o token para os próximos requests (ex.: `Authorization: Bearer {{jwt}}`).

### 2.4 Request autenticado (Bearer JWT)

No request, use o header:

```json
{ "key": "Authorization", "value": "Bearer {{jwt}}" }
```

No **Tests**:

```javascript
pm.test('Status is 200 or 401', function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 401]);
});
```

### 2.5 Aceitar múltiplos códigos (500, 404 etc.)

Quando a API pode retornar erro de servidor ou rota inexistente, não exija só 200:

```javascript
// Ex.: GET que pode retornar 500
pm.test('Status is 200 or 500', function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 500]);
});

// Ex.: POST login que pode retornar 404 (rota não existe no servidor)
pm.test('Status is 200, 400, 401 or 404', function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 400, 401, 404]);
});
```

### 2.6 E-mail aleatório no body (evitar duplicado)

No body do request de cadastro use a variável dinâmica do Postman:

```json
"email": "usuario.{{$randomInt}}@teste.com"
```

---

## 3. Newman (rodar coleção no terminal)

### 3.1 Instalação

No projeto (onde está o `package.json`):

```bash
npm install newman --save-dev
```

Versão usada: `^6.2.0` (evite `^6.3.0` se não existir no npm).

### 3.2 Script no package.json

Se a coleção está na pasta `postman/` na **raiz do repositório** e o `package.json` está numa subpasta (ex.: `app/`):

```json
"scripts": {
  "test:api:postman": "newman run ../postman/Minha-API.postman_collection.json"
}
```

Se a coleção está no **mesmo nível** do `package.json`:

```json
"test:api:postman": "newman run postman/Minha-API.postman_collection.json"
```

### 3.3 Executar

Na pasta onde está o `package.json`:

```bash
npm run test:api:postman
```

O Newman executa todos os requests da coleção e roda os scripts da aba **Tests** de cada um. O resultado (pass/fail por assertion) aparece no terminal.

### 3.4 Relatório HTML (opcional)

```bash
npm install newman-reporter-htmlextra --save-dev
```

```bash
newman run postman/Minha-API.postman_collection.json -r htmlextra --reporter-htmlextra-export report.html
```

---

## 4. Testes de API no Cypress (cy.request)

Para testar a mesma API dentro do Cypress (sem Postman/Newman).

### 4.1 URL da API no cypress.config.js

Em `env`, expose a URL base (e opcionalmente via `.env`):

```javascript
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    // ...
  },
  env: {
    apiUrl: process.env.CYPRESS_API_URL || 'https://api.seudominio.com/v1'
  }
});
```

No `.env` (opcional):

```
CYPRESS_API_URL=https://api.seudominio.com/v1
```

### 4.2 Spec de API (cypress/e2e/api.cy.js)

```javascript
const API_URL = Cypress.env('apiUrl') || 'https://api.seudominio.com/v1';

const headers = {
  'Content-Type': 'application/json',
  'Accept-Language': 'pt',
};

describe('API', () => {
  it('GET /recurso retorna 200 e dados', () => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/recurso`,
      qs: { lingua: 'pt' },
      headers,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('status');
    });
  });

  it('POST /login com credenciais inválidas retorna erro esperado', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/login`,
      headers,
      body: { email: 'naoexiste@teste.com', senha: 'errada' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 400, 401]);
      expect(res.body).to.be.an('object');
    });
  });
});
```

- **failOnStatusCode: false**: Cypress não falha o teste quando a API retorna 4xx/5xx; você controla com `expect(res.status)`.

### 4.3 Rodar só os testes de API

```bash
npx cypress run --spec "cypress/e2e/api.cy.js"
```

---

## 5. Resumo rápido

| O que | Onde | Comando / Ação |
|-------|------|----------------|
| **Coleção Postman** | `postman/*.postman_collection.json` | Import no Postman ou usar com Newman |
| **Variáveis** | Na coleção: `baseUrl`, `jwt` | `{{baseUrl}}`, `{{jwt}}` nos requests |
| **Testes no Postman** | Aba **Tests** de cada request | `pm.test()`, `pm.expect()`, `pm.response`, `pm.collectionVariables.set()` |
| **Newman** | `package.json` script | `npm run test:api:postman` |
| **Cypress API** | `cypress.config.js` → `env.apiUrl` + `cypress/e2e/api.cy.js` | `npx cypress run --spec "cypress/e2e/api.cy.js"` |

---

## 6. Checklist para outro projeto

1. [ ] Criar pasta `postman/` e arquivo `*.postman_collection.json` (schema v2.1).
2. [ ] Definir variáveis `baseUrl` e (se houver login) `jwt`.
3. [ ] Adicionar requests (GET/POST/etc.) e em cada um a seção `event` → `listen: "test"` com `pm.test` / `pm.expect`.
4. [ ] Se login retorna JWT: no Test do Login, usar `pm.collectionVariables.set('jwt', json.data.jwt)`.
5. [ ] Requests que podem retornar 500/404: usar `pm.expect(pm.response.code).to.be.oneOf([200, 500])` (ou 404) em vez de só 200.
6. [ ] Instalar Newman: `npm install newman --save-dev`.
7. [ ] Script no `package.json`: `"test:api:postman": "newman run caminho/para/coleção.json"`.
8. [ ] (Opcional) Cypress: `env.apiUrl` no `cypress.config.js` e spec `api.cy.js` com `cy.request`.

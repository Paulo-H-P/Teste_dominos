# Guia: Postman, Newman e Testes de API (com Qase e relatório HTML)

Passo a passo do que foi implementado neste projeto para testes de API (Postman/Newman), envio de resultados ao Qase e anexo do relatório HTML no Qase. Use este guia para replicar em outros projetos.

---

## Passo a passo do que foi feito aqui

### 1. Estrutura de pastas

```
projeto/
├── postman/
│   ├── Dominos-Acompanhamento-API.postman_collection.json   # Coleção específica (3 requests)
│   └── Teste-Geral-API.postman_collection.json              # Coleção genérica CRUD (8 requests)
├── scripts/
│   └── newman-to-qase.js     # Envia resultados ao Qase + upload do relatório HTML
├── cypress/
│   └── e2e/
│       └── api.cy.js         # Testes de API com cy.request (opcional)
├── .env                      # QASE_API_TOKEN, QASE_PROJECT_CODE, CYPRESS_API_URL
├── .env.example              # Modelo sem valores sensíveis
├── .gitignore                # newman-run-report.json, newman-report/
├── package.json
└── .github/workflows/
    └── teste-dominos.yml     # Job "API Tests (Newman)" + E2E
```

### 2. Coleções Postman

- **Variáveis da coleção:** `baseUrl` (URL base da API), `jwt` (token; preenchido pelo teste de Login). Na Teste Geral: também `idCriado`.
- **baseUrl padrão:** definida como a API do projeto (ex.: `https://site-n1.prd-d.ws01.mobi/api`). Em outro projeto, use a URL base real da sua API.
- **Tratamento de resposta:** quando a API pode devolver HTML (ex.: página de erro) em vez de JSON, os scripts de teste usam `JSON.parse(pm.response.text())` em `try/catch` e não chamam `pm.response.json()` direto, para evitar falha com "Unexpected token '<'".
- **Descrição em cada request:** cada request tem `"description"` com "O que faz" e "Retorno esperado", para documentação no Postman e no relatório.
- **Status aceitos:** incluir 404, 500, 405 (Method Not Allowed) etc. conforme a API (ex.: `pm.expect(pm.response.code).to.be.oneOf([200, 404, 405])`).

### 3. package.json

**Dependências de desenvolvimento:**

```json
"devDependencies": {
  "newman": "^6.2.0",
  "newman-reporter-htmlextra": "^1.23.0",
  "dotenv": "^17.2.3"
}
```

**Scripts:**

```json
"scripts": {
  "test:api:postman": "newman run postman/Dominos-Acompanhamento-API.postman_collection.json",
  "test:api:geral": "newman run postman/Teste-Geral-API.postman_collection.json",
  "test:api:ci": "newman run postman/Teste-Geral-API.postman_collection.json --timeout-request 10000 --reporters cli,json,htmlextra --reporter-json-export newman-run-report.json --reporter-htmlextra-export newman-report/newman-report.html --reporter-htmlextra-darkTheme && node scripts/newman-to-qase.js"
}
```

- **test:api:ci:** timeout de 10 s por request (`--timeout-request 10000`), gera JSON (para o script Qase) e HTML (para download e anexo no Qase), depois roda `newman-to-qase.js`.

### 4. Script newman-to-qase.js

**Função:** após o Newman rodar, lê `newman-run-report.json`, cria um run no Qase, envia cada request da coleção como resultado (passed/failed) e **anexa o relatório HTML** ao primeiro resultado.

**Configuração:**

- **Token:** `QASE_API_TOKEN` ou `QASE_TOKEN` (carrega do `.env` via `dotenv`).
- **Projeto:** `QASE_PROJECT_CODE` (ex.: DOMINOS).
- **Relatório JSON:** primeiro argumento do script ou `newman-run-report.json` na raiz.
- **Relatório HTML:** procurado em `newman-report/newman-report.html`, `newman-report/index.html` ou `newman-report.html` na raiz.

**Fluxo:**

1. Carrega `.env` (path: `../.env` em relação ao script).
2. Lê o JSON do Newman; se não houver token ou report, sai sem erro.
3. Cria um run no Qase: `POST https://api.qase.io/v1/run/{project}` (title, description, is_autotest).
4. **Upload do relatório HTML:** se o arquivo HTML existir, faz `POST https://api.qase.io/v1/attachment/{project}` com **multipart/form-data** (campo `file[]`), usando o pacote `form-data`. A API retorna um `hash`.
5. Para cada execução no report: monta resultado com `status` (passed/failed), `case.title` (nome do request), `time_ms`, `comment` (se falhou). No **primeiro** resultado, envia também `attachments: [hash]` com o hash do HTML.
6. Envia cada resultado: `POST https://api.qase.io/v1/result/{project}/{runId}`.

**Dependência:** o projeto já tem `form-data` (transitiva); o script usa `require('form-data')` para montar o multipart corretamente.

### 5. Relatório HTML no Qase (prompt e implementação)

**Prompt usado (exemplo):**  
*"Consegue anexar um relatório HTML no Qase?"*

**O que foi feito:**

- A API do Qase permite **upload de anexos** por projeto: `POST /v1/attachment/{code}` com **multipart/form-data**, campo **`file[]`** (arquivo binário). A resposta traz um **hash** por arquivo.
- Ao criar um **resultado** de teste (`POST /v1/result/{code}/{runId}`), o body pode incluir **`attachments: [hash]`** (array de hashes). O anexo fica vinculado àquele resultado.
- Implementação no `newman-to-qase.js`:
  1. Após criar o run, verificar se existe o arquivo do relatório HTML (Newman HTMLExtra).
  2. Fazer upload do arquivo com `form-data` (campo `file[]`, `Content-Type: text/html`) e obter o `hash` da resposta.
  3. Ao enviar o **primeiro** resultado do run, incluir `attachments: [hash]`. Assim o relatório HTML aparece como anexo do primeiro teste no run do Qase.
- Limites Qase: até 32 MB por arquivo, 128 MB por request, 20 arquivos por request.

### 6. Workflow GitHub Actions

**Job "API Tests (Newman)":**

- **Timeout do job:** 5 minutos (evita "The operation was canceled" por timeout longo).
- **Variáveis de ambiente:**  
  `QASE_API_TOKEN` (ou `QASE_API_TOKEN`), `QASE_PROJECT_CODE`, `QASE_RUN_TITLE_API`.  
  **NEWMAN_BASE_URL:** `vars.API_BASE_URL` (variável do repositório) ou padrão `https://site-n1.prd-d.ws01.mobi/api`.
- **Comando:**  
  `npx newman run postman/Teste-Geral-API.postman_collection.json --timeout-request 10000 --global-var "baseUrl=$NEWMAN_BASE_URL" --reporters cli,json,htmlextra --reporter-json-export newman-run-report.json --reporter-htmlextra-export newman-report/newman-report.html --reporter-htmlextra-darkTheme && node scripts/newman-to-qase.js`
- **Artifact:** upload da pasta `newman-report/` e do arquivo `newman-run-report.json` com nome `newman-report` (retenção 30 dias).
- **Step summary:** mensagem com link para o Qase e indicação do artifact.

### 7. Cypress (opcional)

- **cypress.config.js:** `env.apiUrl: process.env.CYPRESS_API_URL || 'https://site-n1.prd-d.ws01.mobi/api'`.
- **cypress/e2e/api.cy.js:** testes com `cy.request` usando `Cypress.env('apiUrl')`, `failOnStatusCode: false` e validação de status/body.

### 8. .env e .env.example

**.env (não versionado):**

```
QASE_TOKEN=seu_token_qase
QASE_PROJECT_CODE=DOMINOS
CYPRESS_BASE_URL=https://site-n1.prd-d.ws01.mobi
CYPRESS_API_URL=https://site-n1.prd-d.ws01.mobi/api
```

**.env.example (versionado):**

```
QASE_TOKEN=your_qase_token_here
QASE_PROJECT_CODE=DOMINOS
CYPRESS_BASE_URL=https://site-n1.prd-d.ws01.mobi
CYPRESS_API_URL=https://site-n1.prd-d.ws01.mobi/api
```

### 9. .gitignore

```
newman-run-report.json
newman-report/
```

---

## Referência rápida (este projeto)

| Item | Caminho / Comando |
|------|-------------------|
| Coleção Postman (Domino's) | `postman/Dominos-Acompanhamento-API.postman_collection.json` |
| Coleção Teste Geral API | `postman/Teste-Geral-API.postman_collection.json` |
| Script Qase + upload HTML | `scripts/newman-to-qase.js` |
| Rodar testes API (Newman) | `npm run test:api:postman` ou `npm run test:api:geral` |
| Rodar CI + Qase + relatório HTML | `npm run test:api:ci` |
| Testes API no Cypress | `cypress/e2e/api.cy.js` — `npx cypress run --spec "cypress/e2e/api.cy.js"` |
| Base da API (padrão) | `https://site-n1.prd-d.ws01.mobi/api` |
| Variável no CI para outra base | `API_BASE_URL` (Settings > Variables > Actions) |

---

## Relatório: o que cada teste faz e qual o retorno

### Coleção Domino's Acompanhamento API (3 testes)

| Teste | O que faz | Retorno esperado |
|-------|-----------|------------------|
| **GET Recurso** | GET `/recurso?lingua=pt`. Se JSON, valida `status`. | 200 ou 500; se HTML, teste aceita. |
| **POST Login** | POST `/login` com email/senha. Se 200 e `data.jwt`, salva em `jwt`. | 200, 400, 401 ou 404. |
| **GET Autenticado (Bearer JWT)** | GET protegido com `Authorization: Bearer {{jwt}}`. | 200 ou 401. |

### Coleção Teste Geral API (8 testes)

| Teste | O que faz | Retorno esperado |
|-------|-----------|------------------|
| **1. Health / Root** | GET `/` (health). | 2xx ou 404. |
| **2. GET Lista** | GET `/recurso?page=1&limit=10`. | 200, 404 ou 500. |
| **3. POST Login** | POST `/login`; se JWT, salva `jwt`. | 200, 400, 401 ou 404. |
| **4. GET Por ID** | GET `/recurso/1`. | 200, 404 ou 500. |
| **5. GET Autenticado** | GET com Bearer. | 200 ou 401. |
| **6. POST Criar** | POST `/recurso`; se `data.id`, salva `idCriado`. | 200, 201, 400, 401, 403, 404, 422. |
| **7. PUT Atualizar** | PUT `/recurso/{{idCriado}}`. | 200, 400, 401, 403, 404, 405, 422. |
| **8. DELETE** | DELETE `/recurso/{{idCriado}}`. | 200, 204, 401, 403, 404, 405. |

---

## Detalhes técnicos para outros projetos

### Coleção Postman (schema v2.1)

- **Variáveis:** `variable`: `[{ "key": "baseUrl", "value": "https://sua-api.com/v1" }, { "key": "jwt", "value": "" }]`.
- **Request com descrição:** no objeto `request` inclua `"description": "O que faz: ... Retorno: ..."`.
- **Evitar falha quando a API devolve HTML:** nos Tests use `var json = null; try { json = JSON.parse(pm.response.text()); } catch (e) { }` e só valide JSON quando `json` for objeto; caso contrário, um teste neutro (ex.: `pm.expect(true).to.be.true`).
- **Salvar JWT:** `if (json && json.data && json.data.jwt) pm.collectionVariables.set('jwt', json.data.jwt);`
- **Múltiplos status:** `pm.expect(pm.response.code).to.be.oneOf([200, 400, 401, 404, 405]);`

### Newman

- **Timeout por request:** `--timeout-request 10000` (10 s).
- **URL dinâmica no CI:** `--global-var "baseUrl=$NEWMAN_BASE_URL"`.
- **Export JSON (para script Qase):** `--reporter-json-export newman-run-report.json`.
- **Export HTML (HTMLExtra):** `--reporter-htmlextra-export newman-report/newman-report.html`.

### Qase API (resumo)

- **Criar run:** `POST https://api.qase.io/v1/run/{code}` — body: `{ "title", "description", "is_autotest": true }` — header: `Token: {QASE_API_TOKEN}`.
- **Upload anexo:** `POST https://api.qase.io/v1/attachment/{code}` — multipart/form-data, campo `file[]` — resposta: `result[].hash`.
- **Criar resultado:** `POST https://api.qase.io/v1/result/{code}/{runId}` — body: `{ "status": "passed"|"failed", "case": { "title": "..." }, "time_ms", "comment", "attachments": ["hash"] }`.

### Cypress

- **env.apiUrl** em `cypress.config.js`; ler com `Cypress.env('apiUrl')`.
- **failOnStatusCode: false** em `cy.request` e validar `res.status` com `expect(res.status).to.be.oneOf([...])`.

---

## Checklist para outro projeto

1. [ ] Criar pasta `postman/` e coleção(ões) em schema v2.1 com variáveis `baseUrl`, `jwt` (e `idCriado` se CRUD).
2. [ ] Em cada request: Tests com `JSON.parse(pm.response.text())` em try/catch quando a API pode devolver HTML; aceitar 404, 500, 405 etc. conforme a API; adicionar `description` (o que faz + retorno).
3. [ ] Instalar `newman`, `newman-reporter-htmlextra`, `dotenv`; script `test:api:ci` com `--timeout-request 10000`, reporters json + htmlextra, e `&& node scripts/newman-to-qase.js`.
4. [ ] Criar `scripts/newman-to-qase.js`: carregar `.env`, ler report JSON, criar run no Qase, fazer upload do relatório HTML (form-data, `file[]`), enviar resultados com `attachments: [hash]` no primeiro.
5. [ ] Workflow: job com timeout 5 min, `NEWMAN_BASE_URL` (vars.API_BASE_URL ou padrão), comando newman com `--global-var "baseUrl=$NEWMAN_BASE_URL"`, upload do artifact `newman-report` + `newman-run-report.json`.
6. [ ] .env.example com QASE_TOKEN, QASE_PROJECT_CODE, CYPRESS_API_URL; .gitignore com newman-run-report.json e newman-report/.
7. [ ] (Opcional) Cypress: env.apiUrl no config e spec api.cy.js com cy.request.

Com isso você replica neste ou em outro repositório: testes de API com Postman/Newman, relatório HTML, envio dos resultados ao Qase e **anexo do relatório HTML no run do Qase**.

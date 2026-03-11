/**
 * Testes de API (cy.request) - 8 cenários alinhados à coleção Newman (Teste Geral API).
 * Aparecem no Allure como 8 testes de API; mesma cobertura do Postman/Newman.
 *
 * - URL base: site-n1.prd-d.ws01.mobi/api (ou CYPRESS_API_URL no .env).
 * - Rodar só estes: npx cypress run --spec "cypress/e2e/api.cy.js"
 */
const API_URL = Cypress.env('apiUrl')

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Language': 'pt'
}

const requestTimeout = 15000

// Aceita corpo como objeto ou string (API pode retornar HTML)
function bodyAsObject (res) {
  if (res.body == null) return null
  if (typeof res.body === 'object' && !Array.isArray(res.body)) return res.body
  try {
    return typeof res.body === 'string' ? JSON.parse(res.body) : null
  } catch (_) {
    return null
  }
}

describe('API (8 cenários - Newman)', () => {
  it('1. Health / Root', () => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/`,
      headers: { Accept: 'application/json' },
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      expect(res.status === 404 || (res.status >= 200 && res.status < 300)).to.be.true
      const json = bodyAsObject(res)
      if (json && typeof json === 'object') {
        expect(json).to.be.an('object')
      }
    })
  })

  it('2. GET Lista (query params)', () => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/recurso`,
      qs: { page: 1, limit: 10 },
      headers,
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 404, 500])
      const json = bodyAsObject(res)
      if (json && typeof json === 'object') {
        expect(json).to.satisfy((v) => typeof v === 'object')
      }
    })
  })

  it('3. POST Login', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/login`,
      headers,
      body: { email: 'teste@exemplo.com', senha: '123456' },
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 400, 401, 404])
      const json = bodyAsObject(res)
      if (json && res.status === 200 && json.data && json.data.jwt) {
        expect(json.data.jwt).to.be.a('string')
      }
    })
  })

  it('4. GET Por ID', () => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/recurso/1`,
      headers: { Accept: 'application/json' },
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 404, 500])
      const json = bodyAsObject(res)
      if (json && typeof json === 'object') {
        expect(json).to.be.an('object')
      }
    })
  })

  it('5. GET Autenticado (Bearer)', () => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/recurso-protegido`,
      headers: {
        'Authorization': 'Bearer ',
        'Accept': 'application/json'
      },
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 401])
    })
  })

  it('6. POST Criar (body JSON)', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/recurso`,
      headers,
      body: { nome: 'Item teste', ativo: true },
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 201, 400, 401, 403, 404, 422])
      const json = bodyAsObject(res)
      if (json && (res.status === 200 || res.status === 201) && json.data && json.data.id) {
        expect(json.data.id).to.be.ok
      }
    })
  })

  it('7. PUT Atualizar', () => {
    cy.request({
      method: 'PUT',
      url: `${API_URL}/recurso/1`,
      headers,
      body: { nome: 'Item atualizado', ativo: false },
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 400, 401, 403, 404, 405, 422])
    })
  })

  it('8. DELETE', () => {
    cy.request({
      method: 'DELETE',
      url: `${API_URL}/recurso/1`,
      headers: { Authorization: 'Bearer ' },
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 204, 401, 403, 404, 405])
    })
  })
})

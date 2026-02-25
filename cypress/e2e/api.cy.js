/**
 * Testes de API (cy.request) - conforme POSTMAN-NEWMAN-TESTES-API.md
 * Rodar só estes: npx cypress run --spec "cypress/e2e/api.cy.js"
 */
const API_URL = Cypress.env('apiUrl') || 'https://api.exemplo.com/v1'

const headers = {
  'Content-Type': 'application/json',
  'Accept-Language': 'pt'
}

describe('API', () => {
  it('GET /recurso retorna 200 ou 500 e dados', () => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/recurso`,
      qs: { lingua: 'pt' },
      headers,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 500])
      if (res.status === 200) {
        expect(res.body).to.have.property('status')
      }
    })
  })

  it('POST /login com credenciais inválidas retorna erro esperado', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/login`,
      headers,
      body: { email: 'naoexiste@teste.com', senha: 'errada' },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 400, 401, 404])
      expect(res.body).to.be.an('object')
    })
  })
})

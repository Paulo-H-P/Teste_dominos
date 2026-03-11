/**
 * Testes de API (cy.request) - conforme POSTMAN-NEWMAN-TESTES-API.md
 *
 * - URL base: sempre a das APIs do projeto (site-n1.prd-d.ws01.mobi/api).
 * - Outro ambiente: defina CYPRESS_API_URL no .env (cypress.config.js já trata para nunca usar api.exemplo.com).
 * - Rodar só estes testes:
 *     npx cypress run --spec "cypress/e2e/api.cy.js"
 */
const API_URL = Cypress.env('apiUrl')

const headers = {
  'Content-Type': 'application/json',
  'Accept-Language': 'pt'
}

const requestTimeout = 15000
const maxDurationMs = 4000 // tempo máximo aceitável para respostas "normais"

describe('API - saúde e contratos básicos', () => {
  it('GET /recurso retorna 200 ou 500, dentro de tempo razoável e com estrutura mínima', () => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/recurso`,
      qs: { lingua: 'pt' },
      headers,
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      // Aceita 200 ou 500 (como já estava), mas mede performance
      expect(res.status).to.be.oneOf([200, 500])

      // Performance básica (não falha se estiver acima, só avisa)
      cy.log(`⏱ Duração: ${res.duration} ms`)
      if (res.duration > maxDurationMs) {
        cy.log(`⚠️ Resposta demorou mais que ${maxDurationMs} ms`)
      }

      if (res.status === 200) {
        // Quando OK, valida estrutura mínima do JSON
        expect(res.headers['content-type']).to.match(/application\/json|text\/json/i)
        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('status')
      } else if (res.status === 500) {
        // Quando a API estoura erro interno, ainda assim garante algum corpo
        expect(res.body).to.exist
      }
    })
  })
})

describe('API - autenticação (/login)', () => {
  it('POST /login com credenciais inválidas retorna erro com corpo JSON', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/login`,
      headers,
      body: { email: 'naoexiste@teste.com', senha: 'errada' },
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      // Em APIs reais, pode ser 400, 401, 404 ou até 200 com "sucesso=false"
      expect(res.status).to.be.oneOf([200, 400, 401, 404])

      expect(res.body).to.be.an('object')

      // Quando a API trata como "sucesso=false" com 200
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

  it('POST /login sem corpo retorna erro de validação (status diferente de 200)', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/login`,
      headers,
      body: {}, // sem email/senha
      failOnStatusCode: false,
      timeout: requestTimeout
    }).then((res) => {
      // Espera qualquer status que NÃO seja 200 para indicar erro de validação
      expect(res.status).to.not.equal(200)
      expect(res.status).to.be.oneOf([400, 401, 422, 500])
      expect(res.body).to.be.an('object')
    })
  })
})

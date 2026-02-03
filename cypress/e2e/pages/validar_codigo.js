// cypress/e2e/pages/validar_codigo.js
class ValidarCodigoPage {
    /**
     * Assert simples: garante que estamos na etapa de verificação.
     * (sem mexer no front, usamos texto/estrutura)
     */
    assertTelaCodigo() {
      cy.location('pathname', { timeout: 60000 }).should('match', /register|codigo|verification|password|validate-code|validate|code/i)
      cy.contains(/valida|c[oó]digo/i, { timeout: 60000 }).should('exist')
    }
  
    /**
     * Preenche 6 dígitos (ex: 979899).
     * Estratégia:
     * 1) se existir [data-cy="verification-code"] input -> digita nos inputs
     * 2) se existir code-input input -> digita nos inputs
     * 3) fallback: digita o código inteiro no body (muitos code-input capturam)
     */
    preencherCodigo(codigo = '979899') {
      const digits = String(codigo).slice(0, 6).split('')
  
      cy.dismissOverlays()
  
      cy.get('body', { timeout: 60000 }).then(($b) => {
        const hasDataCy = $b.find('[data-cy="verification-code"] input').length >= 6
        const hasCodeInput = $b.find('code-input input').length >= 6
  
        if (hasDataCy) {
          cy.get('[data-cy="verification-code"] input', { timeout: 60000 })
            .should('have.length.at.least', 6)
            .then(($inputs) => {
              digits.forEach((d, i) => {
                cy.wrap($inputs.eq(i))
                  .clear({ force: true })
                  .type(d, { force: true })
              })
            })
          return
        }
  
        if (hasCodeInput) {
          cy.get('code-input input', { timeout: 60000 })
            .should('have.length.at.least', 6)
            .then(($inputs) => {
              digits.forEach((d, i) => {
                cy.wrap($inputs.eq(i))
                  .clear({ force: true })
                  .type(d, { force: true })
              })
            })
          return
        }
  
        // fallback final: digita o código direto (alguns componentes capturam e distribuem)
        cy.get('body').click(0, 0)
        cy.get('body').type(String(codigo), { force: true })
      })
  
      // Pequena espera para garantir que a validação foi processada
      cy.wait(500)
    }

    /**
     * Clica no botão Continuar - Solução simples e direta.
     */
    clicarContinuar() {
      cy.dismissOverlays()
      cy.wait(1000)
      
      // Seletor simples e direto
      cy.get('#boxPasswordRecovery > app-button > .btn-primary', { timeout: 30000 })
        .first()
        .click({ force: true })
    }
  
    /**
     * Fluxo completo: preencher código e clicar continuar
     */
    validarCodigoCompleto(codigo = '979899') {
      this.assertTelaCodigo()
      this.preencherCodigo(codigo)
      this.clicarContinuar()
    }
  }
  
  export default new ValidarCodigoPage()

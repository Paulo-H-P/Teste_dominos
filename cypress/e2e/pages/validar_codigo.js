// cypress/e2e/pages/validar_codigo.js
class ValidarCodigoPage {
    /**
     * Assert simples: garante que estamos na etapa de verificação.
     * (sem mexer no front, usamos texto/estrutura)
     */
    assertTelaCodigo() {
      cy.location('pathname', { timeout: 60000 }).should('match', /register|codigo|verification|password/i)
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
  
      // ⚠️ truque que muitas libs precisam: "blur" pra disparar validação
      cy.focused().blur({ force: true })
  
      // pequeno checkpoint: garantir que o botão deixou de estar disabled (se possível)
      cy.contains('h4', 'Continuar', { timeout: 60000, matchCase: false }).should('exist')
    }
  
    /**
     * Clica no botão Continuar.
     * IMPORTANTE: Primeiro espera ele ficar habilitado.
     * No seu print ele está disabled, então vamos aguardar até habilitar.
     */
    clicarContinuar() {
      cy.dismissOverlays()
  
      // 1) acha o texto "Continuar" (está em h4 no seu DOM)
      cy.contains('h4', 'Continuar', { timeout: 60000, matchCase: false })
        .should('exist')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .then(($h4) => {
          const $ionButton = $h4.closest('ion-button')
          expect($ionButton.length, 'ion-button do Continuar encontrado').to.be.greaterThan(0)
  
          // 2) espera habilitar (Ionic marca disabled no ion-button e no button-native)
          cy.wrap($ionButton, { log: false })
            .should('not.have.class', 'button-disabled')
            .and('not.have.attr', 'disabled')
  
          // 3) clica no botão real dentro do shadow DOM
          cy.wrap($ionButton, { log: false })
            .shadow()
            .find('button.button-native', { timeout: 30000 })
            .should('not.be.disabled')
            .click({ force: true })
        })
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

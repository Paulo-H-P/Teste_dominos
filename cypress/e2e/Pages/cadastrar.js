// cypress/e2e/Pages/cadastrar.js
// Responsabilidade: validar que estou na tela de cadastro e preencher campos

class CadastrarPage {
    /**
     * ASSERT da tela de cadastro:
     * Aqui você tem duas opções:
     * 1) Assert por rota (/register)
     * 2) Assert por elemento único (ex: label "Nome completo")
     *
     * Como você disse que NÃO pode mexer no front pra colocar data-cy,
     * vamos usar o que já existe na tela (label/texto).
     */
    assertTelaCadastro() {
      // 1) rota correta
      cy.location('pathname', { timeout: 60000 }).should('include', '/register')
  
      // 2) elemento único da tela (pelo print: existe "Nome completo")
      cy.contains('Nome completo', { timeout: 60000 }).should('be.visible')
  
      // 3) opcional: garante que existem inputs no formulário
      cy.get('input', { timeout: 60000 }).should('have.length.at.least', 1)
    }
  }
  
  export default new CadastrarPage()
  
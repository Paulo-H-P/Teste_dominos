// cypress/e2e/pages/preencher_cadastro.js

class PreencherCadastroPage {
    // ==========
    // GERADORES
    // ==========
  
    /**
     * Gera um e-mail único para evitar "e-mail já cadastrado".
     * Ex: teste17000000000001234@testedominos.com
     */
    gerarEmailUnico(dominio = 'testedominos.com') {
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 10000)
      return `teste${timestamp}${random}@${dominio}`
    }
  
    /**
     * Gera um telefone único (DDD + 9 + 8 dígitos)
     * para evitar conflitos em cadastros repetidos.
     */
    gerarTelefoneUnico() {
      const ddds = [
        '11','21','31','41','47','48','51','61','62','63','64','65','66','67','68','69',
        '71','73','74','75','77','79','81','82','83','84','85','86','87','88','89',
        '91','92','93','94','95','96','97','98','99'
      ]
      const ddd = ddds[Math.floor(Math.random() * ddds.length)]
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
      const numero = (timestamp + random).slice(-8).padStart(8, '0')
      return `${ddd}9${numero}`
    }
  
    // ==========
    // SELECTORS
    // ==========
  
    els = {
      nome: () => cy.get('[data-cy="input-fullname"] > .native-input', { timeout: 60000 }),
      email: () => cy.get('[data-cy="input-email"] > .native-input', { timeout: 60000 }),
      phone: () => cy.get('[data-cy="input-phone"] > .native-input', { timeout: 60000 }),
      password: () => cy.get('[data-cy="input-password"] > .native-input', { timeout: 60000 }),
      passwordConfirm: () => cy.get('[data-cy="input-password-confirm"] > .native-input', { timeout: 60000 }),
      zipcode: () => cy.get('[data-cy="input-zipcode"] > .native-input', { timeout: 60000 }),
      addressNumber: () => cy.get('[data-cy="input-address-number"] > .native-input', { timeout: 60000 }),
      termos: () => cy.get('[data-cy="terms-checkbox"]', { timeout: 60000 }),
      criarContaBtn: () => cy.get('.btn-primary', { timeout: 20000 }),
    }
  
    // ==========
    // ASSERTS (opcionais, mas ajudam muito)
    // ==========
  
    /**
     * Confirma que estamos na tela de cadastro.
     * Como você não pode mexer no front, usamos um marcador real: o texto "Nome completo".
     */
    assertTelaCadastro() {
      cy.location('pathname', { timeout: 60000 }).should('include', '/register')
      cy.contains('Nome completo', { timeout: 60000 }).should('be.visible')
    }
  
    // ==========
    // ACTIONS
    // ==========
  
    /**
     * Preenche o formulário inteiro.
     * - Mantém email/telefone sempre únicos por padrão (você pediu isso).
     * - Retorna { email, phone } para você logar/usar depois.
     */
    preencherFormulario({
      nome = 'Paulo Pinheiro',
      email = null,
      phone = null,
      senha = '1234567A',
      cep = '06454010',
      numero = '258',
    } = {}) {
      const emailFinal = email || this.gerarEmailUnico()
      const phoneFinal = phone || this.gerarTelefoneUnico()
  
      cy.log(`🧾 Cadastro gerado: ${emailFinal} | ${phoneFinal}`)
  
      // Nome
      this.els.nome()
        .should('exist')
        .clear({ force: true })
        .type(nome, { force: true, delay: 5 })
  
      // Email
      this.els.email()
        .should('exist')
        .clear({ force: true })
        .type(emailFinal, { force: true })
  
      // Telefone
      this.els.phone()
        .should('exist')
        .clear({ force: true })
        .type(phoneFinal, { force: true })
  
      // Senha
      this.els.password()
        .should('exist')
        .clear({ force: true })
        .type(senha, { force: true, log: false })
  
      // Confirma senha
      this.els.passwordConfirm()
        .should('exist')
        .clear({ force: true })
        .type(senha, { force: true, log: false })
  
      // CEP
      this.els.zipcode()
        .should('exist')
        .clear({ force: true })
        .type(cep, { force: true })
  
      // Número
      this.els.addressNumber()
        .should('exist')
        .clear({ force: true })
        .type(numero, { force: true })
  
      // Aceite termos
      this.els.termos()
        .should('exist')
        .click({ force: true })
      cy.wait(1000)
  
      return cy.wrap({ email: emailFinal, phone: phoneFinal }, { log: false })
      
    }
  
    /**
     * Clica no botão "Criar minha conta" - Solução ULTRA simplificada.
     * Usa EXATAMENTE a mesma abordagem do cadastropage.js que funciona.
     */
    clicarCriarMinhaConta() {
      cy.dismissOverlays()
      cy.wait(2000) // Aguarda formulário processar
      
      // Usa EXATAMENTE a mesma abordagem do cadastropage.js que funciona
      cy.get('.btn-primary', { timeout: 30000 })
        .first()
        .should('exist')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .click({ force: true })
      
      cy.waitForAppReady({ checkBlocking: false })
    }
  }
  
  export default new PreencherCadastroPage()

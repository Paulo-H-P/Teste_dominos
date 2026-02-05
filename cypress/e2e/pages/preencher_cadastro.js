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
      // Seletores robustos que funcionam com shadow DOM (Ionic) e light DOM
      // Removido dependência de .native-input - usa apenas data-cy
      nome: () => cy.get('[data-cy="input-fullname"]', { timeout: 30000 }),
      email: () => cy.get('[data-cy="input-email"]', { timeout: 30000 }),
      phone: () => cy.get('[data-cy="input-phone"]', { timeout: 30000 }),
      password: () => cy.get('[data-cy="input-password"]', { timeout: 30000 }),
      passwordConfirm: () => cy.get('[data-cy="input-password-confirm"]', { timeout: 30000 }),
      zipcode: () => cy.get('[data-cy="input-zipcode"]', { timeout: 30000 }),
      addressNumber: () => cy.get('[data-cy="input-address-number"]', { timeout: 30000 }),
      termos: () => cy.get('[data-cy="terms-checkbox"]', { timeout: 60000 }),
      criarContaBtn: () => cy.get('.btn-primary', { timeout: 20000 }),
    }
  
    // ==========
    // ASSERTS (opcionais, mas ajudam muito)
    // ==========
  
    /**
     * Confirma que estamos na tela de cadastro.
     * Como você não pode mexer no front, usamos um marcador real: o texto "Nome completo".
     * Adiciona checkpoint para garantir que o formulário está visível.
     */
    assertTelaCadastro() {
      cy.location('pathname', { timeout: 60000 }).should('include', '/register')
      cy.contains('Nome completo', { timeout: 60000 }).should('be.visible')
      
      // Checkpoint: garantir que o formulário de cadastro está visível
      // Tenta encontrar o formulário ou pelo menos um campo de input
      cy.get('[data-cy="register-form"]', { timeout: 30000 })
        .should('exist')
        .then(() => {
          cy.log('✅ Formulário de cadastro encontrado e visível')
        })
      
      // Verifica se pelo menos o campo de nome está presente (fallback)
      cy.get('[data-cy="input-fullname"]', { timeout: 30000 })
        .should('exist')
        .should('be.visible')
        .then(() => {
          cy.log('✅ Campo de nome encontrado - formulário está carregado')
        })
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

      // Helper para preencher campo com suporte a shadow DOM (Ionic)
      const fillField = (fieldName, dataCy, value, options = {}) => {
        cy.log(`📝 Preenchendo campo ${fieldName}...`)
        cy.get(`[data-cy="${dataCy}"]`, { timeout: 30000 })
          .should('be.visible')
          .then($el => {
            const element = $el[0]
            // Se tem shadowRoot (Ionic), atravessa o shadow DOM
            if (element.shadowRoot) {
              cy.log(`🔍 Campo ${fieldName} está em shadow DOM, atravessando...`)
              cy.wrap($el).shadow().find('input, textarea').first()
                .should('be.visible')
                .clear({ force: true })
                .type(value, { force: true, ...options })
            } else {
              // Light DOM - procura input dentro ou usa o próprio elemento
              const input = $el.find('input, textarea').first()
              if (input.length > 0) {
                cy.log(`🔍 Campo ${fieldName} encontrado dentro do elemento`)
                cy.wrap(input)
                  .should('be.visible')
                  .clear({ force: true })
                  .type(value, { force: true, ...options })
              } else {
                // Se não encontrou input dentro, tenta usar o próprio elemento (caso o data-cy esteja no input)
                cy.log(`🔍 Tentando usar o próprio elemento ${dataCy} como input`)
                cy.wrap($el)
                  .should('be.visible')
                  .clear({ force: true })
                  .type(value, { force: true, ...options })
              }
            }
          })
      }

      // Nome
      fillField('Nome', 'input-fullname', nome, { delay: 5 })

      // Email
      fillField('Email', 'input-email', emailFinal)

      // Telefone
      fillField('Telefone', 'input-phone', phoneFinal)

      // Senha
      fillField('Senha', 'input-password', senha, { log: false })

      // Confirma senha
      fillField('Confirma Senha', 'input-password-confirm', senha, { log: false })

      // CEP
      fillField('CEP', 'input-zipcode', cep)

      // Número
      fillField('Número', 'input-address-number', numero)
  
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

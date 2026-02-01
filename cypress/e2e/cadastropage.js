// cypress/e2e/fluxo_compra/cadastropage.js

class CadastroPage {
    gerarEmailUnico(dominio = 'testedominos.com') {
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 10000)
      return `teste${timestamp}${random}@${dominio}`
    }
  
    gerarTelefoneUnico() {
      const ddd = ['11','21','31','41','47','48','51','61','62','63','64','65','66','67','68','69','71','73','74','75','77','79','81','82','83','84','85','86','87','88','89','91','92','93','94','95','96','97','98','99']
      const dddAleatorio = ddd[Math.floor(Math.random() * ddd.length)]
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
      const numero = (timestamp + random).slice(-8).padStart(8, '0')
      return `${dddAleatorio}9${numero}`
    }
  
    // Helper: clica de forma segura (aceita selector string OU elemento jQuery)
    clickSafe(target, opts = { force: true }) {
      // target pode ser selector string OU jQuery/HTMLElement
      if (typeof target === 'string') {
        return cy.get(target, { timeout: 30000 }).first().click(opts)
      }
      // se vier jQuery ou HTMLElement
      return cy.wrap(target, { log: false }).click(opts)
    }

    // helper: digitar dentro de ion-input (Ionic) - com detecção automática de Shadow DOM
    typeInIonInput(formcontrolname, value, opts = {}) {
      const { timeout = 30000, log = true } = opts
      const hostSel = `ion-input[formcontrolname="${formcontrolname}"]`

      cy.log(`🔍 Tentando preencher ${formcontrolname}...`)
      
      cy.get(hostSel, { timeout })
        .should('be.visible')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .then(($host) => {
          const host = $host[0]

          // 1) tenta encontrar input no light DOM primeiro
          const light = $host.find('input, textarea')
          if (light.length) {
            cy.log(`✅ ${formcontrolname}: usando light DOM (${light.length} input(s) encontrado(s))`)
            // Garante que pegamos o primeiro elemento jQuery válido
            cy.wrap(light.first(), { log: false })
              .should('exist')
              .should('be.enabled')
              .click({ force: true })
              .clear({ force: true })
              .type(value, { force: true, log })
            return
          }

          // 2) tenta shadow DOM somente se existir shadowRoot
          if (host && host.shadowRoot) {
            cy.log(`✅ ${formcontrolname}: usando shadow DOM`)
            cy.wrap($host, { log: false })
              .shadow()
              .find('input, textarea', { timeout })
              .first()
              .should('exist')
              .should('be.enabled')
              .click({ force: true })
              .clear({ force: true })
              .type(value, { force: true, log })
            return
          }

          // 3) fallback final: achar input associado por proximidade (estrutura do Ionic pode variar)
          cy.log(`⚠️ ${formcontrolname}: tentando fallback por proximidade`)
          cy.wrap($host, { log: false })
            .parent()
            .find('input, textarea', { timeout })
            .first()
            .should('exist')
            .should('be.enabled')
            .click({ force: true })
            .clear({ force: true })
            .type(value, { force: true, log })
        })

      return cy.wrap(value, { log: false })
    }
  
    elements = {
      registerLink: () => cy.get('[routerlink="/register"], [routerLink="/register"], a[href*="/register"]', { timeout: 15000 }).first(),
      checkBoxTermos: () => cy.get('[data-cy="terms-checkbox"]', { timeout: 15000 }),
      criarContaBtn: () => cy.get('.btn-primary', { timeout: 20000 }),
      // Tenta usar data-cy primeiro, depois fallback para o seletor padrão
      codeInputs: () => {
        // Primeiro tenta com data-cy, se não encontrar, usa o seletor padrão
        return cy.get('[data-cy="verification-code"] input, code-input input', { timeout: 20000 })
      },
      continuarCodigoBtn: () => cy.get('#boxPasswordRecovery > app-button > .btn-primary', { timeout: 20000 }),
      nome: () => cy.get('[data-cy="input-fullname"] > .native-input', { timeout: 30000 }),
      email: () => cy.get('[data-cy="input-email"] > .native-input', { timeout: 30000 }),
      phone: () => cy.get('[data-cy="input-phone"] > .native-input', { timeout: 30000 }),
      password: () => cy.get('[data-cy="input-password"] > .native-input', { timeout: 30000 }),
      passwordConfirm: () => cy.get('[data-cy="input-password-confirm"] > .native-input', { timeout: 30000 }),
      zipcode: () => cy.get('[data-cy="input-zipcode"] > .native-input', { timeout: 30000 }),
      addressNumber: () => cy.get('[data-cy="input-address-number"] > .native-input', { timeout: 30000 }),
    }

    clicarCadastrarse() {
      cy.waitForAppReady()
      cy.dismissOverlays()
  
      // se existir link, clica; se não, vai direto
      cy.get('body').then(($b) => {
        const hasLink = $b.find('[routerlink="/register"], [routerLink="/register"], a[href*="/register"]').length > 0
        if (hasLink) {
          this.elements.registerLink().click({ force: true })
        } else {
          cy.visitWithRetry('/register', {
            validate: () => cy.assertPath('/register'),
          })
        }
      })
  
      cy.assertPath('/register')
      cy.waitForAppReady()
      
      // Checkpoint flexível: verifica que a página carregou (não assume texto específico)
      cy.get('body', { timeout: 30000 }).should('be.visible')
      
      // Tenta encontrar qualquer indicador de formulário de cadastro (mais flexível)
      cy.get('body', { timeout: 30000 }).then(($body) => {
        const bodyText = $body.text().toLowerCase()
        const hasForm = $body.find('form, ion-input, input[type="text"], input[type="email"]').length > 0
        const hasCadastroText = /criar|cadastro|registro|conta/i.test(bodyText)
        
        if (!hasForm && !hasCadastroText) {
          cy.log('⚠️ Página de registro pode não ter carregado completamente')
          cy.screenshot('DEBUG_pagina_registro_suspeita')
        } else {
          cy.log('✅ Página de registro parece estar carregada')
        }
      })
    }
  
    preencherNome(nome = 'Paulo Pinheiro') {
      cy.log(`📝 Nome: ${nome}`)
      this.elements.nome()
        .should('be.visible')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .clear({ force: true })
        .type(nome, { force: true })
      return cy.wrap(nome, { log: false })
    }


    
    
  
    preencherEmail(email = null) {
      const emailFinal = email || this.gerarEmailUnico()
      cy.log(`📧 Email: ${emailFinal}`)
      this.elements.email()
        .should('be.visible')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .clear({ force: true })
        .type(emailFinal, { force: true })
      return cy.wrap(emailFinal, { log: false })
    }
  
    preencherCelular(celular = null) {
      const celularFinal = celular || this.gerarTelefoneUnico()
      cy.log(`📱 Celular: ${celularFinal}`)
      this.elements.phone()
        .should('be.visible')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .clear({ force: true })
        .type(celularFinal, { force: true })
      return cy.wrap(celularFinal, { log: false })
    }
  
    preencherSenha(senha = '1234567A') {
      cy.log(`🔒 Senha: ${senha}`)
      this.elements.password()
        .should('be.visible')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .clear({ force: true })
        .type(senha, { force: true, log: false })
    }
  
    preencherConfirmaSenha(confirma = '1234567A') {
      cy.log(`🔒 Confirmar Senha: ${confirma}`)
      this.elements.passwordConfirm()
        .should('be.visible')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .clear({ force: true })
        .type(confirma, { force: true, log: false })
    }
  
    preencherCep(cep = '06454010') {
      cy.log(`📮 CEP: ${cep}`)
      this.elements.zipcode()
        .should('exist')
        .scrollIntoView({ offset: { top: -150, left: 0 } }) // Offset maior para evitar sobreposição
        // Não verifica visibilidade pois pode estar sobreposto por elementos fixed
        .clear({ force: true })
        .type(cep, { force: true })
      return cy.wrap(cep, { log: false })
    }
  
    preencherNumeroEndereco(numero = '258') {
      cy.log(`🏠 Número: ${numero}`)
      this.elements.addressNumber()
        .should('exist')
        .scrollIntoView({ offset: { top: -150, left: 0 } }) // Offset maior para evitar sobreposição
        // Não verifica visibilidade pois pode estar sobreposto por elementos fixed
        .clear({ force: true })
        .type(numero, { force: true })
      return cy.wrap(numero, { log: false })
    }
  
    preencherCheckBoxTermos() {
      cy.dismissOverlays()
      this.elements.checkBoxTermos()
        .should('exist')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .click({ force: true })
        cy.waitForAppReady()
    }
  
    preencherCriarConta() {
      cy.dismissOverlays()
      this.elements.criarContaBtn()
        .should('exist')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .click({ force: true })
  
      cy.waitForAppReady()
      
      // Aguarda a navegação para a tela de código de verificação
      cy.wait(3000)
      cy.dismissOverlays()
      
      // Verifica se navegou para a tela de código
      cy.get('body', { timeout: 30000 }).then(($body) => {
        const temCodeInput = $body.find('code-input').length > 0
        const temDataCy = $body.find('[data-cy="verification-code"]').length > 0
        const bodyText = $body.text().toLowerCase()
        const temTextoVerificacao = bodyText.includes('código') || bodyText.includes('verificação')
        
        if (temCodeInput || temDataCy || temTextoVerificacao) {
          cy.log('✅ Navegação para tela de código de verificação confirmada')
        } else {
          cy.log('⚠️ Ainda não detectou tela de código, aguardando mais...')
          cy.wait(2000)
        }
      })
    }
  
    preencherCodigoVerificacaoCompleto(codigo = '979899') {
      const digits = String(codigo).slice(0, 6).split('')
  
      cy.waitForAppReady()
      cy.dismissOverlays()
      
      // Aguarda um pouco para a página de código carregar
      cy.wait(2000)
      
      // Verifica se realmente chegou na tela de código de verificação
      cy.get('body', { timeout: 30000 }).then(($body) => {
        const temCodeInput = $body.find('code-input').length > 0
        const temDataCy = $body.find('[data-cy="verification-code"]').length > 0
        const temInputs = $body.find('code-input input, [data-cy="verification-code"] input').length >= 6
        const bodyText = $body.text().toLowerCase()
        const temTextoVerificacao = bodyText.includes('código') || bodyText.includes('verificação') || bodyText.includes('code')
        
        if (!temCodeInput && !temDataCy && !temInputs && !temTextoVerificacao) {
          cy.log('⚠️ Tela de código de verificação não detectada')
          cy.screenshot('DEBUG_sem_code_input')
          cy.log('📸 Screenshot salvo: DEBUG_sem_code_input')
        }
      })
      
      // Estratégia 1: Tenta encontrar o componente code-input ou data-cy
      cy.get('body', { timeout: 30000 }).then(($body) => {
        const temCodeInput = $body.find('code-input').length > 0
        const temDataCy = $body.find('[data-cy="verification-code"]').length > 0
        
        if (temCodeInput || temDataCy) {
          cy.log('✅ Componente de código encontrado')
        } else {
          cy.log('⚠️ Componente não encontrado, aguardando mais tempo...')
          cy.wait(3000)
        }
      })
      
      // Aguarda o componente code-input aparecer (com timeout maior)
      cy.get('code-input, [data-cy="verification-code"]', { timeout: 45000 })
        .should('exist')
      
      // Aguarda os inputs estarem disponíveis (sem verificar visibilidade obrigatória)
      this.elements.codeInputs()
        .should('have.length.at.least', 6)
        .then(($inputs) => {
          digits.forEach((d, i) => {
            cy.wrap($inputs.eq(i))
              .clear({ force: true })
              .type(d, { force: true })
          })
        })
  
      cy.waitForAppReady()
    }

    clicarContinuarCodigo() {
      cy.waitForAppReady()
      cy.dismissOverlays()
      this.elements.continuarCodigoBtn()
        .should('exist')
        .should('be.visible')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .click({ force: true })
      cy.waitForAppReady()
    }
  }
  
  export default new CadastroPage()
  
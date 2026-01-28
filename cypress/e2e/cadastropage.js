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
  
    // helper: digitar dentro de ion-input (Ionic) - com suporte a Shadow DOM
    typeInIonInput(formcontrolname, value, opts = {}) {
      const { timeout = 30000, log = true } = opts
      const selector = `ion-input[formcontrolname="${formcontrolname}"]`

      cy.get(selector, { timeout })
        .should('be.visible')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .shadow()
        .find('input, textarea', { timeout })
        .first()
        .should('be.enabled')
        .click({ force: true })
        .clear({ force: true })
        .type(value, { force: true, log })

      return cy.wrap(value, { log: false })
    }
  
    elements = {
      registerLink: () => cy.get('[routerlink="/register"], [routerLink="/register"], a[href*="/register"]', { timeout: 15000 }).first(),
      checkBoxTermos: () => cy.get('ion-checkbox', { timeout: 15000 }).first(),
      criarContaBtn: () => cy.contains('button, ion-button, a, [role="button"]', /criar minha conta/i, { timeout: 20000 }),
      codeInputs: () => cy.get('code-input input', { timeout: 20000 }),
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
      cy.get('ion-input[formcontrolname="fullName"]', { timeout: 30000 }).should('be.visible')
    }
  
    preencherNome(nome = 'Paulo Pinheiro') {
      cy.assertPath('/register')
      cy.dismissOverlays()
      return this.typeInIonInput('fullName', nome)
    }
  
    preencherEmail(email = null) {
      const emailFinal = email || this.gerarEmailUnico()
      cy.log(`📧 Email: ${emailFinal}`)
      return this.typeInIonInput('email', emailFinal)
    }
  
    preencherCelular(celular = null) {
      const celularFinal = celular || this.gerarTelefoneUnico()
      cy.log(`📱 Celular: ${celularFinal}`)
  
      // tenta formcontrolnames mais prováveis
      cy.get('body').then(($b) => {
        const candidates = ['phone', 'phoneNumber', 'mobile']
        const found = candidates.find((name) => $b.find(`ion-input[formcontrolname="${name}"]`).length > 0)
  
        if (found) {
          this.typeInIonInput(found, celularFinal)
        } else {
          // fallback leve por placeholder
          cy.get('input[placeholder*="celular" i], input[placeholder*="telefone" i], input[placeholder*="(00)" i]', { timeout: 15000 })
            .first()
            .clear({ force: true })
            .type(celularFinal, { force: true })
        }
      })
  
      return cy.wrap(celularFinal, { log: false })
    }
  
    preencherSenha(senha = '1234567A') {
      // tenta por formcontrolname, senão cai pro primeiro input password
      cy.get('body').then(($b) => {
        if ($b.find('ion-input[formcontrolname="password"]').length) {
          this.typeInIonInput('password', senha, { log: false })
        } else {
          cy.get('input[type="password"]', { timeout: 15000 })
            .first()
            .clear({ force: true })
            .type(senha, { force: true, log: false })
        }
      })
    }
  
    preencherConfirmaSenha(confirma = '1234567A') {
      cy.get('body').then(($b) => {
        const names = ['confirmPassword', 'confirm_password']
        const found = names.find((n) => $b.find(`ion-input[formcontrolname="${n}"]`).length > 0)
  
        if (found) {
          this.typeInIonInput(found, confirma, { log: false })
        } else {
          cy.get('input[type="password"]', { timeout: 15000 })
            .last()
            .clear({ force: true })
            .type(confirma, { force: true, log: false })
        }
      })
    }
  
    preencherCep(cep = '06454010') {
      return this.typeInIonInput('zipCode', cep)
    }
  
    preencherNumeroEndereco(numero = '258') {
      return this.typeInIonInput('number', numero)
    }
  
    preencherCheckBoxTermos() {
      cy.dismissOverlays()
      this.elements.checkBoxTermos()
        .should('exist')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .click({ force: true })
    }
  
    preencherCriarConta() {
      cy.dismissOverlays()
      this.elements.criarContaBtn()
        .should('exist')
        .scrollIntoView({ offset: { top: -120, left: 0 } })
        .click({ force: true })
  
      cy.waitForAppReady()
    }
  
    preencherCodigoVerificacaoCompleto(codigo = '979899') {
      const digits = String(codigo).slice(0, 6).split('')
  
      cy.waitForAppReady()
      cy.dismissOverlays()
  
      // pega todos inputs de uma vez e preenche dentro do then (sem for com comandos)
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
  }
  
  export default new CadastroPage()
  
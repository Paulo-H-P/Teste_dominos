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
      checkBoxTermos: () => cy.get('ion-checkbox', { timeout: 15000 }).first(),
      criarContaBtn: () => cy.contains('button, ion-button, a, [role="button"]', /criar minha conta/i, { timeout: 20000 }),
      codeInputs: () => cy.get('code-input input', { timeout: 20000 }),
      // Host do ion-input (para verificações, não para digitação - use typeInIonInput para digitar)
      nomeHost: () => cy.get('ion-input[formcontrolname="fullName"]', { timeout: 30000 }),
      // Seletor para o input de nome (detecta shadow ou light DOM automaticamente)
      // NOTA: Prefira usar typeInIonInput() ao invés deste seletor direto
      nome: () => {
        const host = cy.get('ion-input[formcontrolname="fullName"]', { timeout: 30000 })
          .should('be.visible')
          .scrollIntoView({ offset: { top: -120, left: 0 } })
        
        return host.then(($el) => {
          const el = $el[0]
          // Tenta light DOM primeiro
          const light = $el.find('input, textarea')
          if (light.length) {
            return cy.wrap(light.first(), { log: false })
          }
          // Se tem shadow, usa shadow
          if (el && el.shadowRoot) {
            return cy.wrap($el, { log: false }).shadow().find('input, textarea', { timeout: 30000 }).first()
          }
          // Fallback
          return cy.wrap($el, { log: false }).parent().find('input, textarea', { timeout: 30000 }).first()
        })
      },
    }
  
    // Detector robusto de campo de nome (aceita múltiplos candidatos)
    // Retorna ELEMENTO jQuery válido
    findNameField(timeout = 30000) {
      // Candidates seguros (CSS compatível, sem modificadores case-insensitive)
      const candidates = [
        'ion-input[formcontrolname="fullName"]',
        'ion-input[formcontrolname="name"]',
        'ion-input[formcontrolname="nome"]',
        'input[formcontrolname="fullName"]',
        'input[name="fullName"]',
        'input[autocomplete="name"]',
      ]

      // Encontra o primeiro candidato que existe no DOM
      return cy.get('body', { timeout }).then(($b) => {
        const sel = candidates.find(s => $b.find(s).length > 0)
        if (sel) {
          cy.log(`✅ Campo de nome detectado: ${sel}`)
          // ✅ Retorna ELEMENTO jQuery válido usando o seletor encontrado
          return cy.get(sel, { timeout }).first()
        }
        
        // Fallback: busca por placeholder usando filtro JavaScript (case-insensitive)
        cy.log('⚠️ Candidatos diretos não encontrados, tentando fallback por placeholder...')
        return cy.get('input[placeholder]', { timeout: 10000 })
          .filter((_, el) => {
            const p = el.getAttribute('placeholder') || ''
            return /nome/i.test(p) || /name/i.test(p)
          })
          .first()
          .then(($found) => {
            if ($found.length > 0) {
              cy.log(`✅ Campo de nome encontrado via placeholder: ${$found.attr('placeholder')}`)
              return cy.wrap($found.first(), { log: false })
            }
            // Se ainda não encontrou, faz dump pra diagnóstico
            cy.screenshot('DEBUG_nome_nao_encontrado')
            cy.log('❌ Campo de nome não encontrado. HTML snippet:')
            cy.document().its('body').invoke('innerText').then(t => cy.log(t.slice(0, 1500)))
            throw new Error(`Campo de nome não encontrado. Candidates tentados: ${candidates.join(' | ')}`)
          })
      })
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
      cy.assertPath('/register')
      cy.dismissOverlays()
      
      return this.findNameField().then(($el) => {
        // Log de diagnóstico: verifica tipo do elemento
        cy.then(() => {
          const isJQuery = $el && typeof $el.jquery !== 'undefined'
          const tag = $el?.prop?.('tagName')?.toLowerCase() || 'unknown'
          cy.log(`🔍 Preenchendo nome. Tag: ${tag}, isJQuery: ${isJQuery}`)
        })
        
        const tag = $el.prop('tagName')?.toLowerCase()
        
        if (tag === 'ion-input') {
          // Se for ion-input, extrai o formcontrolname e usa typeInIonInput
          const formcontrolname = $el.attr('formcontrolname') || $el.attr('ng-reflect-form-control-name')
          if (formcontrolname) {
            cy.log(`✅ Usando typeInIonInput com formcontrolname: ${formcontrolname}`)
            return this.typeInIonInput(formcontrolname, nome)
          }
          // Fallback: tenta achar input dentro do ion-input
          const host = $el[0]
          const light = $el.find('input, textarea')
          
          if (light.length) {
            // Light DOM: garante que é elemento jQuery válido
            cy.wrap(light.first(), { log: false })
              .should('exist')
              .should('be.enabled')
              .click({ force: true })
              .clear({ force: true })
              .type(nome, { force: true })
            return cy.wrap(nome, { log: false })
          }
          
          // Tenta shadow se existir
          if (host && host.shadowRoot) {
            cy.wrap($el, { log: false })
              .shadow()
              .find('input, textarea', { timeout: 30000 })
              .first()
              .should('be.enabled')
              .click({ force: true })
              .clear({ force: true })
              .type(nome, { force: true })
            return cy.wrap(nome, { log: false })
          }
        }
        
        // Input direto (não ion-input): garante que é elemento jQuery válido
        cy.wrap($el.first(), { log: false })
          .scrollIntoView({ offset: { top: -120, left: 0 } })
          .should('be.visible')
          .should('be.enabled')
          .click({ force: true })
          .clear({ force: true })
          .type(nome, { force: true })
        
        return cy.wrap(nome, { log: false })
      })
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
  
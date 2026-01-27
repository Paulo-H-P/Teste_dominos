class CadastroPage {

    // Métodos auxiliares para gerar dados únicos
    gerarEmailUnico(dominio = 'testedominos.com') {
        // Gera um e-mail único usando timestamp + número aleatório
        const timestamp = Date.now()
        const random = Math.floor(Math.random() * 10000)
        return `teste${timestamp}${random}@${dominio}`
    }

    gerarTelefoneUnico() {
        // Gera um telefone celular brasileiro único (11 dígitos)
        // Formato: DDD (2 dígitos) + 9 (indicador de celular) + número (8 dígitos)
        const ddd = ['11', '21', '31', '41', '47', '48', '51', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99']
        const dddAleatorio = ddd[Math.floor(Math.random() * ddd.length)]
        // Gera os últimos 8 dígitos usando timestamp + random para garantir unicidade
        const timestamp = Date.now().toString().slice(-6) // Últimos 6 dígitos do timestamp
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0') // 2 dígitos aleatórios
        const numero = (timestamp + random).slice(-8).padStart(8, '0') // Garante exatamente 8 dígitos
        return `${dddAleatorio}9${numero}` // DDD + 9 (celular) + 8 dígitos = 11 dígitos
    }

    elements = {

        //cadastrarse: () => cy.get('[routerlink="/register"]'),
        // Seletores estáveis usando formcontrolname (não dependem de classes dinâmicas)
        nome: () => cy.get('ion-input[formcontrolname="fullName"] input'),
        //nascimento: () => cy.get('ion-input[formcontrolname="birthDate"] input'),
        //cpf: () => cy.get('ion-input[formcontrolname="cpf"] input'),
        email: () => cy.get('ion-input[formcontrolname="email"] input'),
        // Celular - tenta múltiplas estratégias
        celular: () => cy.get('ion-input[formcontrolname="phone"] input, ion-input[formcontrolname="phoneNumber"] input, ion-input[formcontrolname="mobile"] input').first(),
        // Senha - pode estar em ion-input ou dentro de password-input
        senha: () => cy.get('ion-input[formcontrolname="password"] input, [formcontrolname="password"] input, .password-input input, ion-input[type="password"] input').first(),
        // Confirmação de senha - pode ter estrutura diferente
        confirma_senha: () => cy.get('ion-input[formcontrolname="confirmPassword"] input, ion-input[formcontrolname="confirm_password"] input, [formcontrolname="confirmPassword"] input, .password-input:last-of-type input').first(),
        // Campos de endereço - seletores estáveis usando formcontrolname
        //endereco: () => cy.get(':nth-child(1) > .ng-untouched > .native-input'),
        cep: () => cy.get('ion-input[formcontrolname="zipCode"] input'),        
        numero_endereco: () => cy.get('ion-input[formcontrolname="number"] input')        ,
        checkBox_termos: () => cy.get('ion-checkbox').should('be.visible'),
        criar_conta: () => cy.contains('button, ion-button', 'Criar minha conta'),
        codigo_verificacao1: () => cy.get('code-input > :nth-child(1) > input'),
        codigo_verificacao2: () => cy.get('code-input > :nth-child(2) > input'),
        codigo_verificacao3: () => cy.get('code-input > :nth-child(3) > input'),
        codigo_verificacao4: () => cy.get('code-input > :nth-child(4) > input'),
        codigo_verificacao5: () => cy.get('code-input > :nth-child(5) > input'),
        codigo_verificacao6: () => cy.get('code-input > :nth-child(6) > input'),
    }

    clicarCadastrarse() {
        // Aguarda a página carregar completamente
    cy.wait(3000)
    
    // Esconde o banner via JavaScript (mais confiável que tentar fechar)
    cy.window().then((win) => {
      const banner = win.document.querySelector('app-cookie-banner')
      if (banner) {
        banner.style.display = 'none'
        cy.log('Banner escondido via JavaScript')
      }
    })
    
    // Aguarda um pouco após esconder o banner
    cy.wait(1500)
    
    // Verifica se o usuário está logado e faz logout se necessário
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase()
      const isLoggedIn = bodyText.includes('olá') || bodyText.includes('sair') || bodyText.includes('logout') || bodyText.includes('minha conta')
      
      if (isLoggedIn) {
        const tempoInicioLogout = Date.now()
        cy.log('🔓 Usuário está logado. Fazendo logout...')
        
        // Tenta fazer logout de várias formas
        // Estratégia 1: Limpar localStorage e sessionStorage
        cy.window().then((win) => {
          win.localStorage.clear()
          win.sessionStorage.clear()
          cy.log('✅ LocalStorage e SessionStorage limpos')
        })
        
        // Estratégia 2: Procurar botão de logout/sair
        cy.get('body').then(($body2) => {
          // Procura por botão de sair/logout
          const logoutButton = $body2.find('[routerlink*="logout"], [routerlink*="sair"], a[href*="logout"], a[href*="sair"], button:contains("sair"), button:contains("logout")').first()
          
          if (logoutButton.length > 0) {
            cy.wrap(logoutButton).click({ force: true })
            cy.log('✅ Logout realizado via botão')
            cy.wait(2000)
          }
        })
        
        // Recarrega a página para garantir que o logout foi aplicado
        cy.reload()
        cy.wait(2000)
        
        // Calcula tempo do logout
        const tempoFimLogout = Date.now()
        const tempoLogout = ((tempoFimLogout - tempoInicioLogout) / 1000).toFixed(2)
        cy.log(`✅ Logout concluído - Tempo: ${tempoLogout}s`)
      }
    })
    
    // Tenta clicar em "cadastrar-se" - tenta múltiplas estratégias
    // Primeiro verifica qual elemento existe na página
    cy.get('body').then(($body) => {
      // Verifica se existe routerLink
      const hasRouterLink = $body.find('[routerlink="/register"], [routerLink="/register"]').length > 0
      // Verifica se existe link com href
      const hasHref = $body.find('a[href*="/register"]').length > 0
      // Verifica se existe texto "cadastre-se"
      const hasText = $body.text().toLowerCase().includes('cadastre-se')
      
      if (hasRouterLink || hasHref) {
        // Estratégia 1: Por routerLink ou href (mais específico)
        cy.get('[routerlink="/register"], [routerLink="/register"], a[href*="/register"]', { timeout: 10000 })
          .first()
          .should('exist')
          .scrollIntoView({ offset: { top: -200, left: 0 } })
          .should('be.visible')
          .click({ force: true })
      } else if (hasText) {
        // Estratégia 2: Por texto no header
        cy.get('app-header', { timeout: 10000 })
          .should('exist')
          .within(() => {
            cy.contains('cadastre-se', { matchCase: false, timeout: 5000 })
              .should('exist')
              .scrollIntoView({ offset: { top: -200, left: 0 } })
              .click({ force: true })
          })
      } else {
        // Se não encontrou "cadastre-se", tenta acessar diretamente a URL de registro
        cy.log('⚠️ Botão "cadastre-se" não encontrado. Acessando URL de registro diretamente...')
        cy.visit('/register', { timeout: 10000 })
      }
    })

    }
    preencherNome(nome = 'Paulo Pinheiro') {
        this.elements.nome()
            .should('be.visible', { timeout: 10000 })
            .clear()
            .type(nome)
    }
    /*preencherNascimento(nascimento = '29/12/1982') {
        this.elements.nascimento()
            .should('be.visible', { timeout: 10000 })
            .clear()
            .type(nascimento)
    }*/
    /*preencherCpf(cpf = '32997605806') {
        this.elements.cpf()
            .should('be.visible', { timeout: 10000 })
            .clear()
            .type(cpf)
    }*/

    preencherEmail(email = null) {
        // Se não fornecer email, gera um único automaticamente
        const emailFinal = email || this.gerarEmailUnico()
        cy.log(`Usando e-mail: ${emailFinal}`)
        
        this.elements.email()
            .should('be.visible', { timeout: 10000 })
            .clear()
            .type(emailFinal)
        
        // Retorna o email usado para possível uso posterior
        return emailFinal
    }
    preencherCelular(celular = null) {
        // Se não fornecer celular, gera um único automaticamente
        const celularFinal = celular || this.gerarTelefoneUnico()
        cy.log(`Usando celular: ${celularFinal}`)
        
        // Tenta encontrar o campo de celular com múltiplas estratégias
        cy.get('body').then(($body) => {
            // Estratégia 1: Por formcontrolname
            const phone1 = $body.find('ion-input[formcontrolname="phone"] input').length
            const phone2 = $body.find('ion-input[formcontrolname="phoneNumber"] input').length
            const phone3 = $body.find('ion-input[formcontrolname="mobile"] input').length
            
            if (phone1 > 0) {
                cy.get('ion-input[formcontrolname="phone"] input')
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(celularFinal)
            } else if (phone2 > 0) {
                cy.get('ion-input[formcontrolname="phoneNumber"] input')
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(celularFinal)
            } else if (phone3 > 0) {
                cy.get('ion-input[formcontrolname="mobile"] input')
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(celularFinal)
            } else {
                // Fallback: procura por placeholder ou label
                cy.get('input[placeholder*="celular" i], input[placeholder*="telefone" i], input[placeholder*="(00)" i]')
                    .first()
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(celularFinal)
            }
        })
        
        // Retorna o celular usado para possível uso posterior
        return celularFinal
    }
    preencherSenha(senha = '1234567A') {
        // Tenta encontrar o campo de senha com múltiplas estratégias
        cy.get('body').then(($body) => {
            // Estratégia 1: Por formcontrolname
            const pass1 = $body.find('ion-input[formcontrolname="password"] input').length
            const pass2 = $body.find('[formcontrolname="password"] input').length
            const pass3 = $body.find('.password-input input').length
            
            if (pass1 > 0) {
                cy.get('ion-input[formcontrolname="password"] input')
                    .first()
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(senha, { log: false })
            } else if (pass2 > 0) {
                cy.get('[formcontrolname="password"] input')
                    .first()
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(senha, { log: false })
            } else if (pass3 > 0) {
                cy.get('.password-input input')
                    .first()
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(senha, { log: false })
            } else {
                // Fallback: procura por input type password
                cy.get('input[type="password"]')
                    .first()
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(senha, { log: false })
            }
        })
    }
    preencherConfirmaSenha(confirma_senha = '1234567A') {
        // Tenta encontrar o campo de confirmação de senha
        cy.get('body').then(($body) => {
            // Estratégia 1: Por formcontrolname
            const confirm1 = $body.find('ion-input[formcontrolname="confirmPassword"] input').length
            const confirm2 = $body.find('ion-input[formcontrolname="confirm_password"] input').length
            const confirm3 = $body.find('[formcontrolname="confirmPassword"] input').length
            
            if (confirm1 > 0) {
                cy.get('ion-input[formcontrolname="confirmPassword"] input')
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(confirma_senha, { log: false })
            } else if (confirm2 > 0) {
                cy.get('ion-input[formcontrolname="confirm_password"] input')
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(confirma_senha, { log: false })
            } else if (confirm3 > 0) {
                cy.get('[formcontrolname="confirmPassword"] input')
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(confirma_senha, { log: false })
            } else {
                // Fallback: procura o segundo input type password ou último password-input
                cy.get('input[type="password"]')
                    .last()
                    .should('be.visible', { timeout: 10000 })
                    .clear()
                    .type(confirma_senha, { log: false })
            }
        })
    }
    
    preencherCep(cep = '06454010') {
        this.elements.cep()
            .should('be.visible', { timeout: 20000 })
            .clear()
            .type(cep)
    }
    preencherNumeroEndereco(numero = '258') {
        this.elements.numero_endereco()
            .should('be.visible', { timeout: 10000 })
            .clear()
            .type(numero)
            cy.wait(1000)
    }
    preencherCheckBoxTermos() {
        this.elements.checkBox_termos()
            .should('be.visible', { timeout: 10000 })
            .click()
    }
    preencherCriarConta() {
        this.elements.criar_conta()
            .should('be.visible', { timeout: 10000 })
            .click({ force: true })
    }
    preencherCodigoVerificacao(codigo = '9') {
        // Aguarda o code-input aparecer
        cy.get('code-input', { timeout: 10000 }).should('exist')
        
        // Preenche o primeiro campo
        cy.get('code-input > :nth-child(1) > input', { timeout: 5000 })
            .should('be.visible')
            .clear()
            .type(codigo)
        
        // Delay para garantir que o foco mude para o próximo campo
        cy.wait(1000)
    }
    preencherCodigoVerificacao2(codigo = '7') {
        cy.get('code-input', { timeout: 10000 }).should('exist')
        
        cy.get('code-input > :nth-child(2) > input', { timeout: 5000 })
            .should('be.visible')
            .clear()
            .type(codigo)
        
        cy.wait(1000)
    }
    preencherCodigoVerificacao3(codigo = '9') {
        cy.get('code-input', { timeout: 10000 }).should('exist')
        
        cy.get('code-input > :nth-child(3) > input', { timeout: 5000 })
            .should('be.visible')
            .clear()
            .type(codigo)
        
        cy.wait(300)
    }
    preencherCodigoVerificacao4(codigo = '8') {
        cy.get('code-input', { timeout: 10000 }).should('exist')
        
        cy.get('code-input > :nth-child(4) > input', { timeout: 5000 })
            .should('be.visible')
            .clear()
            .type(codigo)
        
        cy.wait(300)
    }
    preencherCodigoVerificacao5(codigo = '9') {
        cy.get('code-input', { timeout: 10000 }).should('exist')
        
        cy.get('code-input > :nth-child(5) > input', { timeout: 5000 })
            .should('be.visible')
            .clear()
            .type(codigo)
        
        cy.wait(300)
    }
    preencherCodigoVerificacao6(codigo = '9') {
        cy.get('code-input', { timeout: 10000 }).should('exist')
        
        cy.get('code-input > :nth-child(6) > input', { timeout: 5000 })
            .should('be.visible')
            .clear()
            .type(codigo)
        
        cy.wait(300)
    }
    
    // Método alternativo: preencher todos os campos de uma vez usando índices
    preencherCodigoVerificacaoCompleto(codigo = '979899') {
        // Aguarda o code-input aparecer
        cy.get('code-input', { timeout: 10000 }).should('be.visible')
        
        // Preenche todos os 6 dígitos sequencialmente
        const digitos = codigo.toString().split('')
        
        for (let i = 0; i < 6 && i < digitos.length; i++) {
            cy.get(`code-input > :nth-child(${i + 1}) > input`, { timeout: 5000 })
                .should('be.visible')
                .clear()
                .type(digitos[i])
                .wait(300) // Delay entre cada campo
        }
    }
    
    
    

}

export default new CadastroPage()


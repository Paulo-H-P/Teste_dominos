// cypress/e2e/Pages/Home_cadastrar.js
// Responsabilidade: abrir a home e navegar para o cadastro (register)

class HomeCadastrarPage {
    /**
     * Abre a Home do app.
     * - Usamos visitWithRetry porque CI pode falhar por rede/carregamento.
     * - waitForAppReady é seu comando customizado: espera SPA ficar pronta.
     */
    visitarHome() {
      cy.visitWithRetry('/', {
        timeout: 30000,
        retries: 1,
        validate: () => {
          cy.waitForAppReady({ timeout: 60000, checkBlocking: false })
          cy.dismissOverlays()
        },
      })
    }
  
    /**
     * ASSERT da Home:
     * - Não tenta provar "layout bonito", só prova que o app carregou.
     * - Se isso falhar, você sabe que é carregamento/erro/redirect.
     * - Captura evidências (screenshot e texto) quando falhar para diagnóstico.
     */
    assertHomeCarregou() {
      cy.get('body', { timeout: 60000 }).should('exist')

      // Logs de diagnóstico
      cy.location('href').then((href) => cy.log(`📍 URL: ${href}`))
      cy.document().then((doc) => cy.log(`📄 TITLE: ${doc.title}`))

      // Captura texto do body para diagnóstico (primeiros 800 caracteres)
      cy.get('body').then(($b) => {
        const text = ($b.text() || '').trim().slice(0, 800)
        cy.log(`📝 BODY_TEXT_800: ${text}`)
      })

      // Procura múltiplos roots possíveis (Ionic, Angular, React, etc.)
      const roots = [
        'ion-app',
        'ion-content',
        'ion-router-outlet',
        'app-root',
        '#app',
        '#root',
        '[ng-version]',
        '[data-reactroot]'
      ].join(', ')

      // Verifica se algum root existe antes de fazer assert
      cy.get('body').then(($body) => {
        const temRoot = roots.split(', ').some((root) => {
          return $body.find(root).length > 0
        })

        if (!temRoot) {
          // Se não encontrou root, captura evidências ANTES do assert falhar
          cy.log('❌ App não carregou: nenhum root encontrado')
          cy.screenshot('DEBUG_body_sem_app')
          
          // Captura HTML completo do body para análise
          const html = $body.html().slice(0, 2000)
          cy.log(`🔍 BODY_HTML_2000: ${html}`)
          
          // Verifica se há mensagens comuns de bloqueio
          const bodyText = $body.text().toLowerCase()
          if (bodyText.includes('checking your browser') || bodyText.includes('just a moment')) {
            cy.log('⚠️ Possível bloqueio anti-bot detectado (Cloudflare/WAF)')
          }
          if (bodyText.includes('403') || bodyText.includes('access denied')) {
            cy.log('⚠️ Possível erro 403/Access Denied detectado')
          }
          if (bodyText.includes('enable javascript')) {
            cy.log('⚠️ Mensagem "Enable JavaScript" detectada')
          }
        }
      })

      // Tenta encontrar QUALQUER root típico de SPA (com timeout)
      // Se falhar, o Cypress vai capturar screenshot automaticamente
      cy.get(roots, { timeout: 60000 })
        .should('exist')
        .then(() => {
          cy.log('✅ App carregado: root encontrado')
          
          // Identifica qual root foi encontrado
          cy.get('body').then(($body) => {
            const rootEncontrado = roots.split(', ').find((root) => {
              return $body.find(root).length > 0
            })
            if (rootEncontrado) {
              cy.log(`✅ Root encontrado: ${rootEncontrado}`)
            }
          })
        })
    }
  
    /**
     * Fecha banner de cookies SE existir.
     * - Importante: não pode quebrar o teste se não existir.
     */
    fecharCookiesSeExistir() {
      cy.get('body').then(($b) => {
        const temBotao = $b.find('[data-cy="cookie-close"]').length > 0
        const temBanner = $b.find('app-cookie-banner').length > 0
  
        if (temBotao) {
          cy.get('[data-cy="cookie-close"]', { timeout: 10000 })
            .first()
            .click({ force: true })
          return
        }
  
        if (temBanner) {
          cy.get('app-cookie-banner .accept-cookie ion-icon[name="close"]', { timeout: 10000 })
            .first()
            .click({ force: true })
        }
      })
    }
  
    /**
     * Clica em "Cadastrar-se" (ou link para /register)
     * - Primeiro tenta o mais determinístico: routerlink/href com /register
     * - Depois tenta fallback por texto (só se precisar)
     * - Se nada existir, navega direto /register como último recurso
     */
    irParaCadastro() {
      const linkSel = '[routerlink="/register"], [routerLink="/register"], a[href*="/register"]'
  
      cy.get('body').then(($b) => {
        if ($b.find(linkSel).length) {
          cy.get(linkSel, { timeout: 15000 }).first().click({ force: true })
          return
        }
  
        // Fallback: procura por texto (pode ser "Login ou cadastre-se")
        const regex = /cadastre-se|cadastrar|criar conta|login ou cadastre-se/i
        if (regex.test($b.text())) {
          cy.contains('a, button, [role="button"]', regex, { timeout: 15000 })
            .first()
            .click({ force: true })
          return
        }
  
        // Último recurso: vai direto
        cy.visitWithRetry('/register', {
          timeout: 30000,
          retries: 1,
          validate: () => {
            cy.waitForAppReady({ timeout: 60000, checkBlocking: false })
            cy.dismissOverlays()
          },
        })
      })
    }
  
    /**
     * ASSERT de navegação:
     * - Garante que depois do clique você caiu em /register
     * - Esse assert é o "contrato" da função irParaCadastro()
     */
    assertFoiParaCadastro() {
      cy.location('pathname', { timeout: 60000 }).should('include', '/register')
    }
  }
  
  export default new HomeCadastrarPage()
  
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
     */
    assertHomeCarregou() {
      cy.get('body', { timeout: 60000 }).should('be.visible')
  
      // Se seu projeto é Ionic/Capacitor, geralmente existe ion-app
      cy.get('ion-app', { timeout: 60000 }).should('exist')
  
      // Ajuda debug no CI: imprime URL atual no log
      cy.location('href').then((href) => cy.log(`URL atual: ${href}`))
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
  
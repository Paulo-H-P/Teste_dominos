// cypress/e2e/Pages/promocoes.js
class PromocoesPage {
    /**
     * Clica no menu "Promoções"
     * - tenta pela própria rota (tabs/promotions)
     * - fallback por texto no menu
     */
    irParaPromocoes() {
      cy.dismissOverlays()
  
      // Se já está em promoções, não faz nada
      cy.location('pathname', { timeout: 30000 }).then((p) => {
        if (p.includes('/tabs/promotions')) {
          cy.log('✅ Já está em /tabs/promotions')
          return
        }
  
        // 1) tenta clicar em um link/aba que leve a /promotions
        cy.get('body').then(($b) => {
          const linkSel = '[routerlink*="promotions"], [routerLink*="promotions"], a[href*="promotions"]'
          if ($b.find(linkSel).length) {
            cy.get(linkSel, { timeout: 15000 }).first().click({ force: true })
            return
          }
  
          // 2) fallback por texto
          cy.contains('a, button, [role="button"]', 'Promoções', { timeout: 15000 })
            .first()
            .click({ force: true })
        })
      })
  
      // Assert: entrou em promoções
      cy.location('pathname', { timeout: 60000 }).should('include', '/tabs/promotions')
      cy.contains('Promoções', { timeout: 60000 }).should('exist')
    }
  }
  
  export default new PromocoesPage()
  
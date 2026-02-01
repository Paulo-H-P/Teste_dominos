// cypress/e2e/Pages/overlays.js
class Overlays {
    /**
     * Modal "Pedir uma pizza" (sucesso após cadastro)
     * Regra: se existir, clicar no botão e seguir.
     */
    fecharModalPedirPizzaSeExistir() {
      cy.dismissOverlays()
  
      cy.get('body').then(($b) => {
        const hasBtn = $b.find('[data-cy="success-go-to-pizza"]').length > 0
        if (!hasBtn) {
          cy.log('ℹ️ Modal "Pedir pizza" não apareceu')
          return
        }
  
        cy.log('✅ Modal "Pedir pizza" detectada, clicando...')
        cy.get('[data-cy="success-go-to-pizza"]', { timeout: 30000 })
          .should('exist')
          .click({ force: true })
      })
    }
  
    /**
     * Modal "Loja fechada"
     * Como às vezes ela só aparece em determinados horários,
     * a regra é: se aparecer, clicar no botão "Começar o meu pedido" / "Agendar" etc.
     */
    fecharModalLojaFechadaSeExistir() {
      cy.dismissOverlays()
  
      cy.get('body').then(($b) => {
        const txt = $b.text().toLowerCase()
  
        // gatilhos de texto (fallback) para identificar que a modal realmente apareceu
        const apareceu =
          txt.includes('loja fechada') ||
          txt.includes('ainda não abriu') ||
          txt.includes('agendar o pedido') ||
          txt.includes('começar o meu pedido')
  
        // se não apareceu, sai sem fazer nada
        if (!apareceu) {
          cy.log('ℹ️ Modal "Loja fechada" não apareceu')
          return
        }
  
        cy.log('✅ Modal "Loja fechada" detectada')
  
        // 1) tenta data-cy se existir (preferencial)
        if ($b.find('[data-cy="store-closed-start-button"]').length) {
          cy.get('[data-cy="store-closed-start-button"]', { timeout: 30000 })
            .first()
            .click({ force: true })
          return
        }
  
        // 2) fallback por texto do botão (sem data-cy)
        cy.contains('ion-button, button, [role="button"], a', /começar o meu pedido|agendar/i, {
          timeout: 30000,
          matchCase: false,
        })
          .first()
          .click({ force: true })
      })
    }
  
    /**
     * Último recurso: remove backdrops que travam clique.
     * Use só depois de tentar fechar as modais.
     */
    limparBackdropsSeNecessario() {
      cy.window().then((win) => {
        const backdrops = win.document.querySelectorAll('ion-backdrop')
        if (!backdrops || backdrops.length === 0) return
  
        // remove apenas se estiver "visível" (bloqueando)
        let removidos = 0
        backdrops.forEach((b) => {
          const style = win.getComputedStyle(b)
          const visivel = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
          if (visivel) {
            b.remove()
            removidos++
          }
        })
  
        if (removidos > 0) {
          cy.log(`⚠️ Removidos ${removidos} ion-backdrop(s) bloqueando`)
        }
      })
    }
  
    /**
     * Pipeline padrão antes de clicar em itens do menu (ex: Promoções)
     */
    prepararParaContinuar() {
      this.fecharModalPedirPizzaSeExistir()
      this.fecharModalLojaFechadaSeExistir()
      this.limparBackdropsSeNecessario()
      cy.dismissOverlays()
    }

    PedirPizza() {
        cy.dismissOverlays()

        cy.get('body').then(($b) => {
            const hasBtn = $b.find('[data-cy="success-go-to-pizza"]').length > 0
            if (!hasBtn) {
            cy.log('ℹ️ Modal "Pedir uma pizza" não apareceu')
            return
            }

            cy.log('✅ Modal "Pedir uma pizza" detectada, clicando no botão real...')

            // O data-cy está no ion-button (provável), então:
            // 1) pegamos o ion-button
            // 2) entramos no shadow DOM
            // 3) clicamos no button.button-native
            cy.get('[data-cy="success-go-to-pizza"]', { timeout: 30000 })
            .first()
            .should('exist')
            .scrollIntoView({ offset: { top: -120, left: 0 } })
            .then(($ionBtn) => {
                const el = $ionBtn[0]
                if (el && el.shadowRoot) {
                cy.wrap($ionBtn, { log: false })
                    .shadow()
                    .find('button.button-native', { timeout: 30000 })
                    .click({ force: true })
                } else {
                // fallback se por algum motivo não for ion-button
                cy.wrap($ionBtn, { log: false }).click({ force: true })
                }
            })

            // Assert: modal sumiu (evita seguir com modal aberta)
            cy.get('[data-cy="success-go-to-pizza"]', { timeout: 30000 }).should('not.exist')
        })
        }
    }
  export default new Overlays()
  
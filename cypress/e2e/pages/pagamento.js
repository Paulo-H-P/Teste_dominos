class PagamentoPage {

    IrParaPagamento(){
        // Aguarda um pouco para garantir que o botão esteja habilitado
        cy.wait(2000)
        cy.dismissOverlays()

        cy.get('body').then(($body) => {
            // Estratégia 1: Tenta usar o seletor que funciona no fluxo_compra.js (preferencial)
            const temSeletorFluxo = $body.find('.btn-primary > .d-flex > h4').length > 0
            
            if (temSeletorFluxo) {
                cy.log('✅ Botão de pagamento encontrado via seletor do fluxo_compra.js')
                cy.get('.btn-primary > .d-flex > h4', { timeout: 30000 })
                    .should('exist')
                    .first()
                    .scrollIntoView({ offset: { top: -100, left: 0 } })
                    .click({ force: true })
                return
            }

            // Estratégia 2: Tenta usar o seletor original
            const temSeletorOriginal = $body.find('#container-infos > app-button > .btn-primary').length > 0
            
            if (temSeletorOriginal) {
                cy.log('✅ Botão de pagamento encontrado via seletor original')
                cy.get('#container-infos > app-button > .btn-primary', { timeout: 30000 })
                    .should('exist')
                    .first()
                    .scrollIntoView({ offset: { top: -100, left: 0 } })
                    .then(($btn) => {
                        // Tenta clicar no shadow DOM se for app-button
                        if ($btn[0] && $btn[0].shadowRoot) {
                            cy.log('🔍 Botão tem shadow DOM, clicando no button dentro...')
                            cy.wrap($btn, { log: false })
                                .shadow()
                                .find('button, .btn-primary', { timeout: 30000 })
                                .click({ force: true })
                        } else {
                            cy.wrap($btn).click({ force: true })
                        }
                    })
                return
            }

            // Estratégia 3: Fallback - procura qualquer botão primário com texto de pagamento
            cy.log('⚠️ Seletores específicos não encontrados, tentando fallback...')
            cy.contains('.btn-primary, button, ion-button', /finalizar|pagamento|pagar|continuar/i, {
                timeout: 30000,
                matchCase: false,
            })
                .first()
                .scrollIntoView({ offset: { top: -100, left: 0 } })
                .click({ force: true })
        })

        cy.wait(1000)
    }






}
export default new PagamentoPage()

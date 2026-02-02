// cypress/e2e/Pages/overlays.js
class Overlays {
    /**
     * Modal "Pedir uma pizza" (sucesso após cadastro)
     * Regra: se existir, clicar no botão e seguir.
     */
  fecharModalPedirPizzaSeExistir() {
    cy.log('🍕 Iniciando fecharModalPedirPizzaSeExistir()...')
    
    // Aguarda um pouco para o modal aparecer
    cy.wait(2000)

    // Estratégia 0: Tenta dismiss() primeiro (mais direto)
    cy.window().then((win) => {
      const modals = win.document.querySelectorAll('ion-modal')
      if (modals.length > 0) {
        cy.log(`🔍 Encontradas ${modals.length} modal(s), tentando dismiss() primeiro...`)
        modals.forEach((modal) => {
          if (modal && typeof modal.dismiss === 'function') {
            try {
              modal.dismiss()
              cy.log('✅ Modal fechada via dismiss()')
            } catch (e) {
              cy.log(`⚠️ Erro ao usar dismiss(): ${e.message}`)
            }
          }
        })
        cy.wait(1000)
      }
    })

    // Verifica se o modal existe antes de tentar interagir
    cy.get('body', { timeout: 5000 }).then(($body) => {
      // Estratégia 1: Tenta usar data-cy primeiro (preferencial)
      const temDataCy = $body.find('[data-cy="success-go-to-pizza"]').length > 0
      const temModalSeletor = $body.find('.modal-default > .ion-page > .content-ltr > .md').length > 0
      const temModalApp = $body.find('app-success-registration-modal').length > 0
      const textoLower = $body.text().toLowerCase()
      const temModalTexto = textoLower.includes('parabéns') || textoLower.includes('pedir uma pizza')

      if (temDataCy || temModalSeletor || temModalApp || temModalTexto) {
        cy.log('✅ Modal "Pedir uma pizza" ainda detectada após dismiss(), tentando clicar...')

        // Estratégia 1: Usa data-cy (preferencial) - mesma lógica simples do fluxo_compra.js
        if (temDataCy) {
          cy.log('✅ Usando seletor data-cy para modal de sucesso')
          
          // Aguarda um pouco para garantir que o modal tenha tempo de aparecer
          cy.wait(1000)
          
          // Tenta clicar no botão
          cy.get('[data-cy="success-go-to-pizza"]', { timeout: 10000 })
            .should('exist')
            .first()
            .click({ force: true, timeout: 5000 })
            .then(() => {
              cy.log('✅ Botão "Pedir uma pizza" clicado via data-cy')
            }, (err) => {
              cy.log(`⚠️ Erro ao clicar: ${err.message}`)
            })
        }
        // Estratégia 2: Tenta pegar a modal usando o seletor específico
        else if (temModalSeletor) {
          cy.get('.modal-default > .ion-page > .content-ltr > .md', { timeout: 10000 })
            .should('exist')
            .then(($modal) => {
              if ($modal.length > 0) {
                // Procura o botão dentro da modal
                cy.wrap($modal).within(() => {
                  cy.contains('button, ion-button, a, [role="button"]', 'Pedir uma pizza', {
                    matchCase: false,
                    timeout: 10000,
                  })
                    .should('exist')
                    .first() // Garante que apenas o primeiro elemento seja usado
                    .scrollIntoView({ offset: { top: -100, left: 0 } })
                    .click({ force: true })
                    .then(() => {
                      cy.log('✅ Botão "Pedir uma pizza" clicado dentro da modal')
                    })
                })
              }
            })
        }
        // Estratégia 3: Tenta via app-success-registration-modal
        else if (temModalApp) {
          cy.get('app-success-registration-modal', { timeout: 15000 })
            .should('exist')
            .within(() => {
              cy.contains('button, ion-button, a, [role="button"]', 'Pedir uma pizza', {
                matchCase: false,
                timeout: 10000,
              })
                .should('exist')
                .first() // Garante que apenas o primeiro elemento seja usado
                .scrollIntoView({ offset: { top: -100, left: 0 } })
                .click({ force: true })
                .then(() => {
                  cy.log('✅ Botão "Pedir uma pizza" clicado via app-success-registration-modal')
                })
            })
        }
        // Estratégia 4: Fallback - procura o botão em toda a página
        else if (temModalTexto) {
          cy.contains('button, ion-button, a, [role="button"]', 'Pedir uma pizza', {
            matchCase: false,
            timeout: 10000,
          })
            .should('exist')
            .first() // Garante que apenas o primeiro elemento seja usado
            .scrollIntoView({ offset: { top: -100, left: 0 } })
            .click({ force: true })
            .then(() => {
              cy.log('✅ Botão "Pedir uma pizza" clicado (fallback - página inteira)')
            })
        }
      } else {
        cy.log('ℹ️ Modal "Pedir uma pizza" não encontrado, continuando...')
      }
    })

    // Aguarda um pouco e verifica se a modal ainda está aberta
    cy.wait(2000)
    
    // Remove backdrops que podem estar bloqueando
    cy.window().then((win) => {
      const backdrops = win.document.querySelectorAll('ion-backdrop')
      if (backdrops.length > 0) {
        cy.log(`⚠️ Removendo ${backdrops.length} backdrop(s) que podem estar bloqueando...`)
        backdrops.forEach((b) => {
          b.style.display = 'none'
          b.remove()
        })
      }
    })
    
    cy.get('body', { timeout: 5000 }).then(($body) => {
      if ($body.find('[data-cy="success-go-to-pizza"]').length > 0) {
        cy.log('⚠️ Modal ainda aberta após tentativas, forçando remoção...')
        // Força remoção da modal via DOM
        cy.window().then((win) => {
          const modals = win.document.querySelectorAll('ion-modal')
          modals.forEach((modal) => {
            if (modal) {
              modal.style.display = 'none'
              modal.remove()
            }
          })
          const backdrops = win.document.querySelectorAll('ion-backdrop')
          backdrops.forEach((b) => {
            b.style.display = 'none'
            b.remove()
          })
          cy.log('✅ Modal removida forçadamente via DOM')
        })
      } else {
        cy.log('✅ Modal fechada com sucesso')
      }
    })

    // Remove qualquer backdrop que possa ter ficado após fechar o modal
    cy.window().then((win) => {
      const backdrops = win.document.querySelectorAll('ion-backdrop')
      if (backdrops.length > 0) {
        cy.log(`⚠️ ${backdrops.length} backdrop(s) encontrado(s) após fechar modal, removendo...`)
        backdrops.forEach((b) => {
          b.style.display = 'none'
          b.remove()
        })
        cy.log(`✅ ${backdrops.length} backdrop(s) removido(s)`)
      }
    })

    cy.wait(1000)
  }

    /**
     * Modal "Loja fechada"
     * Só aparece entre 00:00 e 10:59 (meia-noite até 11h)
     * A regra é: se aparecer, clicar no botão "Começar o meu pedido" / "Agendar" etc.
     */
    fecharModalLojaFechadaSeExistir() {
        const hora = new Date().getHours()

        // Modal só aparece entre 00:00 e 10:59, então só verifica nesse horário
        if (hora >= 11) {
            cy.log(`ℹ️ Hora atual: ${hora}h | Modal "Loja Fechada" não aparece após 11h, pulando verificação...`)
            return
        }

        cy.log(`🕒 Hora atual: ${hora}h | Verificando modal "Loja Fechada"...`)
        cy.dismissOverlays()
        cy.wait(2000) // Aguarda modal aparecer (se aparecer)

        cy.get('body', { timeout: 30000 }).then(($body) => {
            const bodyText = $body.text().toLowerCase()

            const temModalLojaFechada =
                bodyText.includes('loja fechada') ||
                bodyText.includes('nossa loja ainda não abriu') ||
                bodyText.includes('agendar o pedido') ||
                bodyText.includes('começar o meu pedido')

            if (!temModalLojaFechada) {
                cy.log('ℹ️ Modal "Loja Fechada" não apareceu')
                return
            }

            cy.log('✅ Modal "Loja Fechada" detectada, tentando fechar...')

            // Estratégia 1: data-cy (preferencial)
            cy.get('body').then(($body2) => {
                const temDataCy = $body2.find('[data-cy="store-closed-start-button"]').length > 0
                const temDataCyModal = $body2.find('[data-cy="store-closed-modal"]').length > 0

                if (temDataCy) {
                    cy.log('✅ Usando seletor data-cy para modal loja fechada')
                    cy.get('[data-cy="store-closed-start-button"]', { timeout: 30000 })
                        .first()
                        .scrollIntoView({ offset: { top: -100, left: 0 } })
                        .click({ force: true })
                } else if (temDataCyModal) {
                    cy.get('[data-cy="store-closed-modal"]', { timeout: 10000 })
                        .should('exist')
                        .within(() => {
                            cy.get('[data-cy="store-closed-start-button"]', { timeout: 15000 })
                                .click({ force: true })
                        })
                } else {
                    // Estratégia 2: Fallback - procura dentro de ion-modal ou app-modal
                    const temModal = $body2.find('ion-modal, app-modal-address-not-found').length > 0

                    if (temModal) {
                        cy.get('ion-modal, app-modal-address-not-found', { timeout: 10000 })
                            .should('exist')
                            .within(() => {
                                cy.contains('ion-button, button', 'Começar o meu pedido', {
                                    matchCase: false,
                                    timeout: 10000,
                                })
                                    .first()
                                    .click({ force: true })
                            })
                    } else {
                        // Fallback final: procura em toda a página
                        cy.contains('ion-button, button, a, [role="button"]', 'Começar o meu pedido', {
                            timeout: 30000,
                            matchCase: false,
                        })
                            .first()
                            .scrollIntoView({ offset: { top: -100, left: 0 } })
                            .click({ force: true })
                    }
                }
            })

            // Remove qualquer backdrop que possa ter ficado
            cy.window().then((win) => {
                const backdrops = win.document.querySelectorAll('ion-backdrop')
                backdrops.forEach((backdrop) => {
                    backdrop.style.display = 'none'
                    backdrop.remove()
                })
                if (backdrops.length > 0) {
                    cy.log(`✅ ${backdrops.length} backdrop(s) removido(s)`)
                }
            })

            cy.wait(1000)
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
    // Usa a mesma lógica do fecharModalPedirPizzaSeExistir que funciona
    this.fecharModalPedirPizzaSeExistir()
  }
    }
  export default new Overlays()
  

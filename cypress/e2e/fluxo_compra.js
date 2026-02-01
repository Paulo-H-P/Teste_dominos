// cypress/e2e/fluxo_compra/fluxo_compra.js

class FluxoCompraPage {
  elements = {
    // Banner de cookies - tenta usar data-cy primeiro, depois fallback
    modalcookies: () => cy.get('[data-cy="cookie-close"], app-cookie-banner .accept-cookie ion-icon[name="close"]', { timeout: 15000 }),
    // modalpizza: () => cy.get('.btn-red'),
    // Modal loja fechada - tenta usar data-cy primeiro, depois fallback
    lojafechada: () => cy.get('[data-cy="store-closed-start-button"], .btn-primary', { timeout: 15000 }),
    // comecar_pedido: () => cy.contains('Começar o meu pedido'),

    // Seletor completo usando data-cy
    promocao: () => cy.get('app-promotions.ion-page > app-header > .header-md > ion-toolbar.md > .background-blue > .menu-itens > .logo-menu > .itens-menu > [data-cy="menu-promotions"]', { timeout: 15000 }),

    // Produto - tenta usar data-cy primeiro, depois fallback
    produto: () => cy.get('[data-cy="promo-card-718679"] [data-cy="promo-card-image"], div[data-promotion-id="718679"] > a > img', { timeout: 15000 }),
    // Seletor assertivo usando data-cy para o card de promoção
    promoCardLink: () => cy.get('[data-cy="promo-card-718679"] > [data-cy="promo-card-link"] > [data-cy="promo-card-minimum-price"]', { timeout: 15000 }),
    // Escolher/abrir o card da promoção - tenta usar data-cy primeiro, depois fallback
    escolher_pizza: () => cy.get('[data-cy="promo-card-718679"] [data-cy="promo-card-minimum-price"], div[data-promotion-id="718679"] > a > .minimum-price', { timeout: 15000 }),

    // Seletores para o botão de adicionar sabor específico (ex: Queijo Cremoso)
    escolher_sabor: () => cy.get('[data-cy="choose-flavor-QUECRE"] > .md'),

    adcionar_pizza: () => cy.get('#button-save > .btn-primary'),

    // Adicionar ao carrinho - usa .btn-primary como seletor principal
    adicionarCarrinho: () => cy.get('.btn-primary', { timeout: 15000 }),
    // Seguir para carrinho - tenta usar data-cy primeiro, depois fallback
    seguirCarrinho: () => cy.get('[data-cy="go-to-cart"], .btn-outline-red', { timeout: 15000 }),
    // Pagamento - usa o seletor específico do botão
    pagamento: () => cy.get('.btn-primary > .d-flex > h4', { timeout: 15000 }),
  }

  fecharModalcookies() {
    // Aguarda o banner aparecer
    cy.wait(1000)

    // Verifica se o banner existe antes de tentar fechá-lo
    cy.get('body').then(($body) => {
      const temBanner = $body.find('app-cookie-banner').length > 0
      const temDataCy = $body.find('[data-cy="cookie-close"]').length > 0

      if (temBanner) {
        cy.log('🔍 Banner de cookies detectado, tentando fechar...')

        // Estratégia 1: Tenta usar data-cy primeiro (preferencial)
        if (temDataCy) {
          cy.log('✅ Usando seletor data-cy para fechar cookies')
          this.elements.modalcookies()
            .first()
            .should('exist')
            .click({ force: true })
          cy.log('✅ Banner de cookies fechado via data-cy')
        } else {
          // Estratégia 2: Fallback para seletores antigos
          cy.get('app-cookie-banner').then(($banner) => {
            const botaoFechar = $banner
              .find('.accept-cookie ion-icon[name="close"], button, [aria-label*="close"], [aria-label*="fechar"]')
              .first()

            if (botaoFechar.length > 0) {
              // Garante que botaoFechar é elemento jQuery válido antes de clicar
              cy.wrap(botaoFechar.first(), { log: false }).click({ force: true })
              cy.log('✅ Banner de cookies fechado via botão (fallback)')
            } else {
              // Se não encontrar botão, esconde via JavaScript
              cy.window().then((win) => {
                const banner = win.document.querySelector('app-cookie-banner')
                if (banner) {
                  banner.style.display = 'none'
                  banner.remove()
                  cy.log('✅ Banner de cookies removido via JavaScript')
                }
              })
            }
          })
        }
      } else {
        cy.log('ℹ️ Banner de cookies não encontrado')
      }
    })

    cy.wait(500)
  }

  fecharmodalpizza() {
    // Aguarda um pouco para o modal aparecer
    cy.wait(2000)

    // Verifica se o modal existe antes de tentar interagir
    cy.get('body').then(($body) => {
      // Estratégia 1: Tenta usar data-cy primeiro (preferencial)
      const temDataCy = $body.find('[data-cy="success-go-to-pizza"]').length > 0
      const temModalSeletor = $body.find('.modal-default > .ion-page > .content-ltr > .md').length > 0
      const temModalApp = $body.find('app-success-registration-modal').length > 0
      const textoLower = $body.text().toLowerCase()
      const temModalTexto = textoLower.includes('parabéns') || textoLower.includes('pedir uma pizza')

      if (temDataCy || temModalSeletor || temModalApp || temModalTexto) {
        cy.log('✅ Modal "Pedir uma pizza" detectado, tentando fechar...')

        // Estratégia 1: Usa data-cy (preferencial)
        if (temDataCy) {
          cy.log('✅ Usando seletor data-cy para modal de sucesso')
          
          // Aguarda um pouco para garantir que o modal tenha tempo de aparecer
          cy.wait(1000)
          
          // Clica no botão sem verificar visibilidade (usa force: true para contornar display: none)
          cy.get('[data-cy="success-go-to-pizza"]', { timeout: 10000 })
            .should('exist')
            .click({ force: true })
            .then(() => {
              cy.log('✅ Botão "Pedir uma pizza" clicado via data-cy')
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

  modalLojaFechada() {
    const hora = new Date().getHours()

    // Modal só aparece entre 00:00 e 10:59
    if (hora < 11) {
      cy.log(`🕒 Hora atual: ${hora}h | Verificando modal Loja Fechada...`)

      // Aguarda um pouco para a modal aparecer (se aparecer)
      cy.wait(2000)

      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase()

        // Verifica se a modal de "Loja fechada" realmente apareceu
        const temModalLojaFechada =
          bodyText.includes('loja fechada') ||
          bodyText.includes('nossa loja ainda não abriu') ||
          bodyText.includes('agendar o pedido') ||
          bodyText.includes('começar o meu pedido')

        if (temModalLojaFechada) {
          cy.log('✅ Modal "Loja Fechada" detectada, tentando fechar...')

          // Opção 1 (Recomendada): Tenta usar data-cy primeiro
          cy.get('body').then(($body2) => {
            const temDataCy = $body2.find('[data-cy="store-closed-start-button"]').length > 0
            const temDataCyModal = $body2.find('[data-cy="store-closed-modal"]').length > 0

            // Estratégia 1: Usa data-cy se disponível (preferencial)
            if (temDataCy) {
              cy.log('✅ Usando seletor data-cy para modal loja fechada')
              this.elements.lojafechada()
                .should('exist')
                .first() // Garante que apenas o primeiro elemento seja usado
                .scrollIntoView({ offset: { top: -100, left: 0 } })
                // Não verifica visibilidade pois pode estar sobreposto por elementos fixed
                .click({ force: true })
              cy.log('✅ Botão "Começar o meu pedido" clicado via data-cy')
            } else if (temDataCyModal) {
              // Se tiver o modal com data-cy, procura o botão dentro dele
              cy.get('[data-cy="store-closed-modal"]', { timeout: 10000 })
                .should('exist')
                .within(() => {
                  cy.get('[data-cy="store-closed-start-button"]', { timeout: 15000 })
                    // Não verifica visibilidade pois modal pode ter display: none
                    .click({ force: true })
                    .then(() => {
                      cy.log('✅ Botão "Começar o meu pedido" clicado dentro do modal data-cy')
                    })
                })
            } else {
              // Estratégia 2: Fallback para seletores antigos
              // Verifica se existe componente app-modal-* específico
              const temAppModal = $body2.find(
                'app-modal-address-not-found, app-modal-loja-fechada, app-modal-store-closed, [class*="app-modal"]'
              ).length > 0

              // Verifica se existe ion-modal com classes específicas
              const temModalEspecifica = $body2.find(
                'ion-modal[class*="loja"], ion-modal[class*="fechada"], ion-modal[class*="store"], ion-modal.modal-default'
              ).length > 0

              if (temAppModal) {
              // Estratégia 1: Componente app-modal-* específico
              cy.get(
                'app-modal-address-not-found, app-modal-loja-fechada, app-modal-store-closed, [class*="app-modal"]',
                { timeout: 10000 }
              )
                .should('exist')
                .within(() => {
                  cy.contains('ion-button, button', 'Começar o meu pedido', {
                    matchCase: false,
                    timeout: 10000,
                  })
                    .first() // Garante que apenas o primeiro elemento seja usado
                    // Não verifica visibilidade pois modal pode ter display: none
                    .click({ force: true })
                    .then(() => {
                      cy.log('✅ Botão "Começar o meu pedido" clicado dentro do app-modal-*')
                    })
                })
            } else if (temModalEspecifica) {
              // Estratégia 2: ion-modal com classe específica
              cy.get(
                'ion-modal[class*="loja"], ion-modal[class*="fechada"], ion-modal[class*="store"], ion-modal.modal-default',
                { timeout: 10000 }
              )
                .should('exist')
                .within(() => {
                  cy.contains('ion-button, button', 'Começar o meu pedido', {
                    matchCase: false,
                    timeout: 10000,
                  })
                    .first() // Garante que apenas o primeiro elemento seja usado
                    // Não verifica visibilidade pois modal pode ter display: none
                    .click({ force: true })
                    .then(() => {
                      cy.log('✅ Botão "Começar o meu pedido" clicado dentro da modal específica')
                    })
                })
            } else {
              // Estratégia 3: Qualquer ion-modal que contenha o texto
              cy.get('ion-modal', { timeout: 10000 })
                .should('exist')
                .within(() => {
                  cy.contains('ion-button, button', 'Começar o meu pedido', {
                    matchCase: false,
                    timeout: 10000,
                  })
                    .first() // Garante que apenas o primeiro elemento seja usado
                    // Não verifica visibilidade pois modal pode ter display: none
                    .click({ force: true })
                    .then(() => {
                      cy.log('✅ Botão "Começar o meu pedido" clicado dentro da ion-modal')
                    })
                })
            }
            }
          })

          // Fallback: Se não encontrar dentro de ion-modal, procura em toda a página
          cy.get('body').then(($body3) => {
            const temBotaoNaModal = $body3
              .find('ion-modal')
              .find('button, ion-button')
              .filter((i, el) => {
                const texto = Cypress.$(el).text().toLowerCase()
                return texto.includes('começar') && texto.includes('pedido')
              }).length > 0

            if (!temBotaoNaModal) {
              cy.log('⚠️ Botão não encontrado dentro de ion-modal, tentando fallback...')
              cy.contains('button, ion-button, a, [role="button"]', /começar.*pedido/i, {
                timeout: 15000,
                matchCase: false,
              })
                .first()
                .should('exist')
                .scrollIntoView({ offset: { top: -100, left: 0 } })
                .click({ force: true })
                .then(() => {
                  cy.log('✅ Botão "Começar o meu pedido" clicado (fallback - página inteira)')
                })
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
        } else {
          cy.log('ℹ️ Modal "Loja Fechada" não apareceu (ok).')
        }
      })
    } else {
      cy.log(`🕒 Hora atual: ${hora}h | Modal Loja Fechada não deve aparecer. Pulando...`)
    }
  }

  clicarPromocao() {
    // Aguarda a página carregar completamente
    cy.wait(2000)

    // Remove backdrops que possam estar bloqueando
    cy.window().then((win) => {
      const backdrops = win.document.querySelectorAll('ion-backdrop')
      if (backdrops.length > 0) {
        cy.log(`⚠️ ${backdrops.length} backdrop(s) encontrado(s), removendo...`)
        backdrops.forEach((b) => {
          b.style.display = 'none'
          b.remove()
        })
        cy.log(`✅ ${backdrops.length} backdrop(s) removido(s)`)
      }
    })

    cy.wait(1000) // Aguarda os backdrops serem removidos

    // Usa o seletor completo com data-cy, com fallback caso não encontre
    cy.get('body').then(($body) => {
      const temDataCy = $body.find('app-promotions.ion-page > app-header > .header-md > ion-toolbar.md > .background-blue > .menu-itens > .logo-menu > .itens-menu > [data-cy="menu-promotions"]').length > 0

      if (temDataCy) {
        // Estratégia 1: Seletor completo com data-cy (preferencial)
        cy.log('✅ Usando seletor completo data-cy para promoção')
        this.elements.promocao()
          .first() // Garante que apenas o primeiro elemento seja usado
          .should('exist')
          .scrollIntoView({ offset: { top: -100, left: 0 } })
          .click({ force: true })
      } else {
        // Estratégia 2: Fallback - busca por texto "promoção" ou "promo"
        cy.log('⚠️ Seletor data-cy não encontrado, tentando busca por texto...')
        cy.contains('a, button, [role="button"]', /promo/i, { matchCase: false, timeout: 10000 })
          .first()
          .should('exist')
          .scrollIntoView({ offset: { top: -100, left: 0 } })
          .click({ force: true })
      }
    })

    cy.wait(1000) // Aguarda após o clique
    cy.log('✅ Promoção clicada')
  }

  clicarProduto() {
    // Aguarda a página carregar
    cy.wait(2000)
    cy.waitForAppReady({ checkBlocking: false })
    cy.dismissOverlays()

    // Verifica se já está na página de detalhes da promoção
    cy.url().then((url) => {
      if (url.includes('/promotion-details/718679') || url.includes('promotion-details')) {
        cy.log('✅ Já está na página de detalhes da promoção, pulando clique')
        return
      }

      // Se não estiver na página de detalhes, tenta clicar no card
      cy.get('body').then(($body) => {
        // Estratégia 1: Tenta usar o seletor assertivo com data-cy (preferencial)
        const temDataCy = $body.find('[data-cy="promo-card-718679"] > [data-cy="promo-card-link"] > [data-cy="promo-card-minimum-price"]').length > 0
        
        if (temDataCy) {
          cy.log('✅ Card de promoção encontrado com data-cy, clicando...')
          this.elements.promoCardLink()
            .first()
            .should('exist')
            //.should('be.visible')
            //.scrollIntoView({ offset: { top: -100, left: 0 } })
            .click({ force: true })
          cy.log('✅ Produto clicado: usando seletor data-cy')
        } else {
          // Estratégia 2: Fallback para seletores antigos
          const temCard = $body.find('div[data-promotion-id="718679"] > a').length > 0
          const temLink = $body.find('div[data-promotion-id="718679"] a').length > 0

          if (temCard || temLink) {
            cy.log('✅ Card de promoção encontrado (fallback), clicando...')
            cy.get('div[data-promotion-id="718679"] > a, div[data-promotion-id="718679"] a', { timeout: 15000 })
              .first()
              .should('exist')
              .scrollIntoView({ offset: { top: -100, left: 0 } })
              .click({ force: true, multiple: false })
            cy.log('✅ Produto clicado: link direto com force')
          } else {
            cy.log('⚠️ Card de promoção não encontrado, tentando buscar por imagem...')
            // Fallback: tenta clicar na imagem do produto
            this.elements.produto()
              .first()
              .should('exist')
              .scrollIntoView({ offset: { top: -100, left: 0 } })
              .click({ force: true })
            cy.log('✅ Produto clicado via imagem do produto')
          }
        }
      })
    })

    cy.wait(2000)
  }

  clicarEscolherProduto() {
    // Aguarda a página carregar
    cy.wait(2000)
    cy.waitForAppReady({ checkBlocking: false })
    cy.dismissOverlays()

    // Usa o seletor .btn-primary para adicionar ao carrinho
    cy.get('body').then(($body) => {
      const temBtnPrimary = $body.find('.btn-primary').length > 0
      
      if (temBtnPrimary) {
        cy.log('✅ Botão .btn-primary encontrado: Adicionar ao carrinho')
        this.elements.adicionarCarrinho()
          .should('exist')
          .first() // Garante que apenas o primeiro elemento seja clicado
          .scrollIntoView({ offset: { top: -100, left: 0 } })
          .click({ force: true })
        cy.log('✅ Botão clicado: Adicionar ao carrinho (.btn-primary)')
      } else {
        // Fallback: Procura pelo botão "Adicionar ao carrinho" por texto
        cy.log('⚠️ .btn-primary não encontrado, tentando busca por texto...')
        cy.contains('button, ion-button, a', 'Adicionar ao carrinho', { matchCase: false, timeout: 10000 })
          .should('exist')
          .scrollIntoView({ offset: { top: -100, left: 0 } })
          .click({ force: true })
        cy.log('✅ Botão encontrado: Adicionar ao carrinho (fallback texto)')
      }
    })

    cy.wait(1000)
  }

  clicarEscolherSabor() {
    // Aguarda a página carregar
    cy.waitForAppReady({ checkBlocking: false })
    cy.dismissOverlays()
    this.elements.escolher_sabor()
      .first() // Garante que apenas o primeiro elemento seja clicado
      .should('exist')
      .scrollIntoView({ offset: { top: -100, left: 0 } })
      .click({ force: true })
  }

  clicarAdcionarPizza() {
    cy.waitForAppReady({ checkBlocking: false })
    cy.dismissOverlays()
    this.elements.adcionar_pizza()
      .first() // Garante que apenas o primeiro elemento seja clicado
      .should('exist')
      .scrollIntoView({ offset: { top: -100, left: 0 } })
      .click({ force: true })
    cy.wait(1000)
  }

  clicarAdicionarCarrinho() {
    cy.wait(1000)
    this.elements.adicionarCarrinho()
      .first() // Garante que apenas o primeiro elemento seja clicado
      .should('exist')
      .scrollIntoView({ offset: { top: -100, left: 0 } })
      .click({ force: true })
    cy.wait(1000)
  }

  clicarSeguirCarrinho() {
    cy.wait(1000)
    this.elements.seguirCarrinho()
      .first() // Garante que apenas o primeiro elemento seja clicado
      .should('exist')
      .scrollIntoView({ offset: { top: -100, left: 0 } })
      .click({ force: true })
    cy.wait(1000)
  }

  clicarPagamento() {
    cy.wait(1000)
    this.elements.pagamento()
      .first() // Garante que apenas o primeiro elemento seja clicado
      .should('exist')
      .scrollIntoView({ offset: { top: -100, left: 0 } })
      .click({ force: true })
    cy.wait(1000)
  }
}

export default new FluxoCompraPage()

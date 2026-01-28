// cypress/e2e/fluxo_compra/fluxo_compra.js

class FluxoCompraPage {
  elements = {
    modalcookies: () => cy.get('app-cookie-banner .accept-cookie ion-icon[name="close"]'),
    // modalpizza: () => cy.get('.btn-red'),
    lojafechada: () => cy.get('.btn-primary'),
    // comecar_pedido: () => cy.contains('Começar o meu pedido'),

    // Múltiplas estratégias para encontrar promoção
    promocao: () =>
      cy.get(
        'app-promotions.ion-page > app-header > .header-md > ion-toolbar.md > .background-blue > .menu-itens > .logo-menu > .itens-menu > .active, a.active, .active a'
      ),

    produto: () => cy.get('div[data-promotion-id="718679"] > a > img'),

    // Escolher/abrir o card da promoção (clique no link do card, não no span)
    escolher_pizza: () => cy.get('div[data-promotion-id="718679"] > a > .minimum-price'),

    // Seletores para o botão de adicionar sabor específico (ex: Queijo Cremoso)
    escolher_sabor: () => cy.get('.add-button-pizza').eq(1),

    adcionar_pizza: () => cy.get('#button-save > .btn-primary'),

    adicionarCarrinho: () => cy.get('.width-web > .btn-primary'),
    seguirCarrinho: () => cy.get('.btn-outline-red'),
    pagamento: () => cy.get('.mt-1 > app-button > .btn-primary'),
  }

  fecharModalcookies() {
    // Aguarda o banner aparecer
    cy.wait(1000)

    // Verifica se o banner existe antes de tentar fechá-lo
    cy.get('body').then(($body) => {
      const temBanner = $body.find('app-cookie-banner').length > 0

      if (temBanner) {
        cy.log('🔍 Banner de cookies detectado, tentando fechar...')

        // Tenta clicar no botão de fechar do banner
        cy.get('app-cookie-banner').then(($banner) => {
          const botaoFechar = $banner
            .find('.accept-cookie ion-icon[name="close"], button, [aria-label*="close"], [aria-label*="fechar"]')
            .first()

          if (botaoFechar.length > 0) {
            cy.wrap(botaoFechar).click({ force: true })
            cy.log('✅ Banner de cookies fechado via botão')
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
      const temModalSeletor = $body.find('.modal-default > .ion-page > .content-ltr > .md').length > 0
      const temModalApp = $body.find('app-success-registration-modal').length > 0
      const textoLower = $body.text().toLowerCase()
      const temModalTexto = textoLower.includes('parabéns') || textoLower.includes('pedir uma pizza')

      if (temModalSeletor || temModalApp || temModalTexto) {
        cy.log('✅ Modal "Pedir uma pizza" detectado, tentando fechar...')

        // Estratégia 1: Tenta pegar a modal usando o seletor específico
        if (temModalSeletor) {
          cy.get('.modal-default > .ion-page > .content-ltr > .md', { timeout: 10000 })
            .should('exist')
            .then(($modal) => {
              if ($modal.length > 0) {
                // Procura o botão dentro da modal
                cy.wrap($modal).within(() => {
                  cy.contains('button, ion-button, a, [role="button"]', 'Pedir uma pizza', {
                    matchCase: false,
                    timeout: 5000,
                  })
                    .should('exist')
                    .scrollIntoView({ offset: { top: -100, left: 0 } })
                    .click({ force: true })
                    .then(() => {
                      cy.log('✅ Botão "Pedir uma pizza" clicado dentro da modal')
                    })
                })
              }
            })
        }
        // Estratégia 2: Tenta via app-success-registration-modal
        else if (temModalApp) {
          cy.get('app-success-registration-modal', { timeout: 5000 })
            .should('exist')
            .within(() => {
              cy.contains('button, ion-button, a, [role="button"]', 'Pedir uma pizza', {
                matchCase: false,
                timeout: 5000,
              })
                .should('exist')
                .scrollIntoView({ offset: { top: -100, left: 0 } })
                .click({ force: true })
                .then(() => {
                  cy.log('✅ Botão "Pedir uma pizza" clicado via app-success-registration-modal')
                })
            })
        }
        // Estratégia 3: Fallback - procura o botão em toda a página
        else if (temModalTexto) {
          cy.contains('button, ion-button, a, [role="button"]', 'Pedir uma pizza', {
            matchCase: false,
            timeout: 5000,
          })
            .should('exist')
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

          // Opção 1 (Recomendada): Ancorar no ion-modal com classe específica ou componente app-modal-*
          cy.get('body').then(($body2) => {
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
                    timeout: 5000,
                  })
                    .should('be.visible')
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
                .should('be.visible')
                .within(() => {
                  cy.contains('ion-button, button', 'Começar o meu pedido', {
                    matchCase: false,
                    timeout: 5000,
                  })
                    .should('be.visible')
                    .click({ force: true })
                    .then(() => {
                      cy.log('✅ Botão "Começar o meu pedido" clicado dentro da modal específica')
                    })
                })
            } else {
              // Estratégia 3: Qualquer ion-modal visível que contenha o texto
              cy.get('ion-modal', { timeout: 10000 })
                .should('be.visible')
                .within(() => {
                  cy.contains('ion-button, button', 'Começar o meu pedido', {
                    matchCase: false,
                    timeout: 5000,
                  })
                    .should('be.visible')
                    .click({ force: true })
                    .then(() => {
                      cy.log('✅ Botão "Começar o meu pedido" clicado dentro da ion-modal')
                    })
                })
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
                timeout: 5000,
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

    // Tenta múltiplas estratégias para encontrar e clicar na promoção
    cy.get('body').then(($body) => {
      // Verifica se o elemento existe no DOM
      const temPromocaoCompleta =
        $body.find(
          'app-promotions.ion-page > app-header > .header-md > ion-toolbar.md > .background-blue > .menu-itens > .logo-menu > .itens-menu > .active'
        ).length > 0
      const temActive = $body.find('a.active, .active a, [class*="active"] a').length > 0

      if (temPromocaoCompleta) {
        // Estratégia 1: Seletor completo (original)
        cy.log('✅ Usando seletor completo para promoção')
        cy.get(
          'app-promotions.ion-page > app-header > .header-md > ion-toolbar.md > .background-blue > .menu-itens > .logo-menu > .itens-menu > .active',
          { timeout: 15000 }
        )
          .should('exist')
          .then(($el) => {
            cy.wrap($el)
              .scrollIntoView({ offset: { top: -100, left: 0 } })
              .click({ force: true })
          })
      } else if (temActive) {
        // Estratégia 2: Seletor simplificado (a.active)
        cy.log('✅ Usando seletor simplificado a.active')
        cy.get('a.active, .active a', { timeout: 15000 })
          .first()
          .should('exist')
          .then(($el) => {
            cy.wrap($el)
              .scrollIntoView({ offset: { top: -100, left: 0 } })
              .click({ force: true })
          })
      } else {
        // Estratégia 3: Busca por texto "promoção" ou "promo"
        cy.log('⚠️ Seletores diretos não funcionaram, tentando busca por texto...')
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

    // Estratégia mais simples e direta: clica no link do card diretamente
    cy.get('div[data-promotion-id="718679"] > a', { timeout: 10000 })
      .should('exist')
      .click({ force: true, multiple: false })

    cy.log('✅ Produto clicado: link direto com force')
    cy.wait(2000)
  }

  clicarEscolherProduto() {
    // Aguarda a página carregar
    cy.wait(2000)

    // O elemento .minimum-price está escondido, então não verifica visibilidade
    // Tenta múltiplas estratégias para encontrar o botão de adicionar pizza
    cy.get('body').then(($body) => {
      // Estratégia 1: Procura pelo botão "Adicionar ao carrinho" (botão roxo visível na página)
      const temBotaoAdicionar = $body.text().toLowerCase().includes('adicionar ao carrinho')
      if (temBotaoAdicionar) {
        cy.contains('button, ion-button, a', 'Adicionar ao carrinho', { matchCase: false, timeout: 10000 })
          .should('exist')
          .click({ force: true })
        cy.log('✅ Botão encontrado: Adicionar ao carrinho')
        return
      }

      // Estratégia 2: Procura pelo seletor do elements (sem verificar visibilidade, só existência)
      cy.get('div[data-promotion-id="718679"] > a > .minimum-price', { timeout: 10000 })
        .should('exist') // Só verifica existência, não visibilidade
        .click({ force: true })
      cy.log('✅ Botão encontrado: .minimum-price (forçado)')
    })

    cy.wait(1000)
  }

  clicarEscolherSabor() {
    // Aguarda a página carregar
    this.elements.escolher_sabor().should('exist').click({ force: true })
  }

  clicarAdcionarPizza() {
    this.elements.adcionar_pizza().should('exist').click({ force: true })
    cy.wait(1000)
  }

  clicarAdicionarCarrinho() {
    cy.wait(1000)
    this.elements.adicionarCarrinho().should('exist').click({ force: true })
    cy.wait(1000)
  }

  clicarSeguirCarrinho() {
    cy.wait(1000)
    this.elements.seguirCarrinho().should('exist').click({ force: true })
    cy.wait(1000)
  }

  clicarPagamento() {
    cy.wait(1000)
    this.elements.pagamento().should('exist').click({ force: true })
    cy.wait(1000)
  }
}

export default new FluxoCompraPage()

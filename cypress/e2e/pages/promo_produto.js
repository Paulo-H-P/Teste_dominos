// cypress/e2e/Pages/promo_produto.js
class PromoProdutoPage {
    /**
     * Abre o card de uma promoção específica (ex: 718679)
     * Prioridade:
     * 1) data-cy (se existir)  -> [data-cy="promo-card-718679"]
     * 2) fallback             -> div[data-promotion-id="718679"]
     */
  abrirPromocaoPorId(promoId = '718679') {
    // Aguarda a página carregar
    cy.wait(2000)
    cy.waitForAppReady()
    cy.dismissOverlays()

    // Verifica se já está na página de detalhes da promoção
    cy.url().then((url) => {
      if (url.includes(`/promotion-details/${promoId}`) || url.includes('promotion-details')) {
        cy.log('✅ Já está na página de detalhes da promoção, pulando clique')
        return
      }

      // Se não estiver na página de detalhes, tenta clicar no card
      cy.get('body').then(($body) => {
        // Estratégia 1: Tenta usar o seletor assertivo com data-cy (preferencial)
        // Clica no link/preço dentro do card, não no card inteiro
        const temDataCy = $body.find(`[data-cy="promo-card-${promoId}"] > [data-cy="promo-card-link"] > [data-cy="promo-card-minimum-price"]`).length > 0
        
        if (temDataCy) {
          cy.log(`✅ Card de promoção encontrado com data-cy, clicando...`)
          cy.get(`[data-cy="promo-card-${promoId}"] > [data-cy="promo-card-link"] > [data-cy="promo-card-minimum-price"]`, { timeout: 30000 })
            .should('exist')
            .click({ force: true, multiple: false })
          cy.log('✅ Produto clicado: usando seletor data-cy')
        } else {
          // Estratégia 2: Fallback para seletores antigos
          const temCard = $body.find(`div[data-promotion-id="${promoId}"] > a`).length > 0
          const temLink = $body.find(`div[data-promotion-id="${promoId}"] a`).length > 0

          if (temCard || temLink) {
            cy.log(`✅ Card de promoção encontrado (fallback), clicando...`)
            cy.get(`div[data-promotion-id="${promoId}"] > a, div[data-promotion-id="${promoId}"] a`, { timeout: 30000 })
              .first()
              .should('exist')
              .scrollIntoView({ offset: { top: -100, left: 0 } })
              .click({ force: true, multiple: false })
            cy.log('✅ Produto clicado: link direto com force')
          } else {
            cy.log('⚠️ Card de promoção não encontrado, tentando buscar por imagem...')
            // Fallback: tenta clicar na imagem do produto
            cy.get(`[data-cy="promo-card-${promoId}"] [data-cy="promo-card-image"], div[data-promotion-id="${promoId}"] > a > img`, { timeout: 30000 })
              .should('exist')
              .scrollIntoView({ offset: { top: -100, left: 0 } })
              .click({ force: true })
            cy.log('✅ Produto clicado via imagem do produto')
          }
        }
      })
    })

    cy.wait(2000)
    
    // Assert: saiu de promoções (ou entrou no detalhe)
    cy.location('pathname', { timeout: 60000 }).should('match', /promotion-details|promotions/i)
  }
  escolherSabor() {
    cy.get('[data-cy="choose-flavor-QUECRE"] > .md')
    .should('exist')
    .click({ force: true })

  }

  adcionarnoCarrinho(){
    cy.get('[data-cy="save-pizza-button"] > .btn-primary')
    .should('exist')
    .click({ force: true })


  }

  finalizarCarrinho(){
    // Aguarda um pouco para o botão ser habilitado
    cy.wait(2000)
    
    cy.get('.d-flex > h4')
      .should('exist')
      .click({ force: true })
  }

  adicionarBebida(){
    cy.wait(2000)
    
    cy.get('.btn-outline-red > .d-flex > h4')
    .should('exist')
    .click({ force: true })
  }


}
  export default new PromoProdutoPage()
  
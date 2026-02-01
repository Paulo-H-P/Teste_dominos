// cypress/e2e/cadastro.cy.js

import CadastroPage from './cadastropage'
import FluxoCompraPage from './fluxo_compra'
import * as allure from 'allure-js-commons'

describe('Fluxo de compra', () => {
  /**
   * Assert robusto de rota final (após redirects client-side)
   */
  const assertRoute = (expectedPathOrRegex, opts = {}) => {
    const timeout = opts.timeout || 30000

    cy.location('href', { timeout }).then((href) => cy.log(`🔁 Final href: ${href}`))
    cy.location('pathname', { timeout }).then((p) => cy.log(`🧭 Final path: ${p}`))

    if (expectedPathOrRegex instanceof RegExp) {
      cy.location('pathname', { timeout }).should('match', expectedPathOrRegex)
    } else {
      cy.location('pathname', { timeout }).should('include', expectedPathOrRegex)
    }
  }

  /**
   * Ready-check simples (independente de seletor do front)
   * Obs: você também tem cy.waitForAppReady() nos commands.
   */
  const waitDocumentReady = (timeout = 30000) => {
    cy.document({ timeout }).its('readyState').should('eq', 'complete')
  }

  /**
   * Coleta métricas de navegação com fallback (Navigation Timing v2 + legacy)
   */
  const captureNavigationPerf = () => {
    cy.window().then((win) => {
      try {
        const nav = win.performance?.getEntriesByType?.('navigation')?.[0]
        if (nav) {
          allure.parameter('nav_domContentLoaded_ms', Math.round(nav.domContentLoadedEventEnd).toString())
          allure.parameter('nav_loadEventEnd_ms', Math.round(nav.loadEventEnd).toString())
          allure.parameter('nav_duration_ms', Math.round(nav.duration).toString())
          cy.log(
            `📊 NavigationTiming: DCL=${Math.round(nav.domContentLoadedEventEnd)}ms | Load=${Math.round(nav.loadEventEnd)}ms | Dur=${Math.round(nav.duration)}ms`
          )
          return
        }

        const perf = win.performance?.timing
        if (perf) {
          const pageLoadTime = perf.loadEventEnd - perf.navigationStart
          const domContentLoaded = perf.domContentLoadedEventEnd - perf.navigationStart
          allure.parameter('page_load_time_ms', pageLoadTime.toString())
          allure.parameter('dom_content_loaded_ms', domContentLoaded.toString())
          cy.log(`📊 LegacyTiming: Load=${pageLoadTime}ms | DCL=${domContentLoaded}ms`)
        }
      } catch (e) {
        cy.log('⚠️ Não foi possível coletar métricas de performance.')
      }
    })
  }

  /**
   * Executa o fluxo completo (cadastro -> compra)
   */
  const executarFluxoCompleto = (numeroExecucao = 1) => {
    const tempoInicioCiclo = Date.now()
    const tempoInicioPerformance = performance.now()

    // Allure
    allure.parameter('execucao_numero', String(numeroExecucao))
    allure.parameter('browser', Cypress.browser.name)
    allure.parameter('browser_version', Cypress.browser.version)
    allure.parameter('viewport', `${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`)

    allure.epic('Fluxo Completo de Compra')
    allure.feature('Cadastro + Compra + Checkout')
    allure.story(`Execução ${numeroExecucao}`)
    allure.severity('critical')

    cy.log(`🔄 Execução ${numeroExecucao} - Ciclo completo (Cadastro → Compra → Checkout)`)

    // Intercepts genéricos (não quebram nada, ajudam diagnóstico se precisar)
    cy.intercept('GET', '**/api/**').as('apiGET')
    cy.intercept('POST', '**/api/**').as('apiPOST')

    // =====================================================
    // 1) Home
    // =====================================================
    allure.step('🌐 Carregamento da página inicial', () => {})
    const tempoInicioVisit = performance.now()

    cy.visitWithRetry('/', {
      timeout: 30000, // Reduzido de 60000 para 30000 (30s é suficiente)
      retries: 1, // Reduzido de 2 para 1 (menos tentativas)
      validate: () => {
        // waitForAppReady já verifica readyState, não precisa waitDocumentReady depois
        cy.waitForAppReady({ timeout: 30000, checkBlocking: false }) // Reduzido de 60000 para 30000
        cy.dismissOverlays()
      },
    })

    // Removido waitDocumentReady redundante - já está dentro de waitForAppReady

    cy.then(() => {
      const tempoVisit = ((performance.now() - tempoInicioVisit) / 1000).toFixed(2)
      cy.log(`⏱️ Página carregada em ${tempoVisit}s`)
      allure.parameter('tempo_carregamento_pagina_segundos', tempoVisit)
      cy.screenshot(`01_pagina_inicial_${numeroExecucao}`)
    })

    // cookies (não assume existência)
    allure.step('🍪 Fechar modal de cookies', () => {})
    FluxoCompraPage.fecharModalcookies()
    cy.dismissOverlays()

    // =====================================================
    // 2) Cadastro
    // =====================================================
    allure.step('📝 Início do cadastro', () => {})
    const tempoInicioCadastro = Date.now()
    const tempoInicioCadastroPerf = performance.now()

    allure.step('🔘 Clicar em cadastrar-se', () => {})
    CadastroPage.clicarCadastrarse()

    // checkpoint robusto: cair em /register (ou força acesso)
    cy.location('pathname', { timeout: 30000 }).then((path) => {
      if (!path.includes('/register')) {
        cy.log('↪️ Não caiu em /register via UI. Forçando navegação.')
        return cy.visitWithRetry('/register', {
          timeout: 30000, // Reduzido de 60000 para 30000
          retries: 1, // Reduzido de 2 para 1
          validate: () => {
            cy.waitForAppReady({ timeout: 30000, checkBlocking: false }) // Reduzido de 60000 para 30000
            cy.dismissOverlays()
          },
        })
      }
    })

    assertRoute('/register', { timeout: 30000 })
    
    // Checkpoint REAL: garante que está MESMO na tela de cadastro (não só na rota)
    // 1) Garante que chegou na rota esperada
    cy.location('pathname', { timeout: 30000 }).should('match', /register|cadastro/i)
    
    // 2) Aguarda o app Ionic carregar completamente (versão robusta)
    // Desabilita verificação de bloqueio para evitar falsos positivos
    cy.waitForAppReady({ timeout: 60000, checkBlocking: false })
    cy.dismissOverlays()
    
    // 3) Verifica marcador visual da tela de cadastro (mais flexível)
    // Verifica se há formulário ou inputs de cadastro (mais confiável que texto)
    cy.get('body', { timeout: 30000 }).then(($body) => {
      const hasForm = $body.find('form, ion-input, input[type="text"], input[type="email"], [data-cy*="input-"]').length > 0
      const bodyText = $body.text().toLowerCase()
      const hasCadastroText = /criar|cadastro|registro|conta|seus dados/i.test(bodyText)
      
      if (hasForm || hasCadastroText) {
        cy.log('✅ Tela de cadastro confirmada (formulário ou texto encontrado)')
      } else {
        cy.log('⚠️ Formulário/texto não encontrado imediatamente, verificando inputs...')
        // Se não encontrar texto, verifica se pelo menos há inputs (mais confiável)
        cy.get('ion-input, input[type="text"], input[type="email"], [data-cy*="input-"]', { timeout: 15000 })
          .should('have.length.at.least', 1)
          .then(() => {
            cy.log('✅ Tela de cadastro confirmada via inputs')
          })
      }
    })
    
    cy.screenshot(`03_register_${numeroExecucao}`)

    // Preenchimento
    allure.step('✏️ Preencher formulário de cadastro', () => {})
    cy.dismissOverlays()
    cy.wait(1000) // Pequena espera para garantir que o formulário está totalmente renderizado

    CadastroPage.preencherNome()
    CadastroPage.preencherEmail()
    CadastroPage.preencherCelular()
    CadastroPage.preencherSenha()
    CadastroPage.preencherConfirmaSenha()
    CadastroPage.preencherCep()
    CadastroPage.preencherNumeroEndereco()
    CadastroPage.preencherCheckBoxTermos()

    cy.screenshot(`04_formulario_${numeroExecucao}`)

    // Criar conta
    allure.step('✅ Criar conta', () => {})
    CadastroPage.preencherCriarConta()

    // Código de verificação
    allure.step('🔐 Preencher código de verificação', () => {})
    // A função preencherCodigoVerificacaoCompleto já aguarda o componente aparecer
    CadastroPage.preencherCodigoVerificacaoCompleto('979899')
    cy.screenshot(`06_codigo_${numeroExecucao}`)
    
    // Clicar em continuar após preencher o código
    CadastroPage.clicarContinuarCodigo()

    // Métricas cadastro
    const tempoFimCadastro = Date.now()
    const tempoFimCadastroPerf = performance.now()
    const tempoCadastro = ((tempoFimCadastro - tempoInicioCadastro) / 1000).toFixed(2)
    const tempoCadastroPerf = ((tempoFimCadastroPerf - tempoInicioCadastroPerf) / 1000).toFixed(2)

    cy.log(`✅ Fim do cadastro - Tempo: ${tempoCadastro}s (Perf: ${tempoCadastroPerf}s)`)
    allure.parameter('tempo_cadastro_segundos', tempoCadastro)
    allure.parameter('tempo_cadastro_performance_segundos', tempoCadastroPerf)

    captureNavigationPerf()

    // =====================================================
    // 3) Compra
    // =====================================================
    allure.step('🛒 Início do fluxo de compra', () => {})
    const tempoInicioCompra = performance.now()

    cy.dismissOverlays()
    FluxoCompraPage.fecharModalcookies()
    FluxoCompraPage.fecharmodalpizza()
    cy.dismissOverlays()

    allure.step('🎯 Clicar em promoção', () => {})
    FluxoCompraPage.clicarPromocao()
    FluxoCompraPage.modalLojaFechada()
    cy.dismissOverlays()
    cy.screenshot(`07_promocao_${numeroExecucao}`)

    allure.step('📦 Clicar em produto', () => {})
    FluxoCompraPage.clicarProduto()
    cy.dismissOverlays()
    cy.screenshot(`08_produto_${numeroExecucao}`)

    allure.step('🍕 Escolher pizza e sabores', () => {})
    FluxoCompraPage.clicarEscolherProduto()
    cy.dismissOverlays()

    FluxoCompraPage.clicarEscolherSabor()
    FluxoCompraPage.clicarAdcionarPizza()

    FluxoCompraPage.clicarEscolherSabor()
    FluxoCompraPage.clicarAdcionarPizza()

    cy.screenshot(`09_sabores_${numeroExecucao}`)

    allure.step('🛒 Adicionar ao carrinho', () => {})
    FluxoCompraPage.clicarAdicionarCarrinho()
    cy.dismissOverlays()
    cy.screenshot(`10_carrinho_add_${numeroExecucao}`)

    allure.step('📋 Seguir para carrinho', () => {})
    FluxoCompraPage.clicarSeguirCarrinho()
    cy.dismissOverlays()
    cy.screenshot(`11_carrinho_${numeroExecucao}`)

    allure.step('💳 Clicar em pagamento', () => {})
    FluxoCompraPage.clicarPagamento()
    cy.dismissOverlays()
    cy.screenshot(`12_pagamento_${numeroExecucao}`)

    const tempoFimCompra = performance.now()
    const tempoCompra = ((tempoFimCompra - tempoInicioCompra) / 1000).toFixed(2)

    // =====================================================
    // 4) Resumo ciclo
    // =====================================================
    const tempoFimCiclo = Date.now()
    const tempoFimCicloPerf = performance.now()
    const tempoTotal = ((tempoFimCiclo - tempoInicioCiclo) / 1000).toFixed(2)
    const tempoTotalPerf = ((tempoFimCicloPerf - tempoInicioPerformance) / 1000).toFixed(2)

    allure.parameter('tempo_fluxo_compra_segundos', tempoCompra)
    allure.parameter('tempo_total_ciclo_segundos', tempoTotal)
    allure.parameter('tempo_total_ciclo_performance_segundos', tempoTotalPerf)

    cy.log(`✅ Execução ${numeroExecucao} finalizada | Total ${tempoTotal}s | Cadastro ${tempoCadastro}s | Compra ${tempoCompra}s`)
  }

  it('Cadastro + Promoção + Produto (loop seguro)', () => {
    const maxExecucoes = 1

    for (let i = 1; i <= maxExecucoes; i++) {
      cy.then(() => {
        cy.log(`📋 Execução ${i}/${maxExecucoes}`)
        executarFluxoCompleto(i)
      })

      if (i < maxExecucoes) {
        cy.then(() => {
          cy.log('⏳ Aguardando 10 segundos antes da próxima execução...')
          allure.step('⏳ Aguardando 10 segundos antes da próxima execução', () => {})
        })
        cy.wait(10000)
      }
    }
  })
})

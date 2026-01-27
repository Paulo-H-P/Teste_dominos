import CadastroPage from './cadastropage'
import FluxoCompraPage from './fluxo_compra'
import * as allure from 'allure-js-commons'

describe('Fluxo de compra', () => {

  // Função que executa o fluxo completo
  const executarFluxoCompleto = (numeroExecucao = 1) => {
    // Marca o início do ciclo (do cadastro até logout)
    const tempoInicioCiclo = Date.now()
    const tempoInicioPerformance = performance.now()
    
    // Adiciona informações de ambiente e performance ao Allure
    allure.parameter('execucao_numero', numeroExecucao.toString())
    allure.parameter('browser', Cypress.browser.name)
    allure.parameter('browser_version', Cypress.browser.version)
    allure.parameter('viewport', `${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`)
    
    cy.log(`🔄 Execução ${numeroExecucao} - Início do ciclo completo (Cadastro → Compra → Logout)`)
    cy.log(`🌐 Browser: ${Cypress.browser.name} ${Cypress.browser.version}`)
    cy.log(`📐 Viewport: ${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`)
    
    // 1) Acessa o site e mede performance
    allure.step('🌐 Carregamento da página inicial', () => {})
    const tempoInicioVisit = performance.now()
    cy.visit('/')
    cy.url().should('include', 'app.dominos.com.br')
    cy.then(() => {
      const tempoVisit = ((performance.now() - tempoInicioVisit) / 1000).toFixed(2)
      cy.log(`⏱️ Página carregada em ${tempoVisit}s`)
      allure.parameter('tempo_carregamento_pagina_segundos', tempoVisit)
      cy.screenshot('01_pagina_inicial_carregada')
    })
    
    allure.step('🍪 Fechar modal de cookies', () => {})
    const tempoInicioModalCookies = performance.now()
    FluxoCompraPage.fecharModalcookies()
    cy.then(() => {
      const tempoModalCookies = ((performance.now() - tempoInicioModalCookies) / 1000).toFixed(2)
      allure.parameter('tempo_fechar_modal_cookies_segundos', tempoModalCookies)
    })

    // 2) Vai para cadastro (o método já faz logout se necessário)
    // Marca o início do cadastro
    allure.step('📝 Início do cadastro', () => {})
    const tempoInicioCadastro = Date.now()
    const tempoInicioCadastroPerformance = performance.now()
    cy.log('📝 Início do cadastro')
    
    allure.step('🔘 Clicar em cadastrar-se', () => {})
    const tempoInicioCadastrarse = performance.now()
    CadastroPage.clicarCadastrarse()
    cy.then(() => {
      const tempoCadastrarse = ((performance.now() - tempoInicioCadastrarse) / 1000).toFixed(2)
      allure.parameter('tempo_clicar_cadastrar_se_segundos', tempoCadastrarse)
      cy.screenshot('02_clicou_cadastrar_se')
    })
    
    // Verifica se já está na página de registro (pode ter sido redirecionado após logout)
    cy.url().then((url) => {
      if (!url.includes('/register')) {
        // Se não está na página de registro, tenta acessar diretamente
        cy.visit('/register', { timeout: 10000 })
      }
    })
    cy.url().should('include', '/register', { timeout: 10000 })
    cy.screenshot('03_pagina_registro_carregada')

    // 3) Preenche cadastro - medindo cada campo
    allure.step('✏️ Preencher formulário de cadastro', () => {})
    const tempoInicioNome = performance.now()
    CadastroPage.preencherNome()
    cy.then(() => {
      allure.parameter('tempo_preencher_nome_segundos', ((performance.now() - tempoInicioNome) / 1000).toFixed(2))
    })
    
    const tempoInicioEmail = performance.now()
    CadastroPage.preencherEmail()
    cy.then(() => {
      allure.parameter('tempo_preencher_email_segundos', ((performance.now() - tempoInicioEmail) / 1000).toFixed(2))
    })
    
    const tempoInicioCelular = performance.now()
    CadastroPage.preencherCelular()
    cy.then(() => {
      allure.parameter('tempo_preencher_celular_segundos', ((performance.now() - tempoInicioCelular) / 1000).toFixed(2))
    })
    
    const tempoInicioSenha = performance.now()
    CadastroPage.preencherSenha()
    cy.then(() => {
      allure.parameter('tempo_preencher_senha_segundos', ((performance.now() - tempoInicioSenha) / 1000).toFixed(2))
    })
    
    const tempoInicioConfirmaSenha = performance.now()
    CadastroPage.preencherConfirmaSenha()
    cy.then(() => {
      allure.parameter('tempo_preencher_confirma_senha_segundos', ((performance.now() - tempoInicioConfirmaSenha) / 1000).toFixed(2))
    })
    
    const tempoInicioCep = performance.now()
    CadastroPage.preencherCep()
    cy.then(() => {
      allure.parameter('tempo_preencher_cep_segundos', ((performance.now() - tempoInicioCep) / 1000).toFixed(2))
    })
    
    const tempoInicioNumero = performance.now()
    CadastroPage.preencherNumeroEndereco()
    cy.then(() => {
      allure.parameter('tempo_preencher_numero_endereco_segundos', ((performance.now() - tempoInicioNumero) / 1000).toFixed(2))
    })
    
    const tempoInicioTermos = performance.now()
    CadastroPage.preencherCheckBoxTermos()
    cy.then(() => {
      allure.parameter('tempo_aceitar_termos_segundos', ((performance.now() - tempoInicioTermos) / 1000).toFixed(2))
      cy.screenshot('04_formulario_preenchido')
    })
    
    allure.step('✅ Criar conta', () => {})
    const tempoInicioCriarConta = performance.now()
    CadastroPage.preencherCriarConta()
    cy.then(() => {
      const tempoCriarConta = ((performance.now() - tempoInicioCriarConta) / 1000).toFixed(2)
      allure.parameter('tempo_criar_conta_segundos', tempoCriarConta)
      cy.screenshot('05_conta_criada')
    })

    // 4) Preenche código de verificação (6 dígitos)
    allure.step('🔐 Preencher código de verificação', () => {})
    const tempoInicioCodigo = performance.now()
    CadastroPage.preencherCodigoVerificacaoCompleto('979899')
    cy.then(() => {
      const tempoCodigo = ((performance.now() - tempoInicioCodigo) / 1000).toFixed(2)
      allure.parameter('tempo_preencher_codigo_verificacao_segundos', tempoCodigo)
      cy.screenshot('06_codigo_verificacao_preenchido')
    })
    
    // Calcula tempo do cadastro
    const tempoFimCadastro = Date.now()
    const tempoFimCadastroPerformance = performance.now()
    const tempoCadastro = ((tempoFimCadastro - tempoInicioCadastro) / 1000).toFixed(2)
    const tempoCadastroPerformance = ((tempoFimCadastroPerformance - tempoInicioCadastroPerformance) / 1000).toFixed(2)

    cy.log(`✅ Fim do cadastro - Tempo: ${tempoCadastro}s (Performance: ${tempoCadastroPerformance}s)`)
    allure.step(`✅ Fim do cadastro - Tempo: ${tempoCadastro}s`, () => {})
    allure.parameter('tempo_cadastro_segundos', tempoCadastro)
    allure.parameter('tempo_cadastro_performance_segundos', tempoCadastroPerformance)

    // Adiciona métricas detalhadas de performance do navegador
    cy.window().then((win) => {
      if (win.performance && win.performance.timing) {
        const perf = win.performance.timing
        const pageLoadTime = perf.loadEventEnd - perf.navigationStart
        const domContentLoaded = perf.domContentLoadedEventEnd - perf.navigationStart
        const domInteractive = perf.domInteractive - perf.navigationStart
        const domComplete = perf.domComplete - perf.navigationStart
        const firstPaint = win.performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')

        cy.log(`📊 Performance Detalhada:`)
        cy.log(`   - Page Load: ${pageLoadTime}ms`)
        cy.log(`   - DOM Content Loaded: ${domContentLoaded}ms`)
        cy.log(`   - DOM Interactive: ${domInteractive}ms`)
        cy.log(`   - DOM Complete: ${domComplete}ms`)
        if (firstPaint) {
          cy.log(`   - First Paint: ${Math.round(firstPaint.startTime)}ms`)
        }
        
        allure.parameter('page_load_time_ms', pageLoadTime.toString())
        allure.parameter('dom_content_loaded_ms', domContentLoaded.toString())
        allure.parameter('dom_interactive_ms', domInteractive.toString())
        allure.parameter('dom_complete_ms', domComplete.toString())
        if (firstPaint) {
          allure.parameter('first_paint_ms', Math.round(firstPaint.startTime).toString())
        }
      }
    })

    // 5) Agora segue o fluxo de compra
    allure.step('🛒 Início do fluxo de compra', () => {})
    const tempoInicioCompra = performance.now()
    cy.log('🛒 Início do fluxo de compra')
    
    allure.step('🍕 Fechar modais (cookies e pizza)', () => {})
    const tempoInicioModais = performance.now()
    FluxoCompraPage.fecharModalcookies()
    FluxoCompraPage.fecharmodalpizza()
    cy.then(() => {
      const tempoModais = ((performance.now() - tempoInicioModais) / 1000).toFixed(2)
      allure.parameter('tempo_fechar_modais_segundos', tempoModais)
    })
    
    allure.step('🎯 Clicar em promoção', () => {})
    const tempoInicioPromocao = performance.now()
    FluxoCompraPage.clicarPromocao()
    // Fecha modal de loja fechada APÓS clicar na promoção (a modal aparece na página de promoções)
    FluxoCompraPage.modalLojaFechada()
    cy.then(() => {
      const tempoPromocao = ((performance.now() - tempoInicioPromocao) / 1000).toFixed(2)
      cy.log(`⏱️ Tempo para clicar promoção: ${tempoPromocao}s`)
      allure.parameter('tempo_clicar_promocao_segundos', tempoPromocao)
      cy.screenshot('07_promocao_selecionada')
    })
    
    allure.step('📦 Clicar em produto', () => {})
    const tempoInicioProduto = performance.now()
    FluxoCompraPage.clicarProduto()
    cy.then(() => {
      const tempoProduto = ((performance.now() - tempoInicioProduto) / 1000).toFixed(2)
      cy.log(`⏱️ Tempo para clicar produto: ${tempoProduto}s`)
      allure.parameter('tempo_clicar_produto_segundos', tempoProduto)
      cy.screenshot('08_produto_selecionado')
    })

    // 6) Escolhe pizza - medindo cada etapa
    allure.step('🍕 Escolher pizza e sabores', () => {})
    const tempoInicioEscolherProduto = performance.now()
    FluxoCompraPage.clicarEscolherProduto()
    cy.then(() => {
      allure.parameter('tempo_escolher_produto_segundos', ((performance.now() - tempoInicioEscolherProduto) / 1000).toFixed(2))
    })
    
    const tempoInicioSabor1 = performance.now()
    FluxoCompraPage.clicarEscolherSabor()
    cy.then(() => {
      allure.parameter('tempo_escolher_sabor_1_segundos', ((performance.now() - tempoInicioSabor1) / 1000).toFixed(2))
    })
    
    const tempoInicioAdicionar1 = performance.now()
    FluxoCompraPage.clicarAdcionarPizza()
    cy.then(() => {
      allure.parameter('tempo_adicionar_sabor_1_segundos', ((performance.now() - tempoInicioAdicionar1) / 1000).toFixed(2))
    })
    
    const tempoInicioSabor2 = performance.now()
    FluxoCompraPage.clicarEscolherSabor()
    cy.then(() => {
      allure.parameter('tempo_escolher_sabor_2_segundos', ((performance.now() - tempoInicioSabor2) / 1000).toFixed(2))
    })
    
    const tempoInicioAdicionar2 = performance.now()
    FluxoCompraPage.clicarAdcionarPizza()
    cy.then(() => {
      allure.parameter('tempo_adicionar_sabor_2_segundos', ((performance.now() - tempoInicioAdicionar2) / 1000).toFixed(2))
      cy.screenshot('09_sabores_selecionados')
    })

    // Adicionar ao carrinho
    allure.step('🛒 Adicionar ao carrinho', () => {})
    const tempoInicioCarrinho = performance.now()
    FluxoCompraPage.clicarAdicionarCarrinho()
    cy.then(() => {
      allure.parameter('tempo_adicionar_carrinho_segundos', ((performance.now() - tempoInicioCarrinho) / 1000).toFixed(2))
      cy.screenshot('10_adicionado_carrinho')
    })

    // Seguir para o carrinho
    allure.step('📋 Seguir para carrinho', () => {})
    const tempoInicioSeguirCarrinho = performance.now()
    FluxoCompraPage.clicarSeguirCarrinho()
    cy.then(() => {
      allure.parameter('tempo_seguir_carrinho_segundos', ((performance.now() - tempoInicioSeguirCarrinho) / 1000).toFixed(2))
      cy.screenshot('11_carrinho')
    })

    // Pagamento (última etapa)
    allure.step('💳 Clicar em pagamento', () => {})
    const tempoInicioPagamento = performance.now()
    FluxoCompraPage.clicarPagamento()
    cy.then(() => {
      allure.parameter('tempo_clicar_pagamento_segundos', ((performance.now() - tempoInicioPagamento) / 1000).toFixed(2))
      cy.screenshot('12_pagamento')
    })
    
    const tempoFimCompra = performance.now()
    const tempoCompra = ((tempoFimCompra - tempoInicioCompra) / 1000).toFixed(2)
    cy.log(`✅ Fim do fluxo de compra - Tempo: ${tempoCompra}s`)
    allure.step(`✅ Fim do fluxo de compra - Tempo: ${tempoCompra}s`, () => {})
    allure.parameter('tempo_fluxo_compra_segundos', tempoCompra)
    
    // Calcula tempo total do ciclo (do início do cadastro até agora)
    const tempoFimCiclo = Date.now()
    const tempoFimCicloPerformance = performance.now()
    const tempoTotalCiclo = ((tempoFimCiclo - tempoInicioCiclo) / 1000).toFixed(2)
    const tempoTotalCicloPerformance = ((tempoFimCicloPerformance - tempoInicioPerformance) / 1000).toFixed(2)
    
    // Adiciona informações detalhadas ao relatório Allure
    cy.log(`\n📊 ========== RESUMO DETALHADO DE PERFORMANCE ==========`)
    cy.log(`⏱️ Tempo total do ciclo: ${tempoTotalCiclo}s (Performance: ${tempoTotalCicloPerformance}s)`)
    cy.log(`📝 Tempo de cadastro: ${tempoCadastro}s (${((tempoCadastro / tempoTotalCiclo) * 100).toFixed(1)}% do total)`)
    cy.log(`🛒 Tempo de compra: ${tempoCompra}s (${((tempoCompra / tempoTotalCiclo) * 100).toFixed(1)}% do total)`)
    cy.log(`📈 Tempo médio por etapa:`)
    cy.log(`   - Cadastro: ${(tempoCadastro / 9).toFixed(2)}s por campo`)
    cy.log(`   - Compra: ${(tempoCompra / 8).toFixed(2)}s por ação`)
    cy.log(`=======================================================\n`)
    
    allure.step(`⏱️ Tempo total do ciclo: ${tempoTotalCiclo}s`, () => {})
    allure.parameter('tempo_total_ciclo_segundos', tempoTotalCiclo)
    allure.parameter('tempo_total_ciclo_performance_segundos', tempoTotalCicloPerformance)
    allure.parameter('percentual_cadastro', `${((tempoCadastro / tempoTotalCiclo) * 100).toFixed(1)}%`)
    allure.parameter('percentual_compra', `${((tempoCompra / tempoTotalCiclo) * 100).toFixed(1)}%`)
    allure.parameter('tempo_medio_cadastro_por_campo', (tempoCadastro / 9).toFixed(2))
    allure.parameter('tempo_medio_compra_por_acao', (tempoCompra / 8).toFixed(2))
    
    // Adiciona descrição detalhada do teste
    allure.description(`Execução ${numeroExecucao} do fluxo completo de compra.

Tempos medidos:
- Tempo total do ciclo: ${tempoTotalCiclo}s
- Tempo de cadastro: ${tempoCadastro}s (${((tempoCadastro / tempoTotalCiclo) * 100).toFixed(1)}% do total)
- Tempo de compra: ${tempoCompra}s (${((tempoCompra / tempoTotalCiclo) * 100).toFixed(1)}% do total)
- Performance total: ${tempoTotalCicloPerformance}s

Tempo médio:
- Cadastro: ${(tempoCadastro / 9).toFixed(2)}s por campo
- Compra: ${(tempoCompra / 8).toFixed(2)}s por ação

Browser: ${Cypress.browser.name} ${Cypress.browser.version}
Viewport: ${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`)
    
    cy.log(`✅ Fluxo completo executado com sucesso!`)
    cy.log(`   Tempo total: ${tempoTotalCiclo}s`)
    cy.log(`   Cadastro: ${tempoCadastro}s`)
    cy.log(`   Compra: ${tempoCompra}s`)
  }

  it('Cadastro + Promoção + Produto (com loop de 10 segundos)', () => {
    // Número máximo de execuções (opcional - remova se quiser loop infinito)
    const maxExecucoes = 1 // Temporariamente 1 para testar o Allure (voltar para 100 depois)
    let execucaoAtual = 0

    // Adiciona informações ao Allure sobre a execução
    allure.epic('Fluxo Completo de Compra')
    allure.feature('Cadastro + Compra + Logout')
    allure.story(`Execução de ${maxExecucoes} ciclo(s)`)
    allure.severity('critical')

    // Função recursiva que executa o fluxo e repete após 10 segundos
    const executarComLoop = () => {
      execucaoAtual++
      
      // Adiciona informações sobre a execução
      cy.log(`📋 Execução ${execucaoAtual} de ${maxExecucoes} - Fluxo Completo de Compra`)
      
      cy.log(`🔄 Iniciando execução ${execucaoAtual} do fluxo completo`)
      
      // Executa o fluxo completo
      executarFluxoCompleto(execucaoAtual)
      
      // Aguarda 10 segundos antes de executar novamente
      cy.log('⏳ Aguardando 10 segundos antes da próxima execução...')
      allure.step('⏳ Aguardando 10 segundos antes da próxima execução', () => {})
      cy.wait(10000) // 10 segundos = 10000 milissegundos
      
      // Verifica se deve continuar (remove esta verificação se quiser loop infinito)
      if (execucaoAtual < maxExecucoes) {
        cy.log(`🔄 Reiniciando fluxo... (Execução ${execucaoAtual + 1}/${maxExecucoes})`)
        executarComLoop() // Chama a função novamente
      } else {
        cy.log(`✅ Número máximo de execuções (${maxExecucoes}) atingido. Teste finalizado.`)
        allure.step(`✅ Teste finalizado após ${maxExecucoes} execuções`, () => {})
      }
    }

    // Inicia a primeira execução
    executarComLoop()
  })

})

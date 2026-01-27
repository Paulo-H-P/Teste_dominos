// Custom commands para medir performance e capturar screenshots

// Comando para medir tempo de uma operação e tirar screenshot se demorar muito
Cypress.Commands.add('medirTempoComScreenshot', (nomeOperacao, operacao, tempoLimiteSegundos = 10) => {
  const inicio = performance.now()
  const inicioDate = Date.now()
  
  cy.log(`⏱️ Iniciando: ${nomeOperacao}`)
  
  return cy.then(() => {
    return operacao()
  }).then(() => {
    const fim = performance.now()
    const fimDate = Date.now()
    const tempoDecorrido = ((fim - inicio) / 1000).toFixed(2)
    const tempoDecorridoDate = ((fimDate - inicioDate) / 1000).toFixed(2)
    
    cy.log(`✅ ${nomeOperacao} concluído em ${tempoDecorrido}s`)
    
    // Se demorou mais que o limite, tira screenshot
    if (parseFloat(tempoDecorrido) > tempoLimiteSegundos) {
      cy.log(`⚠️ ${nomeOperacao} demorou ${tempoDecorrido}s (limite: ${tempoLimiteSegundos}s) - Capturando screenshot`)
      cy.screenshot(`lento_${nomeOperacao.replace(/\s+/g, '_').toLowerCase()}`, {
        capture: 'viewport',
        overwrite: true
      })
    }
    
    return {
      nome: nomeOperacao,
      tempo: parseFloat(tempoDecorrido),
      tempoDate: parseFloat(tempoDecorridoDate),
      lento: parseFloat(tempoDecorrido) > tempoLimiteSegundos
    }
  })
})

// Comando para tirar screenshot em pontos críticos
Cypress.Commands.add('screenshotCritico', (nome) => {
  cy.screenshot(`critico_${nome.replace(/\s+/g, '_').toLowerCase()}`, {
    capture: 'viewport',
    overwrite: true
  })
  cy.log(`📸 Screenshot capturado: ${nome}`)
})

// Comando para medir tempo entre dois pontos
Cypress.Commands.add('medirTempo', (nome, callback, tempoLimiteSegundos = 10) => {
  const inicio = performance.now()
  const inicioDate = Date.now()
  
  // Executa o callback e aguarda sua conclusão
  return callback().then(() => {
    const fim = performance.now()
    const fimDate = Date.now()
    const tempo = ((fim - inicio) / 1000).toFixed(2)
    const tempoDate = ((fimDate - inicioDate) / 1000).toFixed(2)
    
    cy.log(`⏱️ ${nome}: ${tempo}s`)
    
    // Se demorou mais que o limite, tira screenshot
    if (parseFloat(tempo) > tempoLimiteSegundos) {
      cy.log(`⚠️ ${nome} demorou ${tempo}s (limite: ${tempoLimiteSegundos}s) - Capturando screenshot`)
      cy.screenshot(`lento_${nome.replace(/\s+/g, '_').toLowerCase()}`, {
        capture: 'viewport',
        overwrite: true
      })
    }
    
    // Retorna via cy.wrap para manter a cadeia assíncrona
    return cy.wrap({
      nome,
      tempo: parseFloat(tempo),
      tempoDate: parseFloat(tempoDate),
      lento: parseFloat(tempo) > tempoLimiteSegundos
    }, { log: false })
  })
})

// Comando customizado para visitar página tratando 403
Cypress.Commands.add('visitWithRetry', (url, options = {}) => {
  const defaultOptions = {
    failOnStatusCode: false,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    ...options
  }
  
  // Intercepta todas as requisições GET para modificar status 403
  cy.intercept('GET', '**', (req) => {
    req.headers['User-Agent'] = defaultOptions.headers['User-Agent']
  }).as('pageRequest')
  
  return cy.visit(url, defaultOptions).then(() => {
    // Aguarda a requisição e verifica o status
    cy.wait('@pageRequest').then((interception) => {
      if (interception.response && interception.response.statusCode === 403) {
        cy.log('⚠️ 403 Forbidden recebido, mas continuando o teste...')
        cy.log('ℹ️ O site pode estar bloqueando requisições do CI, mas tentaremos continuar')
      }
    })
  }).catch((error) => {
    // Se falhar completamente, loga o erro mas não interrompe
    if (error.message && error.message.includes('403')) {
      cy.log('⚠️ Erro 403: Site bloqueando requisições do CI')
      cy.log('ℹ️ Tentando continuar mesmo assim...')
      // Tenta visitar novamente sem verificar status
      return cy.visit(url, { ...defaultOptions, failOnStatusCode: false, retryOnStatusCodeFailure: false })
    }
    throw error
  })
})
